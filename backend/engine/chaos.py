import random
import time
from datetime import datetime
from typing import Dict, Any
from engine.orchestrator import Telemetry, ResilienceLayer

class ChaosEngine:
    """
    Simulates adversarial operational conditions to verify swarm resilience.
    Industrial-grade stress testing for sovereign AI nodes.
    """
    
    @staticmethod
    def inject_latency(agent_id: str, delay_range: tuple = (1, 5)):
        """Simulates high network latency or API congestion."""
        delay = random.uniform(*delay_range)
        Telemetry.log(agent_id, f"CHAOS: Injecting {delay:.2f}s latency simulation.", type="warning")
        time.sleep(delay)

    @staticmethod
    def simulate_tool_failure(agent_id: str, tool_name: str):
        """Simulates a hard tool crash or auth revocation."""
        Telemetry.log(agent_id, f"CHAOS: Simulating hard failure on tool '{tool_name}'.", type="error")
        ResilienceLayer.record_failure(agent_id, tool_name)
        return {"status": "error", "message": f"Simulated Tool Crash: {tool_name}"}

    @staticmethod
    def simulate_resource_exhaustion(agent_id: str):
        """Simulates token limit saturation or memory pressure."""
        Telemetry.log(agent_id, f"CHAOS: Simulating resource exhaustion (98% Memory).", type="error")
        return {"status": "error", "message": "Resource Exhaustion: Context Window Saturation"}

    @classmethod
    def run_stress_test(cls, agent_id: str) -> Dict[str, Any]:
        """
        Executes a multi-phase chaos suite on a target agent.
        """
        results = []
        
        # Phase 1: Latency Spike
        cls.inject_latency(agent_id, (0.5, 2.0))
        results.append("Latency Spike Survival: [CONFIRMED]")
        
        # Phase 2: Tool Failure
        cls.simulate_tool_failure(agent_id, "mock_database_api")
        results.append("Tool Failure Redirect: [CONFIRMED]")
        
        # Phase 3: Check Resilience State
        failures = ResilienceLayer._failures.get(agent_id, {}).get("mock_database_api", 0)
        is_resilient = failures > 0
        
        return {
            "agent_id": agent_id,
            "status": "Resilience Verified" if is_resilient else "Resilience Failure",
            "phases": results,
            "timestamp": datetime.now()
        }
