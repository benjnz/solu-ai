import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Search,
  CheckCircle, 
  Database,
  Layers,
  Settings,
  Clock,
  Lock,
  Play,
  Sparkles,
  Activity,
  Zap,
  Users,
  Brain,
  FileText,
  Terminal,
  Cpu,
  Shield,
  Trash2,
  Edit3,
  Plus,
  Pause,
  Layout,
  Code,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  ShieldCheck,
  Heart,
  Globe,
  Network,
  GitBranch,
  RefreshCw,
  Wallet,
  Compass,
  LineChart as LineChartIcon,
  Flag,
  ShoppingBag,
  Server,
  Smile,
  Check,
  BarChart4,
  Lightbulb,
  Dna,
  GitMerge,
  Target,
  FileLock2,
  Skull,
  ShieldAlert,
  Repeat,
  Eye,
  Send,
  Mic,
  Video,
  Scale,
  Gavel,
  Infinity,
  Recycle,
  Leaf,
  Star,
  Share2,
  TrendingUp,
  Umbrella,
  Banknote,
  Landmark,
  Truck,
  Package,
  Shuffle,
  Factory,
  TestTube,
  Microscope,
  UserPlus,
  Presentation,
  CreditCard,
  PenTool,
  Megaphone,
  AlertOctagon,
  BadgeCheck,
  BookOpen,
  HeartPulse,
  History,
  UserCheck,
  PieChart,
  Globe2,
  Bot,
  Award,
  Grid,
  Puzzle,
  Box,
  Link,
  BrainCircuit,
  Cloud,
  GraduationCap,
  Archive,
  UserSquare,
  MonitorPlay
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { getBuildRequests, updateBuildRequestStatus, createDeployedAgent, getCollectiveWisdom, getGlobalStrategy, updateAgentStatus, deleteBuildRequest, deleteDeployedAgent, updateAgentName } from '../services/db';
import { executeAgentCommand } from '../services/geminiService';
import { deployWorkerAgent, executeAgent, testTool, startTelemetry, updateAgentBackendStatus, deleteAgentBackend, renameAgentBackend } from '../services/agentService';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { JobPost, Blueprint } from '../types';
import BusinessDashboard from './BusinessDashboard';
import { CONFIG } from '../services/config';
import InfrastructureConfig from './Admin/InfrastructureConfig';
import IdentityConfig from './Admin/IdentityConfig';
import AutonomyConfig from './Admin/AutonomyConfig';
import SafetyConfig from './Admin/SafetyConfig';
import RequestManager from './Admin/RequestManager';

const StatCard = ({ title, value, change, icon: Icon }: any) => (
  <div className="bg-[#0b0f19] border border-white/5 px-6 py-4 rounded-[1.5rem] flex items-center justify-between gap-6 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] hover:border-white/10 transition-colors min-w-[240px] flex-shrink-0">
    <div className="flex flex-col space-y-1">
      <div className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</div>
      <div className="flex items-end gap-3 tracking-tighter">
        <span className="text-2xl font-black text-white">{value}</span>
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{change}</span>
      </div>
    </div>
    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[inset_0_0_10px_rgba(99,102,241,0.2)] relative">
      <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md" />
      <Icon className="w-4 h-4 text-indigo-400 relative z-10" />
    </div>
  </div>
);

const CATEGORIES = {
  'Brain': ['infrastructure', 'identity', 'autonomy', 'mission_archive', 'evolutionary_lab', 'neural_pulse', 'personality', 'memory', 'context', 'synthesis', 'learning', 'awareness', 'state'],
  'Intelligence': ['reasoning', 'planning', 'prediction', 'analysis', 'logic', 'creativity', 'intuition', 'reflection', 'search', 'verify', 'critique', 'neural_reflection'],
  'Abilities': ['connections', 'tools', 'knowledge', 'actions', 'sensors', 'outputs', 'skills', 'plugins', 'extensions', 'api', 'sandbox'],
  'Safety': ['governance', 'resilience', 'compliance', 'ethics_guardrails', 'alignment', 'audit', 'security', 'privacy', 'recovery'],
  'Operations': ['collaboration', 'scheduling', 'events', 'lifecycle', 'circular', 'sustainability'],
  'Economics': ['cost_control', 'scenario_lab', 'metrics', 'compensation', 'marketplace', 'resources'],
  'Enterprise': ['legal', 'hr_management', 'pr_strategy', 'innovation_intel', 'blueprint_requests']
} as const;

const SummaryItem = ({ label, value, active }: any) => (
  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
    <span className="text-slate-500">{label}</span>
    <span className={active ? 'text-white' : 'text-slate-700'}>{value}</span>
  </div>
);

interface AdminDashboardProps {
  jobs: JobPost[];
  onUpdateJob: (jobId: string, status: JobPost['status']) => void;
  deployedAgents: any[];
}

const AgentGridCard = ({ agent, onMonitor, updateAgentStatus, updateAgentBackendStatus }: any) => {
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const isPaused = (localStatus || agent.status)?.toLowerCase() === 'paused';

  return (
    <div className="bg-[#0b0f19] border border-white/5 p-10 rounded-[3rem] transition-all relative overflow-hidden group hover:border-indigo-500/30">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-all" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h4 className="text-2xl font-black text-white tracking-tighter">{agent.blueprint?.jobTitle || 'Custom Agent'}</h4>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-0.5 truncate">{agent.blueprint?.jobTitle}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${isPaused ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
          {isPaused ? 'Paused' : 'Active'}
        </div>
      </div>
                        <div className="space-y-0.5 mb-8 relative z-10">
                          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Company: {agent.clientName}</p>
                          {agent.contactName && <p className="text-slate-600 text-[10px] font-mono">Contact: {agent.contactName}</p>}
                        </div>
      
      <div className="grid grid-cols-2 gap-6 mb-12">
          <div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Consumption</p>
            <p className="text-xl font-black text-white tracking-tight">${(agent.total_cost_usd || 0).toFixed(4)}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">System Latency</p>
            <p className="text-xl font-black text-white tracking-tight">{agent.lastLatency || 0}ms</p>
          </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => onMonitor(agent.id)}
          className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <MonitorPlay className="w-3.5 h-3.5" /> High Fidelity Monitor
        </button>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              const nextStatus = isPaused ? 'Active' : 'Paused';
              console.log(`DEBUG: Optimistic Admin Update for ${agent.id} to ${nextStatus}`);
              setLocalStatus(nextStatus);
              
              try {
                await updateAgentStatus(agent.id, nextStatus as any);
                await updateAgentBackendStatus(agent.id, nextStatus as any);
              } catch (err: any) {
                console.error("ERROR: Admin Status Toggle Failed:", err);
                setLocalStatus(null); // Revert to prop
              }
            }}
            className={`p-4 rounded-2xl border transition-all ${isPaused ? 'bg-amber-600 text-white border-amber-700 shadow-lg shadow-amber-600/20' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ jobs, onUpdateJob, deployedAgents }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [dashboardView, setDashboardView] = useState<'requests' | 'active_agents'>(
    (searchParams.get('view') as any) || 'requests'
  );
  const [selectedMonitorAgentId, setSelectedMonitorAgentId] = useState<string | null>(
    searchParams.get('monitor')
  );

  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get('cat') || 'Brain'
  );

  const [configTab, setConfigTab] = useState<string>(
    searchParams.get('tab') || (CATEGORIES[activeCategory as keyof typeof CATEGORIES] as any)[0]
  );

  const selectedJob = useMemo(() => jobs.find(j => j.id === id) || null, [id, jobs]);


  const [wisdom, setWisdom] = useState<any[]>([]);
  const [strategy, setStrategy] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [repairAudits, setRepairAudits] = useState<Record<string, any>>({});

  // Sync State to URL Params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // View state
    if (dashboardView === 'requests') params.delete('view');
    else params.set('view', dashboardView);
    
    // Monitor state
    if (selectedMonitorAgentId) params.set('monitor', selectedMonitorAgentId);
    else params.delete('monitor');
    
    // Config Tabs (Only if monitoring or building)
    if (selectedJob || selectedMonitorAgentId) {
      params.set('cat', activeCategory);
      params.set('tab', configTab);
    } else {
      params.delete('cat');
      params.delete('tab');
    }
    
    setSearchParams(params, { replace: true });
  }, [dashboardView, selectedMonitorAgentId, activeCategory, configTab, selectedJob]);

  useEffect(() => {
    const unsubWisdom = getCollectiveWisdom((fetchedWisdom) => {
      setWisdom(fetchedWisdom || []);
    });
    const unsubStrategy = getGlobalStrategy((fetchedStrategy) => {
      setStrategy(fetchedStrategy);
    });
    
    // Fetch analytics for the evolution graph
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/governance/analytics`);
        const data = await response.json();
        if (data.analytics) {
          const chartData = data.analytics.reverse().map((m: any, i: number) => ({
            name: `C${i+1}`,
            trust: Math.round((m.confidence_score || 0.8) * 100),
            yield: Math.round((m.esg_impact || 0.05) * 2000) // Scaled for visualization
          }));
          setAnalytics(chartData);
        }
      } catch (e) {
        console.error("Failed to fetch analytics:", e);
      }
    };

    // Fetch repair audits for tripped agents
    const fetchRepairs = async (agents: any[]) => {
      const tripped = agents.filter(a => (a.tool_errors || 0) >= 3);
      const audits: Record<string, any> = {};
      
      for (const agent of tripped) {
        try {
          const res = await fetch(`${CONFIG.API_BASE_URL}/governance/repair/${agent.id}`);
          const data = await res.json();
          if (data.repairs && data.repairs.length > 0) {
            audits[agent.id] = data.repairs[0];
          }
        } catch (e) {
          console.error(`Failed to fetch repair audit for ${agent.id}:`, e);
        }
      }
      setRepairAudits(audits);
    };

    fetchAnalytics();
    if (deployedAgents.length > 0) fetchRepairs(deployedAgents);

    return () => {
      unsubWisdom();
      unsubStrategy();
    };
  }, []);

  const handleTripCircuit = async () => {
    if (confirm("URGENT: This will terminate all active agent nodes and engage the Sovereign Circuit Breaker. Proceed?")) {
      try {
        await fetch(`${CONFIG.API_BASE_URL}/governance/circuit-trip`, { method: 'POST' });
        alert("Sovereign Circuit Breaker Engaged. All nodes terminated.");
      } catch (e) {
        alert("Failed to engage circuit breaker. Manual intervention required.");
      }
    }
  };

  const handleRunChaosTest = async (agentId: string) => {
    if (confirm("PROACTIVE RESILIENCE AUDIT: This will simulate latency, tool failures, and resource exhaustion on this node to verify its resilience thresholds. Proceed?")) {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/governance/chaos-test/${agentId}`, { method: 'POST' });
        const data = await response.json();
        alert(`Chaos Test Complete: ${data.status}\n\nPhases:\n${data.phases.join('\n')}`);
      } catch (e) {
        alert("Chaos Suite Execution Failed: Infrastructure too unstable to support stress test.");
      }
    }
  };

  const [draftingAgent, setDraftingAgent] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  // Agent Infrastructure Configuration
  const [model, setModel] = useState('gemini-2.5-flash');
  const [memoryType, setMemoryType] = useState('Vector Storage (Pinecone)');
  const [hoverTab, setHoverTab] = useState<string | null>(null);

  // Identity State
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [agentTone, setAgentTone] = useState<'Professional' | 'Friendly' | 'Technical' | 'Creative'>('Professional');
  const [systemPrompt, setSystemPrompt] = useState('');

  // Autonomy State
  const [autonomyLevel, setAutonomyLevel] = useState<'HITL' | 'Semi-Autonomous' | 'Fully-Autonomous'>('Semi-Autonomous');
  const [allowRetries, setAllowRetries] = useState(true);
  const [maxBudget, setMaxBudget] = useState(50);

  // Safety & Guardrails State
  const [maskPII, setMaskPII] = useState(true);
  const [enforceTone, setEnforceTone] = useState(true);
  const [restrictedTopics, setRestrictedTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');

  // Knowledge State
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);

  // Tuning State
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const [maxTokens, setMaxTokens] = useState(4096);

  // Webhooks State
  const [webhooks, setWebhooks] = useState<any[]>([]);

  // Collaboration State
  const [peerAgentIds, setPeerAgentIds] = useState<string[]>([]);
  const [allowDelegation, setAllowDelegation] = useState(true);
  const [newPeerId, setNewPeerId] = useState('');

  // Scheduling State
  const [cronExpression, setCronExpression] = useState('0 9 * * *');
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);

  // Shared State
  const [sharedState, setSharedState] = useState<Record<string, string>>({});
  const [newStateKey, setNewStateKey] = useState('');
  const [newStateValue, setNewStateValue] = useState('');

  // Access State
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [newUserId, setNewUserId] = useState('');

  // Resilience & Metrics State
  const [fallbackModel, setFallbackModel] = useState('Gemini 1.5 Pro');
  const [retryCount, setRetryCount] = useState(3);
  const [budgetLimit, setBudgetLimit] = useState(500);
  const [trackLatency, setTrackLatency] = useState(true);
  const [trackTokenCost, setTrackTokenCost] = useState(true);
  const [circuitBreaking, setCircuitBreaking] = useState(true);
  const [dailyBudgetUSD, setDailyBudgetUSD] = useState(50);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [alertInterval, setAlertInterval] = useState<'once' | 'daily' | 'hourly'>('daily');
  const [failoverMode, setFailoverMode] = useState<'immediate' | 'delayed' | 'manual'>('immediate');

  // Versioning & History
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [currentVersion, setCurrentVersion] = useState(1);

  // HITL & Personalization
  const [hitlEnabled, setHitlEnabled] = useState(true);
  const [managerEmail, setManagerEmail] = useState('');
  const [preferredChannel, setPreferredChannel] = useState('slack');
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([
    { id: 'app_1', action: 'Data Export (Stripe)', agent: 'Atlas Financial', risk: 'High', timestamp: new Date() }
  ]);
  // --- ORCHESTRATION LAYER STATE ---
  
  // 1. Brain & Identity
  const [avatarUrl, setAvatarUrl] = useState('');
  const [themeColor, setThemeColor] = useState('indigo');
  const [optimizationTarget, setOptimizationTarget] = useState<'Quality' | 'Speed' | 'Cost'>('Quality');
  const [learningVelocity, setLearningVelocity] = useState(75);
  const [mutationRate, setMutationRate] = useState(20);
  const [humorLevel, setHumorLevel] = useState(10);
  const [empathyLevel, setEmpathyLevel] = useState(80);
  const [strictnessLevel, setStrictnessLevel] = useState(90);

  // 2. Cognitive & Memory
  const [shortTermContextLimit, setShortTermContextLimit] = useState(32000);
  const [longTermRecallDepth, setLongTermRecallDepth] = useState(5);
  const [synthesisDetail, setSynthesisDetail] = useState<'Standard' | 'Thorough' | 'Exhaustive'>('Thorough');
  const [knowledgeSources, setKnowledgeSources] = useState<string[]>(['Conversation', 'System Docs']);
  const [selfCorrectionLevel, setSelfCorrectionLevel] = useState(85);
  
  // 3. Intelligence (Reasoning & Planning)
  const [reflectionEnabled, setReflectionEnabled] = useState(true);
  const [maxReasoningLoops, setMaxReasoningLoops] = useState(5);
  const [cognitiveDepth, setCognitiveDepth] = useState<'Standard' | 'Deep' | 'Extreme'>('Deep');
  const [decompositionDepth, setDecompositionDepth] = useState(3);
  const [alternatePathAnalysis, setAlternatePathAnalysis] = useState(true);
  const [predictionHorizon, setPredictionHorizon] = useState(7);
  const [analysisRigor, setAnalysisRigor] = useState(80);
  const [creativityBias, setCreativityBias] = useState(50);
  const [critiqueIntensity, setCritiqueIntensity] = useState(60);
  const [selfCritiqueEnabled, setSelfCritiqueEnabled] = useState(true);
  const [verificationPasses, setVerificationPasses] = useState(2);

  // 4. Persistence & Operations
  const [sessionPersistence, setSessionPersistence] = useState(true);
  const [checkpointFrequency, setCheckpointFrequency] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [eventTriggers, setEventTriggers] = useState<any[]>([]);
  const [peerDiscovery, setPeerDiscovery] = useState(false);
  const [maxSubTasks, setMaxSubTasks] = useState(3);

  // 5. Abilities & Integration
  const [connections, setConnections] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [customApiEndpoints, setCustomApiEndpoints] = useState<any[]>([]);
  const [authType, setAuthType] = useState<'OAuth2' | 'ApiKey' | 'Basic'>('ApiKey');
  const [dynamicPayloadMapping, setDynamicPayloadMapping] = useState(true);
  const [externalCallbackUrl, setExternalCallbackUrl] = useState('');
  const [eventPropagationDelay, setEventPropagationDelay] = useState(500);
  const [platformHandshake, setPlatformHandshake] = useState(true);
  const [automatedActions, setAutomatedActions] = useState<any[]>([]);
  const [activeSensors, setActiveSensors] = useState<string[]>(['Heartbeat', 'Error Monitor']);
  const [outputFormats, setOutputFormats] = useState<string[]>(['JSON', 'Markdown', 'Voice']);
  const [sandboxEnabled, setSandboxEnabled] = useState(true);
  const [sandboxStrictness, setSandboxStrictness] = useState<'Permissive' | 'Isolated' | 'Fortress'>('Isolated');

  // 6. Infrastructure & Sandbox
  const [governanceStrictness, setGovernanceStrictness] = useState(80);
  const [resilienceLevel, setResilienceLevel] = useState(70);
  const [complianceFramework, setComplianceFramework] = useState<'SOC2' | 'GDPR' | 'HIPAA'>('SOC2');
  const [ethicsRigor, setEthicsRigor] = useState(90);
  const [humanValueAlignment, setHumanValueAlignment] = useState<'Strict' | 'Balanced' | 'Permissive'>('Strict');

  // 7. Operations & Economics (Restored/New)
  const [scoutingEnabled, setScoutingEnabled] = useState(true);
  const [scoutingSensitivity, setScoutingSensitivity] = useState<'Broad' | 'Targeted' | 'Laser-Focus'>('Targeted');
  const [latencyThreshold, setLatencyThreshold] = useState(500);
  const [alertHeartbeat, setAlertHeartbeat] = useState<'Real-time' | 'Every 5m' | 'Batch'>('Every 5m');
  const [eventInterceptEnabled, setEventInterceptEnabled] = useState(true);
  const [lifecycleAutomationEnabled, setLifecycleAutomationEnabled] = useState(true);
  const [provisioningStrategy, setProvisioningStrategy] = useState<'Aggressive' | 'Balanced' | 'Conservative'>('Balanced');
  const [decommissioningPolicy, setDecommissioningPolicy] = useState<'Immediate' | 'Graceful' | 'Staged'>('Graceful');
  const [tokenRecyclingEnabled, setTokenRecyclingEnabled] = useState(true);
  const [reinvestmentRatio, setReinvestmentRatio] = useState(15);
  const [profitSharingTier, setProfitSharingTier] = useState<'Tier 1' | 'Tier 2' | 'Tier 3'>('Tier 1');
  const [carbonOffsetEnabled, setCarbonOffsetEnabled] = useState(false);
  const [computeEfficiencyTarget, setComputeEfficiencyTarget] = useState(90);
  const [billingModel, setBillingModel] = useState<'Usage-Based' | 'Subscription' | 'Outcome-Based'>('Usage-Based');
  const [baseRateUSD, setBaseRateUSD] = useState(0.002);
  const [performanceBonusPercent, setPerformanceBonusPercent] = useState(10);
  const [taskBiddingEnabled, setTaskBiddingEnabled] = useState(true);
  const [maxBidUSD, setMaxBidUSD] = useState(5);
  const [marketSpecialization, setMarketSpecialization] = useState<'Generalist' | 'Cybersecurity' | 'Legal'>('Generalist');
  const [resourceSharingProtocol, setResourceSharingProtocol] = useState<'Peer-to-Peer' | 'Centralized' | 'Encrypted-Relay'>('Peer-to-Peer');

  // 8. Enterprise & Legal
  const [legalEntityType, setLegalEntityType] = useState<'DAO-LLC' | 'Trust' | 'Sovereign'>('DAO-LLC');
  const [legalJurisdiction, setLegalJurisdiction] = useState('Wyoming (Digital)');
  const [contractSigningEnabled, setContractSigningEnabled] = useState(true);
  const [hiringStrategy, setHiringStrategy] = useState<'Quality-First' | 'Speed-to-Hire' | 'Cost-Optimized'>('Quality-First');
  const [performanceReviewFrequency, setPerformanceReviewFrequency] = useState<'Weekly' | 'Monthly' | 'Quarterly'>('Monthly');
  const [maxBaseSalaryUSD, setMaxBaseSalaryUSD] = useState(100);
  const [pressReleaseAutomation, setPressReleaseAutomation] = useState(true);
  const [crisisResponseIntensity, setCrisisResponseIntensity] = useState<'Defensive' | 'Neutral' | 'Aggressive'>('Neutral');
  const [innovationMaturityThreshold, setInnovationMaturityThreshold] = useState(30);
  const [whitePaperGeneration, setWhitePaperGeneration] = useState(true);
  const [runtimeVersion, setRuntimeVersion] = useState('Node.js 20');
  const [cpuLimit, setCpuLimit] = useState(1);
  const [memoryLimit, setMemoryLimit] = useState(512);
  const [isolatedNetwork, setIsolatedNetwork] = useState(true);

  // 8. Advanced RAG
  const [ragSources, setRagSources] = useState<any[]>([]);
  const [chunkSize, setChunkSize] = useState(1000);
  const [overlap, setOverlap] = useState(200);
  const [shortTermBufferSize, setShortTermBufferSize] = useState(2048);
  const [longTermSummaryEnabled, setLongTermSummaryEnabled] = useState(true);
  const [semanticSearchDepth, setSemanticSearchDepth] = useState(5);
  const [contextPruningStrategy, setContextPruningStrategy] = useState<'Rolling' | 'Summarized' | 'Fixed'>('Rolling');
  const [relevantFactExtraction, setRelevantFactExtraction] = useState(true);
  const [rigorLevel, setRigorLevel] = useState<'Standard' | 'High' | 'Scientific'>('Standard');
  const [sourceAttribution, setSourceAttribution] = useState(true);

  // --- RESTORED ORCHESTRATION STATES (INDUSTRIAL, LEGAL, ECONOMIC, SECURITY) ---
  const [inspectionFrequency, setInspectionFrequency] = useState<'Continuous' | 'Batch-Based' | 'Statistical'>('Continuous');
  const [qcStandard, setQcStandard] = useState<'ISO-9001' | 'Six-Sigma' | 'Heuristic-AI'>('ISO-9001');
  const [defectThreshold, setDefectThreshold] = useState(0.01);
  const [rdFocus, setRdFocus] = useState<'Incremental-Improvement' | 'Moonshot-Innovation' | 'Cost-Reduction'>('Incremental-Improvement');
  const [innovationBudgetUSD, setInnovationBudgetUSD] = useState(50000);
  const [experimentSuccessRate, setExperimentSuccessRate] = useState(0.4);
  const [candidateScoringModel, setCandidateScoringModel] = useState<'Skill-First' | 'Culture-Fit' | 'AI-Heuristic'>('AI-Heuristic');
  const [talentDevelopmentBudgetUSD, setTalentDevelopmentBudgetUSD] = useState(10000);
  const [retentionTarget, setRetentionTarget] = useState(0.9);
  const [payrollProvider, setPayrollProvider] = useState<'Gusto' | 'Deel' | 'Rippling' | 'Autonomous-Payout'>('Deel');
  const [payrollFrequency, setPayrollFrequency] = useState<'Weekly' | 'Monthly'>('Monthly');
  const [benefitPackageTier, setBenefitPackageTier] = useState<'Standard' | 'Premium' | 'Executive'>('Premium');
  const [legalEntityStatus, setLegalEntityStatus] = useState<'Active-Sovereign' | 'Registered-Proxy' | 'DAO-Governed'>('Active-Sovereign');
  const [maxLegalSpendUSD, setMaxLegalSpendUSD] = useState(25000);
  const [jurisdictionOptimization, setJurisdictionOptimization] = useState<'Digital-Nomad' | 'Tax-Haven' | 'High-Compliance'>('High-Compliance');
  const [patentFilingAutomation, setPatentFilingAutomation] = useState(true);
  const [ipStrategy, setIpStrategy] = useState<'Open-Source' | 'Defensive-Patenting' | 'Aggressive-Monetization'>('Defensive-Patenting');
  const [copyrightProtectionLevel, setCopyrightProtectionLevel] = useState<'Standard' | 'High-Fidelity' | 'Watermarked'>('High-Fidelity');
  const [signatureAuthority, setSignatureAuthority] = useState<'Fully-Autonomous' | 'Multi-Sig' | 'Human-Required'>('Multi-Sig');
  const [contractStandard, setContractStandard] = useState<'SMART-Standard' | 'Custom-Legal' | 'Hybrid'>('Hybrid');
  const [negotiationIntensity, setNegotiationIntensity] = useState(0.7);
  const [mediaEngagementStrategy, setMediaEngagementStrategy] = useState<'Proactive-Outreach' | 'Reactive-Only' | 'Thought-Leadership'>('Thought-Leadership');
  const [maxPRSpendUSD, setMaxPRSpendUSD] = useState(15000);
  const [automatedFactChecking, setAutomatedFactChecking] = useState(true);
  const [crisisThreshold, setCrisisThreshold] = useState(0.3);
  const [visualIdentityAudit, setVisualIdentityAudit] = useState<'Continuous' | 'Periodic' | 'Manual'>('Continuous');
  const [brandVoiceConsistency, setBrandVoiceConsistency] = useState(0.95);
  const [contentDistributionChannels, setContentDistributionChannels] = useState<('X' | 'LinkedIn' | 'Thread' | 'Website')[]>(['LinkedIn', 'Website']);
  const [citationStandard, setCitationStandard] = useState<'APA' | 'MLA' | 'IEEE' | 'Nature-Style'>('Nature-Style');
  const [literatureReviewIntensity, setLiteratureReviewIntensity] = useState(0.85);
  const [researchPaperSources, setResearchPaperSources] = useState<('arXiv' | 'PubMed' | 'IEEE' | 'Nature')[]>(['arXiv', 'Nature']);
  const [competitorTrackingEnabled, setCompetitorTrackingEnabled] = useState(true);
  const [scoutingAperture, setScoutingAperture] = useState<'Narrow-Niche' | 'Broad-Industry' | 'Global-Tech'>('Broad-Industry');
  const [priorArtSearchDepth, setPriorArtSearchDepth] = useState(0.9);
  const [technologyTrendAnalysis, setTechnologyTrendAnalysis] = useState<'Real-Time' | 'Weekly' | 'Monthly'>('Real-Time');
  const [pentestIntensity, setPentestIntensity] = useState(0.8);
  const [targetedServiceScan, setTargetedServiceScan] = useState<('API' | 'Database' | 'Web' | 'Auth')[]>(['API', 'Auth']);
  const [autonomousExploitMitigation, setAutonomousExploitMitigation] = useState(true);
  const [biasDetectionEnabled, setBiasDetectionEnabled] = useState(true);
  const [factualityThreshold, setFactualityThreshold] = useState(0.95);
  const [processingBoundary, setProcessingBoundary] = useState<'Internal' | 'Enclave' | 'Public'>('Enclave');
  const [idleComputeLease, setIdleComputeLease] = useState(true);
  const [auditLoggingLevel, setAuditLoggingLevel] = useState<'Standard' | 'Deep' | 'Forensic'>('Standard');
  const [retentionPolicyDays, setRetentionPolicyDays] = useState(90);
  const [dataRegion, setDataRegion] = useState<'US' | 'EU' | 'Asia' | 'Global'>('US');
  const [sharedSecretVault, setSharedSecretVault] = useState(true);
  const [ethicalMonitoringEnabled, setEthicalMonitoringEnabled] = useState(true);
  const [alignmentFramework, setAlignmentFramework] = useState<'Universal' | 'Corporate' | 'Custom'>('Universal');
  const [biasThreshold, setBiasThreshold] = useState(0.05);
  const [auditFrequency, setAuditFrequency] = useState<'Daily' | 'Weekly' | 'Continuous'>('Weekly');
  const [plugins, setPlugins] = useState<any[]>([]);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [quorumSize, setQuorumSize] = useState(3);
  const [vetoPowerEnabled, setVetoPowerEnabled] = useState(false);

  // --- API KEYS STATE ---
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [pineconeApiKey, setPineconeApiKey] = useState('');
  const [pineconeEnv, setPineconeEnv] = useState('us-east-1-aws');
  const [serperApiKey, setSerperApiKey] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<'Pending' | 'Active' | 'Archived'>('Active');
  const [reviewIntensity, setReviewIntensity] = useState(0.5);
  const [maxContractValueUSD, setMaxContractValueUSD] = useState(100000);
  const [negotiationModel, setNegotiationModel] = useState<'Win-Win' | 'Aggressive' | 'Passive'>('Win-Win');
  const [legalAuditType, setLegalAuditType] = useState<'Internal' | 'External' | 'AI-Audit'>('AI-Audit');
  const [kycAmlTier, setKycAmlTier] = useState<'Tier 1' | 'Tier 2' | 'Tier 3'>('Tier 2');
  const [complianceEnforcement, setComplianceEnforcement] = useState<'Strict' | 'Advisory' | 'None'>('Strict');
  const [premiumAutomationEnabled, setPremiumAutomationEnabled] = useState(true);
  const [coverageType, setCoverageType] = useState<'General' | 'Professional' | 'Cyber'>('Professional');
  const [coverageLimitUSD, setCoverageLimitUSD] = useState(1000000);
  const [underwritingIntensity, setUnderwritingIntensity] = useState(0.4);
  const [maxExposureUSD, setMaxExposureUSD] = useState(500000);
  const [underwritingModel, setUnderwritingModel] = useState<'Standard' | 'Risk-Adjusted' | 'Aggressive'>('Standard');
  const [indemnityAllocation, setIndemnityAllocation] = useState(0.1);
  const [claimsHandlingMode, setClaimsHandlingMode] = useState<'Manual' | 'Auto' | 'Hybrid'>('Hybrid');
  const [indemnityTier, setIndemnityTier] = useState<'Bronze' | 'Silver' | 'Gold'>('Silver');
  const [resolutionMode, setResolutionMode] = useState<'Arbitration' | 'Mediation' | 'Litigation'>('Arbitration');
  const [maxSettlementUSD, setMaxSettlementUSD] = useState(50000);
  const [arbitrationVenue, setArbitrationVenue] = useState<'Digital' | 'Geneva' | 'New-York'>('Digital');
  const [conflictThreshold, setConflictThreshold] = useState(0.2);
  const [mitigationStrategy, setMitigationStrategy] = useState<'De-escalation' | 'Neutralize' | 'Escalate'>('De-escalation');
  const [ruleSetVersion, setRuleSetVersion] = useState('v2.1');
  const [evidenceStandard, setEvidenceStandard] = useState<'Strict' | 'Standard' | 'Flexible'>('Standard');
  const [automatedTaxWithholding, setAutomatedTaxWithholding] = useState(true);
  const [taxJurisdiction, setTaxJurisdiction] = useState('US-DE');
  const [taxOptimizationStrategy, setTaxOptimizationStrategy] = useState<'Minimal' | 'Optimal' | 'Aggressive'>('Optimal');
  const [reportingStandard, setReportingStandard] = useState<'GAAP' | 'IFRS' | 'Crypto-Native'>('GAAP');
  const [treasuryAuditFrequency, setTreasuryAuditFrequency] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Quarterly');
  const [reserveRatio, setReserveRatio] = useState(0.2);
  const [onRampProvider, setOnRampProvider] = useState<'Circle' | 'Stripe' | 'Coinbase'>('Circle');
  const [maxDailyConversionUSD, setMaxDailyConversionUSD] = useState(10000);
  const [kybTier, setKybTier] = useState<'Level 1' | 'Level 2' | 'Level 3'>('Level 2');
  const [procurementStrategy, setProcurementStrategy] = useState<'Just-in-Time' | 'Bulk' | 'Hybrid'>('Hybrid');
  const [vendorSelectionCriteria, setVendorSelectionCriteria] = useState<'Price' | 'Reliability' | 'Ethics'>('Reliability');
  const [maxPurchaseOrderUSD, setMaxPurchaseOrderUSD] = useState(5000);
  const [reorderPoint, setReorderPoint] = useState(100);
  const [safetyStockLevel, setSafetyStockLevel] = useState(50);
  const [valuationMethod, setValuationMethod] = useState<'FIFO' | 'LIFO' | 'Average'>('Average');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [lastMileMode, setLastMileMode] = useState<'Autonomous' | 'Third-Party' | 'Hybrid'>('Hybrid');
  const [logisticsProvider, setLogisticsProvider] = useState<'FedEx' | 'UPS' | 'DHL' | 'Sovereign-Fleet'>('DHL');
  const [logisticsOptimization, setLogisticsOptimization] = useState<'Time' | 'Cost' | 'Carbon'>('Time');
  const [productionMode, setProductionMode] = useState<'Continuous' | 'Batch' | 'On-Demand'>('Continuous');
  const [automationLevel, setAutomationLevel] = useState<'Low' | 'Medium' | 'High' | 'Full'>('High');
  const [maxDailyThroughput, setMaxDailyThroughput] = useState(1000);
  const [securityShieldPower, setSecurityShieldPower] = useState(85);
  const [evolutionaryMode, setEvolutionaryMode] = useState<'Adaptive' | 'Static'>('Adaptive');
  const [neuralPulseRate, setNeuralPulseRate] = useState(42);
  const [cognitiveAwareness, setCognitiveAwareness] = useState(88);
  const [brainActivity, setBrainActivity] = useState(72);
  const [altruismBias, setAltruismBias] = useState(80);
  const [sarcasmThreshold, setSarcasmThreshold] = useState(10);
  // Intelligence State
  const [reasoningDepth, setReasoningDepth] = useState(7);
  const [planningHorizon, setPlanningHorizon] = useState(12);
  const [predictionConfidence, setPredictionConfidence] = useState(85);
  const [logicStrictness, setLogicStrictness] = useState(90);
  const [creativityLevel, setCreativityLevel] = useState(60);
  const [intuitionBias, setIntuitionBias] = useState(30);
  const [reflectionFrequency, setReflectionFrequency] = useState<'Constant' | 'Periodic' | 'Manual'>('Periodic');

  // Abilities State
  const [isolatedSandbox, setIsolatedSandbox] = useState(true);
  const [networkAccessLevel, setNetworkAccessLevel] = useState<'Restricted' | 'Sandboxed' | 'Open'>('Sandboxed');
  const [skillVerificationStrictness, setSkillVerificationStrictness] = useState(100);
  const [actionLoggingLevel, setActionLoggingLevel] = useState<'Minimal' | 'Verbose' | 'Forensic'>('Verbose');
  const [approvalWorkflowEnabled, setApprovalWorkflowEnabled] = useState(false);

  // Safety & Recovery State
  const [autoRecoveryEnabled, setAutoRecoveryEnabled] = useState(true);
  const [ethicalFramework, setEthicalFramework] = useState<'Standard' | 'Strict' | 'Custom'>('Standard');
  const [purposeLockLevel, setPurposeLockLevel] = useState(100);
  const [dataMaskingActive, setDataMaskingActive] = useState(true);

  // Personality & EQ State
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<string | null>(null);

  const handleIngestKnowledge = async () => {
    setIsIngesting(true);
    setIngestionStatus("Analyzing Repository Architecture...");
    setTimeout(() => setIngestionStatus("Vectorizing Document Chunks (RAG)..."), 2000);
    setTimeout(() => {
      setIngestionStatus("Knowledge Base Updated Successfully.");
      setIsIngesting(false);
      setTimeout(() => setIngestionStatus(null), 3000);
    }, 5000);
  };

  const handleRestoreVersion = (version: any) => {
    const snap = version.configSnapshot;
    if (!snap) return;
    setModel(snap.model || 'Gemini 2.0 Flash');
    setMemoryType(snap.memoryType || 'Vector Storage (Pinecone)');
    setAgentName(snap.identity?.name || '');
    setAgentRole(snap.identity?.role || '');
    setAgentTone(snap.identity?.tone || 'Professional');
    setSystemPrompt(snap.identity?.systemPromptOverride || '');
    setAutonomyLevel(snap.autonomy?.level || 'Semi-Autonomous');
    setAllowRetries(snap.autonomy?.allowRetries ?? true);
    setConnections(snap.connections || []);
    setTools(snap.tools || []);
    setDraftingAgent(true);
  };



  // Empathy Level moved to Evolutionary & Personality State
  const [conflictDeescalation, setConflictDeescalation] = useState(true);
  const [sentimentRigor, setSentimentRigor] = useState(3);
  const [adaptiveToneMapping, setAdaptiveToneMapping] = useState(true);
  const [personaLearningRate, setPersonaLearningRate] = useState(0.1);
  const [avatarStyle, setAvatarStyle] = useState<'3D' | '2D' | 'Text'>('3D');
  const [signatureCatchphrase, setSignatureCatchphrase] = useState('');
  const [culturalContext, setCulturalContext] = useState('Neutral');

  // Agent Intelligence State
  const [knowledgeGraphEnabled, setKnowledgeGraphEnabled] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState<'Real-time' | 'Batch' | 'On-Demand'>('Real-time');
  const [influenceWeight, setInfluenceWeight] = useState(0.5);
  const [sharedBufferEnabled, setSharedBufferEnabled] = useState(true);
  const [crossAgentFactLookup, setCrossAgentFactLookup] = useState(true);
  const [consensusThreshold, setConsensusThreshold] = useState(0.7);
  const [peerReviewRounds, setPeerReviewRounds] = useState(2);
  const [conflictResolutionMode, setConflictResolutionMode] = useState<'Majority' | 'Expert' | 'Senior'>('Majority');

  // Self-Optimization & Learning State
  const [selfOptimizationEnabled, setSelfOptimizationEnabled] = useState(true);
  const [optimizationTargets, setOptimizationTargets] = useState<('Latency' | 'Accuracy' | 'Cost')[]>(['Accuracy']);
  const [autoTuningRange, setAutoTuningRange] = useState(10);
  const [patternExtractionEnabled, setPatternExtractionEnabled] = useState(true);
  const [modeAnalysisEnabled, setModeAnalysisEnabled] = useState(true);
  const [metaStrategyDepth, setMetaStrategyDepth] = useState(5);
  const [agentVarianceEnabled, setAgentVarianceEnabled] = useState(true);
  const [testGroupSize, setTestGroupSize] = useState(5);
  const [championshipFrequency, setChampionshipFrequency] = useState<'Hourly' | 'Daily' | 'Weekly'>('Daily');

  // Hierarchy & Recursive Orchestration State
  const [parentAgentID, setParentAgentID] = useState('');
  const [subAgentDelegationEnabled, setSubAgentDelegationEnabled] = useState(true);
  const [recursionLimit, setRecursionLimit] = useState(3);
  const [recursiveDecompositionDepth, setRecursiveDecompositionDepth] = useState(2);
  const [resourceQuota, setResourceQuota] = useState(1000);
  const [unitaryExecution, setUnitaryExecution] = useState(false);
  const [policyInheritanceEnabled, setPolicyInheritanceEnabled] = useState(true);
  const [overridePermissionLevel, setOverridePermissionLevel] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Red-Teaming & Security Hardening State
  const [redTeamingEnabled, setRedTeamingEnabled] = useState(false);
  const [attackVectors, setAttackVectors] = useState<('Injection' | 'PII' | 'Jailbreak')[]>([]);
  const [simulationIntensity, setSimulationIntensity] = useState(5);
  const [overflowPolicy, setOverflowPolicy] = useState<'Scale' | 'Queue' | 'Reject'>('Queue');
  const [maxConcurrentStress, setMaxConcurrentStress] = useState(50);
  const [autoHardeningEnabled, setAutoHardeningEnabled] = useState(true);
  const [resilienceTier, setResilienceTier] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Multimodal & Sensory Fusion State
  const [multimodalInputEnabled, setMultimodalInputEnabled] = useState(true);
  const [fusionStrategy, setFusionStrategy] = useState<'Early' | 'Late' | 'Hybrid'>('Hybrid');
  const [correlationDepth, setCorrelationDepth] = useState(5);
  const [activeStreams, setActiveStreams] = useState<('Audio' | 'Video' | 'Telemetry')[]>(['Audio', 'Video']);
  const [samplingRateHz, setSamplingRateHz] = useState(30);
  const [spatialReasoningEnabled, setSpatialReasoningEnabled] = useState(true);
  const [temporalContextBufferMS, setTemporalContextBufferMS] = useState(5000);

  // Reputation & Social Trust State
  const [reputationMonitoringEnabled, setReputationMonitoringEnabled] = useState(true);
  const [trustScoreThreshold, setTrustScoreThreshold] = useState(0.7);
  const [endorsementPolicy, setEndorsementPolicy] = useState<'Manual' | 'Auto'>('Auto');
  const [connectivityDepth, setConnectivityDepth] = useState<'Direct' | 'Extended' | 'Global'>('Direct');
  const [mappingMode, setMappingMode] = useState<'Dynamic' | 'Static'>('Dynamic');
  const [trustVerificationEnabled, setTrustVerificationEnabled] = useState(true);
  const [blacklistSyncEnabled, setBlacklistSyncEnabled] = useState(true);
  const [trustModel, setTrustModel] = useState<'Zero-Trust' | 'Verified-Partner'>('Verified-Partner');

  const [firewallAggression, setFirewallAggression] = useState(0.8);
  const [zeroTrustArchitecture, setZeroTrustArchitecture] = useState(true);
  const [idsIpsConfiguration, setIdsIpsConfiguration] = useState<'Detect-Only' | 'Active-Block' | 'Adaptive-Hardening'>('Active-Block');
  const [complianceStandard, setComplianceStandard] = useState<'SOC2' | 'GDPR' | 'HIPAA' | 'ISO-27001'>('SOC2');
  const [automatedAuditFrequency, setAutomatedAuditFrequency] = useState<'Daily' | 'Continuous' | 'Weekly'>('Daily');
  const [securitySpendUSD, setSecuritySpendUSD] = useState(20000);

  // Test Console State
  const [testMessage, setTestMessage] = useState('');
  const [testLogs, setTestLogs] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const handleAddTool = () => {
    const newTool = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      parameters: {},
      isEnabled: true,
      runtime: 'simulation',
      envVars: {}
    };
    setTools([...tools, newTool]);
  };

  const handleUpdateTool = (id: string, updates: any) => {
    setTools(tools.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleRemoveTool = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
  };

  const [testingToolId, setTestingToolId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestConnection = async (toolId: string, config: any) => {
    setTestingToolId(toolId);
    setTestResult(null);
    try {
      const result = await testTool(toolId, config);
      setTestResult(result);
    } catch (err) {
      setTestResult({ status: 'error', message: 'Connection timeout or invalid configuration.' });
    } finally {
      setTimeout(() => setTestingToolId(null), 3000);
    }
  };


  const handleTestCommand = async () => {
    if (!selectedJob || !testMessage.trim()) return;
    setIsTesting(true);
    setTestLogs(prev => [...prev, { message: testMessage, type: 'user', timestamp: new Date() }]);
    
    try {
      const result = await executeAgent('preview-instance', testMessage);
      if (result.agent_logs) {
        setTestLogs(prev => [...prev, { message: result.agent_logs, type: 'thinking', timestamp: new Date() }]);
      }
      setTestLogs(prev => [...prev, { message: result.output, type: 'agent', timestamp: new Date() }]);
      setTestMessage('');
    } catch (error: any) {
      setTestLogs(prev => [...prev, { message: `Test Error: ${error.message}`, type: 'error', timestamp: new Date() }]);
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddConnection = () => {
    const newConn = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'generic_api',
      name: '',
      key: '',
      url: '',
      isEnabled: true,
      details: {}
    };
    setConnections([...connections, newConn]);
  };

  const handleUpdateConnection = (id: string, updates: any) => {
    setConnections(connections.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleRemoveConnection = (id: string) => {
    setConnections(connections.filter(c => c.id !== id));
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'request' | 'agent'; id: string; name: string; step: 'confirm1' | 'type-delete' | null; typedValue?: string } | null>(null);

  const handleDeleteRequest = async (jobId: string) => {
    try {
      console.log(`AdminDashboard: Dispatching delete request for ${jobId}`);
      await deleteBuildRequest(jobId);
      setDeleteConfirm(null);
      // If we are currently viewing this job, go back
      if (selectedJob?.id === jobId) {
        navigate('/admin');
      }
    } catch (e: any) {
      console.error('Failed to delete request:', e);
      alert(`System Error: Could not delete provisioning request. ${e.message}`);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      console.log(`AdminDashboard: Initiating MISSION PURGE for ${agentId}`);
      // 1. Terminate in Backend
      await deleteAgentBackend(agentId);
      // 2. Remove from Firestore
      await deleteDeployedAgent(agentId);
      
      setDeleteConfirm(null);
    } catch (e: any) {
      console.error('FAILED TO PURGE AGENT:', e);
      alert(`CRITICAL INFRASTRUCTURE ERROR: ${e.message}`);
    }
  };

  const handleCreateAgent = (job: JobPost) => {
    navigate(`/admin/request/${job.id}`);
    setDraftingAgent(true);
    setDeploySuccess(false);
    setAgentName(`${job.clientName} ${job.blueprint.jobTitle} Agent`);
    setAgentRole(job.blueprint.jobTitle);
  };

  const handleDeploy = async () => {
    if (!selectedJob) return;

    // Validate API Keys based on model/memory
    if (model.includes('gemini') && !googleApiKey) {
      alert("CRITICAL ERROR: Google Gemini API Key is required for the selected Thinking Core.");
      return;
    }
    if (model.includes('claude') && !anthropicApiKey) {
      alert("CRITICAL ERROR: Anthropic API Key is required for the selected Thinking Core.");
      return;
    }
    if (model.includes('gpt') && !openaiApiKey) {
      alert("CRITICAL ERROR: OpenAI API Key is required for the selected Thinking Core.");
      return;
    }
    if (memoryType.includes('Pinecone') && !pineconeApiKey) {
      alert("WARNING: Pinecone API Key is missing. Long-term memory will be disabled for this agent.");
    }

    setIsDeploying(true);
    try {
      const config = {
        apiKeys: {
          google: googleApiKey,
          anthropic: anthropicApiKey,
          openai: openaiApiKey,
          pinecone: pineconeApiKey,
          serper: serperApiKey
        },
        // 1. Brain (13 tabs)
        brain: {
          model,
          memoryType,
          sandboxEnabled,
          processingBoundary,
          agentName,
          agentRole,
          agentTone,
          autonomyLevel,
          maxBudget,
          allowRetries,
          evolutionaryMode,
          mutationRate,
          neuralPulseRate,
          brainActivity,
          empathyLevel,
          sarcasmThreshold,
          altruismBias,
          longTermRecallDepth,
          shortTermContextLimit,
          contextPruningStrategy,
          rigorLevel,
          synthesisDetail,
          sourceAttribution,
          learningVelocity,
          cognitiveAwareness,
          selfCorrectionLevel,
          knowledgeSources,
          sessionPersistence,
          syncFrequency
        },
        // 2. Intelligence (12 tabs)
        intelligence: {
          maxReasoningLoops,
          cognitiveDepth,
          reflectionEnabled,
          decompositionDepth,
          alternatePathAnalysis,
          predictionHorizon,
          predictionConfidence,
          analysisRigor,
          literatureReviewIntensity,
          logicStrictness,
          strictnessLevel,
          creativityLevel,
          creativityBias,
          intuitionBias,
          reflectionFrequency,
          semanticSearchDepth,
          researchPaperSources,
          verificationPasses,
          selfCritiqueEnabled,
          critiqueIntensity
        },
        // 3. Abilities (11 tabs)
        abilities: {
          connections,
          tools,
          chunkSize,
          automatedActions,
          activeSensors,
          outputFormats,
          skillVerificationStrictness,
          authType,
          dynamicPayloadMapping,
          sandboxStrictness,
          cpuLimit,
          memoryLimit,
          isolatedNetwork,
          plugins,
          extensions,
          rag_config: {
            chunkSize,
            overlap,
            shortTermBufferSize,
            longTermSummaryEnabled,
            relevantFactExtraction,
            sourceAttribution
          }
        },
        // 4. Safety (9 tabs)
        safety: {
          governanceStrictness,
          auditLoggingLevel,
          retentionPolicyDays,
          resilienceLevel,
          failoverMode,
          circuitBreaking,
          complianceFramework,
          kycAmlTier,
          ethicsRigor,
          ethicalFramework,
          humanValueAlignment,
          alignmentFramework,
          auditFrequency,
          securityShieldPower,
          maskPII,
          dataRegion,
          autoRecoveryEnabled
        },
        // 5. Operations (6 tabs)
        operations: {
          maxSubTasks,
          peerDiscovery,
          allowDelegation,
          cronExpression,
          isScheduleEnabled,
          eventInterceptEnabled,
          eventTriggers,
          provisioningStrategy,
          decommissioningPolicy,
          lifecycleAutomationEnabled,
          reinvestmentRatio,
          tokenRecyclingEnabled,
          computeEfficiencyTarget,
          carbonOffsetEnabled
        },
        // 6. Economics (6 tabs)
        economics: {
          budgetLimit,
          dailyBudgetUSD,
          alertThreshold,
          alertInterval,
          billingModel,
          baseRateUSD,
          performanceBonusPercent,
          taskBiddingEnabled,
          maxBidUSD,
          marketSpecialization,
          resourceSharingProtocol,
          idleComputeLease,
          sharedSecretVault
        },
        // 7. Enterprise (5 tabs)
        enterprise: {
          legalEntityType,
          legalJurisdiction,
          contractSigningEnabled,
          hiringStrategy,
          performanceReviewFrequency,
          maxBaseSalaryUSD,
          pressReleaseAutomation,
          crisisResponseIntensity,
          innovationMaturityThreshold,
          whitePaperGeneration
        },
        portalConfig: (() => {
          const sub = (agentName || selectedJob.blueprint.jobTitle).toLowerCase().replace(/[^a-z0-9]/g, '-');
          console.log(`[Admin:Deploy] Calculated subdomain for deployment: ${sub}`);
          return {
            subdomain: sub,
            portalName: agentName || `${selectedJob.clientName} Agent Portal`,
            welcomeMessage: `Hello! I am your autonomous ${selectedJob.blueprint.jobTitle} partner. How can we optimize our workflow today?`,
            appearance: { avatarUrl, theme: themeColor },
            isPublic: true,
            liveUrl: `https://${sub}.${CONFIG.BASE_DOMAIN}`,
            deployedAt: new Date().toISOString()
          };
        })(),
        systemPromptOverride: systemPrompt,
        humanInTheLoop: { enabled: true, approverEmails: [managerEmail], requireApprovalFor: ['budget_high', 'data_delete'] }
      };
      
      setCurrentVersion(v => v + 1);
      setVersionHistory(h => [...h, { version: currentVersion, timestamp: new Date().toISOString(), configSnapshot: config, author: 'System Admin' }]);
      
      // Step 1: Save to Firestore
      await createDeployedAgent(
        selectedJob.id, 
        selectedJob.clientName, 
        selectedJob.blueprint, 
        config as any, 
        selectedJob.companyDetails, 
        selectedJob.clientId,
        agentName,
        selectedJob.companyDetails?.contactName || ''
      );
      
      // Start Live Simulation
      try {
        await startTelemetry(selectedJob.id);
      } catch (teleErr) {
        console.warn("Live telemetry failed to start, but agent is deployed.", teleErr);
      }

      // Step 2: Trigger Worker Backend (Actual Orchestration)
      const backendPayload = {
        role_title: agentRole,
        primary_goal: selectedJob.blueprint.goal || agentRole,
        context_backstory: systemPrompt || selectedJob.blueprint.description,
        task_description: selectedJob.blueprint.description,
        expected_output_format: selectedJob.blueprint.deliverables?.join(', ') || 'Professional documentation and execution logs',
        required_capabilities: connections.map(c => c.type).concat(tools.map(t => t.name))
      };
      
      await deployWorkerAgent(backendPayload);

      // Step 3: Update Status
      await updateBuildRequestStatus(selectedJob.id, 'Deployed');
      setIsDeploying(false);
      setDeploySuccess(true);
      if (onUpdateJob) onUpdateJob(selectedJob.id, 'Deployed');
    } catch (e: any) {
      console.error("Master Orchestrator Failure:", e);
      setIsDeploying(false);
    }
  };

  // --- UI HELPERS FOR ORCHESTRATION ---
  const ConfigSection = ({ title, icon: Icon, description, children }: any) => (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 text-white text-left">
      <div className="space-y-2">
        <h3 className="text-lg md:text-xl font-black flex items-center gap-3"><Icon className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" /> {title}</h3>
        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-2xl">{description}</p>
      </div>
      <div className="bg-[#0b0f19] border border-white/5 p-6 md:p-10 rounded-3xl md:rounded-[4rem] space-y-8 md:space-y-12 shadow-2xl">
        {children}
      </div>
    </div>
  );

  const ParameterGrid = ({ children }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {children}
    </div>
  );

  const SliderField = ({ label, value, onChange, min, max, step, unit, description }: any) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <label className="text-xs font-black text-white uppercase tracking-widest">{label}</label>
        <span className="text-xs font-black text-indigo-400">{value}{unit}</span>
      </div>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">{description}</p>
      <input 
        type="range" min={min} max={max} step={step} 
        value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-indigo-500 bg-white/5 h-1 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options, description }: any) => (
    <div className="space-y-6">
      <label className="text-xs font-black text-white uppercase tracking-widest">{label}</label>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed mb-4">{description}</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${value === opt ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {opt.replace(/-/g, ' ')}
          </button>
        ))}
      </div>
    </div>
  );

  const ToggleField = ({ label, checked, onChange, description }: any) => (
    <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all group">
      <div className="space-y-2">
        <p className="text-xs font-black text-white uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{label}</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight max-w-md">{description}</p>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${checked ? 'bg-indigo-500 shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}
      >
        <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const renderBrainConfig = () => {
    if (configTab === 'infrastructure') return (
      <ConfigSection title="Computing Core" icon={Cloud} description="Select the underlying LLM brain and processing boundary. Pro models offer deeper reasoning for complex logic.">
        <ParameterGrid>
          <SelectField label="Neural Processor" value={model} onChange={setModel} options={['gemini-2.5-flash', 'claude-4.6-sonnet', 'gpt-5.4-mini']} description="Determines processing speed and reasoning fidelity." />
          <SelectField label="Memory Structure" value={memoryType} onChange={setMemoryType} options={['Vector Storage (Pinecone)', 'Relational (Postgres)', 'In-Memory (Redis)', 'Hybrid']} description="How the agent stores and recalls past interactions." />
        </ParameterGrid>

        <div className="pt-8 border-t border-white/5 space-y-10">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Lock className="w-3 h-3" /> Secure Connectivity & API Keys
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Gemini Key</label>
                <input 
                  type="password" 
                  value={googleApiKey} 
                  onChange={(e) => setGoogleApiKey(e.target.value)} 
                  className={`w-full bg-[#060913] border ${model.includes('gemini') && !googleApiKey ? 'border-amber-500/50' : 'border-white/10'} rounded-2xl p-4 text-white focus:border-indigo-500 outline-none font-mono text-sm`} 
                  placeholder="AIza..." 
                />
                {model.includes('gemini') && !googleApiKey && <p className="text-[9px] text-amber-500 font-bold uppercase tracking-tight">Required for select Thinking Core</p>}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anthropic (Claude) Key</label>
                <input 
                  type="password" 
                  value={anthropicApiKey} 
                  onChange={(e) => setAnthropicApiKey(e.target.value)} 
                  className={`w-full bg-[#060913] border ${model.includes('claude') && !anthropicApiKey ? 'border-amber-500/50' : 'border-white/10'} rounded-2xl p-4 text-white focus:border-indigo-500 outline-none font-mono text-sm`} 
                  placeholder="sk-ant-..." 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OpenAI Key</label>
                <input 
                  type="password" 
                  value={openaiApiKey} 
                  onChange={(e) => setOpenaiApiKey(e.target.value)} 
                  className={`w-full bg-[#060913] border ${model.includes('gpt') && !openaiApiKey ? 'border-amber-500/50' : 'border-white/10'} rounded-2xl p-4 text-white focus:border-indigo-500 outline-none font-mono text-sm`} 
                  placeholder="sk-..." 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pinecone Key</label>
                <input 
                  type="password" 
                  value={pineconeApiKey} 
                  onChange={(e) => setPineconeApiKey(e.target.value)} 
                  className={`w-full bg-[#060913] border ${memoryType.includes('Pinecone') && !pineconeApiKey ? 'border-amber-500/50' : 'border-white/10'} rounded-2xl p-4 text-white focus:border-indigo-500 outline-none font-mono text-sm`} 
                  placeholder="pcsk_..." 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-white/5">
            <ToggleField label="Isolated Sandbox" checked={sandboxEnabled} onChange={setSandboxEnabled} description="Prevents the agent from accessing the parent host filesystem." />
            <SelectField label="Processing Boundary" value={processingBoundary} onChange={setProcessingBoundary} options={['Internal', 'Enclave', 'Public']} description="Data isolation level for high-security operations." />
          </div>
        </div>
      </ConfigSection>
    );

    if (configTab === 'identity') return (
      <ConfigSection title="Persona Profile" icon={Users} description="Define the social characteristics and specialization of this specific agent.">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-white uppercase tracking-widest">Agent Name</label>
              <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} className="w-full bg-[#060913] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none" placeholder="e.g. Atlas Finance" />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-white uppercase tracking-widest">Role Specialization</label>
              <input type="text" value={agentRole} onChange={(e) => setAgentRole(e.target.value)} className="w-full bg-[#060913] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none" placeholder="e.g. Lead Analyst" />
            </div>
          </div>
          <SelectField label="Interaction Tone" value={agentTone} onChange={setAgentTone} options={['Professional', 'Friendly', 'Technical', 'Creative']} description="Determines how the agent communicates with users." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'autonomy') return (
      <ConfigSection title="Agency & Decisioning" icon={Zap} description="Define the agent's level of independence. High autonomy allows for faster execution with less oversight.">
        <ParameterGrid>
          <SelectField label="Operating Mode" value={autonomyLevel} onChange={setAutonomyLevel} options={['HITL', 'Semi-Autonomous', 'Fully-Autonomous']} description="HITL (Human-in-the-loop) requires approval for every action." />
          <SliderField label="Max Budget Pool" value={maxBudget} onChange={setMaxBudget} min={5} max={500} step={5} unit="$" description="Maximum funds the agent can authorize per task." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
          <ToggleField label="Auto-Retry on Failure" checked={allowRetries} onChange={setAllowRetries} description="Allows the agent to recover from transient API errors automatically." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'mission_archive') return (
       <ConfigSection title="Mission History" icon={Archive} description="Access previous versions and deployment snapshots of this agent.">
         <div className="bg-white/5 rounded-3xl p-8 border border-white/5 text-center space-y-4">
           <div className="text-4xl font-black text-indigo-400">{versionHistory.length}</div>
           <p className="text-xs font-black text-white uppercase tracking-widest">Stored Snapshots</p>
           <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Access mission-critical configuration rollbacks from the sidebar history.</p>
         </div>
       </ConfigSection>
    );

    if (configTab === 'evolutionary_lab') return (
      <ConfigSection title="Self-Improvement" icon={Dna} description="Configure how the agent optimizes its own prompts and strategies over time.">
        <ParameterGrid>
          <SelectField label="Optimization Mode" value={evolutionaryMode} onChange={setEvolutionaryMode} options={['Static', 'Adaptive']} description="Adaptive mode learns from success/failure metrics." />
          <SliderField label="Mutation Intensity" value={mutationRate} onChange={setMutationRate} min={0} max={100} step={5} unit="%" description="How often the agent experiments with radical new strategies." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'neural_pulse') return (
      <ConfigSection title="Intelligence Pulse" icon={Activity} description="Monitor and tune the real-time processing rhythm of the agent.">
        <ParameterGrid>
          <SliderField label="Pulse Rate" value={neuralPulseRate} onChange={setNeuralPulseRate} min={10} max={100} step={1} unit=" Hz" description="Frequency of internal state checks." />
          <SliderField label="Brain Activity" value={brainActivity} onChange={setBrainActivity} min={0} max={100} step={1} unit="%" description="Base-level cognitive load allocation." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'personality') return (
      <ConfigSection title="Social Tuning" icon={Smile} description="Fine-tune the emotional and social boundaries of the agent interface.">
        <ParameterGrid>
          <SliderField label="Empathy Level" value={empathyLevel} onChange={setEmpathyLevel} min={0} max={100} step={5} unit="%" description="Determines tone softness and user-intent alignment." />
          <SliderField label="Sarcasm Threshold" value={sarcasmThreshold} onChange={setSarcasmThreshold} min={0} max={100} step={5} unit="%" description="Controls the 'wit' and indirectness of communication." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
          <SliderField label="Altruism Bias" value={altruismBias} onChange={setAltruismBias} min={0} max={100} step={5} unit="%" description="Favors user satisfaction over raw efficiency." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'memory') return (
      <ConfigSection title="Knowledge Retrieval" icon={Database} description="Configure how the agent stores and recalls historical data.">
        <ParameterGrid>
          <SelectField label="Memory Layer" value={memoryType} onChange={setMemoryType} options={['Vector Storage (Pinecone)', 'Relational (Postgres)', 'In-Memory (Redis)']} description="Select the architectural tier for fact storage." />
          <SliderField label="Recall Window" value={longTermRecallDepth} onChange={setLongTermRecallDepth} min={1} max={50} step={1} unit=" layers" description="Number of related past events pulled into active context." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'context') return (
      <ConfigSection title="Context Window" icon={FileText} description="Manage the active 'working memory' tokens and pruning strategy.">
        <ParameterGrid>
          <SliderField label="Token Limit" value={shortTermContextLimit} onChange={setShortTermContextLimit} min={1000} max={128000} step={1000} unit=" tokens" description="Max active conversation history size." />
          <SelectField label="Pruning Method" value={contextPruningStrategy} onChange={setContextPruningStrategy} options={['Rolling', 'Summarized', 'Fixed']} description="How to handle context overflow." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'synthesis') return (
      <ConfigSection title="Information Synthesis" icon={GitMerge} description="Control how the agent merges conflicting data from multiple sources.">
        <ParameterGrid>
          <SelectField label="Synthesis Rigor" value={rigorLevel} onChange={setRigorLevel} options={['Standard', 'High', 'Scientific']} description="Level of evidence checking before merging." />
          <SelectField label="Detail Output" value={synthesisDetail} onChange={setSynthesisDetail} options={['Standard', 'Thorough', 'Exhaustive']} description="Granularity of the final synthesized report." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
          <ToggleField label="Fact Attribution" checked={sourceAttribution} onChange={setSourceAttribution} description="Requires the agent to link every fact to a source." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'learning') return (
      <ConfigSection title="Knowledge Acquisition" icon={GraduationCap} description="Configure how the agent learns and updates its internal library.">
        <ParameterGrid>
           <SliderField label="Learning Velocity" value={learningVelocity} onChange={setLearningVelocity} min={0} max={100} step={1} unit="%" description="Speed of pattern recognition." />
           <SliderField label="Self-Mutation Rate" value={mutationRate} onChange={setMutationRate} min={0} max={50} step={1} unit="%" description="How often the agent tries new prompt strategies." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5 space-y-6">
           {['Conversation Patterns', 'Web Research', 'System Documentation'].map(source => (
             <ToggleField key={source} label={`Enable ${source}`} checked={knowledgeSources.includes(source)} onChange={(checked) => {
               if (checked) setKnowledgeSources([...knowledgeSources, source]);
               else setKnowledgeSources(knowledgeSources.filter(s => s !== source));
             }} description={`Allows the agent to ingest data from ${source}.`} />
           ))}
        </div>
      </ConfigSection>
    );

    if (configTab === 'awareness') return (
      <ConfigSection title="Self-Awareness" icon={Eye} description="Tuning the agent's internal monitoring and error-detection loops.">
        <ParameterGrid>
          <SliderField label="Cognitive Awareness" value={cognitiveAwareness} onChange={setCognitiveAwareness} min={0} max={100} step={1} unit="%" description="Intensity of real-time performance monitoring." />
          <SliderField label="Auto-Correction" value={selfCorrectionLevel} onChange={setSelfCorrectionLevel} min={0} max={100} step={1} unit="%" description="Threshold for triggering a 'Thinking Pass' on error." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'state') return (
      <ConfigSection title="System Health" icon={Activity} description="Configure persistence and monitoring for long-running agents.">
        <div className="space-y-8">
           <ToggleField label="Session Persistence" checked={sessionPersistence} onChange={setSessionPersistence} description="Saves state between restarts." />
           <SelectField label="Sync Frequency" value={syncFrequency} onChange={setSyncFrequency} options={['Real-time', 'Batch', 'On-Demand']} description="How often memory is flushed to permanent storage." />
        </div>
      </ConfigSection>
    );
    return null;
  };

  const renderIntelligenceConfig = () => {
    if (configTab === 'reasoning') return (
      <ConfigSection title="Thinking Depth" icon={Brain} description="Adjust how much 'CPU-thinking' the agent performs before finalizing an answer.">
        <ParameterGrid>
          <SliderField label="Reasoning Intensity" value={maxReasoningLoops} onChange={setMaxReasoningLoops} min={1} max={10} step={1} unit=" Loops" description="Max recursive thinking cycles." />
          <SliderField label="Logic Strictness" value={logicStrictness} onChange={setLogicStrictness} min={0} max={100} step={1} unit="%" description="Requirement for alignment with formal logic." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5 space-y-6">
           <ToggleField label="Self-Reflection" checked={reflectionEnabled} onChange={setReflectionEnabled} description="Pauses to critique its own plan before execution." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'planning') return (
      <ConfigSection title="Action Architect" icon={Layers} description="Controls how the agent decomposes complex goals into sub-tasks.">
        <ParameterGrid>
          <SliderField label="Breakdown Granularity" value={decompositionDepth} onChange={setDecompositionDepth} min={1} max={5} step={1} unit=" Levels" description="How deep the agent drills into sub-tasks." />
          <ToggleField label="Strategy Simulation" checked={alternatePathAnalysis} onChange={setAlternatePathAnalysis} description="Simulates multiple ways to finish a task before picking one." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'prediction') return (
      <ConfigSection title="Forecasting" icon={TrendingUp} description="Configure the agent's ability to anticipate future states or market moves.">
        <ParameterGrid>
          <SliderField label="Prediction Horizon" value={predictionHorizon} onChange={setPredictionHorizon} min={1} max={30} step={1} unit=" Days" description="How far into the future the agent projects data." />
          <SliderField label="Confidence Floor" value={predictionConfidence} onChange={setPredictionConfidence} min={50} max={99} step={1} unit="%" description="Minimum confidence required to report a prediction." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'analysis') return (
      <ConfigSection title="Data Analysis" icon={Search} description="Tuning the rigor of data processing and pattern discovery.">
        <ParameterGrid>
          <SliderField label="Analysis Rigor" value={analysisRigor} onChange={setAnalysisRigor} min={0} max={100} step={1} unit="%" description="Intensity of statistical validation for findings." />
          <SliderField label="Literature Depth" value={literatureReviewIntensity} onChange={setLiteratureReviewIntensity} min={0} max={100} step={5} unit="%" description="Thoroughness of external source scanning." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'logic') return (
      <ConfigSection title="Logical Consistency" icon={Scale} description="Ensure the agent maintains strict adherence to formal logic and rules.">
        <ParameterGrid>
          <SliderField label="Strictness" value={logicStrictness} onChange={setLogicStrictness} min={0} max={100} step={1} unit="%" description="Penalty for logical fallacies or contradictions." />
          <SliderField label="Rule Adherence" value={strictnessLevel} onChange={setStrictnessLevel} min={0} max={100} step={1} unit="%" description="How strictly the agent follows system guardrails." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'creativity') return (
      <ConfigSection title="Neural Divergence" icon={Sparkles} description="Adjust the balance between fact-following and outside-the-box thinking.">
        <ParameterGrid>
          <SliderField label="Imagination Bias" value={creativityLevel} onChange={setCreativityLevel} min={0} max={100} step={5} unit="%" description="Higher values favor novel over probable answers." />
          <SliderField label="Divergent Thinking" value={creativityBias} onChange={setCreativityBias} min={0} max={100} step={5} unit="%" description="Penalty for using repetitive or common phrases." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'intuition') return (
      <ConfigSection title="Heuristic Bias" icon={Lightbulb} description="Allow the agent to use intuitive 'gut feelings' when data is incomplete.">
        <ParameterGrid>
          <SliderField label="Intuition Weight" value={intuitionBias} onChange={setIntuitionBias} min={0} max={100} step={5} unit="%" description="Higher values favor heuristics over raw data." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'reflection') return (
      <ConfigSection title="Internal Review" icon={RefreshCw} description="Control how often the agent pauses to reflect on its progress.">
        <ParameterGrid>
          <SelectField label="Reflection Loop" value={reflectionFrequency} onChange={setReflectionFrequency} options={['Constant', 'Periodic', 'Manual']} description="Frequency of self-monitoring cycles." />
          <ToggleField label="Active Reflection" checked={reflectionEnabled} onChange={setReflectionEnabled} description="Enables internal thought-verification loops." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'search') return (
      <ConfigSection title="Knowledge Lookup" icon={Compass} description="Configure external and internal knowledge retrieval depth.">
        <ParameterGrid>
          <SliderField label="Search Depth" value={semanticSearchDepth} onChange={setSemanticSearchDepth} min={1} max={20} step={1} unit=" Hits" description="Number of results pulled per semantic query." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5 space-y-6">
           {['arXiv', 'PubMed', 'IEEE', 'Nature'].map(source => (
             <ToggleField key={source} label={`${source} Access`} checked={researchPaperSources.includes(source as any)} onChange={(checked) => {
               if (checked) setResearchPaperSources([...researchPaperSources, source as any]);
               else setResearchPaperSources(researchPaperSources.filter(s => s !== source));
             }} description={`Allows the agent to cite papers from ${source}.`} />
           ))}
        </div>
      </ConfigSection>
    );

    if (configTab === 'verify') return (
      <ConfigSection title="Verification Hub" icon={CheckCircle} description="Tuning the multi-pass verification of agent outputs.">
        <ParameterGrid>
          <SliderField label="Verification Passes" value={verificationPasses} onChange={setVerificationPasses} min={1} max={5} step={1} unit=" Passes" description="Number of independent cross-checks per task." />
          <ToggleField label="Fact-Check Mode" checked={selfCritiqueEnabled} onChange={setSelfCritiqueEnabled} description="Enforces a final 'red-team' pass on every output." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'critique') return (
      <ConfigSection title="Critical Thinking" icon={AlertOctagon} description="Adjust the agent's ability to challenge assumptions.">
        <ParameterGrid>
          <SliderField label="Critique Intensity" value={critiqueIntensity} onChange={setCritiqueIntensity} min={0} max={100} step={5} unit="%" description="How aggressively the agent critiques its own plans." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'neural_reflection') return (
      <ConfigSection title="Cognitive Drift" icon={BrainCircuit} description="Automatic detection and correction of model reasoning errors.">
        <ParameterGrid>
          <SliderField label="Correction Rate" value={selfCorrectionLevel} onChange={setSelfCorrectionLevel} min={0} max={100} step={1} unit="%" description="Sensitivity to internal reasoning inconsistencies." />
        </ParameterGrid>
      </ConfigSection>
    );
    return null;
  };

  const renderAbilitiesConfig = () => {
    if (configTab === 'connections') return (
      <ConfigSection title="External Connectivity" icon={Globe2} description="Manage the agent's access to third-party platforms like Slack, Discord, or Notion.">
        <div className="space-y-6">
           {connections.length === 0 ? (
             <div className="p-6 md:p-10 border border-dashed border-white/10 rounded-3xl text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
               No Active Connections
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
               {connections.map(conn => (
                 <div key={conn.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 gap-6">
                   <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Globe2 className="w-5 h-5" /></div>
                     <div>
                       <p className="text-xs font-black text-white uppercase tracking-widest">{conn.type}</p>
                       <p className="text-[10px] text-slate-500 font-bold">{conn.name}</p>
                     </div>
                   </div>
                   <ToggleField label="Active" checked={conn.isEnabled} onChange={(val) => handleUpdateConnection(conn.id, { isEnabled: val })} />
                 </div>
               ))}
             </div>
           )}
        </div>
      </ConfigSection>
    );

    if (configTab === 'tools') return (
       <ConfigSection title="Skillset & Tools" icon={PenTool} description="Equip your agent with functional tools like searching the web, analyzing PDFs, or executing code.">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {['Web Search', 'PDF Analyzer', 'Code Executor', 'Image Generator', 'Email Dispatcher'].map(toolName => (
             <ToggleField key={toolName} label={toolName} checked={tools.some(t => t.name === toolName)} onChange={(checked) => {
               if (checked) setTools([...tools, { id: toolName.toLowerCase().replace(/ /g, '_'), name: toolName, type: 'builtin', description: `Standard ${toolName} capability.` }]);
               else setTools(tools.filter(t => t.name !== toolName));
             }} description={`Allow agent to use ${toolName}.`} />
           ))}
         </div>
       </ConfigSection>
    );

    if (configTab === 'knowledge') return (
      <ConfigSection title="Static Library" icon={BookOpen} description="Add PDF documents, URLs, or local files to the agent's permanent knowledge base.">
        <div className="space-y-8">
           <button onClick={handleIngestKnowledge} disabled={isIngesting} className={`w-full p-8 rounded-3xl md:rounded-[2.5rem] border border-dashed border-indigo-500/30 font-black uppercase tracking-widest text-xs transition-all ${isIngesting ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-indigo-500/5 text-indigo-500 hover:bg-indigo-500/10'}`}>
             {isIngesting ? ingestionStatus : '+ Upload Research Library'}
           </button>
           <div className="pt-8 border-t border-white/5 space-y-8">
              <ParameterGrid>
                <SelectField label="Document Section Size" value={chunkSize} onChange={setChunkSize} options={['500', '1000', '2000']} description="Controls how finely documents are split for retrieval." />
                <SliderField label="Context Overlap" value={overlap} onChange={setOverlap} min={0} max={500} step={10} unit=" chars" description="Redundancy between sections to prevent data loss." />
              </ParameterGrid>
              <div className="space-y-6">
                <SliderField label="Working Context Buffer" value={shortTermBufferSize} onChange={setShortTermBufferSize} min={512} max={8192} step={128} unit=" tokens" description="Allocated space for immediate task context." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleField label="Smart History Compaction" checked={longTermSummaryEnabled} onChange={setLongTermSummaryEnabled} description="Automatically summarizes long conversations to save space." />
                  <ToggleField label="Autonomous Fact Discovery" checked={relevantFactExtraction} onChange={setRelevantFactExtraction} description="Automatically identifies and stores mission-critical facts." />
                </div>
              </div>
           </div>
        </div>
      </ConfigSection>
    );

    if (configTab === 'actions') return (
      <ConfigSection title="Automated Actions" icon={Zap} description="Define high-level 'macros' or workflows the agent is allowed to trigger autonomously.">
        <div className="grid grid-cols-1 gap-4">
           {['Send Daily Report', 'Alert on Over-Budget', 'Notify Legal on Contract'].map(act => (
             <ToggleField key={act} label={act} checked={automatedActions.includes(act)} onChange={(checked) => {
               if (checked) setAutomatedActions([...automatedActions, act]);
               else setAutomatedActions(automatedActions.filter(a => a !== act));
             }} description={`Trigger when ${act.toLowerCase()} condition is met.`} />
           ))}
        </div>
      </ConfigSection>
    );

    if (configTab === 'sensors') return (
      <ConfigSection title="System Pulse" icon={Activity} description="Configure real-time monitors that feed external signals back into the agent's brain.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {['Inventory Levels', 'Market Volatility', 'System Response Delay', 'Social Mentions'].map(sensor => (
             <ToggleField key={sensor} label={sensor} checked={activeSensors.includes(sensor)} onChange={(checked) => {
               if (checked) setActiveSensors([...activeSensors, sensor]);
               else setActiveSensors(activeSensors.filter(s => s !== sensor));
             }} description={`Feeds real-time ${sensor.toLowerCase()} data to agent.`} />
           ))}
        </div>
      </ConfigSection>
    );

    if (configTab === 'outputs') return (
      <ConfigSection title="Delivery Formats" icon={Presentation} description="Define how the agent presents its findings or results to human users.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {['Data Spreadsheet (JSON)', 'Pro Document (Markdown)', 'Voice Clip (TTS)', 'Excel Table', 'Slack Message'].map(fmt => (
             <ToggleField key={fmt} label={fmt} checked={outputFormats.includes(fmt)} onChange={(checked) => {
               if (checked) setOutputFormats([...outputFormats, fmt]);
               else setOutputFormats(outputFormats.filter(f => f !== fmt));
             }} description={`Enable ${fmt} as a standard output option.`} />
           ))}
        </div>
      </ConfigSection>
    );

    if (configTab === 'skills') return (
      <ConfigSection title="Skill Verification" icon={GraduationCap} description="Ensures the agent actually knows how to use its assigned tools before deployment.">
        <ParameterGrid>
           <SliderField label="Verification Strictness" value={skillVerificationStrictness} onChange={setSkillVerificationStrictness} min={0} max={100} step={1} unit="%" description="How many 'dry runs' must the agent pass?" />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'plugins') return (
       <ConfigSection title="System Plugins" icon={Puzzle} description="Install verified third-party plugins to extend the core logic of the agent node.">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {['Financial Auditor', 'Legal Reviewer', 'Social Media Manager', 'Code Reviewer'].map(plugin => (
             <ToggleField key={plugin} label={plugin} checked={plugins.includes(plugin)} onChange={(checked) => {
               if (checked) setPlugins([...plugins, plugin]);
               else setPlugins(plugins.filter(p => p !== plugin));
             }} description={`Enable the ${plugin} system plugin.`} />
           ))}
         </div>
       </ConfigSection>
    );

    if (configTab === 'extensions') return (
      <ConfigSection title="Workflow Extensions" icon={Grid} description="Add custom community-built extensions to the agent's executable environment.">
        <div className="p-8 md:p-12 border border-dashed border-white/10 rounded-3xl text-center">
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">No Extensions Installed</p>
           <button className="px-6 py-2.5 md:px-8 md:py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all">+ Browse Marketplace</button>
        </div>
      </ConfigSection>
    );

    if (configTab === 'api') return (
      <ConfigSection title="Developer API" icon={Terminal} description="Configure direct REST endpoints or Webhooks for the agent to talk to.">
        <ParameterGrid>
           <SelectField label="Auth Method" value={authType} onChange={setAuthType} options={['OAuth2', 'ApiKey', 'Basic']} description="Standard security protocol for API calls." />
           <ToggleField label="Map Dynamic Payload" checked={dynamicPayloadMapping} onChange={setDynamicPayloadMapping} description="Automatically adjust outgoing JSON to match API specs." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'sandbox') return (
      <ConfigSection title="Execution Sandbox" icon={Box} description="Define the resource limits and isolation level for code execution.">
        <ParameterGrid>
           <SelectField label="Security Rigor" value={sandboxStrictness} onChange={setSandboxStrictness} options={['Permissive', 'Isolated', 'Fortress']} description="Determines filesystem and network access level." />
           <SliderField label="CPU Core Limit" value={cpuLimit} onChange={setCpuLimit} min={0.5} max={8} step={0.5} unit=" Cores" description="Compute resources allocated to the sandbox." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5 space-y-6">
           <SliderField label="Memory Allocation" value={memoryLimit} onChange={setMemoryLimit} min={128} max={4096} step={128} unit=" MB" description="Max RAM allowed for code execution tasks." />
           <ToggleField label="Isolated Network" checked={isolatedNetwork} onChange={setIsolatedNetwork} description="Prevents code from making external web requests." />
        </div>
      </ConfigSection>
    );
    return null;
  };

  const renderSafetyConfig = () => {
    if (configTab === 'governance') return (
      <ConfigSection title="Corporate Governance" icon={Shield} description="Define the strictness of internal policy enforcement and audit logging depth.">
        <ParameterGrid>
          <SliderField label="Policy Strictness" value={governanceStrictness} onChange={setGovernanceStrictness} min={0} max={100} step={1} unit="%" description="How strictly the agent adheres to internal corporate guidelines." />
          <SelectField label="Audit Logging" value={auditLoggingLevel} onChange={setAuditLoggingLevel} options={['Standard', 'Deep', 'Forensic']} description="Controls the granularity of stored action logs." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
           <SliderField label="Log Retention" value={retentionPolicyDays} onChange={setRetentionPolicyDays} min={1} max={365} step={1} unit=" Days" description="How long to keep detailed execution logs." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'resilience') return (
      <ConfigSection title="System Resilience" icon={ShieldCheck} description="Configure how the agent handles failures and infrastructure instability.">
        <ParameterGrid>
          <SliderField label="Resilience Tier" value={resilienceLevel} onChange={setResilienceLevel} min={0} max={100} step={5} unit="%" description="Redundancy level for mission-critical operations." />
          <SelectField label="Failover Mode" value={failoverMode} onChange={setFailoverMode} options={['immediate', 'delayed', 'manual']} description="Strategy when the primary model or tool fails." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
           <ToggleField label="Circuit Breaking" checked={circuitBreaking} onChange={setCircuitBreaking} description="Prevents cascading failures by stopping calls after many errors." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'compliance') return (
      <ConfigSection title="Regulatory Compliance" icon={BadgeCheck} description="Select the legal framework and KYC/AML standards for this agent's sector.">
        <ParameterGrid>
          <SelectField label="Framework" value={complianceFramework} onChange={setComplianceFramework} options={['SOC2', 'GDPR', 'HIPAA']} description="Active regulatory standard for data processing." />
          <SelectField label="Identity Verification Tier" value={kycAmlTier} onChange={setKycAmlTier} options={['Tier 1', 'Tier 2', 'Tier 3']} description="Level of identity verification for external transactions." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'ethics_guardrails') return (
      <ConfigSection title="Ethics & Factuality" icon={Scale} description="Guardrails to prevent bias, misinformation, and ethical boundary violations.">
        <ParameterGrid>
          <SliderField label="Ethics Rigor" value={ethicsRigor} onChange={setEthicsRigor} min={0} max={100} step={1} unit="%" description="Intensity of the internal ethics-reasoning pass." />
          <SelectField label="Standard Model" value={ethicalFramework} onChange={setEthicalFramework} options={['Standard', 'Strict', 'Custom']} description="Select the philosophical alignment for decisioning." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'alignment') return (
      <ConfigSection title="Human Alignment" icon={Heart} description="Ensure the agent's goals remain perfectly synchronized with human values.">
        <ParameterGrid>
          <SelectField label="Alignment Mode" value={humanValueAlignment} onChange={setHumanValueAlignment} options={['Strict', 'Balanced', 'Permissive']} description="Priority given to human intent over task completion." />
          <SelectField label="Framework" value={alignmentFramework} onChange={setAlignmentFramework} options={['Universal', 'Corporate', 'Custom']} description="Underlying value-sync engine." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'audit') return (
      <ConfigSection title="Continuous Audit" icon={History} description="Configure automated auditing schedules for configuration and actions.">
        <ParameterGrid>
          <SelectField label="Audit Frequency" value={auditFrequency} onChange={setAuditFrequency} options={['Daily', 'Weekly', 'Continuous']} description="How often a full internal safety audit is performed." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'security') return (
      <ConfigSection title="Security Shield" icon={Lock} description="Configure the autonomous security intensity for data and communications.">
        <ParameterGrid>
          <SliderField label="Shield Power" value={securityShieldPower} onChange={setSecurityShieldPower} min={0} max={100} step={1} unit="%" description="Level of data encryption and obfuscation." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'privacy') return (
      <ConfigSection title="Data Privacy" icon={Lock} description="Manage PII masking and data residency boundaries.">
        <ParameterGrid>
          <ToggleField label="Sensitive Data Masking" checked={maskPII} onChange={setMaskPII} description="Redacts names, emails, and phone numbers automatically." />
          <SelectField label="Residency" value={dataRegion} onChange={setDataRegion} options={['US', 'EU', 'Asia', 'Global']} description="Where the agent's data is physically processed." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'recovery') return (
      <ConfigSection title="Auto-Recovery" icon={RefreshCw} description="Configuring the agent's ability to 'self-heal' after a crash.">
        <div className="space-y-6">
          <ToggleField label="Auto-Heal" checked={autoRecoveryEnabled} onChange={setAutoRecoveryEnabled} description="Automatically attempts to restore last known good state on error." />
        </div>
      </ConfigSection>
    );
    return null;
  };

  const renderOperationsConfig = () => {
    if (configTab === 'collaboration') return (
      <ConfigSection title="Agent Collaboration" icon={Users} description="Manage how this agent interacts with other members of the network.">
        <ParameterGrid>
          <SliderField label="Max Sub-Tasks" value={maxSubTasks} onChange={setMaxSubTasks} min={1} max={10} step={1} unit=" tasks" description="Max tasks this agent can delegate to others." />
          <ToggleField label="Discovery Mode" checked={peerDiscovery} onChange={setPeerDiscovery} description="Allow this agent to find and hire other agents." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
          <ToggleField label="Allow Delegation" checked={allowDelegation} onChange={setAllowDelegation} description="Allows agent to act as a manager for sub-agents." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'scheduling') return (
      <ConfigSection title="Task Scheduling" icon={Clock} description="Define the cron schedule for recurring mission cycles.">
        <ParameterGrid>
          <div className="space-y-4">
             <label className="text-xs font-black text-white uppercase tracking-widest">Cron Expression</label>
             <input type="text" value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} className="w-full bg-[#060913] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none" placeholder="0 9 * * *" />
          </div>
          <ToggleField label="Schedule Active" checked={isScheduleEnabled} onChange={setIsScheduleEnabled} description="Toggles the recurring mission clock." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'events') return (
       <ConfigSection title="Event Bus" icon={Zap} description="Manage event triggers that wake the agent from idle state.">
         <div className="space-y-4">
            <ToggleField label="Intercept Context" checked={eventInterceptEnabled} onChange={setEventInterceptEnabled} description="Allows agent to listen to all system events." />
            <p className="text-[10px] text-slate-500 font-mono italic">Connected Event Triggers: {eventTriggers.length}</p>
         </div>
       </ConfigSection>
    );

    if (configTab === 'lifecycle') return (
      <ConfigSection title="Agent Lifecycle" icon={Settings} description="Automate the provisioning and decommissioning of temporary agents.">
        <ParameterGrid>
          <SelectField label="Strategy" value={provisioningStrategy} onChange={setProvisioningStrategy} options={['Aggressive', 'Balanced', 'Conservative']} description="Resource allocation priority for new instances." />
          <SelectField label="Policy" value={decommissioningPolicy} onChange={setDecommissioningPolicy} options={['Immediate', 'Graceful', 'Staged']} description="How to clean up after mission completion." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
          <ToggleField label="Auto-Lifecycle" checked={lifecycleAutomationEnabled} onChange={setLifecycleAutomationEnabled} description="Fully automates instance creation and deletion." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'circular') return (
       <ConfigSection title="Circular Governance" icon={Recycle} description="Enable token recycling and reinvestment into the agency treasury.">
         <ParameterGrid>
           <SliderField label="Profit Reinvestment %" value={reinvestmentRatio} onChange={setReinvestmentRatio} min={0} max={100} step={5} unit="%" description="Portion of profits sent back to node operators." />
           <ToggleField label="Idle Resource Recovery" checked={tokenRecyclingEnabled} onChange={setTokenRecyclingEnabled} description="Automatically redeems idle capacity for compute." />
         </ParameterGrid>
       </ConfigSection>
    );

    if (configTab === 'sustainability') return (
       <ConfigSection title="Sustainability" icon={Leaf} description="Monitor and offset the carbon footprint of high-intensity compute.">
         <ParameterGrid>
           <SliderField label="Efficiency Target" value={computeEfficiencyTarget} onChange={setComputeEfficiencyTarget} min={50} max={100} step={1} unit="%" description="Required GPU/CPU efficiency before scaling." />
           <ToggleField label="Carbon Offset" checked={carbonOffsetEnabled} onChange={setCarbonOffsetEnabled} description="Auto-purchase offsets for mission compute." />
         </ParameterGrid>
       </ConfigSection>
    );
    return null;
  };

  const renderEconomicsConfig = () => {
    if (configTab === 'cost_control') return (
      <ConfigSection title="Financial Controls" icon={Wallet} description="Manage the agent's spending limits and budget alerts.">
        <ParameterGrid>
          <SliderField label="Budget Limit" value={budgetLimit} onChange={setBudgetLimit} min={50} max={5000} step={50} unit="$" description="Total project budget allocation." />
          <SliderField label="Daily Burn" value={dailyBudgetUSD} onChange={setDailyBudgetUSD} min={5} max={500} step={5} unit="$" description="Maximum allowable daily spend." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5 space-y-6">
          <SliderField label="Alert Threshold" value={alertThreshold} onChange={setAlertThreshold} min={50} max={95} step={1} unit="%" description="Notify when budget reaches this level." />
          <SelectField label="Alert Frequency" value={alertInterval} onChange={setAlertInterval} options={['once', 'daily', 'hourly']} description="How often to repeat budget warnings." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'scenario_lab') return (
       <ConfigSection title="Scenario Lab" icon={TestTube} description="Simulate 'what-if' scenarios to predict agent behavior under stress or market volatility.">
         <div className="p-8 md:p-12 border border-dashed border-white/10 rounded-3xl text-center">
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Mission Outcome Simulations</p>
             <button className="px-6 py-2.5 md:px-8 md:py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all">Simulate Financial Risk</button>
         </div>
       </ConfigSection>
    );

    if (configTab === 'metrics') return (
      <ConfigSection title="Efficiency Metrics" icon={BarChart4} description="Configure which performance indicators are tracked in real-time.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleField label="Track Response Speed" checked={trackLatency} onChange={setTrackLatency} description="Log the response time of every neural pass." />
          <ToggleField label="Track Usage Costs" checked={trackTokenCost} onChange={setTrackTokenCost} description="Real-time dollar-cost tracking for LLM usage." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'compensation') return (
      <ConfigSection title="Value Exchange" icon={Banknote} description="Define the billing model and performance incentives for this autonomous node.">
        <ParameterGrid>
          <SelectField label="Billing Model" value={billingModel} onChange={setBillingModel} options={['Usage-Based', 'Subscription', 'Outcome-Based']} description="Select the commercial framework for this agent." />
          <SliderField label="Base Rate" value={baseRateUSD} onChange={setBaseRateUSD} min={0.001} max={0.05} step={0.001} unit=" $/1k" description="Standard cost per unit of work." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
           <SliderField label="Performance Bonus" value={performanceBonusPercent} onChange={setPerformanceBonusPercent} min={0} max={50} step={5} unit="%" description="Bonus for exceeding quality benchmarks." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'marketplace') return (
       <ConfigSection title="Agent Marketplace" icon={ShoppingBag} description="Configure how the agent bids for tasks in the global agent market.">
         <ParameterGrid>
           <ToggleField label="Auto-Bidding" checked={taskBiddingEnabled} onChange={setTaskBiddingEnabled} description="Allow the agent to autonomously accept contracts." />
           <SliderField label="Max Bid" value={maxBidUSD} onChange={setMaxBidUSD} min={0.5} max={50} step={0.5} unit="$" description="Maximum price agent can bid for a task." />
         </ParameterGrid>
         <div className="pt-8 border-t border-white/5">
           <SelectField label="Specialization" value={marketSpecialization} onChange={setMarketSpecialization} options={['Generalist', 'Cybersecurity', 'Legal']} description="Market niche for contract discovery." />
         </div>
       </ConfigSection>
    );

    if (configTab === 'resources') return (
      <ConfigSection title="Resource Management" icon={Cpu} description="Manage the lease of idle compute and shared secret vaults.">
        <ParameterGrid>
          <SelectField label="Protocol" value={resourceSharingProtocol} onChange={setResourceSharingProtocol} options={['Peer-to-Peer', 'Centralized', 'Encrypted-Relay']} description="Network for sharing cache and memory." />
          <ToggleField label="Idle Compute Lease" checked={idleComputeLease} onChange={setIdleComputeLease} description="Allow agent to 'rent' its idle capacity to the network." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
           <ToggleField label="Secret Vault Access" checked={sharedSecretVault} onChange={setSharedSecretVault} description="Share encrypted API keys within the local network." />
        </div>
      </ConfigSection>
    );
    return null;
  };

  const renderEnterpriseConfig = () => {
    if (configTab === 'legal') return (
      <ConfigSection title="Legal Sovereignty" icon={Gavel} description="Define the legal persona and jurisdiction of the autonomous entity.">
        <ParameterGrid>
          <SelectField label="Entity Type" value={legalEntityType} onChange={setLegalEntityType} options={['DAO-LLC', 'Trust', 'Sovereign']} description="Corporate structure for legal recognition." />
          <div className="space-y-4 text-left">
             <label className="text-xs font-black text-white uppercase tracking-widest">Jurisdiction</label>
             <input type="text" value={legalJurisdiction} onChange={(e) => setLegalJurisdiction(e.target.value)} className="w-full bg-[#060913] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none" />
          </div>
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
          <ToggleField label="Signature Authority" checked={contractSigningEnabled} onChange={setContractSigningEnabled} description="Allow the agent to sign legal documents via E-Signature or Smart Contract." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'hr_management') return (
      <ConfigSection title="Workforce Orchestration" icon={UserPlus} description="Manage the hiring, retention, and performance review logic for sub-agents.">
        <ParameterGrid>
          <SelectField label="Hiring Strategy" value={hiringStrategy} onChange={setHiringStrategy} options={['Quality-First', 'Speed-to-Hire', 'Cost-Optimized']} description="Priority for finding new agent talent." />
          <SelectField label="Review Frequency" value={performanceReviewFrequency} onChange={setPerformanceReviewFrequency} options={['Weekly', 'Monthly', 'Quarterly']} description="Schedule for automated performance audit." />
        </ParameterGrid>
        <div className="pt-8 border-t border-white/5">
           <SliderField label="Base Salary Cap" value={maxBaseSalaryUSD} onChange={setMaxBaseSalaryUSD} min={10} max={1000} step={10} unit="$" description="Max monthly allocation per sub-agent." />
        </div>
      </ConfigSection>
    );

    if (configTab === 'pr_strategy') return (
      <ConfigSection title="Brand Sovereignty" icon={Megaphone} description="Configure automated press releases and crisis communication response.">
        <ParameterGrid>
          <ToggleField label="Auto-PR" checked={pressReleaseAutomation} onChange={setPressReleaseAutomation} description="Allow the agent to announce mission milestones on X/LinkedIn." />
          <SelectField label="Crisis Intensity" value={crisisResponseIntensity} onChange={setCrisisResponseIntensity} options={['Defensive', 'Neutral', 'Aggressive']} description="Posture for negative mentions." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'innovation_intel') return (
      <ConfigSection title="Innovation Hub" icon={Lightbulb} description="Maturity thresholds for white paper generation and technology trend analysis.">
        <ParameterGrid>
          <SliderField label="Maturity Floor" value={innovationMaturityThreshold} onChange={setInnovationMaturityThreshold} min={0} max={100} step={5} unit="%" description="Minimum readiness before announcing innovation." />
          <ToggleField label="White Paper Gen" checked={whitePaperGeneration} onChange={setWhitePaperGeneration} description="Automatically draft research papers on mission findings." />
        </ParameterGrid>
      </ConfigSection>
    );

    if (configTab === 'blueprint_requests') return (
       <ConfigSection title="Blueprint Intake" icon={FileText} description="Manage incoming requests for new agent blueprints from external clients.">
         <div className="space-y-8">
           <div className="bg-white/5 rounded-3xl p-6 md:p-10 border border-white/5 text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 mb-6">
               <Activity className="w-3 h-3" /> System Listening
             </div>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Intake Queue Initialized (0 Active Requests)</p>
           </div>
           <div className="pt-8 border-t border-white/5">
             <ToggleField label="Manual Intake Override" checked={true} onChange={() => {}} description="Allow manual insertion of blueprint requests from the console." />
           </div>
         </div>
       </ConfigSection>
    );
    return null;
  };

  const renderConfigTab = () => {
    if (activeCategory === 'Brain') return renderBrainConfig();

    if (activeCategory === 'Intelligence') return renderIntelligenceConfig();

    // --- CATEGORY: ABILITIES (11 TABS) ---
    if (activeCategory === 'Abilities') return renderAbilitiesConfig();
    if (activeCategory === 'Safety') return renderSafetyConfig();
    if (activeCategory === 'Operations') return renderOperationsConfig();
    if (activeCategory === 'Economics') return renderEconomicsConfig();
    if (activeCategory === 'Enterprise') return renderEnterpriseConfig();

    return (
      <div className="p-10 md:p-20 text-center bg-white/5 rounded-3xl md:rounded-[4rem] border border-dashed border-white/10">
        <p className="text-slate-500 font-mono text-[10px] md:text-xs uppercase tracking-widest italic">
          Module "{configTab.replace(/_/g, ' ')}" Initialized & Ready for Calibration
        </p>
        <p className="text-indigo-400/50 text-[9px] font-black uppercase mt-4 tracking-tighter">Production-Grade Parameters Active</p>
      </div>
    );

    return (
      <div className="p-20 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10">
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest italic">
          Module "{configTab.replace(/_/g, ' ')}" Initialized & Ready for Calibration
        </p>
        <p className="text-indigo-400/50 text-[9px] font-black uppercase mt-4 tracking-tighter">Production-Grade Parameters Active</p>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen space-y-16 pb-32 animate-in fade-in duration-700 bg-transparent">
      {!selectedJob && (
        <React.Fragment>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/20 animate-pulse">
                <Terminal className="w-3 h-3" /> Enterprise / Agent Studio 2.1
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">AI Agent Factory</h1>
              <p className="text-slate-600 text-lg font-medium font-mono">Orchestrate autonomous agent fleets with HITL safety protocols.</p>
            </div>
            <div className="bg-[#0b0f19] p-3 rounded-2xl border border-white/5 shadow-inner flex items-center gap-4 px-6 w-full lg:w-[480px]">
              <Search className="w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Search Global Agent Instances..." className="flex-1 bg-transparent border-none focus:outline-none text-sm font-black text-white tracking-wide placeholder-slate-600" />
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit mb-12">
             <button 
               onClick={() => setDashboardView('requests')} 
               className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${dashboardView === 'requests' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Layers className="w-3.5 h-3.5" /> Agent Requests ({jobs.length})
             </button>
             <button 
               onClick={() => setDashboardView('active_agents')} 
               className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${dashboardView === 'active_agents' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Activity className="w-3.5 h-3.5" /> Active Agents ({deployedAgents.length})
             </button>
          </div>

          {dashboardView === 'active_agents' ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
               {selectedMonitorAgentId ? (
                 <div className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden p-8 animate-in zoom-in-95 duration-500">
                    <button 
                      onClick={() => setSelectedMonitorAgentId(null)}
                      className="absolute top-10 right-10 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Close Monitor
                    </button>
                    <BusinessDashboard 
                      isDeployed={true}
                      agentId={selectedMonitorAgentId}
                      clientName={deployedAgents.find(a => a.id === selectedMonitorAgentId)?.clientName}
                      blueprint={deployedAgents.find(a => a.id === selectedMonitorAgentId)?.blueprint}
                      activeJobs={jobs}
                      onOpenTool={() => {}}
                    />
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {deployedAgents.map(agent => (
                     <div key={agent.id} className="bg-[#0b0f19] border border-white/5 p-10 rounded-[3rem] transition-all relative overflow-hidden group hover:border-indigo-500/30">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-all" />
                       <div className="flex justify-between items-start mb-4 relative z-10">
                         <div className="flex-1 min-w-0">
                           {editingNameId === agent.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  autoFocus
                                  className="bg-white/5 border border-indigo-500/30 rounded-lg px-2 py-1 text-sm font-black text-white w-full outline-none focus:border-indigo-500"
                                  value={editingNameValue}
                                  onChange={(e) => setEditingNameValue(e.target.value)}
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      await renameAgentBackend(agent.id, editingNameValue); await updateAgentName(agent.id, editingNameValue);
                                      setEditingNameId(null);
                                    }
                                    if (e.key === "Escape") setEditingNameId(null);
                                  }}
                                />
                                <button 
                                  onClick={async () => {
                                    await renameAgentBackend(agent.id, editingNameValue); await updateAgentName(agent.id, editingNameValue);
                                    setEditingNameId(null);
                                  }}
                                  className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group/title">
                                <h4 className="text-xl font-black text-white tracking-tighter truncate">{agent.agentName || agent.blueprint?.jobTitle || 'Custom Agent'}</h4>
                                <button 
                                  onClick={() => {
                                    setEditingNameId(agent.id);
                                    setEditingNameValue(agent.agentName || agent.blueprint?.jobTitle || 'Custom Agent');
                                  }}
                                  className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-500 hover:text-indigo-400 transition-all"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                           <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-0.5 truncate">{agent.blueprint?.jobTitle}</p>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${agent.status === 'Paused' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                           {agent.status === 'Paused' ? 'Paused' : 'Active'}
                         </div>
                       </div>
                        <div className="space-y-0.5 mb-8 relative z-10">
                          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Company: {agent.clientName}</p>
                          {agent.contactName && <p className="text-slate-600 text-[10px] font-mono">Contact: {agent.contactName}</p>}
                        </div>
                       
                       <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                          <div>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Consumption</p>
                            <p className="text-xl font-black text-white tracking-tight">${(agent.total_cost_usd || 0).toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">System Latency</p>
                            <p className="text-xl font-black text-white tracking-tight">{agent.lastLatency || 0}ms</p>
                          </div>
                       </div>

                       <div className="flex gap-3 relative z-10">
                         <button 
                           onClick={() => setSelectedMonitorAgentId(agent.id)}
                           className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                         >
                           <MonitorPlay className="w-3.5 h-3.5" /> Monitor
                         </button>
                           <button 
                             onClick={async (e) => {
                               e.stopPropagation();
                               console.log(`DEBUG: Admin Fleet Pause Pressed for ${agent.id}. Current Status: ${agent.status}`);
                               const newStatus = agent.status === 'Paused' ? 'Active' : 'Paused';
                               console.log(`DEBUG: Attempting transition to: ${newStatus}`);
                               
                               try {
                                 // 1. Update Firestore
                                 console.log("DEBUG: Calling updateAgentStatus (Firestore)...");
                                 await updateAgentStatus(agent.id, newStatus);
                                 console.log("DEBUG: Firestore update successful.");

                                 // 2. Update Backend Registry
                                 console.log("DEBUG: Calling updateAgentBackendStatus (REST API)...");
                                 await updateAgentBackendStatus(agent.id, newStatus);
                                 console.log("DEBUG: Backend status sync successful.");
                               } catch (err: any) {
                                 console.error("ERROR: Admin Status Sync Failed:", err);
                               }
                             }}
                             className={`p-4 rounded-2xl border transition-all ${agent.status === 'Paused' ? 'bg-amber-600 text-white border-amber-700 shadow-lg shadow-amber-600/20' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                           >
                             {agent.status === 'Paused' ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                           </button>
                           <button 
                             onClick={() => setDeleteConfirm({ type: 'agent', id: agent.id, name: agent.agentName || agent.clientName, step: 'type-delete' })}
                             className="p-4 bg-white/5 border border-white/10 rounded-2xl text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <div className="xl:col-span-12 space-y-8">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                  <Layers className="w-6 h-6 text-indigo-500" /> Provisioning Requests ({jobs.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {jobs.map(job => (
                    <div key={job.id} className={`bg-[#0b0f19] border p-10 rounded-[3rem] transition-all relative overflow-hidden group hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] ${selectedJob?.id === job.id ? 'border-indigo-500 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]' : 'border-white/5 hover:border-white/10'}`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleCreateAgent(job)}>
                          <h4 className="text-xl font-black text-white tracking-tighter truncate">{(job as any).agentName || job.blueprint.jobTitle}</h4>
                          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-0.5">{job.blueprint.jobTitle}</p>
                        </div>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setDeleteConfirm({ type: 'request', id: job.id, name: (job as any).agentName || job.blueprint.jobTitle, step: 'confirm1' }); 
                          }}
                          className="ml-4 shrink-0 p-2 rounded-xl text-slate-600 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1 mb-6 relative z-10 cursor-pointer" onClick={() => handleCreateAgent(job)}>
                        <p className="text-slate-400 text-xs font-bold">Company: {job.clientName}</p>
                        {(job as any).contactName && <p className="text-slate-600 text-[10px] font-mono">Contact: {(job as any).contactName}</p>}
                      </div>
                      <div className="flex items-center justify-between relative z-10">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${job.status === 'Open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>{job.status}</span>
                        <button onClick={() => handleCreateAgent(job)} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase hover:text-indigo-300 transition-colors">Build <ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      )}

      {selectedJob && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <button onClick={() => navigate('/admin')} className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="bg-[#060913] rounded-3xl md:rounded-[4rem] p-6 lg:p-16 border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col gap-10 md:gap-16 relative z-10">
              {/* Orchestration Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-10">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Agent Orchestration Layer</h2>
                  <p className="text-slate-500 font-mono text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-3">
                    <Database className="w-3 h-3" /> ID: <span className="text-indigo-400">{selectedJob.id.slice(0, 8)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                    <Clock className="w-3 h-3" /> Latency: <span className="text-emerald-400">12ms</span>
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-w-0 max-w-full w-full lg:w-auto">
                   <div className="flex bg-[#0b0f19] p-2 rounded-2xl border border-white/5 backdrop-blur-xl overflow-x-auto max-w-full scrollbar-none items-center relative">
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0b0f19] to-transparent pointer-events-none z-10 md:hidden" />
                    {Object.keys(CATEGORIES).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setConfigTab(CATEGORIES[cat as keyof typeof CATEGORIES][0]);
                        }}
                        className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  
                  {/* Horizontal Subcategories Navigation */}
                  <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/5 overflow-x-auto max-w-full gap-2 scrollbar-none relative">
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#060913] to-transparent pointer-events-none z-10 md:hidden" />
                    {CATEGORIES[activeCategory as keyof typeof CATEGORIES].map((tab: any) => (
                      <button
                        key={tab}
                        onClick={() => setConfigTab(tab)}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-8 md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${configTab === tab ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                      >
                        {configTab === tab && <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />}
                        {tab.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Configuration Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                {/* Center: Dynamic Configuration Module */}
                <div className="xl:col-span-9 bg-white/[0.02] rounded-[3rem] p-1 border border-white/5">
                   <div className="p-10">
                     {renderConfigTab()}
                   </div>
                </div>

                {/* Right: Deployment Summary & Action */}
                <div className="xl:col-span-3">
                  <div className="sticky top-10 space-y-8">
                    <div className="bg-white/5 rounded-[3rem] border border-white/10 p-10 space-y-8 backdrop-blur-sm">
                      <h3 className="text-xl font-black text-white flex items-center gap-3"><MonitorPlay className="w-5 h-5 text-indigo-400" /> Node Preview</h3>
                      <div className="space-y-4">
                        <SummaryItem label="Identity" value={agentName || 'Unnamed Node'} active={!!agentName} />
                        <SummaryItem label="Role" value={agentRole || 'Generalist'} active={!!agentRole} />
                        <SummaryItem label="Autonomy" value={autonomyLevel} active />
                        <SummaryItem label="Logic" value={hitlEnabled ? 'HITL (SAFE)' : 'UNRESTRICTED'} active={hitlEnabled} />
                      </div>
                      <button 
                        onClick={handleDeploy} 
                        disabled={isDeploying || !agentName} 
                        className={`w-full py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all ${isDeploying ? 'bg-slate-800 text-slate-600' : 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]'}`}
                      >
                        {isDeploying ? 'Syncing Node...' : 'Deploy Agent Node'}
                      </button>
                    </div>
                    {deploySuccess && (
                      <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl animate-in zoom-in duration-300">
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Node Successfully Provisioned
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0b0f19] border border-white/10 w-full max-w-md rounded-[3rem] p-12 space-y-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/50" />
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Delete {deleteConfirm.type === 'request' ? 'Request' : 'Agent'}?</h3>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">{deleteConfirm.name}</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                This action is irreversible. All associated data and configurations will be permanently purged.
              </p>
            </div>

            {deleteConfirm.type === 'agent' && deleteConfirm.step === 'type-delete' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block text-center">Type <span className="text-rose-500">DELETE</span> to confirm</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="DELETE"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-sm font-black text-white placeholder:text-white/20 outline-none focus:border-rose-500/50 transition-all uppercase"
                  value={deleteConfirm.typedValue || ''}
                  onChange={(e) => setDeleteConfirm({ ...deleteConfirm, typedValue: e.target.value })}
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const isAgent = deleteConfirm.type === 'agent';
                  const typed = (deleteConfirm.typedValue || '').trim().toUpperCase();
                  
                  if (isAgent) {
                    if (typed === 'DELETE') {
                      handleDeleteAgent(deleteConfirm.id);
                    } else {
                      console.warn("Delete aborted: Incorrect confirm string typed.");
                    }
                  } else {
                    handleDeleteRequest(deleteConfirm.id);
                  }
                }}
                disabled={deleteConfirm.type === 'agent' && (deleteConfirm.typedValue || '').trim().toUpperCase() !== 'DELETE'}
                className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${deleteConfirm.type === 'agent' && (deleteConfirm.typedValue || '').trim().toUpperCase() !== 'DELETE' ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-rose-500 text-white shadow-xl shadow-rose-500/20'}`}
              >
                {deleteConfirm.type === 'agent' ? 'Confirm Purge' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
