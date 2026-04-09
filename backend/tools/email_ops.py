import os
import imaplib
import smtplib
import email
from email.mime.text import MIMEText
from email.header import decode_header
from langchain.tools import tool
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASS = os.getenv("GMAIL_PASS")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")

def connect_imap():
    """Helper to connect to IMAP server."""
    if not GMAIL_USER or not GMAIL_PASS:
        raise ValueError("GMAIL_USER and GMAIL_PASS must be set in environment.")
    
    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    mail.login(GMAIL_USER, GMAIL_PASS)
    return mail

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


@tool("read_unread_emails")
def read_unread_emails(query: str = "UNSEEN", agent_id: str = "unknown"):
    """
    Fetches unread emails.
    """
    AuditLogger.log_tool_usage(agent_id, "read_unread_emails", f"Polling inbox with query: {query}")

    try:
        mail = connect_imap()
        mail.select("inbox")
        
        status, messages = mail.search(None, query)
        if status != "OK":
            return "Error searching for emails."
        
        email_ids = messages[0].split()
        results = []
        
        # Fetch last 5 unread emails
        for e_id in email_ids[-5:]:
            status, msg_data = mail.fetch(e_id, "(RFC822)")
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject, encoding = decode_header(msg["Subject"])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding if encoding else "utf-8")
                    
                    from_ = msg.get("From")
                    results.append({
                        "id": e_id.decode(),
                        "from": from_,
                        "subject": subject,
                        "date": msg.get("Date")
                    })
        
        mail.logout()
        return str(results) if results else "No unread emails found."
        
    except Exception as e:
        return f"IMAP Error: {str(e)}"

@tool("send_email_reply")
def send_email_reply(to_email: str, subject: str, body: str, agent_id: str = "unknown"):
    """
    Sends an email reply. Requires high-fidelity Sovereign Approval (HITL).
    """
    AuditLogger.log_tool_usage(agent_id, "send_email_reply", f"Requesting Sovereign Approval for email to {to_email}")

    try:
        # HITL Sovereign Authority Gate
        from engine.hitl import HITLManager
        approved = HITLManager.request_approval(
            agent_id, 
            "send_email_reply", 
            f"RECIPIENT: {to_email}\nSUBJECT: {subject}\nBODY: {body}",
            reason=f"Mandatory stakeholder outreach for mission: '{subject}'"
        )
        
        if not approved:
            return "Sovereign Authority REJECTED this action. Email was NOT sent."

        if not GMAIL_USER or not GMAIL_PASS:
            return "Error: GMAIL credentials not found."

        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = GMAIL_USER
        msg["To"] = to_email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_PASS)
            server.send_message(msg)
            
        return "Email sent successfully after Sovereign Approval."
        
    except Exception as e:
        return f"SMTP Error: {str(e)}"

def get_email_tools():
    """Returns a list of email-related tools."""
    return [read_unread_emails, send_email_reply]
