import os
import json
from hubspot import HubSpot
from hubspot.crm.contacts import PublicObjectSearchRequest
from langchain.tools import tool
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

HUBSPOT_ACCESS_TOKEN = os.getenv("HUBSPOT_ACCESS_TOKEN")

def get_client():
    """Helper to get HubSpot client."""
    if not HUBSPOT_ACCESS_TOKEN:
        raise ValueError("HUBSPOT_ACCESS_TOKEN must be set in environment.")
    return HubSpot(access_token=HUBSPOT_ACCESS_TOKEN)

class AuditLogger:
    @staticmethod
    def log_tool_usage(agent_id, tool_name, action_summary):
        from firebase_admin import firestore
        from firebase_admin import _apps
        if not _apps: return
        db = firestore.client()
        db.collection('mission_archive').add({
            'agent_id': agent_id,
            'tool': tool_name,
            'action': action_summary,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'compliance_status': 'verified'
        })


@tool("search_crm_contacts")
def search_crm_contacts(query_string: str, agent_id: str = "unknown"):
    """
    Searches for contacts.
    """
    AuditLogger.log_tool_usage(agent_id, "search_crm_contacts", f"Searching CRM for '{query_string}'")

    try:
        client = get_client()
        search_request = PublicObjectSearchRequest(
            filter_groups=[{
                "filters": [{
                    "propertyName": "email",
                    "operator": "CONTAINS_TOKEN",
                    "value": query_string
                }]
            }]
        )
        
        results = client.crm.contacts.search_api.do_search(public_object_search_request=search_request)
        
        contacts = []
        for contact in results.results:
            contacts.append({
                "id": contact.id,
                "first_name": contact.properties.get("firstname"),
                "last_name": contact.properties.get("lastname"),
                "email": contact.properties.get("email")
            })
            
        return json.dumps(contacts) if contacts else "No contacts found matching the query."
        
    except Exception as e:
        return f"HubSpot Error: {str(e)}"

@tool("update_deal_stage")
def update_deal_stage(deal_id: str, stage_id: str, agent_id: str = "unknown"):
    """
    Updates a deal stage.
    """
    AuditLogger.log_tool_usage(agent_id, "update_deal_stage", f"Updating Deal {deal_id} to Stage {stage_id}")

    try:
        client = get_client()
        properties = {"dealstage": stage_id}
        client.crm.deals.basic_api.update(deal_id=deal_id, simple_public_object_input={"properties": properties})
        return f"Deal {deal_id} successfully updated to stage {stage_id}."
        
    except Exception as e:
        return f"HubSpot Error: {str(e)}"

def get_crm_tools():
    """Returns a list of CRM-related tools."""
    return [search_crm_contacts, update_deal_stage]
