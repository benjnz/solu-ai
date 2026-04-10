import React, { useState, useRef, useMemo, useEffect } from 'react';
import { evaluateWorkflow } from '../services/geminiService';
import { getCompanies, getMicroTasks, completeMicroTask } from '../services/db';
import { auth } from '../firebaseConfig';
import { JobPost, AssessmentResult, WorkflowNode, WorkflowConnection, WorkflowGraph, Company, MicroTask } from '../types';
import { 
  BadgeCheck, Briefcase, Award, Lock, 
  BrainCircuit, Zap, Database, Server, FileText, 
  Cpu, Plus, X, ArrowRight, Play, CheckCircle, Trash2, Mail,
  ChevronDown, ChevronUp, Info, Clock, DollarSign, Activity, Settings, PenTool,
  Gem, Building2, Gavel, Search, Hexagon, AlertTriangle, ShieldCheck
} from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';

interface AssociateDashboardProps {
  availableJobs: JobPost[];
}

// --- VISUAL IQ TEST ENGINE ---

type ShapeType = 'circle' | 'square' | 'triangle' | 'diamond' | 'arrow' | 'star' | 'pentagon' | 'hexagon' | 'cross' | 'bar';
type FillType = 'solid' | 'outline' | 'dot';

interface PatternItemConfig {
  shape: ShapeType;
  color: string; // Tailwind text color class
  rotation: number; // degrees
  count: number;
  fill: FillType;
  inner?: PatternItemConfig; // Recursive shape
}

interface IQQuestion {
  id: number;
  sequence: PatternItemConfig[];
  options: PatternItemConfig[];
  answer: number;
  logic: string;
}

// Helper to create configs
const cfg = (shape: ShapeType, props: Partial<PatternItemConfig> = {}): PatternItemConfig => ({
  shape,
  color: 'text-slate-700',
  rotation: 0,
  count: 1,
  fill: 'solid',
  ...props
});


// 20 Visual Pattern Questions - Progressive Difficulty
const IQ_QUESTIONS: IQQuestion[] = [
  // 1. Pattern Recognition - Simple Cycle
  {
    id: 1,
    logic: "Shape cycle: Circle, Square, Triangle...",
    sequence: [cfg('circle'), cfg('square'), cfg('triangle')],
    options: [cfg('square'), cfg('circle'), cfg('triangle'), cfg('star')],
    answer: 1
  },
  // 2. Spatial Reasoning - Rotation 90
  {
    id: 2,
    logic: "Arrow rotates 90° clockwise",
    sequence: [cfg('arrow', {rotation: 0}), cfg('arrow', {rotation: 90}), cfg('arrow', {rotation: 180})],
    options: [cfg('arrow', {rotation: 0}), cfg('arrow', {rotation: 270}), cfg('arrow', {rotation: 90}), cfg('arrow', {rotation: 45})],
    answer: 1
  },
  // 3. Quantitative - Counting
  {
    id: 3,
    logic: "Count increments by 1",
    sequence: [cfg('circle', {count: 1}), cfg('circle', {count: 2}), cfg('circle', {count: 3})],
    options: [cfg('circle', {count: 3}), cfg('circle', {count: 5}), cfg('circle', {count: 4}), cfg('square', {count: 4})],
    answer: 2
  },
  // 4. Geometry - Sides Increment
  {
    id: 4,
    logic: "Number of sides increases: 3, 4, 5...",
    sequence: [cfg('triangle'), cfg('square'), cfg('pentagon')],
    options: [cfg('hexagon'), cfg('pentagon'), cfg('star'), cfg('diamond')],
    answer: 0
  },
  // 5. Visual Logic - Fill Alternation
  {
    id: 5,
    logic: "Fill style alternates: Solid, Outline...",
    sequence: [cfg('square', {fill: 'solid'}), cfg('square', {fill: 'outline'}), cfg('square', {fill: 'solid'})],
    options: [cfg('square', {fill: 'solid'}), cfg('square', {fill: 'outline'}), cfg('circle', {fill: 'outline'}), cfg('square', {fill: 'dot'})],
    answer: 1
  },
  // 6. Multi-Attribute - Color & Shape
  {
    id: 6,
    logic: "Color alternates Red/Blue, Shape stays Circle",
    sequence: [cfg('circle', {color: 'text-red-500'}), cfg('circle', {color: 'text-blue-500'}), cfg('circle', {color: 'text-red-500'})],
    options: [cfg('circle', {color: 'text-red-500'}), cfg('circle', {color: 'text-blue-500'}), cfg('square', {color: 'text-blue-500'}), cfg('circle', {color: 'text-green-500'})],
    answer: 1
  },
  // 7. Recursive Logic - Inner Shape Cycle
  {
    id: 7,
    logic: "Outer shape static, Inner shape cycles: Circle, Square, Triangle",
    sequence: [
      cfg('square', {fill: 'outline', inner: cfg('circle', {fill: 'solid'})}),
      cfg('square', {fill: 'outline', inner: cfg('square', {fill: 'solid'})}),
      cfg('square', {fill: 'outline', inner: cfg('triangle', {fill: 'solid'})})
    ],
    options: [
       cfg('square', {fill: 'outline', inner: cfg('triangle', {fill: 'solid'})}),
       cfg('square', {fill: 'outline', inner: cfg('circle', {fill: 'solid'})}),
       cfg('square', {fill: 'outline', inner: cfg('star', {fill: 'solid'})}),
       cfg('circle', {fill: 'outline', inner: cfg('circle', {fill: 'solid'})})
    ],
    answer: 1
  },
  // 8. Spatial - Fine Rotation
  {
    id: 8,
    logic: "Arrow rotates 45° clockwise",
    sequence: [cfg('arrow', {rotation: 0}), cfg('arrow', {rotation: 45}), cfg('arrow', {rotation: 90})],
    options: [cfg('arrow', {rotation: 180}), cfg('arrow', {rotation: 135}), cfg('arrow', {rotation: 120}), cfg('arrow', {rotation: 45})],
    answer: 1
  },
  // 9. Quantitative - Subtraction
  {
    id: 9,
    logic: "Bar count decreases by 1",
    sequence: [cfg('bar', {count: 5}), cfg('bar', {count: 4}), cfg('bar', {count: 3})],
    options: [cfg('bar', {count: 1}), cfg('bar', {count: 4}), cfg('bar', {count: 2}), cfg('bar', {count: 5})],
    answer: 2
  },
  // 10. Complex Multi-Attribute - Color & Rotation
  {
    id: 10,
    logic: "Color alternates Red/Blue, Rotation +90°",
    sequence: [
        cfg('arrow', {color: 'text-red-500', rotation: 0}), 
        cfg('arrow', {color: 'text-blue-500', rotation: 90}), 
        cfg('arrow', {color: 'text-red-500', rotation: 180})
    ],
    options: [
        cfg('arrow', {color: 'text-blue-500', rotation: 180}),
        cfg('arrow', {color: 'text-red-500', rotation: 270}),
        cfg('arrow', {color: 'text-blue-500', rotation: 270}),
        cfg('arrow', {color: 'text-blue-500', rotation: 0})
    ],
    answer: 2
  },
  // 11. Advanced Logic - Shape & Fill Progressive
  {
    id: 11,
    logic: "Sides +1, Fill alternates Solid/Outline",
    sequence: [
        cfg('triangle', {fill: 'solid'}),
        cfg('square', {fill: 'outline'}),
        cfg('pentagon', {fill: 'solid'})
    ],
    options: [
        cfg('hexagon', {fill: 'solid'}),
        cfg('hexagon', {fill: 'outline'}),
        cfg('pentagon', {fill: 'outline'}),
        cfg('star', {fill: 'solid'})
    ],
    answer: 1
  },
  // 12. Spatial - Oscillation
  {
    id: 12,
    logic: "Orientation flips 180° back and forth",
    sequence: [cfg('triangle', {rotation: 0}), cfg('triangle', {rotation: 180}), cfg('triangle', {rotation: 0})],
    options: [cfg('triangle', {rotation: 90}), cfg('triangle', {rotation: 0}), cfg('triangle', {rotation: 180}), cfg('triangle', {rotation: 270})],
    answer: 2
  },
  // 13. Quantitative - Geometric Progression
  {
    id: 13,
    logic: "Count doubles: 1, 2, 4...",
    sequence: [cfg('circle', {count: 1}), cfg('circle', {count: 2}), cfg('circle', {count: 4})],
    options: [cfg('circle', {count: 6}), cfg('circle', {count: 8}), cfg('circle', {count: 5}), cfg('circle', {count: 10})],
    answer: 1
  },
  // 14. Nested Logic - Synchronized Rotation
  {
    id: 14,
    logic: "Outer rotates 45°, Inner rotates 90°",
    sequence: [
        cfg('square', {rotation: 0, inner: cfg('arrow', {rotation: 0})}),
        cfg('square', {rotation: 45, inner: cfg('arrow', {rotation: 90})}),
        cfg('square', {rotation: 90, inner: cfg('arrow', {rotation: 180})})
    ],
    options: [
        cfg('square', {rotation: 135, inner: cfg('arrow', {rotation: 270})}),
        cfg('square', {rotation: 135, inner: cfg('arrow', {rotation: 180})}),
        cfg('square', {rotation: 90, inner: cfg('arrow', {rotation: 270})}),
        cfg('square', {rotation: 180, inner: cfg('arrow', {rotation: 0})})
    ],
    answer: 0
  },
  // 15. Nested Logic - Counter Rotation
  {
    id: 15,
    logic: "Outer rotates CW 45°, Inner rotates CCW 45°",
    sequence: [
        cfg('cross', {rotation: 0, inner: cfg('bar', {rotation: 0})}),
        cfg('cross', {rotation: 45, inner: cfg('bar', {rotation: -45})}), // -45 is 315
        cfg('cross', {rotation: 90, inner: cfg('bar', {rotation: -90})})  // -90 is 270
    ],
    options: [
        cfg('cross', {rotation: 135, inner: cfg('bar', {rotation: 270})}),
        cfg('cross', {rotation: 135, inner: cfg('bar', {rotation: 225})}), // -135 is 225
        cfg('cross', {rotation: 135, inner: cfg('bar', {rotation: 135})}),
        cfg('cross', {rotation: 180, inner: cfg('bar', {rotation: 225})})
    ],
    answer: 1
  },
  // 16. Pattern Memory - Repetition pairs
  {
    id: 16,
    logic: "A, A, B, B, C... pairs of shapes",
    sequence: [cfg('circle'), cfg('circle'), cfg('square'), cfg('square'), cfg('triangle')],
    options: [cfg('square'), cfg('circle'), cfg('triangle'), cfg('star')],
    answer: 2
  },
  // 17. Arithmetic Progression (Steps)
  {
    id: 17,
    logic: "Rotation step increases: +45, +90, +135...",
    sequence: [
        cfg('arrow', {rotation: 0}),   // 0
        cfg('arrow', {rotation: 45}),  // +45
        cfg('arrow', {rotation: 135})  // +90
    ],
    options: [
        cfg('arrow', {rotation: 225}),
        cfg('arrow', {rotation: 270}), // +135
        cfg('arrow', {rotation: 180}),
        cfg('arrow', {rotation: 315})
    ],
    answer: 1
  },
  // 18. Fibonacci Sequence
  {
    id: 18,
    logic: "Fibonacci Count: 1, 1, 2, 3, 5...",
    sequence: [cfg('bar', {count: 1}), cfg('bar', {count: 1}), cfg('bar', {count: 2}), cfg('bar', {count: 3})],
    options: [cfg('bar', {count: 4}), cfg('bar', {count: 5}), cfg('bar', {count: 6}), cfg('bar', {count: 8})],
    answer: 1
  },
  // 19. Matrix/Set Logic (Missing Piece)
  {
    id: 19,
    logic: "Set must contain one of each: Red, Blue, Green. Sequence restarts.",
    sequence: [
        cfg('square', {color: 'text-red-500'}),
        cfg('square', {color: 'text-blue-500'}),
        cfg('square', {color: 'text-green-500'}),
        cfg('square', {color: 'text-red-500'}),
        cfg('square', {color: 'text-blue-500'})
    ],
    options: [
        cfg('square', {color: 'text-red-500'}),
        cfg('square', {color: 'text-blue-500'}),
        cfg('square', {color: 'text-green-500'}),
        cfg('square', {color: 'text-amber-500'})
    ],
    answer: 2
  },
  // 20. The Master Pattern
  {
    id: 20,
    logic: "Sides +1, Color Cycle (R,B,G), Rotation +45°",
    sequence: [
        cfg('triangle', {color: 'text-red-500', rotation: 0}),      // 3 sides, Red, 0
        cfg('square',   {color: 'text-blue-500', rotation: 45}),    // 4 sides, Blue, 45
        cfg('pentagon', {color: 'text-green-500', rotation: 90}), // 5 sides, Green, 90
        cfg('hexagon',  {color: 'text-red-500', rotation: 135})     // 6 sides, Red, 135
    ],
    // Next: 7 sides (Star), Blue, 180
    options: [
        cfg('star', {color: 'text-green-500', rotation: 180}),
        cfg('star', {color: 'text-blue-500', rotation: 180}),
        cfg('hexagon', {color: 'text-blue-500', rotation: 180}),
        cfg('star', {color: 'text-blue-500', rotation: 225})
    ],
    answer: 1
  }
];

// --- COMPONENT: PATTERN RENDERER ---
const PatternRenderer: React.FC<{ config: PatternItemConfig, className?: string }> = ({ config, className }) => {
  const { shape, color, rotation, count, fill, inner } = config;

  const renderShape = (s: ShapeType, f: FillType) => {
    const style = { 
        fill: f === 'solid' ? 'currentColor' : 'none', 
        stroke: 'currentColor', 
        strokeWidth: 2,
        strokeDasharray: f === 'dot' ? '2 2' : 'none'
    };
    
    switch (s) {
        case 'circle': return <circle cx="12" cy="12" r="10" style={style} />;
        case 'square': return <rect x="4" y="4" width="16" height="16" style={style} />;
        case 'triangle': return <polygon points="12,2 22,22 2,22" style={style} />;
        case 'diamond': return <polygon points="12,2 22,12 12,22 2,12" style={style} />;
        case 'pentagon': return <polygon points="12,2 22,9 18,21 6,21 2,9" style={style} />;
        case 'hexagon': return <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" style={style} />;
        case 'star': return <polygon points="12,2 15,8 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,8" style={style} />;
        case 'arrow': return <path d="M12,2 L12,22 M12,2 L6,8 M12,2 L18,8" style={{...style, fill: 'none'}} />;
        case 'cross': return <path d="M12,2 L12,22 M2,12 L22,12" style={{...style, fill: 'none'}} />;
        case 'bar': return <rect x="8" y={22 - (count * 5)} width="8" height={count * 5} style={{fill: 'currentColor'}} />;
        default: return <circle cx="12" cy="12" r="10" style={style} />;
    }
  };

  const getGridPosition = (idx: number, total: number) => {
      if (total === 1) return { x: 0, y: 0, scale: 1 };
      if (total <= 4) return { 
          x: (idx % 2) * 24 - 12, 
          y: Math.floor(idx / 2) * 24 - 12, 
          scale: 0.5 
      };
      return { 
        x: (idx % 3) * 16 - 16, 
        y: Math.floor(idx / 3) * 16 - 16, 
        scale: 0.33 
      };
  };

  
  return (
    <div className={`relative w-24 h-24 flex items-center justify-center ${color} ${className}`}>
        {Array.from({ length: shape === 'bar' ? 1 : count }).map((_, i) => {
            const pos = getGridPosition(i, shape === 'bar' ? 1 : count);
            // Special handling for 'bar' type which uses count internally for height
            return (
                <div 
                    key={i}
                    style={{ 
                        transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale}) rotate(${rotation}deg)`,
                        transition: 'all 0.3s ease'
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <svg viewBox="0 0 24 24" className="w-16 h-16">
                        {renderShape(shape, fill)}
                    </svg>
                    {inner && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <svg viewBox="0 0 24 24" className="w-8 h-8" style={{transform: `rotate(${inner.rotation - rotation}deg)`}}>
                                {renderShape(inner.shape, inner.fill)}
                            </svg>
                        </div>
                    )}
                </div>
            );
        })}
    </div>
  );
};


// --- EXISTING DASHBOARD LOGIC (MODIFIED FOR NEW IQ TEST) ---

const SAMPLE_JOB_DESC = `
  **Role:** Senior Customer Support & Onboarding Specialist.
  **Responsibilities:** 1. Monitor shared inbox for new client emails.
  2. Categorize emails into 'Support', 'Sales', or 'Billing'.
  3. If 'Support', check knowledge base. If answer found, draft reply using tone guidelines.
  4. If 'Sales', log lead in CRM (Salesforce) and notify account manager via Slack.
  5. If 'Billing', generate invoice PDF from Stripe data and email to client.
  6. Weekly, aggregate all ticket sentiment and generate a PDF report for management.
`;

const TOOLBOX_ITEMS = [
  { type: 'trigger', label: 'Email Trigger', icon: 'zap', color: 'bg-purple-500' },
  { type: 'ai-tool', label: 'ChatGPT (GPT-5)', icon: 'brain', color: 'bg-amber-500' },
  { type: 'ai-tool', label: 'Gemini 3', icon: 'brain', color: 'bg-amber-500' },
  { type: 'action', label: 'Send Slack Msg', icon: 'message', color: 'bg-blue-500' },
  { type: 'action', label: 'Update CRM', icon: 'database', color: 'bg-blue-500' },
  { type: 'compute', label: 'Python Script', icon: 'cpu', color: 'bg-slate-600' },
  { type: 'compute', label: 'RPA Bot', icon: 'server', color: 'bg-slate-600' },
  { type: 'output', label: 'Generate PDF', icon: 'file', color: 'bg-green-500' },
];

// Metrics Lookup for Estimations
const NODE_METRICS: Record<string, { cost: number, time: number, load: number }> = {
    'trigger': { cost: 0.00, time: 50, load: 1 },
    'ai-tool': { cost: 0.03, time: 2500, load: 80 },
    'action': { cost: 0.00, time: 200, load: 5 },
    'compute': { cost: 0.002, time: 800, load: 40 },
    'output': { cost: 0.00, time: 1200, load: 10 }
};

const AssociateDashboard: React.FC<AssociateDashboardProps> = ({ availableJobs }) => {
  const [view, setView] = useState<'profile' | 'iq-test' | 'iq-complete' | 'node-intro' | 'node-challenge' | 'dashboard'>('profile');
  const [isVetted, setIsVetted] = useState(false);
  const [activeTab, setActiveTab] = useState<'bids' | 'careers' | 'solutes'>('bids');
  const [solutesBalance, setSolutesBalance] = useState(0);

  // --- NEW STATE: ONBOARDING MODAL ---
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showSoluteInfoModal, setShowSoluteInfoModal] = useState(false);

  // --- IQ TEST STATE ---
  const [currentIqIndex, setCurrentIqIndex] = useState(0);
  const [iqAnswers, setIqAnswers] = useState<number[]>([]);

  // --- NODAL INTERFACE STATE ---
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: 'start', type: 'trigger', label: 'New Email Received', x: 50, y: 250, icon: 'zap' }
  ]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isBriefExpanded, setIsBriefExpanded] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Custom Node State
  const [showCustomNodeDialog, setShowCustomNodeDialog] = useState(false);
  const [customNodeForm, setCustomNodeForm] = useState({ label: '', type: 'action' });

  // Evaluation State
  const [isLoading, setIsLoading] = useState(false);
  const [gradingResult, setGradingResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null); // Added Error State

// Professional Assessment State
const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes (in seconds)
  
// Timer Logic
useEffect(() => {
  if (view === 'iq-test' && timeLeft > 0) {
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  } else if (timeLeft === 0 && view === 'iq-test') {
    setView('iq-complete'); // Auto-submit on timeout
  }
}, [timeLeft, view]);

// Helper to format time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

  // --- API DATA STATE ---
  const [companies, setCompanies] = useState<Company[]>([]);
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    // In a real app, verify vetting before fetching restricted data
    if (view === 'dashboard') {
        const loadData = async () => {
            const [c, t] = await Promise.all([getCompanies(), getMicroTasks()]);
            setCompanies(c);
            setMicroTasks(t);
        };
        loadData();
    }
  }, [view]);

  // --- WORKFLOW METRICS CALCULATION ---
  const workflowMetrics = useMemo(() => {
     return nodes.reduce((acc, node) => {
         const metrics = NODE_METRICS[node.type] || NODE_METRICS['action'];
         return {
             cost: acc.cost + metrics.cost,
             time: acc.time + metrics.time,
             load: acc.load + metrics.load
         };
     }, { cost: 0, time: 0, load: 0 });
  }, [nodes]);

  // --- SOLUTE LOGIC ---
  const handleTaskComplete = async (taskId: string, reward: number) => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert("You must be logged in to complete tasks.");
        return;
      }
      try {
        await completeMicroTask(taskId, userId);
        setSolutesBalance(prev => prev + reward);
        alert(`Task Completed! You earned ${reward} Solutes.`);
      } catch (err: any) {
        alert(`Error completing task: ${err.message}`);
      }
  };

  // --- IQ TEST LOGIC ---
  const handleIqAnswer = (optionIndex: number) => {
    const newAnswers = [...iqAnswers, optionIndex];
    setIqAnswers(newAnswers);
    
    // Auto-advance to next question or finish
    if (currentIqIndex < IQ_QUESTIONS.length - 1) { 
      setCurrentIqIndex(prev => prev + 1);
    } else {
      // Finish Test immediately
      setView('iq-complete');
    }
  };

  // Skip logic for debugging - REMOVE IN PROD
  // useEffect(() => { if (view === 'iq-test') setView('node-challenge'); }, []);

  // --- NODAL INTERFACE LOGIC ---
  const addNode = (tool: { type: string, label: string, icon?: string }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: tool.type as any,
      label: tool.label,
      x: 200 + Math.random() * 50,
      y: 200 + Math.random() * 50,
      icon: tool.icon || 'settings'
    };
    setNodes([...nodes, newNode]);
  };

  const handleAddCustomNode = () => {
      if(!customNodeForm.label) return;
      addNode({ 
          type: customNodeForm.type, 
          label: customNodeForm.label, 
          icon: 'settings' 
      });
      setCustomNodeForm({ label: '', type: 'action' });
      setShowCustomNodeDialog(false);
  };

  const deleteNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isConnecting) {
      if (selectedNodeId && selectedNodeId !== id) {
        setConnections([...connections, { 
          id: `conn-${Date.now()}`, 
          from: selectedNodeId, 
          to: id 
        }]);
        setIsConnecting(false);
        setSelectedNodeId(null);
      }
    } else {
      setDraggingNodeId(id);
      setSelectedNodeId(id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (draggingNodeId) {
      setNodes(prev => prev.map(n => 
        n.id === draggingNodeId ? { ...n, x: x - 96, y: y - 24 } : n // Centered drag anchor
      ));
    }
  };

  const handleMouseUp = () => setDraggingNodeId(null);

  const startConnection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    setIsConnecting(true);
  };

  const getBezierPath = (source: {x: number, y: number}, target: {x: number, y: number}) => {
    const sx = source.x + 192; // Node width
    const sy = source.y + 48;  // Node half height (approx)
    const tx = target.x;
    const ty = target.y + 48;
    
    // Bezier control points for smooth S-curve
    return `M ${sx} ${sy} C ${sx + 60} ${sy}, ${tx - 60} ${ty}, ${tx} ${ty}`;
  };

  const getNodeColor = (type: string) => {
      switch(type) {
          case 'trigger': return 'bg-purple-500 border-purple-200 text-purple-700';
          case 'ai-tool': return 'bg-amber-500 border-amber-200 text-amber-700';
          case 'action': return 'bg-blue-500 border-blue-200 text-blue-700';
          case 'output': return 'bg-green-500 border-green-200 text-green-700';
          default: return 'bg-slate-500 border-slate-200 text-slate-700';
      }
  };

  const getNodeIcon = (iconStr: string | undefined) => {
      switch(iconStr) {
          case 'zap': return <Zap className="w-4 h-4 text-white" />;
          case 'brain': return <BrainCircuit className="w-4 h-4 text-white" />;
          case 'message': return <Mail className="w-4 h-4 text-white" />;
          case 'database': return <Database className="w-4 h-4 text-white" />;
          case 'cpu': return <Cpu className="w-4 h-4 text-white" />;
          case 'server': return <Server className="w-4 h-4 text-white" />;
          case 'file': return <FileText className="w-4 h-4 text-white" />;
          case 'settings': return <Settings className="w-4 h-4 text-white" />;
          default: return <Zap className="w-4 h-4 text-white" />;
      }
  };

  // --- SUBMIT LOGIC ---
  const submitWorkflow = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const graph: WorkflowGraph = { nodes, connections };
      const { data } = await evaluateWorkflow({ 
        jobDescription: SAMPLE_JOB_DESC, 
        workflowGraph: graph 
      });
      
      setGradingResult(data);
      if (data.passed) setIsVetted(true);
    } catch (err: any) {
      console.error("Workflow evaluation failed:", err);
      setError(err.message || "System Error: Unable to verify workflow. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER FUNCTIONS ---

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* --- ONBOARDING INSTRUCTION MODAL --- */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Sovereign Verification Process</h3>
                <p className="text-sm text-slate-500">How to become a Sovereign Associate</p>

              </div>
              <button 
                onClick={() => setShowOnboardingModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Step 1 */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm text-amber-600 font-bold text-lg">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    Cognitive Pattern Assessment
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">5 Mins</span>
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    A 20-question visual IQ test designed to evaluate your pattern recognition and logical reasoning capabilities.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm text-blue-600 font-bold text-lg">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    Nodal Agent Challenge
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">10 Mins</span>

                  </h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    A practical engineering task. You will be given a client brief and must construct a working automation workflow using our node-based tool.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                 <Info className="w-5 h-5 text-amber-600 shrink-0" />
                 <p className="text-xs text-amber-800">
                   <strong>Note:</strong> You must score above 85% on the combined assessment to access client projects. You can retake the assessment after 24 hours if you fail.
                 </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowOnboardingModal(false)}
                className="px-5 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowOnboardingModal(false);
                  setView('iq-test');
                }}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Begin Assessment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DASHBOARD PROFILE CONTENT --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl">👨‍💻</div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Alex Associate</h2>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                    <span className={`flex items-center gap-1 text-sm font-medium ${isVetted ? 'text-green-600' : 'text-amber-600'}`}>
                        {isVetted ? <BadgeCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {isVetted ? 'Sovereign Associate' : 'Elite Candidate'}

                    </span>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-2">Verification Status</h3>
                <p className="text-sm text-slate-600 mb-4">Complete the IQ test and Nodal Automation Challenge to unlock client projects.</p>
                {!isVetted ? (
                      <button 
                        onClick={() => setShowOnboardingModal(true)} 
                        className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                      >
                        Start Onboarding Process
                    </button>
                ) : (
                    <button 
                        onClick={() => setView('dashboard')} 
                        className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                    >
                        Enter Workspace
                    </button>
                )}
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-2">Platform Activity</h3>
                <p className="text-sm text-slate-600 mb-4 text-slate-600">{availableJobs.length} active projects matching your skills.</p>
                <button 
                    onClick={() => isVetted ? setView('dashboard') : null} 
                    disabled={!isVetted} 
                    className={`w-full py-2 rounded-lg font-medium transition-colors border ${isVetted ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'}`}
                >
                    View Dashboard
                </button>
            </div>
        </div>
      </div>
    </div>
  );

  const renderIQTest = () => {
    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <LoadingAnimation message="Processing Response" submessage="Analyzing cognitive patterns..." />
            </div>
        );
    }

    const question = IQ_QUESTIONS[currentIqIndex];

    return (
        <div className="max-w-5xl mx-auto min-h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-500">
            
            {/* --- ASSESSMENT HUD --- */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 rounded-t-xl">
                <div>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assessment Protocol</h2>
                    <div className="flex items-center gap-2 text-slate-900 font-mono font-medium">
                        <span>S-294.B</span>
                        <span className="text-slate-300">|</span>
                        <span>Item {currentIqIndex + 1} of {IQ_QUESTIONS.length}</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Remaining</p>
                        <p className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                    <button 
                        onClick={() => setView('profile')} 
                        className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                        ABORT
                    </button>
                </div>
            </div>

            {/* --- PROGRESS BAR --- */}
            <div className="h-1 w-full bg-slate-100">
                <div 
                    className="h-full bg-slate-900 transition-all duration-500 ease-out" 
                    style={{ width: `${((currentIqIndex + 1) / IQ_QUESTIONS.length) * 100}%` }}
                ></div>
            </div>

            <div className="flex-1 bg-slate-50/50 p-6 md:p-10 flex flex-col items-center gap-8">
                
                {/* --- PROBLEM MATRIX --- */}
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100/50 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sequence Data</span>
                        <Info className="w-4 h-4 text-slate-300" />
                    </div>
                    
                    <div 
                        className="p-8 md:p-12 flex flex-wrap items-center justify-center gap-8 md:gap-12 min-h-[200px]"
                        style={{
                            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    >
                        {question.sequence.map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    FIG.{idx + 1}
                                </div>
                                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                                    <PatternRenderer config={item} />
                                </div>
                                {idx < question.sequence.length - 1 && (
                                    <div className="absolute top-1/2 -right-8 md:-right-10 -translate-y-1/2 text-slate-300">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* The "Unknown" Slot */}
                        <div className="relative">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400">
                                TARGET
                            </div>
                            <div className="w-28 h-28 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner animate-pulse">
                                <span className="text-3xl font-bold text-slate-300">?</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SELECTION MATRIX --- */}
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Logical Continuation</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {question.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleIqAnswer(idx)}
                                className="group relative bg-white hover:bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col items-center gap-3 active:scale-95 active:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            >
                                <div className="absolute top-2 left-3 text-[10px] font-bold text-slate-300 group-hover:text-amber-500">
                                    OPT {String.fromCharCode(65 + idx)}
                                </div>
                                <PatternRenderer config={opt} />
                                <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-amber-500 mt-2 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
  };

  const renderIQComplete = () => (
    <div className="max-w-xl mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 pt-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Assessment Complete</h2>
        <p className="text-slate-600 text-lg">
            Thank you for completing this assessment. Your pattern recognition skills have been recorded.
        </p>
        <button 
            onClick={() => setView('node-intro')}
            className="px-8 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 mx-auto"
        >
            Next <ArrowRight className="w-4 h-4" />
        </button>
    </div>
  );

  const renderNodeIntro = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 pt-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Nodal Automation Challenge</h2>
            </div>
            
            <div className="space-y-4 text-slate-600 mb-8">
                <p>
                    You have demonstrated your cognitive aptitude. Now, we need to verify your practical expertise in designing automation workflows.
                </p>
                <p>
                    In this challenge, you will be presented with a client job description. Your task is to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
                    <li>Deconstruct the role into logical steps.</li>
                    <li>Select appropriate AI and automation tools from the toolbox.</li>
                    <li>Connect nodes to visualize the automated process flow.</li>
                    <li>Submit your blueprint for AI analysis.</li>
                </ul>
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={() => setView('node-challenge')}
                    className="px-8 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Play className="w-4 h-4" /> Start Challenge
                </button>
            </div>
        </div>
    </div>
  );

  const renderNodeChallenge = () => {
    if (isLoading) return <div className="flex items-center justify-center h-[600px]"><LoadingAnimation message="Evaluating Workflow" submessage="Analyzing logic..." /></div>;

    // --- UPDATED ERROR DISPLAY WITH BYPASS ---
    if (error) {
      return (
        <div className="max-w-2xl mx-auto pt-10 animate-in fade-in zoom-in-95">
          <div className="p-8 rounded-2xl border bg-red-50 border-red-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Server Connection Error</h2>
            <p className="text-slate-600 mb-6 font-mono text-xs bg-red-100/50 p-2 rounded">{error}</p>
            
            <div className="flex flex-col gap-3 justify-center sm:flex-row">
                <button 
                onClick={() => { setError(null); submitWorkflow(); }} 
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm"
                >
                Retry Connection
                </button>
            </div>

            <button 
              onClick={() => setError(null)} 
              className="block w-full mt-6 text-sm text-slate-500 hover:text-slate-800 underline"
            >
              Back to Editor
            </button>
          </div>
        </div>
      );
    }

    if (gradingResult) {
      return (
        <div className="max-w-2xl mx-auto pt-10 animate-in fade-in zoom-in-95">
             <div className={`p-8 rounded-2xl border ${gradingResult.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} shadow-sm`}>
                <div className="flex items-center gap-4 mb-4">
                  {gradingResult.passed ? <CheckCircle className="w-10 h-10 text-green-600" /> : <X className="w-10 h-10 text-red-600" />}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{gradingResult.passed ? "Vetting Passed!" : "Workflow Needs Improvement"}</h2>
                    <p className="text-slate-600">Automation Score: {gradingResult.score}/100</p>
                  </div>
                </div>
                <div className="bg-white/50 p-4 rounded-xl text-slate-700 mb-6">{gradingResult.feedback}</div>
                {gradingResult.passed ? (
                  <button onClick={() => setView('dashboard')} className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800">Go to Workspace</button>
                ) : (
                   <button onClick={() => setGradingResult(null)} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50">Try Again</button>
                )}
            </div>
        </div>
      );
    }

    return (
      <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 relative">
        <div className="flex justify-between items-center mb-4">
           <div>
             <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                 <BrainCircuit className="w-6 h-6 text-amber-500" /> 
                 Nodal Automation Challenge
                 <button 
                    onClick={() => setShowInfoModal(true)} 
                    className="ml-2 text-slate-400 hover:text-amber-500 transition-colors rounded-full hover:bg-slate-100 p-1"
                    title="Challenge Instructions"
                 >
                    <Info className="w-5 h-5" />
                 </button>
             </h2>
             <p className="text-sm text-slate-500">Automate the job description by connecting tools.</p>
           </div>
           <button onClick={submitWorkflow} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-2 transition-all hover:scale-105">
             <Play className="w-4 h-4" /> Run & Evaluate
           </button>
        </div>

        {/* Info Modal Overlay */}
        {showInfoModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200 rounded-xl">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-200">
                    <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-1 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                            <BrainCircuit className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                             <h3 className="text-xl font-bold text-slate-900">Challenge Instructions</h3>
                             <p className="text-sm text-slate-500">How to pass the vetting process</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 text-slate-600 mb-8">
                        <p>
                            In this challenge, you need to design an automated workflow for the provided job description.
                        </p>
                        <ul className="list-disc pl-5 space-y-3 text-slate-700 font-medium text-sm">
                            <li><strong>Deconstruct</strong> the role into logical steps based on the brief.</li>
                            <li><strong>Select</strong> appropriate tools from the toolbar (AI, Trigger, Action).</li>
                            <li><strong>Connect</strong> nodes by dragging from the output circle (⚫) of one node to another.</li>
                            <li><strong>Monitor</strong> your system metrics in the bottom right corner.</li>
                            <li><strong>Submit</strong> your blueprint for AI analysis to get your score.</li>
                        </ul>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={() => setShowInfoModal(false)} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                            Return to Challenge
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Custom Node Modal */}
        {showCustomNodeDialog && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/20 backdrop-blur-[1px]">
                <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-200 w-80 animate-in zoom-in-95 duration-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Add Custom Node</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Tool Name</label>
                            <input 
                                autoFocus
                                type="text" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" 
                                placeholder="e.g. Scraper API"
                                value={customNodeForm.label}
                                onChange={(e) => setCustomNodeForm({...customNodeForm, label: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                                value={customNodeForm.type}
                                onChange={(e) => setCustomNodeForm({...customNodeForm, type: e.target.value})}
                            >
                                <option value="trigger">Trigger</option>
                                <option value="action">Action</option>
                                <option value="ai-tool">AI Tool</option>
                                <option value="compute">Compute</option>
                                <option value="output">Output</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                             <button onClick={() => setShowCustomNodeDialog(false)} className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded text-sm">Cancel</button>
                             <button onClick={handleAddCustomNode} className="px-3 py-1.5 bg-amber-500 text-white rounded text-sm font-medium hover:bg-amber-600">Add Tool</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Task Brief - Top Collapsible */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 overflow-hidden shrink-0">
             <button onClick={() => setIsBriefExpanded(!isBriefExpanded)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" /> Task Brief
                </h3>
                {isBriefExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
             </button>
             {isBriefExpanded && (
                <div className="p-4 border-t border-slate-200 bg-white max-h-48 overflow-y-auto">
                    <div className="prose prose-sm prose-slate text-sm max-w-none"><div dangerouslySetInnerHTML={{ __html: SAMPLE_JOB_DESC.replace(/\n/g, '<br/>') }} /></div>
                </div>
             )}
        </div>

        <div className="flex-1 flex flex-col gap-4 relative overflow-hidden">
             {/* Toolbox */}
             <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-2 overflow-x-auto shrink-0 items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider py-2 px-2 flex items-center">Tools:</span>
                {TOOLBOX_ITEMS.map((tool, idx) => (
                  <button key={idx} onClick={() => addNode(tool)} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-medium text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap ${tool.color}`}>
                    <Plus className="w-3 h-3" /> {tool.label}
                  </button>
                ))}
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <button onClick={() => setShowCustomNodeDialog(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-medium bg-slate-800 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap">
                   <PenTool className="w-3 h-3" /> Custom
                </button>
             </div>

             {/* Interactive Canvas */}
             <div 
                ref={canvasRef} 
                className="flex-1 rounded-xl border border-slate-200 relative overflow-hidden cursor-crosshair shadow-inner min-h-0"
                style={{
                  backgroundColor: '#f8fafc',
                  backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
                onMouseMove={handleMouseMove} 
                onMouseUp={handleMouseUp}
             >
                <div className="absolute top-4 left-4 text-xs bg-white/80 backdrop-blur px-3 py-1 rounded-full text-slate-500 pointer-events-none border border-slate-200 shadow-sm z-20">
                    Drag nodes to move. Click ⚫ to connect.
                </div>

                {/* Real-time System Monitor */}
                <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm text-white p-4 rounded-xl border border-slate-700 shadow-2xl z-30 w-64 animate-in slide-in-from-bottom-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-700 pb-2 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> System Monitor
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2 text-sm text-slate-300">
                                 <DollarSign className="w-4 h-4 text-amber-500" /> Cost/Run
                             </div>
                             <span className="font-mono font-bold">${workflowMetrics.cost.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2 text-sm text-slate-300">
                                 <Clock className="w-4 h-4 text-blue-500" /> Latency
                             </div>
                             <span className="font-mono font-bold">{(workflowMetrics.time / 1000).toFixed(1)}s</span>
                        </div>
                        <div className="space-y-1">
                             <div className="flex justify-between items-center text-xs text-slate-400">
                                 <span>Compute Load</span>
                                 <span>{workflowMetrics.load}%</span>
                             </div>
                             <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full transition-all duration-500 ${workflowMetrics.load > 100 ? 'bg-red-500' : 'bg-green-500'}`} 
                                    style={{width: `${Math.min(workflowMetrics.load, 100)}%`}}
                                 ></div>
                             </div>
                        </div>
                    </div>
                </div>

                <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
                  <defs>
                      <marker id="head" orient="auto" markerWidth="6" markerHeight="6" refX="5" refY="3">
                        <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
                      </marker>
                  </defs>
                  
                  {/* Dynamic Connection Line */}
                  {isConnecting && selectedNodeId && (
                      <path 
                        d={getBezierPath(
                           nodes.find(n => n.id === selectedNodeId)!,
                           mousePos
                        )}
                        stroke="#cbd5e1" 
                        strokeWidth="3" 
                        fill="none"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                  )}

                  {/* Existing Connections */}
                  {connections.map(conn => {
                    const from = nodes.find(n => n.id === conn.from);
                    const to = nodes.find(n => n.id === conn.to);
                    if (!from || !to) return null;
                    return (
                        <path 
                            key={conn.id}
                            d={getBezierPath(from, to)}
                            stroke="#94a3b8"
                            strokeWidth="3"
                            fill="none"
                            markerEnd="url(#head)"
                            className="transition-all duration-300"
                        />
                    );
                  })}
                </svg>

                {nodes.map(node => (
                  <div 
                    key={node.id} 
                    className={`absolute w-48 rounded-xl shadow-sm flex flex-col z-10 select-none transition-all duration-75 group
                        ${selectedNodeId === node.id ? 'ring-2 ring-amber-400 shadow-md scale-105' : 'shadow-sm hover:shadow-md'}`} 
                    style={{ left: node.x, top: node.y }} 
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                  >
                    {/* Node Header */}
                    <div className={`h-8 rounded-t-xl flex items-center justify-between px-3 ${getNodeColor(node.type).split(' ')[0]}`}>
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">{node.type}</span>
                        <div className="flex gap-1">
                            <button 
                                onMouseDown={(e) => deleteNode(e, node.id)}
                                className="text-white/60 hover:text-white hover:bg-white/20 rounded p-0.5 transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Node Body */}
                    <div className="bg-white p-3 rounded-b-xl border-x border-b border-slate-200 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getNodeColor(node.type).split(' ')[0]}`}>
                            {getNodeIcon(node.icon)}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 leading-tight">{node.label}</span>
                    </div>

                    {/* Input Handle (Visual Only) */}
                    <div className="absolute -left-1.5 top-12 w-3 h-3 bg-slate-100 border-2 border-slate-300 rounded-full"></div>

                    {/* Output Handle (Clickable) */}
                    <div 
                      className="absolute -right-1.5 top-12 w-3 h-3 bg-white border-2 border-slate-400 rounded-full cursor-pointer hover:bg-amber-400 hover:border-amber-500 hover:scale-125 transition-all"
                      onMouseDown={(e) => startConnection(e, node.id)}
                    ></div>

                  </div>
                ))}
             </div>
          </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500 relative">
        
        {/* --- SOLUTES INFO MODAL --- */}
        {showSoluteInfoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            The Solumetrics Ecosystem
                        </h3>
                        <button 
                            onClick={() => setShowSoluteInfoModal(false)}
                            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        
                        {/* WARNING BOX */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-800 text-sm">Strict Meritocracy</h4>
                                <p className="text-sm text-amber-700 mt-1">
                                    Solutes <strong>cannot be bought, sold, or transferred</strong>. They are exclusively earned through verified work on the Solumetrics dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Hexagon className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">What are Solutes?</h4>
                                    <p className="text-sm text-slate-600">The metric of your professional reputation. Earning Solutes unlocks higher tiers of access within the platform.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Gavel className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Project Bids</h4>
                                    <p className="text-sm text-slate-600">Use your reputation score to place bids on high-value client automation projects.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Career Opportunities</h4>
                                    <p className="text-sm text-slate-600">High Solute balances reveal exclusive full-time roles at top-tier tech firms.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
                        <button onClick={() => setShowSoluteInfoModal(false)} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
                 <button onClick={() => setView('profile')} className="text-slate-500 hover:text-slate-900 text-sm mb-2 block">&larr; Back to Profile</button>
                 <h2 className="text-3xl font-bold text-slate-900">Associate Workspace</h2>
                 <p className="text-slate-500">Manage your projects, career, and reputation.</p>
            </div>
            
            {/* UPDATED HEADER SECTION */}
            <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-0.5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solutes Balance</p>
                        <button 
                            onClick={() => setShowSoluteInfoModal(true)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                            title="How Solutes Work"
                        >
                            <Info className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{solutesBalance.toLocaleString()}</p>
                </div>
                {/* NEW BLACK AND WHITE ICON */}
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    <Hexagon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
            </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
            <button 
                onClick={() => setActiveTab('bids')} 
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'bids' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
                <Gavel className="w-4 h-4" /> Project Bids
            </button>
            <button 
                onClick={() => setActiveTab('careers')} 
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'careers' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
                <Building2 className="w-4 h-4" /> Career Opportunities
            </button>
            <button 
                onClick={() => setActiveTab('solutes')} 
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'solutes' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
                <Gem className="w-4 h-4" /> Earn Solutes
            </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'bids' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800">Open Projects for Bidding</h3>
                <div className="grid gap-4">
                    {availableJobs.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-slate-200"><p className="text-slate-500">No active projects available yet.</p></div>
                    ) : (
                        availableJobs.map(job => (
                            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{job.blueprint.jobTitle}</h3>
                                        <p className="text-slate-500 text-sm mb-4">{job.clientName} • Posted {job.postedDate}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{job.status}</span>
                                         <span className="text-xs text-slate-400">0 Bids placed</span>
                                    </div>
                                </div>
                                <p className="text-slate-600 mb-4 line-clamp-2">{job.blueprint.summary}</p>
                                <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-1"><Award className="w-4 h-4 text-amber-500" /><span>Est. Value: ${Math.round(job.blueprint.estimatedAnnualSavings * 0.15).toLocaleString()}</span></div>
                                    <div className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-slate-400" /><span>Tasks: {job.blueprint.tasks.length}</span></div>
                                    <button className="ml-auto px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Place Bid</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {activeTab === 'careers' && (
             <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800">Companies Hiring Automation Talent</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {companies.map(company => (
                        <div key={company.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-amber-200 transition-all">
                             <div className="flex items-center gap-4 mb-4">
                                 <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl border border-slate-100">
                                     {company.logo}
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-slate-900">{company.name}</h4>
                                     <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full">{company.industry}</span>
                                 </div>
                             </div>
                             <p className="text-sm text-slate-600 mb-4 h-10">{company.description}</p>
                             <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                 <span className="text-sm font-semibold text-green-600">{company.openRoles} Open Roles</span>
                                 <button className="text-sm font-medium text-slate-900 hover:text-amber-600 flex items-center gap-1">View Careers <ArrowRight className="w-4 h-4" /></button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'solutes' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Micro-Tasks <span className="text-sm font-normal text-slate-500 ml-2">Build your reputation score</span></h3>
                </div>
                <div className="grid gap-4">
                    {microTasks.map(task => (
                        <div key={task.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between group">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.type === 'Labeling' ? 'bg-blue-100 text-blue-600' : task.type === 'Design' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {task.type === 'Labeling' ? <Database className="w-5 h-5" /> : task.type === 'Design' ? <PenTool className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{task.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{task.type}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.timeEstimate}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2">{task.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-amber-500 flex items-center justify-end gap-1">
                                    +{task.solutesReward} <Gem className="w-4 h-4" />
                                </div>
                                <button 
                                    onClick={() => handleTaskComplete(task.id, task.solutesReward)}
                                    className="mt-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                                >
                                    Start Task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100">
        {/* --- GLOBAL HEADER START --- */}
        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                    <Hexagon className="w-5 h-5 text-amber-400 fill-amber-400/20" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">solumetrics</span>
            </div>
            {view !== 'profile' && view !== 'dashboard' && (
                <div className="text-xs font-medium text-slate-400 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                   Restricted Environment
                </div>
            )}
        </nav>
        {/* --- GLOBAL HEADER END --- */}

        <div className="w-full p-6">
            {view === 'profile' && renderProfile()}
            {view === 'iq-test' && renderIQTest()}
            {view === 'iq-complete' && renderIQComplete()}
            {view === 'node-intro' && renderNodeIntro()}
            {view === 'node-challenge' && renderNodeChallenge()}
            {view === 'dashboard' && renderDashboard()}
        </div>
    </div>
  );
};

export default AssociateDashboard;