from pydantic import BaseModel, Field
from typing import List, Optional

class BlueprintPayload(BaseModel):
    """
    Schema for the /deploy-worker endpoint.
    Represents the full configuration of an AI agent derived
    from the user's blueprint.
    """
    role_title: str = Field(..., description="The role assigned to the AI agent.")
    primary_goal: str = Field(..., description="The main objective the agent should achieve.")
    context_backstory: str = Field(..., description="Detailed background or constraints for the agent.")
    task_description: str = Field(..., description="A specific task the agent must execute.")
    expected_output_format: str = Field(..., description="The required structure or format of the output.")
    required_capabilities: List[str] = Field(..., description="A list of capability identifiers (e.g. ['email_ops', 'crm_ops']).")
    is_semi_auto: bool = Field(False, description="Whether the agent requires manual approval for sensitive tools.")

class ExecutionResult(BaseModel):
    status: str
    output: str
    agent_logs: Optional[str] = None
    error: Optional[str] = None
    mission_id: Optional[str] = None
    compliance_audit: Optional[dict] = None
    esg_impact: Optional[float] = None
    cognitive_friction: Optional[float] = None


class ToolTestRequest(BaseModel):
    tool_id: str
    config: dict

class ToolTestResponse(BaseModel):
    status: str
    message: str
    latency_ms: Optional[float] = None

class CommandRequest(BaseModel):
    """
    Schema for the /execute-agent endpoint.
    Supports multimodal inputs (text + vision).
    """
    command: str = Field(..., description="The textual directive for the agent.")
    image_url: Optional[str] = Field(None, description="Optional image URL for vision-based reasoning.")
    context_data: Optional[dict] = Field(None, description="Additional metadata for the execution.")


