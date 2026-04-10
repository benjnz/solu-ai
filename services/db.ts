import { collection, addDoc, getDocs, doc, getDoc, onSnapshot, query, where, orderBy, serverTimestamp, setDoc, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
export { db };
import { JobPost, MicroTask, Company, Blueprint } from '../types'; 
import { User } from './auth';

// Collections
const usersCollection = collection(db, 'users');
const jobPostingsCollection = collection(db, 'job_postings');
const microTasksCollection = collection(db, 'micro_tasks');

// --- Core Data Services ---
// (No hardcoded mock companies - data is fetched from live collections)

// --- User Management ---

export const getUserProfile = (uid: string, callback: (user: User) => void) => {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      callback({ uid, ...doc.data() } as User);
    }
  });
};

export const updateUserProfile = async (uid: string, profile: Partial<User>) => {
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, sanitizeData({ ...profile }), { merge: true });
};

// --- Helper to remove undefined values for Firestore ---
const sanitizeData = (data: any): any => {
  if (data === null || typeof data !== 'object') {
    return data === undefined ? null : data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  const sanitized: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = null;
    }
  });
  return sanitized;
};

// --- Job Postings ---

export const getClientJobPostings = (clientId: string, callback: (jobs: JobPost[]) => void) => {
  const q = query(jobPostingsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    // Filter in-memory to avoid requiring a composite index for where + orderBy
    const jobs = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as JobPost))
      .filter((j: JobPost) => j.clientId === clientId);
    callback(jobs);
  });
};

export const getAllJobPostings = (callback: (jobs: JobPost[]) => void) => {
  const q = query(jobPostingsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobPost));
    callback(jobs);
  });
}

export const createJobPosting = async (job: Omit<JobPost, 'id' | 'createdAt'>) => {
  await addDoc(jobPostingsCollection, sanitizeData({
    ...job,
    createdAt: serverTimestamp()
  }));
}

// --- Micro Tasks ---
export const getMicroTasksStream = (callback: (tasks: MicroTask[]) => void) => {
    const q = query(microTasksCollection, orderBy('solutesReward', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MicroTask));
      callback(tasks);
    });
};

export const getMicroTasks = async (): Promise<MicroTask[]> => {
    const snapshot = await getDocs(query(microTasksCollection, orderBy('solutesReward', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MicroTask));
}


// Seed initial micro-tasks if the collection is empty
const seedMicroTasks = async () => {
    const snapshot = await getDocs(microTasksCollection);
    if(snapshot.empty) {
        const MICRO_TASKS: Omit<MicroTask, 'id'>[] = [
            { title: 'RLHF: Rank Chatbot Responses', type: 'Evaluation', solutesReward: 50, timeEstimate: '5 min', description: 'Compare two AI outputs for a customer service scenario.' },
            { title: 'Label Invoice Data', type: 'Labeling', solutesReward: 30, timeEstimate: '3 min', description: 'Identify bounding boxes for "Total Amount" on 10 invoice images.' },
            { title: 'Prompt Optimization', type: 'Design', solutesReward: 100, timeEstimate: '15 min', description: 'Refine a prompt to reduce token usage by 20% while maintaining accuracy.' },
        ];
        MICRO_TASKS.forEach(async (task) => {
            await addDoc(microTasksCollection, task);
        })
    }
}

seedMicroTasks();

// --- Company Functions ---
export const getCompanies = async (): Promise<Company[]> => {
    const companiesCollection = collection(db, 'companies');
    const q = query(companiesCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
};

// --- Task Completion ---
export const completeMicroTask = async (taskId: string, userId: string): Promise<void> => {
  const completionRef = collection(db, 'users', userId, 'completed_tasks');
  await addDoc(completionRef, {
    taskId,
    completedAt: serverTimestamp()
  });
  console.log(`Task ${taskId} recorded as complete for user ${userId}`);
};

const sharedBlueprintsCollection = collection(db, 'shared_blueprints');
const buildRequestsCollection = collection(db, 'build_requests');

export const saveSharedBlueprint = async (blueprint: any): Promise<string> => {
  const docRef = await addDoc(sharedBlueprintsCollection, sanitizeData({
    ...blueprint,
    createdAt: serverTimestamp()
  }));
  return docRef.id;
};

export const createBuildRequest = async (job: JobPost): Promise<void> => {
  // Remove client-side temp ID so Firestore auto-ID is used and doesn't get overwritten in the data
  const { id, ...jobData } = job;
  await addDoc(buildRequestsCollection, sanitizeData({
    ...jobData,
    createdAt: serverTimestamp(),
    status: 'Open'
  }));
};

export const createDeployedAgent = async (
  agentId: string, 
  clientName: string, 
  blueprint: Blueprint,
  config: any,
  companyDetails?: any,
  clientId?: string,
  agentName?: string,
  contactName?: string
): Promise<void> => {
  const agentRef = doc(db, 'deployed_agents', agentId);
  await setDoc(agentRef, sanitizeData({
    clientName,
    clientId,
    companyDetails,
    blueprint,
    config,
    agentName,
    contactName,
    portalConfig: (() => {
      const sub = (config?.portalConfig?.subdomain || agentName || blueprint.jobTitle).toLowerCase().replace(/[^a-z0-9]/g, '-');
      console.log(`[Firestore:Subdomain] Creating agent ${agentId} with subdomain: ${sub}`);
      return {
        ...(config?.portalConfig || {}),
        subdomain: sub
      };
    })(),
    status: 'Active',
    deployedAt: serverTimestamp(),
    totalTasks: 0,
    lastLatency: 0,
    total_cost_usd: 0
  }));
};

export const getBuildRequests = (callback: (jobs: JobPost[]) => void) => {
  const q = query(buildRequestsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    // Put id: doc.id LAST to ensure it wins over any internal 'id' field in the document data
    const jobs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as JobPost));
    callback(jobs);
  });
};

export const getUserBuildRequests = (clientId: string, callback: (jobs: JobPost[]) => void) => {
  const q = query(
    buildRequestsCollection, 
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    // Filter in-memory to avoid requiring a composite index for where + orderBy
    const jobs = snapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id } as JobPost))
      .filter((j: JobPost) => j.clientId === clientId);
    callback(jobs);
  });
};

export const getDeployedAgentsForClient = (clientId: string, callback: (agents: any[]) => void) => {
  const q = query(
    collection(db, 'deployed_agents'), 
    where('clientId', '==', clientId),
    orderBy('deployedAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(agents);
  });
};

export const getDeployedAgents = (callback: (agents: any[]) => void) => {
  const q = query(
    collection(db, 'deployed_agents'), 
    orderBy('deployedAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(agents);
  });
};

export const updateAgentStatus = async (agentId: string, status: 'Active' | 'Paused' | 'Terminated'): Promise<void> => {
  const docRef = doc(db, 'deployed_agents', agentId);
  await setDoc(docRef, { status }, { merge: true });
};

export const updateBuildRequestStatus = async (jobId: string, status: JobPost['status']): Promise<void> => {
  const docRef = doc(db, 'build_requests', jobId);
  await setDoc(docRef, { status }, { merge: true });
};

export const deleteBuildRequest = async (jobId: string): Promise<void> => {
  try {
    const trimmedId = jobId.trim();
    const path = `build_requests/${trimmedId}`;
    console.log(`Firestore: Attempting to delete ${path}`);
    const docRef = doc(db, 'build_requests', trimmedId);
    await deleteDoc(docRef);
    console.log(`Firestore: Successfully deleted ${path}`);
  } catch (err) {
    console.error(`Firestore ERROR: Failed to delete build request ${jobId}:`, err);
    throw err;
  }
};

export const deleteDeployedAgent = async (agentId: string): Promise<void> => {
  try {
    console.log(`Firestore: Attempting to delete deployed agent ${agentId}`);
    const docRef = doc(db, 'deployed_agents', agentId);
    await deleteDoc(docRef);
    console.log(`Firestore: Successfully deleted deployed agent ${agentId}`);
  } catch (err) {
    console.error(`Firestore ERROR: Failed to delete deployed agent ${agentId}:`, err);
    throw err;
  }
};

export const updateAgentName = async (agentId: string, agentName: string): Promise<void> => {
  const docRef = doc(db, 'deployed_agents', agentId);
  const normalized = agentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  await setDoc(docRef, { 
    agentName,
    'portalConfig.subdomain': normalized 
  }, { merge: true });
};

export const updateBuildRequestMeta = async (jobId: string, meta: { clientName?: string; contactName?: string; agentName?: string; notificationEmail?: string }): Promise<void> => {
  const docRef = doc(db, 'build_requests', jobId);
  await setDoc(docRef, sanitizeData(meta), { merge: true });
};

export const getAgentLogs = (agentId: string, callback: (logs: any[]) => void) => {
  const logsRef = collection(db, 'deployed_agents', agentId, 'logs');
  const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(logs);
  });
};

export const getAgentStats = (agentId: string, callback: (stats: any) => void) => {
  const agentRef = doc(db, 'deployed_agents', agentId);
  return onSnapshot(agentRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const getPendingApprovals = (agentId: string, callback: (approvals: any[]) => void) => {
  const approvalsRef = collection(db, 'deployed_agents', agentId, 'approvals');
  const q = query(approvalsRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    // Filter in-memory to avoid requiring a composite index for where + orderBy
    const approvals = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((a: any) => a.status === 'pending');
    callback(approvals);
  });
};

export const updateApprovalStatus = async (agentId: string, approvalId: string, status: 'approved' | 'rejected') => {
  const docRef = doc(db, 'deployed_agents', agentId, 'approvals', approvalId);
  await setDoc(docRef, { status }, { merge: true });
};

export const updateAgentConfig = async (agentId: string, config: any) => {
  const docRef = doc(db, 'deployed_agents', agentId);
  await setDoc(docRef, sanitizeData({ config }), { merge: true });
};

export const updateAgentPortalConfig = async (agentId: string, portalConfig: any) => {
  const docRef = doc(db, 'deployed_agents', agentId);
  console.log(`[Firestore:Subdomain] Updating path ${docRef.path} with:`, portalConfig);
  await setDoc(docRef, sanitizeData({ portalConfig }), { merge: true });
};

export const getAgentBySubdomain = async (subdomain: string): Promise<any | null> => {
  const normalized = subdomain.toLowerCase().replace(/[^a-z0-9]/g, '-');
  console.log(`[Firestore:Registry] Querying by subdomain: ${normalized}`);
  const q = query(
    collection(db, 'deployed_agents'),
    where('portalConfig.subdomain', '==', normalized),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const data = snapshot.docs[0].data();
    console.log(`[Firestore:Registry] Found agent: ${snapshot.docs[0].id}`, data.portalConfig);
    return { id: snapshot.docs[0].id, ...data };
  }
  console.warn(`[Firestore:Registry] No agent found for: ${normalized}`);
  return null;
};

export const getSharedBlueprint = async (id: string): Promise<any | null> => {
  const docRef = doc(db, 'shared_blueprints', id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as any;
  }
  return null;
};
export const getMissionArchive = (agent_id: string, callback: (missions: any[]) => void) => {
  const q = query(collection(db, 'mission_archives'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    // Filter in-memory to avoid requiring a composite index for where + orderBy
    const missions = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((m: any) => m.agent_id === agent_id);
    callback(missions);
  });
};

export const getGlobalStrategy = (callback: (strategy: any) => void) => {
  const docRef = doc(db, 'governance', 'global_strategy');
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const getCollectiveWisdom = (callback: (wisdom: any[]) => void) => {
  const q = query(collection(db, 'collective_wisdom'), orderBy('timestamp', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    const wisdom = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(wisdom);
  });
};
