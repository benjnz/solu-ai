from typing import List, Any
from tools.email_ops import get_email_tools
from tools.crm_ops import get_crm_tools
from tools.doc_ops import get_doc_tools

# Placeholders for other tools
from tools.rag_ops import get_rag_tools
def get_calendar_tools(): return []

def get_slack_tools(): return []
def get_data_tools(): return []

from engine.hitl import HITLManager

class ToolFactory:
    """
    Maps string identifiers to actual executable tools.
    """
    
    _MAPPING = {
        "email_ops": get_email_tools,
        "crm_ops": get_crm_tools,
        "doc_ops": get_doc_tools,
        "rag_ops": get_rag_tools,
        "calendar_ops": get_calendar_tools,
        "slack_ops": get_slack_tools,
        "data_ops": get_data_tools,
    }

    @staticmethod
    def _wrap_tool_with_hitl(tool: Any, agent_id: str) -> Any:
        """
        Wraps a LangChain tool with an approval interceptor.
        """
        original_func = getattr(tool, 'func', None)
        if not original_func:
            return tool # Can't wrap if it's not a function-based tool for now

        def hitl_wrapper(*args, **kwargs):
            input_context = f"Args: {args}, Kwargs: {kwargs}"
            if HITLManager.request_approval(agent_id, tool.name, input_context):
                return original_func(*args, **kwargs)
            else:
                return f"SYSTEM: Operation '{tool.name}' was REJECTED by the human operator."

        # Update the tool's execution function
        tool.func = hitl_wrapper
        return tool

    @classmethod
    def get_tools_for_capabilities(cls, capabilities: List[str], agent_id: str = None, is_semi_auto: bool = False) -> List[Any]:
        """
        Returns a flattened list of tools for the requested capabilities.
        Wraps tools with HITL if is_semi_auto and agent_id are provided.
        """
        tools = []
        for capability in capabilities:
            if capability in cls._MAPPING:
                # Industrial Gating: Check ESG/Sovereign policy before injection
                capability_tools = cls._MAPPING[capability]()
                
                # Apply HITL wrapping if requested
                if is_semi_auto and agent_id:
                    capability_tools = [cls._wrap_tool_with_hitl(t, agent_id) for t in capability_tools]
                
                tools.extend(capability_tools)
            else:
                print(f"WARNING: Capability '{capability}' requested but not implemented in ToolFactory.")
        
        return tools

    @classmethod
    def get_industrial_tool_matrix(cls):
        """
        Returns the full matrix of enterprise-grade capabilities available for deployment.
        """
        return list(cls._MAPPING.keys())


def get_tool_factory():
    """Helper to get a tool factory instance if needed."""
    return ToolFactory()
