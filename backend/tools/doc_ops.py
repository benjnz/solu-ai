import os
import json
import fitz # PyMuPDF
from langchain.tools import tool

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


@tool("extract_pdf_text_real")
def extract_pdf_text_real(file_path: str, agent_id: str = "unknown"):
    """
    Extracts raw text from a real PDF file using PyMuPDF.
    """
    AuditLogger.log_tool_usage(agent_id, "extract_pdf_text_real", f"Reading document: {file_path}")

    try:
        if not os.path.exists(file_path):
            return f"Error: File not found at {file_path}"

        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
            
        doc.close()
        return text if text.strip() else "PDF is empty or could not be read."
        
    except Exception as e:
        return f"PyMuPDF Error: {str(e)}"

@tool("scan_document_metadata")
def scan_document_metadata(file_path: str, agent_id: str = "unknown"):
    """
    Extracts metadata from a PDF.
    """
    AuditLogger.log_tool_usage(agent_id, "scan_document_metadata", f"Scanning metadata for: {file_path}")

    try:
        if not os.path.exists(file_path):
            return f"Error: File not found."

        doc = fitz.open(file_path)
        metadata = doc.metadata
        doc.close()
        return json.dumps(metadata)
        
    except Exception as e:
        return f"PyMuPDF Error: {str(e)}"

def get_doc_tools():
    """Returns a list of document processing tools."""
    return [extract_pdf_text_real, scan_document_metadata]
