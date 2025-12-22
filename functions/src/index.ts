
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Get Gemini API Key from environment variables
const GEMINI_API_KEY = functions.config().gemini.key;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- 1. generateBlueprint Cloud Function ---

export const generateBlueprint = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  
  const userId = context.auth.uid;
  const jobDescription = data.jobDescription;

  if (!jobDescription) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'jobDescription'."
    );
  }

  // Security: Check if the user is a verified client
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'client') {
      throw new functions.https.HttpsError(
        "permission-denied",
        "User does not have 'client' privileges."
      );
    }
  } catch (error) {
    console.error("Permission check failed:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while verifying user permissions."
    );
  }

  // --- Gemini API Call ---
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are an expert automation consultant. Your task is to analyze a job description and decompose it into a structured "AI Readiness Blueprint".

      **Analyze the following job description:**
      ---
      ${jobDescription}
      ---

      **Your output MUST be a valid JSON object with NO markdown formatting.**
      The JSON object should conform to the following TypeScript interface:

      '''
      interface Blueprint {
        jobTitle: string;
        summary: string;
        estimatedAnnualSavings: number;
        tasks: Array<{
          taskName: string;
          reasoning: string;
          automationScore: number; // A score from 0-100 indicating how automatable this specific task is.
          recommendedTools: string[]; // e.g., ["Zapier", "UiPath", "GPT-4"]
        }>;
      }
      '''

      **Instructions:**
      1.  **jobTitle:** Extract or infer a concise job title.
      2.  **summary:** Provide a one-sentence summary of the automation potential.
      3.  **estimatedAnnualSavings:** Provide a realistic, conservative estimate of annual savings in USD, assuming a mid-level employee salary. Base this on the percentage of the role that can be automated. For a typical $65,000 salary, if 50% of tasks are automated, savings might be around $32,500.
      4.  **tasks:**
          *   Break down the primary responsibilities of the role into distinct, actionable tasks.
          *   For each task, provide a `taskName`.
          *   Provide clear `reasoning` for its automation potential.
          *   Assign an `automationScore` from 0 (impossible to automate) to 100 (fully automatable).
          *   Suggest specific and realistic `recommendedTools` for automating the task.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the JSON response
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const blueprint = JSON.parse(cleanedText);
    
    return blueprint;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while generating the blueprint."
    );
  }
});


// --- 2. evaluateWorkflow Cloud Function ---

export const evaluateWorkflow = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { jobDescription, workflowGraph } = data;

  if (!jobDescription || !workflowGraph) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Function requires 'jobDescription' and 'workflowGraph'."
    );
  }
  
  // Security: Check for 'associate' role (optional, could be open)
  // For this project, we'll allow any authenticated user to try the challenge.

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert systems analyst and an automation competition judge.
      Your task is to evaluate a candidate's proposed automation workflow against a given job description.

      **1. The Original Job Description:**
      ---
      ${jobDescription}
      ---

      **2. The Candidate's Proposed Workflow (as a JSON graph):**
      ---
      ${JSON.stringify(workflowGraph, null, 2)}
      ---

      **Your Evaluation Criteria:**
      - **Coverage:** Does the workflow address the key responsibilities in the job description?
      - **Logic:** Is the flow of operations logical? Are the connections between nodes correct?
      - **Tool Selection:** Did the candidate choose appropriate tools for each task? (e.g., using an AI tool for analysis, a CRM action for updating records).
      - **Efficiency:** Is the workflow efficient, or does it have redundant or unnecessary steps?

      **Your Output MUST be a valid JSON object with NO markdown formatting.**
      The JSON object should conform to the following TypeScript interface:

      '''
      interface AssessmentResult {
        score: number; // An overall score from 0 to 100.
        feedback: string; // Detailed, constructive feedback for the candidate. Explain the score.
        passed: boolean; // True if the score is 70 or above.
      }
      '''

      **Instructions:**
      1.  **score:** Provide a fair `score` from 0-100 based on the criteria. Be critical but fair.
          - 90-100: Excellent, comprehensive, and logical.
          - 70-89: Good, covers most aspects but may have minor inefficiencies.
          - 50-69: Decent attempt, but has logical flaws or misses key tasks.
          - 0-49: Poor, fundamentally misunderstands the requirements or the tools.
      2.  **feedback:** Write a concise (3-5 sentences) `feedback` paragraph. Start by stating the strongest part of the workflow, then explain what could be improved.
      3.  **passed:** Set `passed` to true if the score is 70 or higher, otherwise false.
    `;

    const generationConfig = {
      temperature: 0.2,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];
    
    const modelForEval = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings,
        generationConfig,
    });

    const result = await modelForEval.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const assessment = JSON.parse(cleanedText);

    return assessment;

  } catch (error) {
    console.error("Gemini API call for evaluation failed:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while evaluating the workflow."
    );
  }
});
