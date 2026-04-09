import time
import os
from firebase_admin import firestore

class HITLManager:
    @staticmethod
    def request_approval(agent_id: str, tool_name: str, input_data: str, reason: str = "Strategic Requirement") -> bool:
        """
        Posts an approval request to Firestore and waits for user intervention.
        """
        # Access the DB instance from the internal firebase_admin apps
        from firebase_admin import _apps
        if not _apps:
            print(f"WARNING: Firebase not initialized. Auto-approving {tool_name}.")
            return True
        
        db = firestore.client()
        
        # 1. Create a log entry and an approval request
        approval_ref = db.collection('deployed_agents').document(agent_id).collection('approvals').document()
        approval_id = approval_ref.id
        
        approval_ref.set({
            'tool': tool_name,
            'input': input_data,
            'reason': reason,
            'status': 'pending',
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        
        print(f"HITL: Pausing for '{tool_name}' approval. ID: {approval_id}")
        
        # 2. Poll Firestore for status change
        # In a production app, use a listener, but polling is simpler for this script
        timeout = 300 # 5 minutes timeout
        elapsed = 0
        while elapsed < timeout:
            doc = approval_ref.get()
            if doc.exists:
                status = doc.to_dict().get('status')
                if status == 'approved':
                    print(f"HITL: Action '{tool_name}' APPROVED.")
                    return True
                if status == 'rejected':
                    print(f"HITL: Action '{tool_name}' REJECTED.")
                    return False
            
            time.sleep(2)
            elapsed += 2
            
        print(f"HITL: Approval for '{tool_name}' TIMEOUT. Defaulting to REJECT.")
        approval_ref.update({'status': 'timeout'})
        return False

    @staticmethod
    def verify_strategic_alignment(agent_id: str, action: str) -> bool:
        """
        Cross-references a proposed manual override with the global strategy vault.
        """
        db = firestore.client()
        strategy = db.collection('governance').document('global_strategy').get().to_dict()
        if not strategy: return True
        
        # Simple keyword matching for sovereign alignment
        mission = strategy.get('mission', '').lower()
        if any(word in mission for word in action.lower().split()):
            return True
        
        return False

