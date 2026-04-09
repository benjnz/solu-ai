/**
 * Agent Service
 * Handles communication with the modular AI backend (FastAPI/CrewAI).
 */
import { CONFIG } from './config';

export interface BlueprintPayload {
  role_title: string;
  primary_goal: string;
  context_backstory: string;
  task_description: string;
  expected_output_format: string;
  required_capabilities: string[];
}

export interface ExecutionResult {
  status: 'success' | 'error';
  output: string;
  agent_logs?: string;
  error?: string;
  mission_id?: string;
  compliance_audit?: any;
  esg_impact?: number;
  cognitive_friction?: number;
  context_data?: any;
}



const BACKEND_URL = CONFIG.API_BASE_URL;

/**
 * Deploys a modular worker agent based on a blueprint.
 * Interacts with the FastAPI CrewAI orchestrator.
 */
export const deployWorkerAgent = async (payload: BlueprintPayload): Promise<ExecutionResult> => {
  console.log(`DEBUG: Deploying worker agent for role: ${payload.role_title}`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/deploy-worker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to deploy worker agent.');
    }

    const result: ExecutionResult = await response.json();
    return result;

  } catch (error: any) {
    console.error("ERROR: deployWorkerAgent failed:", error);
    return {
      status: 'error',
      output: '',
      error: error.message || 'An unexpected error occurred during agent deployment.'
    };
  }
};

/**
 * Executes a command on a deployed agent.
 */
export const executeAgent = async (agentId: string, command: string, imageUrl?: string): Promise<ExecutionResult> => {
  console.log(`DEBUG: Executing agent command for: ${agentId}`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/execute-agent?agent_id=${agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command, image_url: imageUrl })
    });


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to execute agent command.');
    }

    return await response.json();

  } catch (error: any) {
    console.error("ERROR: executeAgent failed:", error);
    return {
      status: 'error',
      output: '',
      error: error.message || 'An unexpected error occurred during command execution.'
    };
  }
};

export const testTool = async (toolId: string, config: any) => {
  try {
    const response = await fetch(`${BACKEND_URL}/test-tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_id: toolId, config })
    });
    
    if (!response.ok) throw new Error("Diagnostic check failed");
    return await response.json();
  } catch (error) {
    console.error("Tool diagnostic failed:", error);
    throw error;
  }
};

export const startTelemetry = async (agentId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/agent/status?agent_id=${agentId}&status=active`, {
      method: 'POST'
    });
    // This also acts as start-telemetry now as it initializes the status
    if (!response.ok) throw new Error("Failed to initialize telemetry");
    return await response.json();
  } catch (error) {
    console.error("Telemetry initiation failed:", error);
    throw error;
  }
};

export const updateAgentBackendStatus = async (agentId: string, status: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/agent/status?agent_id=${agentId}&status=${status}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error("Failed to update backend status");
    return await response.json();
  } catch (error) {
    console.error("Backend status update failed:", error);
    throw error;
  }
};

export const deleteAgentBackend = async (agentId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/agent/${agentId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error("Failed to decommission agent in backend");
    return await response.json();
  } catch (error) {
    console.error("Backend agent deletion failed:", error);
    throw error;
  }
};

export const renameAgentBackend = async (agentId: string, newName: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/agent/rename?agent_id=${agentId}&new_name=${newName}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error("Failed to rename agent in backend");
    return await response.json();
  } catch (error) {
    console.error("Backend agent rename failed:", error);
    throw error;
  }
};

