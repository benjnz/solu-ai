import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { WorkflowGraph, AssessmentResult, Blueprint } from "../types";

// --- Callable Cloud Functions ---

/**
 * Calls the `evaluateWorkflow` Cloud Function to assess a user-submitted workflow.
 * @param jobDescription The original job description.
 * @param workflowGraph The user's workflow graph.
 * @returns A promise that resolves to an AssessmentResult.
 */
export const evaluateWorkflow = httpsCallable<
  { jobDescription: string; workflowGraph: WorkflowGraph },
  AssessmentResult
>(functions, 'evaluateWorkflow');


/**
 * Calls the `generateBlueprint` Cloud Function to create an automation blueprint from a job description.
 * @param jobDescription The job description string.
 * @returns A promise that resolves to a Blueprint object.
 */
export const generateBlueprintFromJobDescription = async (jobDescription: string): Promise<Blueprint> => {
  const generateBlueprint = httpsCallable<
    { jobDescription: string },
    Blueprint
  >(functions, 'generateBlueprint');
  
  try {
    const result = await generateBlueprint({ jobDescription });
    return result.data;
  } catch (error) {
    console.error("Error calling generateBlueprint function:", error);
    // Return a fallback blueprint or re-throw the error
    throw new Error("Failed to generate blueprint. Please try again later.");
  }
};
