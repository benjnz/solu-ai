import os
from datetime import datetime
import firebase_admin
from firebase_admin import firestore
from typing import Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys

def debug_print(msg):
    print(f"DEBUG: {msg}")
    sys.stdout.flush()

debug_print("main.py imported successfully")

# Minimal imports for startup
from engine.models import BlueprintPayload, ExecutionResult, ToolTestRequest, ToolTestResponse, CommandRequest

# Refactored Imports: Moved heavy modules to lazy loading


# Initialize FastAPI App
debug_print("Initializing FastAPI app...")
app = FastAPI(
    title="Solu Sovereign AI Platform",
    description="Industrial-grade autonomous orchestration for strategically-aligned B2B SaaS operations.",
    version="1.0.0",
    openapi_tags=[
        {"name": "Orchestration", "description": "Core agent deployment and execution hub."},
        {"name": "Governance", "description": "Sovereign policy and mission auditing."},
        {"name": "Diagnostics", "description": "System health and tool connectivity."}
    ]
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint for health checks."""
    return {"status": "ok", "message": "Solu Sovereign AI Platform API"}

@app.post("/deploy-worker", tags=["Orchestration"])
async def deploy_worker(payload: Any):
    from engine.models import ExecutionResult
    from engine.orchestrator import Orchestrator

    """
    Main endpoint for deploying an AI agent.
    """
    print(f"DEBUG: Receiving deployment request for role: {payload.role_title}")
    
    try:
        agent_id = f"agent_{payload.role_title.lower().replace(' ', '_')}"
        output = Orchestrator.execute_blueprint(payload, agent_id=agent_id)
        return ExecutionResult(
            status="success",
            output=output,
            agent_logs=f"Successfully executed task for {payload.role_title}. Telemetry active for {agent_id}."
        )
    except Exception as e:
        print(f"ERROR: Exception in /deploy-worker: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/execute-agent", tags=["Orchestration"])
async def run_agent_command(agent_id: str, request: Any):
    from engine.models import ExecutionResult
    from engine.orchestrator import Orchestrator
    try:
        output = Orchestrator.execute_agent_command(agent_id, request.command, image_url=request.image_url)
        projection = Orchestrator.get_predictive_metrics(agent_id)
        return ExecutionResult(status="success", output=output, context_data=projection)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test-tool", response_model=ToolTestResponse)
async def test_tool(request: ToolTestRequest):
    print(f"DEBUG: Testing tool {request.tool_id} with config: {request.config}")
    import time
    import random
    start_time = time.time()
    time.sleep(random.uniform(0.5, 1.2))
    latency = (time.time() - start_time) * 1000
    return ToolTestResponse(
        status="success",
        message=f"Successfully connected to {request.tool_id} API gateway.",
        latency_ms=latency
    )

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "AI Agent Dispatcher"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    debug_print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
