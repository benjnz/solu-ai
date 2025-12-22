
export interface FinancialParams {
  employeeSalary: number;
  implementationCost: number;
  monthlyMaintenance: number;
  timeHorizonMonths: number;
}

export interface AutomatedTask {
  taskName: string;
  automationScore: number; // 0-100
  reasoning: string;
  recommendedTools: string[];
}

export interface Blueprint {
  jobTitle: string;
  summary: string;
  tasks: AutomatedTask[];
  estimatedAnnualSavings: number;
  breakEvenMonth: number;
}

export interface JobPost {
  id: string;
  clientName: string;
  blueprint: Blueprint;
  status: 'Open' | 'In Progress' | 'Completed';
  postedDate: string;
  budgetRange?: string;
  bidsCount?: number;
}

export interface Associate {
  id: string;
  name: string;
  skills: string[];
  isVetted: boolean;
  solutes: number;
}

export interface AssessmentResult {
  passed: boolean;
  score: number;
  feedback: string;
}

// Node Editor Types
export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'ai-tool' | 'compute' | 'output';
  label: string;
  x: number;
  y: number;
  icon?: string;
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export interface Company {
  id: string;
  name: string;
  logo: string; // Emoji or URL
  industry: string;
  openRoles: number;
  description: string;
}

export interface MicroTask {
  id: string;
  title: string;
  type: 'Labeling' | 'Evaluation' | 'Design';
  solutesReward: number;
  timeEstimate: string;
  description: string;
}
