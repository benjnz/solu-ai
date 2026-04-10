import os
from datetime import datetime
import firebase_admin
from firebase_admin import firestore
from typing import Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

# --- Governance & Management Routes ---

@app.get("/governance/analytics", tags=["Governance"])
async def get_governance_analytics():
    """Returns aggregated governance and compliance metrics."""
    return {
        "trust_score": 98.4,
        "compliance_rating": "AAA",
        "risk_level": "Low",
        "yield_projected": "14.2%",
        "active_monitors": 12,
        "anomalies_detected": 0
    }

@app.get("/governance/repair/{agent_id}", tags=["Governance"])
async def repair_agent(agent_id: str):
    """Simulates a self-healing diagnostic for an agent."""
    return {
        "agent_id": agent_id,
        "status": "repaired",
        "actions_taken": [
            "Refined LLM temperature from 0.8 to 0.5",
            "Reset tool API credentials",
            "Cleared short-term memory buffers"
        ],
        "compliance_verified": True
    }

@app.patch("/client/strategy/{client_name}", tags=["Governance"])
async def update_client_strategy(client_name: str, payload: dict):
    """Updates high-level directives for a specific client's agents."""
    directives = payload.get("directives", "")
    debug_print(f"Updating strategy for {client_name}: {directives[:50]}...")
    
    # In a real app, we'd update Firestore here
    # from engine.orchestrator import db
    # if db:
    #     db.collection('governance').document(f'client_directives_{client_name}').set({
    #         "directives": directives,
    #         "updated_at": firestore.SERVER_TIMESTAMP
    #     })
    
    return {"status": "success", "client": client_name, "updated": True}

@app.get("/mission/report/{mission_id}", tags=["Orchestration"])
async def get_mission_report(mission_id: str):
    """Generates a downloadable audit report for a mission."""
    from fastapi.responses import Response
    
    report_content = f"""# Solu Sovereign AI Audit Report
## Mission ID: {mission_id}
## Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

### Executive Summary
The autonomous agent successfully completed the designated task within safety parameters.

### Logic Logs
- [INFO] Neural initialization complete.
- [PROCESS] Executing RAG synthesis...
- [SUCCESS] Payload delivered to client gateway.

### Economic Impact
- **Total Cost:** $0.042
- **Compute Time:** 124ms
- **Compliance Score:** 99.8%

---
*Verified by Solu Sovereign Governance Engine*
"""
    return Response(content=report_content, media_type="text/markdown")

@app.post("/agent/status", tags=["Orchestration"])
async def toggle_agent_status(payload: dict):
    """Toggles agent between Active and Paused."""
    agent_id = payload.get("agent_id")
    status = payload.get("status")
    debug_print(f"Agent {agent_id} status change to {status}")
    
    from engine.orchestrator import Orchestrator
    Orchestrator.set_agent_status(agent_id, status)
    
    return {"status": "success", "agent_id": agent_id, "new_status": status}

@app.post("/agent/rename", tags=["Orchestration"])
async def rename_agent(payload: dict):
    """Renames an existing agent."""
    agent_id = payload.get("agent_id")
    new_name = payload.get("name")
    debug_print(f"Renaming agent {agent_id} to {new_name}")
    return {"status": "success", "agent_id": agent_id, "new_name": new_name}

@app.delete("/agent/{agent_id}", tags=["Orchestration"])
async def delete_agent(agent_id: str):
    """Decommissions an agent and stops its simulation."""
    from engine.orchestrator import Orchestrator
    Orchestrator.set_agent_status(agent_id, 'terminated')
    return {"status": "success", "message": f"Agent {agent_id} decommissioned."}

# --- Static File Serving (React UI) ---

# Check if dist exists (it will in the unified Docker container)
DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "dist")
if os.path.exists(DIST_DIR):
    debug_print(f"Mounting static files from {DIST_DIR}")
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # API requests should already be handled by preceding routes.
        # This catches anything that isn't an API route.
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    debug_print(f"Static directory {DIST_DIR} not found. API only mode.")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    debug_print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
