import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  BarChart3,
  Settings,
  Database,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  MessageSquare,
  Globe,
  Layers,
  Sparkles,
  Lock,
  ChevronRight,
  CheckCircle,
  Brain,
  Terminal,
  Compass,
  Flag,
  Users,
  FileText,
  Loader2,
  Trash2,
  Pause,
  Play
} from 'lucide-react';


import {
  getAgentLogs,
  getAgentStats,
  getPendingApprovals,
  updateApprovalStatus,
  updateAgentConfig,
  getMissionArchive,
  updateAgentStatus,
  updateAgentPortalConfig,
  db // Assuming db is exported from services/db or similar
} from '../services/db';
import { doc, onSnapshot } from 'firebase/firestore';
import { executeAgent, updateAgentBackendStatus } from '../services/agentService';
import { Blueprint, JobPost } from '../types';
import { onAuthChanged, User } from '../services/auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CONFIG } from '../services/config';

/**
 * --- HELPER COMPONENTS ---
 */

const StatCard = ({ title, value, change, icon, color }: any) => {
  const colorClasses: any = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <div className={`p-2 md:p-3 rounded-lg md:rounded-2xl border ${colorClasses[color]}`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4 md:w-5 h-5' })}
        </div>
        <span className="text-[8px] md:text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 md:py-1 rounded-full uppercase tracking-tighter">{change}</span>
      </div>
      <div>
        <p className="text-[8px] md:text-[10px] font-black text-slate-400 mb-0.5 md:mb-1 uppercase tracking-widest truncate">{title}</p>
        <p className="text-lg md:text-2xl font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );
};

const ServiceRow = ({ name, status }: any) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
    <div className="flex items-center gap-3 font-bold text-sm text-slate-700">
      <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
      {name}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
      {status === 'active' ? 'Operational' : 'Optimizing'}
    </span>
  </div>
);

const ModelProgressBar = ({ name, percentage, color }: any) => {
  const colorClasses: any = {
    indigo: 'bg-indigo-500 shadow-lg shadow-indigo-500/20',
    amber: 'bg-amber-500 shadow-lg shadow-amber-500/20',
    emerald: 'bg-emerald-500 shadow-lg shadow-emerald-500/20'
  };
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
        <span className="text-slate-400">{name}</span>
        <span className="text-slate-900">{percentage}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorClasses[color]} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

const LogEntry = ({ time, message, type, metadata }: any) => {
  const isThinking = type === 'thinking';
  const typeIcons: any = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    info: <Activity className="w-4 h-4 text-indigo-500" />,
    error: <Lock className="w-4 h-4 text-rose-500" />,
    warning: <Zap className="w-4 h-4 text-amber-500" />,
    thinking: <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
  };

  return (
    <div className={`p-4 rounded-2xl flex gap-4 transition-all animate-in fade-in slide-in-from-left-2 duration-300 ${isThinking ? 'bg-indigo-500/5 italic border-l-2 border-indigo-500/20' : 'bg-white/5 border border-white/10'}`}>
      <div className="font-mono text-[9px] text-slate-600 mt-1 uppercase w-10 shrink-0">{time}</div>
      <div className="mt-1 flex-shrink-0">
        {typeIcons[type] || <Terminal className="w-4 h-4 text-slate-500" />}
      </div>
      <div className="space-y-1">
        <p className={`text-[11px] leading-relaxed ${isThinking ? 'text-indigo-300/80 font-serif' : 'text-slate-300 font-mono'}`}>
          {isThinking && <span className="font-black uppercase text-[8px] mr-2 text-indigo-500/50">Thought:</span>}
          {message}
        </p>
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="mt-2 p-3 bg-white/5 rounded-xl text-[9px] font-mono text-slate-500 border border-white/5">
            {JSON.stringify(metadata, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
};

const ControlSetting = ({ label, enabled, onClick }: { label: string, enabled: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-500/30 transition-all w-full group shadow-sm"
  >
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">{label}</span>
    <div className={`w-2 h-2 rounded-full transition-all ${enabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20 scale-125' : 'bg-slate-200'}`} />
  </button>
);

/**
 * --- MAIN COMPONENT ---
 */

interface BusinessDashboardProps {
  isDeployed?: boolean;
  isProvisioning?: boolean;
  onOpenTool?: () => void;
  agentId?: string;
  clientName?: string;
  blueprint?: Blueprint;
  activeJobs?: JobPost[];
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ 
  isDeployed = false, 
  isProvisioning = false, 
  onOpenTool, 
  agentId, 
  clientName,
  blueprint,
  activeJobs = []
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'monitoring' | 'controls' | 'approvals' | 'strategy' | 'portal'>('analytics');
  const [portalConfig, setPortalConfig] = useState({
    welcomeMessage: '',
    isPublic: true,
    authorizedEmails: [] as string[],
    authorizedDomains: [] as string[]
  });
  const [portalSaveStatus, setPortalSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [domInput, setDomInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  // Sync local status with stats when it arrives
  useEffect(() => {
    if (stats?.status) {
      setLocalStatus(stats.status);
    }
  }, [stats?.status]);

  const isPaused = (localStatus?.toLowerCase() === 'paused');

  const hasInitializedPortal = React.useRef<string | null>(null);

  // Fetch initial portal config
  useEffect(() => {
    if (stats?.portalConfig && hasInitializedPortal.current !== agentId) {
      setPortalConfig(stats.portalConfig);
      setDomInput(stats.portalConfig.authorizedDomains?.join(', ') || '');
      setEmailInput(stats.portalConfig.authorizedEmails?.join('\n') || '');
      hasInitializedPortal.current = agentId;
    }
  }, [stats?.portalConfig, agentId]);

  const handleSavePortalConfig = async () => {
    if (!agentId) return;
    if (!portalConfig.subdomain.trim()) {
      setPortalSaveStatus('error');
      setTimeout(() => setPortalSaveStatus('idle'), 3000);
      return;
    }

    // Parse buffered inputs
    const authorizedDomains = domInput.split(',').map(d => d.trim().toLowerCase()).filter(d => !!d);
    const authorizedEmails = emailInput.split(/[\n,]/).map(em => em.trim().toLowerCase()).filter(em => !!em);
    
    const finalConfig = {
      ...portalConfig,
      authorizedDomains,
      authorizedEmails
    };

    setPortalSaveStatus('saving');
    console.log(`[Business:Update] Saving portal config for ${agentId}:`, finalConfig);
    try {
      await updateAgentPortalConfig(agentId, {
        ...finalConfig,
        deployedAt: new Date().toISOString(),
        liveUrl: `https://${portalConfig.subdomain}.${CONFIG.BASE_DOMAIN}`
      });
      setPortalConfig(finalConfig);
      setPortalSaveStatus('saved');
      setTimeout(() => setPortalSaveStatus('idle'), 4000);
    } catch (error) {
      console.error("Failed to save portal config:", error);
      setPortalSaveStatus('error');
      setTimeout(() => setPortalSaveStatus('idle'), 3000);
    }
  };
  useEffect(() => {
    if (!isDeployed) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isDeployed]);
  const [command, setCommand] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const [directives, setDirectives] = useState('');
  const [isSavingDirectives, setIsSavingDirectives] = useState(false);
  const [lastDirectiveUpdate, setLastDirectiveUpdate] = useState<string | null>(null);

  const [approvals, setApprovals] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ is_semi_auto: true });
  const [showThinking, setShowThinking] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthChanged((u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!agentId || !isDeployed) return;

    // Fetch Directives (Only if clientName is known)
    let unsubDirectives = () => {};
    if (clientName) {
      const docRef = doc(db, 'governance', `client_directives_${clientName}`);
      unsubDirectives = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          setDirectives(doc.data().directives || '');
          setLastDirectiveUpdate(doc.data().updated_at?.toDate()?.toLocaleTimeString() || 'Just now');
        }
      });
    }

    const unsubLogs = getAgentLogs(agentId, (fetchedLogs) => {
      setLogs(fetchedLogs || []);
    });

    const unsubStats = getAgentStats(agentId, (fetchedStats) => {
      console.log(`[Business:Debug] Fetched agency stats for ${agentId}:`, fetchedStats);
      setStats(fetchedStats);
      setTotalCost(fetchedStats?.total_cost_usd || 0);
      if (fetchedStats?.config) setConfig(fetchedStats.config);
    });

    const unsubApprovals = getPendingApprovals(agentId, (fetchedApprovals) => {
      setApprovals(fetchedApprovals || []);
    });

    const unsubMissions = getMissionArchive(agentId, (fetchedMissions) => {
      setMissions(fetchedMissions || []);
    });

    return () => {
      unsubDirectives();
      unsubLogs();
      unsubStats();
      unsubApprovals();
      unsubMissions();
    };
  }, [agentId, isDeployed, clientName]);

  const handleSaveDirectives = async () => {
    if (!clientName) return;
    setIsSavingDirectives(true);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/client/strategy/${clientName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directives })
      });
      if (response.ok) {
        // Success handled by Firestore listener
      }
    } catch (err) {
      console.error("Failed to save directives:", err);
    } finally {
      setIsSavingDirectives(false);
    }
  };

  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityMap: Record<string, number> = {};
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      last7Days.push(dayName);
      activityMap[dayName] = 0;
    }

    if (logs && logs.length > 0) {
      logs.forEach(log => {
        const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
        const dayName = days[date.getDay()];
        if (activityMap[dayName] !== undefined) activityMap[dayName]++;
      });
    }

    return last7Days.map(day => ({
      name: day,
      tasks: activityMap[day] || 0
    }));
  }, [logs]);

  const accuracyRate = useMemo(() => {
    if (!logs || logs.length === 0) return "100%";
    const errors = logs.filter(l => l.type === 'error' || l.type === 'warning').length;
    const rate = ((logs.length - errors) / logs.length) * 100;
    return `${rate.toFixed(1)}%`;
  }, [logs]);

  const activeTasksCount = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.tasks, 0);
  }, [chartData]);

  const handleExecuteCommand = async () => {
    if (!agentId || (!command.trim() && !imageUrl) || !blueprint) return;
    setIsExecuting(true);

    try {
      const result = await executeAgent(agentId, command, imageUrl || undefined);
      if (result.context_data) setPrediction(result.context_data);
      setCommand('');

      setImageUrl(null);
    } catch (e: any) {

      console.error("Command execution failed:", e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDownloadProof = async (missionId: string) => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/mission/report/${missionId}`);
      if (!response.ok) throw new Error("Failed to generate report.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sovereign_Audit_${missionId}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Evidence Retrieval Failed: Secure vault connection interrupted.");
    }
  };

  const handleUpdateToggle = async (key: string, value: boolean) => {
    if (!agentId) return;
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    await updateAgentConfig(agentId, newConfig);
  };

  const handleApproveAction = async (approvalId: string) => {
    if (!agentId) return;
    try {
      await updateApprovalStatus(agentId, approvalId, 'approved');
      setApprovals(prev => prev.filter(a => a.id !== approvalId));
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleRejectAction = async (approvalId: string) => {
    if (!agentId) return;
    try {
      await updateApprovalStatus(agentId, approvalId, 'rejected');
      setApprovals(prev => prev.filter(a => a.id !== approvalId));
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-1000 text-slate-900 min-h-screen pb-20 relative">
      
      {/* Blurred Console Content (Blur everything but the global header) */}
      <div className={`space-y-8 transition-all duration-1000 ${!isDeployed ? 'filter blur-[15px] opacity-25 pointer-events-none' : ''}`}>
        
        {/* Header (Now part of the blurred content) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="hidden md:block">
            <div className="flex items-center gap-3 mb-2 font-black">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Agent Management Console</h2>
            </div>
            <p className="text-slate-400 font-bold text-xs tracking-widest uppercase italic">Executive Control Dashboard</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full lg:w-auto">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className={`px-3 md:px-5 py-2 rounded-2xl border text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showThinking ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
            >
              <Brain className={`w-3 h-3 ${showThinking ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">Step-by-step logic:</span> {showThinking ? 'Visible' : 'Hidden'}
            </button>
            <div className={`px-3 md:px-5 py-2 rounded-2xl border text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isPaused ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              {isPaused ? 'PAUSED' : 'ONLINE'}
            </div>
            {isDeployed && agentId && (
              <button 
                onClick={async () => {
                  const nextStatus = isPaused ? 'Active' : 'Paused';
                  setLocalStatus(nextStatus);
                  try {
                    await updateAgentStatus(agentId, nextStatus as any);
                    await updateAgentBackendStatus(agentId, nextStatus as any);
                  } catch (e) {
                    setLocalStatus(stats?.status || 'Active');
                  }
                }}
                className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${isPaused ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isPaused ? <Play className="w-3 h-3 md:w-3.5 h-3.5 fill-current" /> : <Pause className="w-3 h-3 md:w-3.5 h-3.5 fill-current" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        </div>

        <div className="relative">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
          <StatCard title="Total Tasks Computed" value={activeTasksCount.toFixed(0)} change="Real-time" icon={<Cpu className="w-5 h-5" />} color="indigo" />
          <StatCard title="Accuracy & Compliance" value={accuracyRate} change="Real-time" icon={<ShieldCheck className="w-5 h-5" />} color="emerald" />
          <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm transition-all group relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className="p-2 md:p-3 rounded-lg md:rounded-2xl border bg-amber-50 text-amber-600 border-amber-100"><Zap className="w-4 h-4 md:w-5 h-5" /></div>
              <span className="hidden md:inline-block text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">Live Allocation</span>
            </div>
            <div className="space-y-2 md:space-y-4">
              <div>
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 mb-0.5 md:mb-2 uppercase tracking-widest">Resource Allocation</p>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <p className="text-lg md:text-2xl font-black text-slate-900 leading-none">${totalCost.toFixed(2)}</p>
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">/ ${config.budget?.dailyLimitUSD || 10}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 rounded-full ${(totalCost / (config.budget?.dailyLimitUSD || 10)) > 0.8 ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (totalCost / (config.budget?.dailyLimitUSD || 10)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <StatCard title="Average Latency" value={stats?.lastLatency ? `${stats.lastLatency}ms` : "N/A"} change="API Measured" icon={<Activity className="w-5 h-5" />} color="purple" />

          <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm transition-all group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className="p-2 md:p-3 rounded-lg md:rounded-2xl border bg-indigo-50 text-indigo-600 border-indigo-100"><ShieldCheck className="w-4 h-4 md:w-5 h-5" /></div>
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">System Health</p>
              <p className="text-lg md:text-2xl font-black text-slate-900">{stats?.trust_score ? `${stats.trust_score}%` : "100%"}</p>
            </div>
          </div>


          {/* Industrial Circuit Status */}
          <div className={`p-3 md:p-6 rounded-2xl md:rounded-3xl border transition-all duration-700 flex flex-col justify-between ${(stats?.tool_errors || 0) >= 3 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Integrity</p>
              <div className={`w-1.5 h-1.5 md:w-2 h-2 rounded-full ${(stats?.tool_errors || 0) >= 3 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <p className={`text-[11px] md:text-sm font-black uppercase tracking-tighter truncate ${stats?.status === 'Paused' ? 'text-amber-600' : ((stats?.tool_errors || 0) >= 3 ? 'text-rose-600' : 'text-emerald-600')}`}>
                {stats?.status === 'Paused' ? "System Idle" : ((stats?.tool_errors || 0) >= 3 ? "Action Req." : "Secure")}
              </p>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

          {/* Central Analytics */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200 min-h-[460px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <h3 className="text-[10px] md:text-sm font-black text-slate-900 flex items-center gap-3 tracking-[0.2em] uppercase whitespace-nowrap overflow-hidden">
                  <span className="truncate">
                    {activeTab === 'analytics' && <><BarChart3 className="w-4 h-4 md:w-5 h-5 text-indigo-600 inline mr-2" /> Logs & Activity</>}
                    {activeTab === 'strategy' && <><Settings className="w-4 h-4 md:w-5 h-5 text-amber-600 inline mr-2" /> Core Instructions</>}
                    {activeTab === 'controls' && <><Lock className="w-4 h-4 md:w-5 h-5 text-rose-600 inline mr-2" /> Permissions</>}
                    {activeTab === 'approvals' && <><CheckCircle className="w-4 h-4 md:w-5 h-5 text-emerald-600 inline mr-2" /> Approvals</>}
                    {activeTab === 'portal' && <><Globe className="w-4 h-4 md:w-5 h-5 text-indigo-500 inline mr-2" /> Interface</> }
                  </span>
                </h3>
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none w-full sm:w-auto shrink-0">
                  {[
                    { id: 'analytics', label: 'Activity' },
                    { id: 'strategy', label: 'Instructions' },
                    { id: 'controls', label: 'Permissions' },
                    { id: 'approvals', label: 'Approvals' },
                    { id: 'portal', label: 'Interface' }
                  ].map((tab: any) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 md:px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'analytics' && (
                <div className="space-y-10 animate-in fade-in duration-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4"><Activity className="w-6 h-6 text-indigo-600" /> Activity Stream</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Network Optimized</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {logs.length === 0 ? (
                      <div className="p-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[4rem]">
                        <Terminal className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">Awaiting first automation task...</p>
                      </div>
                    ) : (
                      Object.entries(
                        logs.reduce((acc: any, log) => {
                          const mid = log.mission_id || 'Routine_Task';
                          if (!acc[mid]) acc[mid] = [];
                          acc[mid].push(log);
                          return acc;
                        }, {})
                      ).map(([mid, missionLogs]: [any, any]) => (
                        <div key={mid} className="bg-white border border-slate-200 rounded-[3rem] p-10 space-y-8 transition-all hover:border-indigo-500/20 hover:shadow-lg shadow-sm">
                          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6">
                            <div className="space-y-3 w-full">
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <span className="px-2 md:px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[7px] md:text-[10px] font-black tracking-widest uppercase border border-indigo-100">Session: {mid.slice(0, 10)}</span>
                                <span className={`px-2 md:px-3 py-1 rounded-lg text-[7px] md:text-[10px] font-black tracking-widest uppercase ${missionLogs.some((l: any) => l.type === 'error') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                  {missionLogs.some((l: any) => l.type === 'error') ? 'Errors' : 'Clean'}
                                </span>
                                <span className="px-2 md:px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[7px] md:text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                  {new Date(missionLogs[0].timestamp?.toDate?.() || Date.now()).toLocaleTimeString()}
                                </span>
                              </div>
                              <h4 className="text-lg md:text-2xl font-black text-slate-900 leading-tight">{missionLogs[0].message.length > 60 ? missionLogs[0].message.substring(0, 60) + '...' : missionLogs[0].message}</h4>
                            </div>
                            <div className="flex grid grid-cols-2 lg:flex lg:flex-row items-center gap-4 w-full lg:w-auto">
                              <div className="flex flex-col items-end gap-1 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-right w-full lg:w-32">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                                <p className="text-sm font-black text-emerald-600">
                                  {((missionLogs.filter((l: any) => l.type !== 'error').length / missionLogs.length) * 100).toFixed(1)}%
                                </p>
                              </div>
                              <button
                                onClick={() => handleDownloadProof(mid)}
                                className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all w-full lg:w-32"
                              >
                                <p className="text-[9px] font-black uppercase tracking-widest">Audit</p>
                                <p className="text-[10px] font-black uppercase tracking-widest">Proof</p>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-6 pt-8 border-t border-slate-100">
                            {missionLogs.map((log: any, idx: number) => (
                              <div key={idx} className="flex gap-8 group">
                                <div className="flex flex-col items-center">
                                  <div className={`w-3 h-3 rounded-full mt-2 border-2 border-white shadow-sm ${log.type === 'error' ? 'bg-rose-500' : log.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-600'} group-last:bg-indigo-200`} />
                                  <div className="w-px flex-1 bg-slate-100 group-last:bg-transparent" />
                                </div>
                                <div className="pb-8 space-y-3">
                                  <div className="flex items-center gap-3">
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${log.type === 'error' ? 'text-rose-600' : log.type === 'success' ? 'text-emerald-600' : 'text-indigo-600'}`}>{log.type}</p>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.timestamp?.toDate?.() || Date.now()).toLocaleTimeString()}</p>
                                  </div>
                                  <p className="text-base font-medium text-slate-600 leading-relaxed">{log.message}</p>
                                  {log.reasoning && (
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-3">
                                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2"><Brain className="w-4 h-4" /> AI Logic Path</p>
                                      <p className="text-sm text-slate-500 italic leading-relaxed font-serif">"{log.reasoning}"</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}


              {activeTab === 'strategy' && (
                <div className="space-y-10 animate-in fade-in duration-700">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 italic tracking-tighter"><Compass className="w-8 h-8 text-emerald-600" /> Agent Core Instructions</h3>
                      <p className="text-xs text-slate-400 font-medium tracking-tight">Set mandatory operational guidelines and rules of engagement for your agent fleet.</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-12 rounded-[4rem] space-y-8 relative overflow-hidden">
                    <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Corporate Strategic Directives</label>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Last Update: {lastDirectiveUpdate || 'Initial'}</span>
                      </div>
                      <textarea
                        value={directives}
                        onChange={(e) => setDirectives(e.target.value)}
                        placeholder="Example: 'Prioritize long-term stakeholder value over immediate cost reduction. Be extremely cautious with external API mutations...'"
                        className="w-full h-48 bg-white border border-slate-200 rounded-[3rem] p-10 text-slate-900 font-serif text-sm focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-300 shadow-inner"
                      />
                      <button
                        onClick={handleSaveDirectives}
                        disabled={isSavingDirectives}
                        className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-slate-200 hover:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {isSavingDirectives ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {isSavingDirectives ? 'Saving Instructions...' : 'Update Agent Instructions'}
                      </button>
                    </div>


                  </div>
                </div>
              )}

              {activeTab === 'controls' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 uppercase tracking-wider text-xs">Human Oversight Mode</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Require manual approval for critical actions.</p>
                    </div>
                    <button
                      onClick={() => handleUpdateToggle('is_semi_auto', !config.is_semi_auto)}
                      className={`w-14 h-8 rounded-full p-1.5 transition-all duration-300 ${config.is_semi_auto ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${config.is_semi_auto ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ControlSetting label="Autonomous Response" enabled={config.auto_response_email} onClick={() => handleUpdateToggle('auto_response_email', !config.auto_response_email)} />
                    <ControlSetting label="Database Mutation" enabled={config.crm_mutation} onClick={() => handleUpdateToggle('crm_mutation', !config.crm_mutation)} />
                    <ControlSetting label="Document Synthesis" enabled={config.doc_synthesis} onClick={() => handleUpdateToggle('doc_synthesis', !config.doc_synthesis)} />
                    <ControlSetting label="External Sync" enabled={config.slack_notifications} onClick={() => handleUpdateToggle('slack_notifications', !config.slack_notifications)} />
                  </div>
                </div>
              )}

              {activeTab === 'approvals' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {approvals.length === 0 ? (
                    <div className="p-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[4rem]">
                      <ShieldCheck className="w-16 h-16 text-emerald-500/20 mx-auto mb-6" />
                      <p className="text-slate-400 text-sm italic font-medium uppercase tracking-[0.2em]">All actions verified: No pending approvals.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Action Approval Queue ({approvals.length})</h3>
                      </div>
                      {approvals.map((approval) => (
                        <div key={approval.id} className="p-10 bg-white border border-slate-200 rounded-[3.5rem] flex flex-col space-y-8 relative overflow-hidden group hover:border-indigo-500/40 transition-all shadow-sm">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Restricted Tool: {approval.tool}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {approval.id.slice(0, 8)}</span>
                              </div>
                              <h4 className="text-2xl font-black text-slate-900 tracking-tight">Manual Authorization Required</h4>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                              <button
                                onClick={() => handleRejectAction(approval.id)}
                                className="flex-1 md:flex-none px-10 py-4 bg-slate-50 hover:bg-rose-50 border border-slate-200 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleApproveAction(approval.id)}
                                className="flex-1 md:flex-none px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:scale-105 transition-all italic"
                              >
                                Approve Action
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-3">
                              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Rationale</p>
                              <p className="text-sm font-black text-slate-700 leading-relaxed italic">"{approval.reason || "Autonomous necessity for task continuity."}"</p>
                            </div>
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Execution Context</p>
                              <div className="p-4 bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-inner">
                                <code className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap">{approval.input}</code>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'portal' && (
                <div className="space-y-10 animate-in fade-in duration-700">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 italic tracking-tighter"><Globe className="w-8 h-8 text-indigo-500" /> Employee Portal Configuration</h3>
                      <p className="text-xs text-slate-400 font-medium tracking-tight">Configure a dedicated, branded workspace for your employees to collaborate with this agent.</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-8 md:p-12 rounded-[4rem] space-y-10 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Portal Subdomain</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="text" 
                            value={portalConfig.subdomain}
                            onChange={(e) => setPortalConfig({...portalConfig, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                            placeholder="company"
                            className="bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all w-full shadow-sm"
                          />
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">.{CONFIG.BASE_DOMAIN}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic">Employees will access the agent core via this custom URL.</p>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Access Security</label>
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit">
                          <button 
                            onClick={() => setPortalConfig({...portalConfig, isPublic: true})}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${portalConfig.isPublic ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Public
                          </button>
                          <button 
                            onClick={() => setPortalConfig({...portalConfig, isPublic: false})}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!portalConfig.isPublic ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Authorized Only
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic">
                          {portalConfig.isPublic ? 'Anyone with the link can access the portal.' : 'Only Google-authenticated users from whitelisted domains or emails can access.'}
                        </p>
                      </div>
                    </div>

                    {!portalConfig.isPublic && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Whitelisted Domains</label>
                          <input 
                            type="text" 
                            value={domInput}
                            onChange={(e) => setDomInput(e.target.value)}
                            placeholder="e.g. google.com, apple.com"
                            className="bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all w-full shadow-sm"
                          />
                          <p className="text-[10px] text-slate-400 font-medium italic">Comma-separated list of authorized domains.</p>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Individual Whitelist</label>
                          <textarea 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="user@example.com (one per line)"
                            className="bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all w-full shadow-sm h-32"
                          />
                          <p className="text-[10px] text-slate-400 font-medium italic">Specific emails authorized for access.</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Portal Profile Name</label>
                        <input 
                          type="text" 
                          value={portalConfig.portalName || ''}
                          onChange={(e) => setPortalConfig({...portalConfig, portalName: e.target.value})}
                          placeholder="e.g., Acme Procurement Hub"
                          className="bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all w-full shadow-sm"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Theme Branding</label>
                        <div className="flex gap-3">
                          {['indigo', 'rose', 'emerald', 'amber', 'slate'].map(color => (
                            <button
                              key={color}
                              onClick={() => setPortalConfig({...portalConfig, appearance: { ...portalConfig.appearance, theme: color }})}
                              className={`w-10 h-10 rounded-full border-2 transition-all ${
                                (portalConfig.appearance?.theme || 'indigo') === color 
                                  ? 'border-slate-900 scale-110 shadow-lg' 
                                  : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color === 'indigo' ? '#6366f1' : color === 'rose' ? '#f43f5e' : color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : '#0f172a' }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Agent Avatar URL</label>
                      <input 
                        type="text" 
                        value={portalConfig.appearance?.avatarUrl || ''}
                        onChange={(e) => setPortalConfig({...portalConfig, appearance: { ...portalConfig.appearance, avatarUrl: e.target.value }})}
                        placeholder="https://example.com/logo.png"
                        className="bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all w-full shadow-sm font-mono"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Worker Welcome Directive</label>
                      <textarea 
                        value={portalConfig.welcomeMessage || ''}
                        onChange={(e) => setPortalConfig({...portalConfig, welcomeMessage: e.target.value})}
                        placeholder="Greeting shown to employees when they first enter the portal..."
                        className="w-full h-32 bg-white border border-slate-200 rounded-3xl p-6 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 bg-white border border-slate-100 rounded-3xl group shadow-sm gap-4">
                      <div className="space-y-1">
                        <p className="font-black text-slate-900 uppercase tracking-wider text-[10px] md:text-xs italic">Public Portal Access</p>
                        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Allow access without enterprise SSO.</p>
                      </div>
                      <button
                        onClick={() => setPortalConfig({...portalConfig, isPublic: !portalConfig.isPublic})}
                        className={`w-12 h-7 md:w-14 md:h-8 rounded-full p-1 transition-all duration-300 shrink-0 ${portalConfig.isPublic ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${portalConfig.isPublic ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Live URL Preview */}
                    {portalConfig.subdomain && (
                      <div className={`p-4 md:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-500 ${
                        portalSaveStatus === 'saved' 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-indigo-50 border-indigo-100'
                      }`}>
                        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            portalSaveStatus === 'saved' ? 'bg-emerald-500' : 'bg-indigo-300 animate-pulse'
                          }`} />
                          <div className="min-w-0">
                            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                              {portalSaveStatus === 'saved' ? 'Portal Live At' : 'Portal URL Preview'}
                            </p>
                            <p className={`text-xs md:text-sm font-black truncate ${portalSaveStatus === 'saved' ? 'text-emerald-700' : 'text-indigo-600'}`}>
                              {portalConfig.subdomain}.solu.uk
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`https://${portalConfig.subdomain}.solu.uk`);
                          }}
                          className="shrink-0 px-4 py-2 bg-white border border-slate-100 rounded-2xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                        >
                          Copy URL
                        </button>
                      </div>
                    )}

                    <button 
                      onClick={handleSavePortalConfig}
                      disabled={portalSaveStatus === 'saving'}
                      className={`w-full py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
                        portalSaveStatus === 'saved'
                          ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-[0.99]'
                          : portalSaveStatus === 'error'
                          ? 'bg-rose-600 text-white shadow-xl shadow-rose-200'
                          : portalSaveStatus === 'saving'
                          ? 'bg-slate-200 text-slate-400 cursor-wait'
                          : 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:scale-[0.99]'
                      }`}
                    >
                      {portalSaveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {portalSaveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
                      {portalSaveStatus === 'error' && <span>⚠</span>}
                      {portalSaveStatus === 'idle' && <Zap className="w-4 h-4 text-amber-400" />}
                      {portalSaveStatus === 'saving' ? 'Deploying...' 
                        : portalSaveStatus === 'saved' ? 'Portal Live! Configuration Saved'
                        : portalSaveStatus === 'error' ? 'Error — Subdomain Required'
                        : 'Deploy Interface Updates'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <Globe className="w-4 h-4 text-amber-600" /> Connected Tools & APIs
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-3 font-black text-[10px] text-indigo-600 uppercase tracking-widest">
                      <Zap className="w-3.5 h-3.5" /> API Gateway
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-600">Online</span>
                  </div>
                  <ServiceRow name="Email / SMTP Services" status={config.auto_response_email ? 'active' : 'inactive'} />
                  <ServiceRow name="CRM Integration" status={config.crm_mutation ? 'active' : 'inactive'} />
                  <ServiceRow name="Internal Webhooks" status={config.slack_notifications ? 'active' : 'inactive'} />
                </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <Layers className="w-4 h-4 text-indigo-600" /> Resource Allocation
                </h4>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Automation Nodes</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${isExecuting ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>Primary_Orchestrator</span>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${isExecuting && config.collaboration?.allowDelegation ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 animate-pulse' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>Worker_Sub_01</span>
                    </div>
                  </div>
                  <div className="space-y-5 pt-2">
                    <ModelProgressBar name={config?.model || "Standard Engine"} percentage={isExecuting ? 92 : 0} color="indigo" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interaction Loop */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 relative overflow-hidden shadow-xl shadow-slate-200/50">
              <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Mission Dispatch</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">Enter a directive for your automation fleet.</p>

              <div className="space-y-6 relative z-10">
                <div className="relative group">
                  <textarea
                    className="relative w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-slate-900 font-serif text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 resize-none shadow-inner"
                    placeholder="e.g., Analyze the Q1 procurement flow and verify compliance against strategy..."
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleExecuteCommand}
                  disabled={isExecuting || !command.trim()}
                  className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${isExecuting ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-slate-200'}`}
                >
                  {isExecuting ? (
                    <>Processing Request <Loader2 className="w-4 h-4 animate-spin" /></>
                  ) : (
                    <>Engage Automation <Zap className="w-4 h-4" /></>
                  )}
                </button>

                {imageUrl && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-indigo-200">
                      <img src={imageUrl} alt="Upload" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">Vision Payload Attached</p>
                    <button onClick={() => setImageUrl(null)} className="p-1 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      const url = prompt("Enter Image URL for Vision Analysis:");
                      if (url) setImageUrl(url);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${imageUrl ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                  >
                    <Globe className="w-3.5 h-3.5" /> Attach Vision
                  </button>
                </div>

                <p className="text-[10px] text-center text-slate-700 font-bold uppercase tracking-widest pt-4">Signed By Sovereign Authority: {user?.uid.substring(0, 8)}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 p-10 rounded-[4rem] space-y-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-3"><ShieldCheck className="w-4 h-4" /> Collective Wisdom Feed</p>
                <Sparkles className="w-4 h-4 text-amber-500/50" />
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-white/5 border border-white/5 rounded-[2rem] space-y-3 group hover:border-indigo-500/30 transition-all cursor-help">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol #492</p>
                    <Zap className="w-3 h-3 text-emerald-500" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed italic">"Procurement delays in EU-Zone-3 are linked to seasonal compliance shifts."</p>
                </div>
                <div className="p-5 bg-white/5 border border-white/5 rounded-[2rem] space-y-3 group hover:border-indigo-500/30 transition-all cursor-help">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency #491</p>
                    <Zap className="w-3 h-3 text-emerald-500" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed italic">"Vector synthesis reduces doc-ops latency by 14% on SOC2 reports."</p>
                </div>
              </div>
              <button className="w-full py-4 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] transition-colors border border-transparent hover:border-white/5 rounded-2xl">View All Wisdom Archives</button>
            </div>
          </div>
        </div>
      </div>

      {/* End Blurred Session Wrapper */}
      </div>

      {!isDeployed && !isProvisioning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-3xl p-16 rounded-[4rem] border border-slate-200 max-w-2xl w-full text-center space-y-10 shadow-2xl animate-in zoom-in-95 duration-1000 pointer-events-auto">
            <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 rotate-6 group">
              <Sparkles className="w-12 h-12 text-white -rotate-6 transition-transform group-hover:scale-110" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Create your first agent build request</h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">Our AI will analyze your hiring needs and generate a custom automation blueprint for your review.</p>
            </div>
            <button onClick={onOpenTool} className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-sm">
              Get Started
            </button>
          </div>
        </div>
      )}

      {isProvisioning && !isDeployed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] border border-slate-200 max-w-3xl w-full text-center space-y-10 shadow-2xl animate-in zoom-in-95 duration-1000 max-h-[90vh] overflow-y-auto pointer-events-auto">
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-100 rotate-6 group">
              <CheckCircle className="w-10 h-10 text-white -rotate-6 animate-pulse" />
            </div>
            
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Active Build Requests</h2>
              <p className="text-slate-500 text-sm font-medium">Our AI Expert team is currently architecting your custom agent fleet.</p>
            </div>

            <div className="space-y-3 text-left">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Pending Infrastructure ({activeJobs.filter(j => j.status !== 'Deployed').length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {activeJobs.filter(j => j.status !== 'Deployed').map((job) => (
                  <div key={job.id} className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{job.blueprint?.jobTitle || "Custom Agent Build"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.postedDate || "Recently Submitted"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100 animate-pulse">
                        {job.status}
                      </span>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Phase: Provisioning</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
              <button 
                onClick={onOpenTool}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl shadow-slate-900/20 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                Initialize New Agent Build
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact support@solu.ai for priority deployment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
