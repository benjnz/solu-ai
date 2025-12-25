import { collection, addDoc, getDocs, doc, onSnapshot, query, where, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import the initialized db instance
import { JobPost, MicroTask, Company } from '../types'; 
import { User } from './auth';

// Collections
const usersCollection = collection(db, 'users');
const jobPostingsCollection = collection(db, 'job_postings');
const microTasksCollection = collection(db, 'micro_tasks');

// --- MOCK DATA ---
const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Automation Anywhere',
    logo: '🤖',
    industry: 'RPA',
    openRoles: 5,
    description: 'Leading the world in Robotic Process Automation and AI.',
  },
  {
    id: '2',
    name: 'DataBricks',
    logo: '🧱',
    industry: 'Data & AI',
    openRoles: 12,
    description: 'The Data and AI company, helping data teams solve the world’s toughest problems.',
  },
    {
    id: '3',
    name: 'OpenAI',
    logo: '🧠',
    industry: 'AI Research',
    openRoles: 8,
    description: 'Ensuring that artificial general intelligence benefits all of humanity.',
  },
    {
    id: '4',
    name: 'Scale AI',
    logo: '⚖️',
    industry: 'Data Labeling',
    openRoles: 20,
    description: 'The most valuable and reliable way to get high quality data for your AI models.',
  },
];

// --- User Management ---

export const getUserProfile = (uid: string, callback: (user: User) => void) => {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      callback({ uid, ...doc.data() } as User);
    }
  });
};

// --- Job Postings ---

export const getClientJobPostings = (clientId: string, callback: (jobs: JobPost[]) => void) => {
  const q = query(jobPostingsCollection, where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobPost));
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
  await addDoc(jobPostingsCollection, {
    ...job,
    createdAt: serverTimestamp()
  });
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
    // In a real app, this would fetch from Firestore
    return Promise.resolve(MOCK_COMPANIES);
};

// --- Task Completion ---
export const completeMicroTask = async (taskId: string): Promise<boolean> => {
  // In a real app, this would update Firestore and user profiles
  console.log(`Completing task ${taskId}`);
  return Promise.resolve(true);
};
