import { Company, JobPost, MicroTask } from '../types';

// --- MOCK DATABASE ---

const HIRING_COMPANIES: Company[] = [
  { id: 'c1', name: 'Nexus Automata', logo: '🧬', industry: 'Biotech', openRoles: 3, description: 'Seeking automation architects for high-throughput screening workflows.' },
  { id: 'c2', name: 'FinFlow Systems', logo: '💸', industry: 'FinTech', openRoles: 1, description: 'Looking for RPA specialists to streamline compliance auditing.' },
  { id: 'c3', name: 'LogiChain', logo: '📦', industry: 'Logistics', openRoles: 5, description: 'Hiring AI efficiency consultants for warehouse optimization.' },
  { id: 'c4', name: 'EduScale', logo: '🎓', industry: 'EdTech', openRoles: 2, description: 'Need designers for personalized learning content pipelines.' },
];

const MICRO_TASKS: MicroTask[] = [
  { id: 't1', title: 'RLHF: Rank Chatbot Responses', type: 'Evaluation', solutesReward: 50, timeEstimate: '5 min', description: 'Compare two AI outputs for a customer service scenario.' },
  { id: 't2', title: 'Label Invoice Data', type: 'Labeling', solutesReward: 30, timeEstimate: '3 min', description: 'Identify bounding boxes for "Total Amount" on 10 invoice images.' },
  { id: 't3', title: 'Prompt Optimization', type: 'Design', solutesReward: 100, timeEstimate: '15 min', description: 'Refine a prompt to reduce token usage by 20% while maintaining accuracy.' },
];

// --- BACKEND FRAME ENDPOINTS ---

export const getCompanies = async (): Promise<Company[]> => {
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve(HIRING_COMPANIES), 600));
}

export const getMicroTasks = async (): Promise<MicroTask[]> => {
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve(MICRO_TASKS), 600));
}

export const getJobs = async (): Promise<JobPost[]> => {
    // Simulate API call to fetch open jobs
    return new Promise(resolve => setTimeout(() => resolve([]), 600));
}

export const submitBid = async (jobId: string, amount: number): Promise<boolean> => {
    console.log(`Submitting bid of $${amount} for job ${jobId}`);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}

export const completeMicroTask = async (taskId: string): Promise<boolean> => {
    console.log(`Completing task ${taskId}`);
    return new Promise(resolve => setTimeout(() => resolve(true), 800));
}