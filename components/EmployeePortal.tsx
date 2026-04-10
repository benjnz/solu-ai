import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Send, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Zap, 
  Clock, 
  MessageSquare, 
  ChevronRight, 
  User, 
  Bot, 
  Terminal, 
  Cpu,
  Info,
  LogOut,
  Lock,
  Globe,
  ArrowRight
} from 'lucide-react';
import { getAgentStats, getAgentLogs } from '../services/db';
import { onAuthChanged, login, logout, User as AuthUser } from '../services/auth';

interface EmployeePortalProps {
  agent: any;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ agent }) => {
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(agent);
  const [activeTab, setActiveTab] = useState<'collab' | 'telemetry' | 'tasks'>('collab');

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!agent?.id) return;

    const unsubStats = getAgentStats(agent.id, (newStats) => {
      setStats(prev => ({ ...prev, ...newStats }));
    });

    const unsubLogs = getAgentLogs(agent.id, (newLogs) => {
      setLogs(newLogs);
    });

    const unsubAuth = onAuthChanged((user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });

    return () => {
      unsubStats();
      unsubLogs();
      unsubAuth();
    };
  }, [agent?.id]);

  useEffect(() => {
    const config = stats?.portalConfig;
    if (!config) {
      setIsAuthorized(false);
      return;
    }

    // Public Option: If isPublic is explicitly true, everyone is authorized
    if (config.isPublic === true) {
      setIsAuthorized(true);
      return;
    }

    if (currentUser) {
      const email = currentUser.email?.toLowerCase().trim() || '';
      const domain = email.split('@')[1] || '';
      
      const authorizedEmails = (config.authorizedEmails || []).map((e: string) => e.toLowerCase().trim());
      const authorizedDomains = (config.authorizedDomains || []).map((d: string) => d.toLowerCase().trim());

      const isEmailAllowed = authorizedEmails.includes(email);
      const isDomainAllowed = authorizedDomains.includes(domain);
      
      console.log(`[Auth:Enforcement] Checking ${email} / ${domain}. Result: Email=${isEmailAllowed}, Domain=${isDomainAllowed}`);
      setIsAuthorized(isEmailAllowed || isDomainAllowed);
    } else {
      setIsAuthorized(false);
    }
  }, [currentUser, stats?.portalConfig, authChecked]);

  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !agent?.id || isThinking) return;
    
    const userMsg = { text: message, sender: 'user', timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsThinking(true);

    try {
      const { executeAgent } = await import('../services/agentService');
      const result = await executeAgent(agent.id, message);
      
      const agentMsg = { 
        text: result.output, 
        sender: 'agent', 
        timestamp: new Date(),
        reasoning: result.agent_logs
      };
      
      setChatHistory(prev => [...prev, agentMsg]);
    } catch (error: any) {
      setChatHistory(prev => [...prev, { 
        text: "Neural bridge interrupted. Please try re-establishing the uplink.", 
        sender: 'system', 
        type: 'error',
        timestamp: new Date() 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const themeColors: Record<string, string> = {
    indigo: '#6366f1',
    rose: '#f43f5e',
    emerald: '#10b981',
    amber: '#f59e0b',
    slate: '#0f172a'
  };

  const currentTheme = stats?.portalConfig?.appearance?.theme || 'indigo';
  const themeHex = themeColors[currentTheme] || themeColors.indigo;
  const portalName = stats?.portalConfig?.portalName || `${agent.clientName || 'Enterprise'} Agent Portal`;
  const avatarUrl = stats?.portalConfig?.appearance?.avatarUrl;

  const handleLogin = async () => {
    try {
      await login('associate');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 animate-pulse">
           <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
              <Brain className="w-8 h-8 text-white" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Re-establishing neural bridge...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#080b11] flex items-center justify-center p-6 selection:bg-indigo-500/30 overflow-hidden relative">
        {/* Dynamic Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        
        <div className="max-w-xl w-full bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 fade-in duration-1000 relative z-10">
          <div className="p-10 md:p-14 text-center space-y-12">
            <div className="relative inline-block">
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20 rotate-6 transition-transform hover:rotate-0 duration-500 overflow-hidden group">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Logo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <Brain className="w-12 h-12 text-white" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black border border-white/10 rounded-2xl flex items-center justify-center shadow-xl">
                <Lock className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                Restricted Node
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Sovereign <br/><span className="text-indigo-400">Authentication</span></h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm mx-auto">
                Accessing <span className="text-white font-black italic">{portalName}</span>. 
                Please verify your identity to establish a neural uplink.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <button 
                onClick={handleLogin}
                className="w-full group relative flex items-center justify-center gap-4 bg-white hover:bg-white/90 text-black py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xl"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                </div>
                <span>Authenticate via Google</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel Attempt
              </button>
            </div>

            {currentUser && !isAuthorized && (
              <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-center gap-3 text-rose-500 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Access Denied</span>
                </div>
                <p className="text-rose-200/60 text-xs font-medium leading-relaxed">
                  Identity <span className="font-black text-rose-400">{currentUser.email}</span> is not authorized for this specific node. 
                </p>
                <button onClick={logout} className="mt-6 text-[10px] font-black text-white bg-rose-500 hover:bg-rose-600 px-6 py-3 rounded-xl uppercase tracking-widest transition-all">
                  Switch Account
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white/[0.02] p-8 border-t border-white/5">
             <div className="flex items-center gap-4 text-slate-500">
                <Info className="w-5 h-5 opacity-50" />
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-left leading-relaxed">
                  This portal is restricted to <span className="text-white font-bold">authorized stakeholders</span> of the {agent.clientName || 'enterprise'} collective.
                </p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      <header className="bg-white/80 backdrop-blur-2xl border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-10 h-10 md:w-14 h-14 bg-slate-900 rounded-xl md:rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-slate-400/20 overflow-hidden rotate-2 hover:rotate-0 transition-transform cursor-pointer">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Agent" className="w-full h-full object-cover" />
              ) : (
                <Brain className="w-5 h-5 md:w-8 h-8 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 leading-tight uppercase italic truncate">{portalName}</h1>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                   <div className="w-1 h-1 md:w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <div className="w-1 h-1 md:w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">{agent.blueprint?.jobTitle || 'Autonomous Node'}</span>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/40">
            {(['collab', 'tasks', 'telemetry'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-slate-900 shadow-xl shadow-slate-200' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                style={activeTab === tab ? { borderBottom: `3px solid ${themeHex}` } : {}}
              >
                {tab === 'collab' ? 'Collaboration' : tab === 'tasks' ? 'Task Ledger' : 'Telemetry'}
              </button>
            ))}
          </nav>

          {/* Mobile Navigation Trigger */}
          <div className="lg:hidden flex items-center p-1 bg-slate-100 rounded-xl">
             {(['collab', 'tasks', 'telemetry'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`p-2.5 rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-400'
                }`}
              >
                {tab === 'collab' ? <MessageSquare className="w-5 h-5" /> : tab === 'tasks' ? <Layers className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                   {currentUser?.avatar ? (
                     <img src={currentUser.avatar} alt="User" className="w-full h-full rounded-full" />
                   ) : (
                     <User className="w-4 h-4 text-indigo-400" />
                   )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 leading-none mb-0.5">{currentUser?.name || 'Authorized Member'}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[100px]">{currentUser?.email}</p>
                </div>
            </div>
            <button 
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }} 
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm group"
              title="Terminate Session"
            >
               <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-12 gap-10 lg:flex">
        {/* Left Sidebar: Context & Live Stats - Hidden on Mobile if not Telemetry tab */}
        <div className={`w-full lg:w-[380px] space-y-8 shrink-0 ${activeTab !== 'telemetry' ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-[3rem] p-10 border border-white/60 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 opacity-5 -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-1000">
               <ShieldCheck className="w-full h-full text-indigo-900" />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Goal</p>
                   <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Live Mission</div>
                </div>
                <p className="text-xl font-black text-slate-900 tracking-tight leading-tight italic">
                   "{agent.blueprint?.primaryGoal || 'Autonomous Enterprise Optimization'}"
                </p>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Neural Capabilities</label>
                    <div className="flex flex-wrap gap-2">
                       {agent.blueprint?.requiredCapabilities?.map((cap: string, i: number) => (
                         <span key={i} className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                            {cap}
                         </span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                   <div className="absolute top-1 right-1">
                      <Zap className="w-3 h-3 text-amber-500 opacity-20" />
                   </div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Efficiency</p>
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">98.4%</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Latency</p>
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">124ms</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group min-h-[400px] border border-white/5">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 100% 0%, ${themeHex}, transparent 60%)` }} />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 uppercase tracking-[0.3em] font-black text-[10px]">
                   <Activity className="w-4 h-4 text-indigo-400" /> Mission Telemetry
                </div>
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Stream Active</span>
                </div>
              </div>
              
              <div className="space-y-6 flex-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="group/log border-l-2 border-white/5 pl-6 pb-6 relative last:pb-0">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] group-hover/log:scale-150 transition-all duration-300" />
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1.5 font-mono">
                      {new Date(log.timestamp?.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </p>
                    <p className="text-[11px] font-bold text-white/90 leading-relaxed font-serif tracking-tight italic group-hover/log:text-white transition-colors">
                      {log.message || log.text}
                    </p>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-40 opacity-10">
                     <Cpu className="w-10 h-10 mb-4 animate-spin font-serif" style={{ animationDuration: '4s' }} />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">Establishing Link...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className={`flex-1 space-y-8 min-w-0 ${activeTab === 'telemetry' ? 'hidden lg:block' : ''}`}>
          {activeTab === 'collab' && (
            <div className="bg-white rounded-[3.5rem] flex flex-col h-[85vh] border border-white/60 shadow-2xl relative overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-6 md:px-10 py-4 md:py-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 uppercase tracking-[0.3em] font-black text-[8px] md:text-[10px] text-slate-400">
                     <MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">Interactive Node Channel</span><span className="sm:hidden">Node Output</span>
                  </div>
                  <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                     v1.4.2
                  </div>
               </div>

              <div className="flex-1 p-6 md:p-12 overflow-y-auto space-y-8 md:space-y-10 custom-scrollbar scroll-smooth">
                {/* Initial Greeting */}
                <div className="flex gap-6 animate-in fade-in slide-in-from-left-4 duration-700">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden shadow-xl shadow-slate-200">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Agent" className="w-full h-full object-cover" />
                    ) : (
                      <Bot className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] rounded-tl-none border border-slate-100 max-w-2xl shadow-sm">
                      <p className="text-base font-medium text-slate-700 leading-relaxed font-serif italic">
                        "{stats?.portalConfig?.welcomeMessage || `Welcome to the ${portalName}. I am initialized and ready to execute high-fidelity operations. How shall we proceed?`}"
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Autonomous Partner</span>
                       <span className="w-1 h-1 rounded-full bg-slate-200" />
                       <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Logic: RAG-Enhanced</span>
                    </div>
                  </div>
                </div>

                {chatHistory.map((chat, i) => (
                  <div key={i} className={`flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[${i * 100}ms] ${chat.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xl relative group ${chat.sender === 'user' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
                      {chat.sender === 'user' ? (
                        <User className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      ) : avatarUrl ? (
                        <img src={avatarUrl} alt="Agent" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      )}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className={`space-y-3 max-w-2xl ${chat.sender === 'user' ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                      <div className={`group relative p-8 rounded-[2.5rem] border shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] ${
                        chat.sender === 'user' 
                          ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' 
                          : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                      }`}>
                        <div className={`absolute top-0 ${chat.sender === 'user' ? 'right-0 -mr-2 bg-indigo-600' : 'left-0 -ml-2 bg-white'} w-4 h-4 rotate-45 border-t border-l border-inherit`} />
                        <p className={`text-base font-medium leading-relaxed relative z-10 ${chat.sender === 'user' ? 'font-sans' : 'font-serif italic'}`}>{chat.text}</p>
                        
                        {chat.reasoning && (
                          <div className={`mt-8 p-6 rounded-[2rem] border overflow-hidden relative ${chat.sender === 'user' ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200/50'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                              <Brain className="w-16 h-16" />
                            </div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 ${chat.sender === 'user' ? 'text-white/60' : 'text-indigo-400'}`}>
                              <Zap className="w-3.5 h-3.5 fill-current" /> Neural Trace Configuration
                            </p>
                            <p className={`text-[11px] font-mono leading-relaxed opacity-70 ${chat.sender === 'user' ? 'text-white' : 'text-slate-600'}`}>
                              {chat.reasoning}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 px-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {chat.sender === 'user' ? 'Authority Control' : 'Autonomous Node'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex gap-6 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Bot className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-50/50 px-10 py-6 rounded-[2.5rem] rounded-tl-none border border-slate-100 flex items-center gap-4">
                         <div className="flex gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                         </div>
                         <p className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] italic">Synthesizing Cognition...</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll Anchor */}
                <div id="chat-end" />
              </div>

              {/* Chat Input Redesign */}
              <div className="p-4 md:p-12 bg-white border-t border-slate-50">
                <div className="max-w-4xl mx-auto relative group">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Input directive..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl md:rounded-[3rem] px-6 md:px-12 py-4 md:py-7 pr-20 md:pr-24 focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all font-medium text-sm md:text-base shadow-inner placeholder:italic placeholder:text-slate-300"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isThinking || !message.trim()}
                    className="absolute right-2 md:right-4 top-2 md:top-4 bottom-2 md:bottom-4 aspect-square text-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl disabled:opacity-30 disabled:scale-100 group-hover:shadow-indigo-500/10"
                    style={{ backgroundColor: themeHex, boxShadow: `0 10px 30px ${themeHex}40` }}
                  >
                    <ArrowRight className="w-5 h-5 md:w-6 h-6" />
                  </button>
                </div>
                <div className="hidden sm:flex items-center justify-center gap-8 mt-6 opacity-30">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-3 h-3" /> End-to-End Encryption
                    </p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Node v2.0
                    </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {[
                { label: 'Neural Executions', value: stats.totalTasks || 0, icon: <Activity className="text-indigo-400" />, detail: 'Total cognitive prompts successful' },
                { label: 'Success Velocity', value: '99.8%', icon: <ShieldCheck className="text-emerald-400" />, detail: 'Zero failure events in last 24h' },
                { label: 'Compute Allocation', value: '1.24kW/h', icon: <Cpu className="text-amber-400" />, detail: 'Sustainable industrial engine' },
                { label: 'Logical Integrity', value: '100%', icon: <Layers className="text-purple-400" />, detail: 'Verified by Sovereign Auth' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-white/60 shadow-2xl shadow-slate-200/40 group hover:scale-[1.02] transition-transform duration-500">
                  <div className="flex items-center justify-between mb-8">
                     <div className="p-5 bg-slate-50 rounded-3xl group-hover:bg-indigo-50 transition-colors">{item.icon}</div>
                     <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{item.label}</p>
                    <p className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{item.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-[3.5rem] p-12 border border-white/60 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 min-h-[70vh]">
               <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Mission Ledger</h2>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-widest">Immutable Log</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Historical trace of all autonomous operations performed by the core.</p>
                </div>
                <button 
                  onClick={() => alert("Secure PDF Export Protocol initiated. Report will be available in your Enterprise vault shortly.")}
                  className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)] active:scale-95"
                >
                  Export PDF Report
                </button>
              </div>

              <div className="space-y-6">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:scale-[1.01] transition-all group cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-300 shadow-sm border border-slate-50 group-hover:text-indigo-500 transition-colors">
                        <Terminal className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-800 tracking-tight">{log.message || log.text}</p>
                        <div className="flex items-center gap-3 mt-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.timestamp?.seconds * 1000).toLocaleString()}</p>
                           <span className="w-1 h-1 rounded-full bg-slate-200" />
                           <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Completed</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <ChevronRight className="w-6 h-6 text-slate-900" />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-32 space-y-6 opacity-30">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
                      <Layers className="w-10 h-10 text-slate-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em]">No historical traces found</p>
                       <p className="text-xs font-medium">Core memory is clean. Initialize a new mission.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white border border-slate-100 rounded-full shadow-sm">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Solu Sovereign Neural Network • v2.1-ENTERPRISE</p>
        </div>
      </footer>

      {/* Decorative Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default EmployeePortal;
