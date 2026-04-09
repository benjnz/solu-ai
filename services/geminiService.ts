import { getFunctions, httpsCallable } from 'firebase/functions';
import { WorkflowGraph, AssessmentResult, Blueprint } from "../types";

// Initialize Firebase Functions
const functions = getFunctions();

// Create references to the callable functions
const generateBlueprintCallable = httpsCallable(functions, 'generateBlueprint');
const evaluateWorkflowCallable = httpsCallable(functions, 'evaluateWorkflow');
const refineBlueprintCallable = httpsCallable(functions, 'refineBlueprint');
const executeAgentCommandCallable = httpsCallable(functions, 'executeAgentCommand');

/**
 * Calls the `executeAgentCommand` Cloud Function to interact with a deployed agent.
 * @param agentId The ID of the deployed agent.
 * @param command The user command string.
 * @param context The blueprint/context for the agent.
 * @returns A promise that resolves to the agent's response and logs.
 */
export const executeAgentCommand = async (agentId: string, command: string, context: Blueprint): Promise<any> => {
  try {
    console.log(`Executing command for agent ${agentId}...`);
    const result = await executeAgentCommandCallable({ agentId, command, context });
    return result.data;
  } catch (error) {
    console.error("Error executing agent command:", error);
    throw error;
  }
};

/**
 * Calls the `generateBlueprint` Cloud Function to create an automation blueprint.
 * @param jobDescription The job description string.
 * @returns A promise that resolves to a Blueprint object.
 */
export const generateBlueprintFromJobDescription = async (jobDescription: string, budget?: string | number, focus?: string): Promise<Blueprint> => {
  try {
    console.log("Calling generateBlueprint Cloud Function...");
    const result = await generateBlueprintCallable({ jobDescription, budget, focus });
    console.log("Successfully received data from generateBlueprint.");
    const blueprint = (result.data as any)?.result || (result.data as any)?.data || result.data;
    if (!blueprint) {
      throw new Error("Invalid blueprint data received from server.");
    }
    return blueprint as Blueprint;
  } catch (error) {
    console.error("Error calling generateBlueprint function:", error);
    throw error;
  }
};

/**
 * Calls the `refineBlueprint` Cloud Function to iteratively update a blueprint based on feedback.
 * @param previousBlueprint The existing blueprint object.
 * @param feedback The client's feedback string.
 * @returns A promise that resolves to the updated Blueprint object.
 */
export const refineBlueprintFromFeedback = async (previousBlueprint: Blueprint, feedback: string): Promise<Blueprint> => {
  try {
    console.log("Calling refineBlueprint Cloud Function...");
    const result = await refineBlueprintCallable({ previousBlueprint, feedback });
    console.log("Successfully received refined blueprint.");
    const blueprint = (result.data as any)?.result || (result.data as any)?.data || result.data;
    if (!blueprint) {
      throw new Error("Invalid refined blueprint data received from server.");
    }
    return blueprint as Blueprint;
  } catch (error) {
    console.error("Error calling refineBlueprint function:", error);
    throw error;
  }
};

/**
 * Calls the `evaluateWorkflow` Cloud Function to assess a user-submitted workflow.
 * @param payload Object containing jobDescription and workflowGraph.
 * @returns A promise that resolves to an object containing the AssessmentResult.
 */
export const evaluateWorkflow = async (payload: { jobDescription: string; workflowGraph: WorkflowGraph }): Promise<{ data: AssessmentResult }> => {
  try {
    console.log("Calling evaluateWorkflow Cloud Function...");
    const result = await evaluateWorkflowCallable(payload);
    console.log("Successfully received data from evaluateWorkflow.");
    return result.data as { data: AssessmentResult };
  } catch (error) {
    console.error("Error evaluating workflow:", error);
    throw error;
  }
};
