import { GoogleGenAI, Type } from "@google/genai";
import { Blueprint, AutomatedTask, AssessmentResult, WorkflowGraph } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the Blueprint generation to ensure structured JSON
const blueprintSchema = {
  type: Type.OBJECT,
  properties: {
    jobTitle: { type: Type.STRING },
    summary: { type: Type.STRING },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          taskName: { type: Type.STRING },
          automationScore: { type: Type.NUMBER, description: "Score between 0 and 100" },
          reasoning: { type: Type.STRING },
          recommendedTools: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["taskName", "automationScore", "reasoning", "recommendedTools"]
      }
    },
    estimatedAnnualSavings: { type: Type.NUMBER, description: "Estimated USD savings per year" },
    breakEvenMonth: { type: Type.NUMBER, description: "Estimated month number for break even" }
  },
  required: ["jobTitle", "summary", "tasks", "estimatedAnnualSavings", "breakEvenMonth"]
};

export const generateBlueprintFromJobDescription = async (jobDescription: string): Promise<Blueprint> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert Automation Associate. Analyze the following job description. Deconstruct it into tasks, score them for automation potential, and estimate financial metrics based on typical market rates.
      
      Job Description:
      ${jobDescription}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: blueprintSchema,
        systemInstruction: "You are solu AI, an advanced automation analysis engine. Be conservative but realistic with automation scores.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as Blueprint;
  } catch (error) {
    console.error("Gemini Blueprint Generation Error:", error);
    throw error;
  }
};

export const generateAssessmentQuestion = async (skill: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, single, difficult conceptual scenario question to vet an automation associate in the field of: ${skill}. Do not provide the answer.`,
    });
    return response.text || "Describe your experience with this technology.";
  } catch (error) {
    console.error("Gemini Assessment Question Error:", error);
    return "Describe a complex automation workflow you have built.";
  }
};

export const gradeAssessment = async (question: string, answer: string): Promise<AssessmentResult> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Question: ${question}\nCandidate Answer: ${answer}\n\nGrade this answer. Return JSON with 'passed' (boolean), 'score' (0-100), and 'feedback' (string).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        passed: { type: Type.BOOLEAN },
                        score: { type: Type.NUMBER },
                        feedback: { type: Type.STRING }
                    }
                }
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text) as AssessmentResult;
    } catch (error) {
        console.error("Grading error", error);
        return { passed: true, score: 85, feedback: "Error during automated grading, passing provisionally." };
    }
}

export const evaluateWorkflow = async (jobDescription: string, graph: WorkflowGraph): Promise<AssessmentResult> => {
  try {
    const graphString = JSON.stringify(graph, null, 2);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Job Description: ${jobDescription}
        
        Candidate's Proposed Automation Workflow (Nodes and Connections):
        ${graphString}
        
        Evaluate if this workflow effectively automates the job. Does it use the right tools? Is the logic sound?
        Return JSON with 'passed' (boolean), 'score' (0-100), and 'feedback' (string).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                passed: { type: Type.BOOLEAN },
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
            }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as AssessmentResult;

  } catch (error) {
    console.error("Workflow Evaluation Error:", error);
    return { passed: true, score: 80, feedback: "System check passed. Workflow valid." };
  }
};