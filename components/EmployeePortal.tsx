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
  Cpu
} from 'lucide-react';
import { getAgentStats, getAgentLogs } from '../services/db';

interface EmployeePortalProps {
  agent: any;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ agent }) => {
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(agent);
  const [activeTab, setActiveTab] = useState<'collab' | 'telemetry' | 'tasks'>('collab');

  useEffect(() => {
    if (!agent?.id) return;

    const unsubStats = getAgentStats(agent.id, (newStats) => {
      setStats(prev => ({ ...prev, ...newStats }));
    });

    const unsubLogs = getAgentLogs(agent.id, (newLogs) => {
      setLogs(newLogs);
    });

    return () => {
      unsubStats();
      unsubLogs();
    };
  }, [agent?.id]);

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

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Agent Avatar" className="w-full h-full object-cover" />
              ) : (
                <Brain className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-tight">{portalName}</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autonomous Core Active</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-bold text-slate-400">
                <button 
                  onClick={() => setActiveTab('collab')}
                  className={`transition-all ${activeTab === 'collab' ? 'text-slate-900' : 'hover:text-slate-600'}`}
                  style={activeTab === 'collab' ? { color: themeHex } : {}}
                >
                  Collaboration
                </button>
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className={`transition-all ${activeTab === 'tasks' ? 'text-slate-900' : 'hover:text-slate-600'}`}
                  style={activeTab === 'tasks' ? { color: themeHex } : {}}
                >
                  Task Ledger
                </button>
                <button 
                  onClick={() => setActiveTab('telemetry')}
                  className={`transition-all ${activeTab === 'telemetry' ? 'text-slate-900' : 'hover:text-slate-600'}`}
                  style={activeTab === 'telemetry' ? { color: themeHex } : {}}
                >
                  Telemetry
                </button>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-sm font-black text-slate-900">Employee Node</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: `${themeHex}10` }}>
                <ShieldCheck className="w-6 h-6" style={{ color: themeHex }} />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Agent Profile</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role Title</p>
                <p className="text-xl font-bold text-slate-900 tracking-tight">{agent.blueprint?.jobTitle || 'Autonomous Worker'}</p>
              </div>
              
              <div className="pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Goal</p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {agent.blueprint?.primaryGoal || 'Optimizing enterprise operations through autonomous reasoning.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                  <p className="text-lg font-black text-slate-900">98.4%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cognition</p>
                  <p className="text-lg font-black text-slate-900">124ms</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/30 transition-all duration-700" style={{ backgroundColor: `${themeHex}30` }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-widest">Live Feed</h3>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.length > 0 ? logs.slice(0, 5).map((log, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="font-mono shrink-0" style={{ color: themeHex }}>[{new Date(log.timestamp?.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
                    <span className="text-slate-300 font-medium">{log.message || log.text}</span>
                  </div>
                )) : (
                  <div className="text-slate-500 text-xs italic">Waiting for agent telemetry...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'collab' && (
            <div className="bg-white rounded-[3rem] p-4 flex flex-col min-h-[600px] border border-white/60 shadow-2xl shadow-slate-200/60 overflow-hidden">
              <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Agent" className="w-full h-full object-cover" />
                    ) : (
                      <Bot className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="bg-slate-50 p-6 rounded-3xl rounded-tl-none border border-slate-100 max-w-lg">
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {stats?.portalConfig?.welcomeMessage || "Hello! I am your autonomous partner for this department. How can we optimize our workflow today?"}
                      </p>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Agent • Just Now</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-20 text-center opacity-20 pointer-events-none">
                  <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-xl font-black text-slate-900">Collaboration Space</p>
                  <p className="text-sm font-medium">Interact with the agent core directly</p>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100">
                <div className="max-w-3xl mx-auto relative group">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide context, request a task, or ask for analysis..."
                    className="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 pr-16 focus:outline-none focus:ring-4 focus:border-transparent shadow-sm transition-all font-medium text-sm"
                    style={{ '--tw-ring-color': `${themeHex}20` } as any}
                  />
                  <button 
                    className="absolute right-3 top-3 bottom-3 aspect-square text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all group-hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
                    style={{ backgroundColor: themeHex }}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
                <div className="flex justify-center mt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Secure Autonomous Channel v1.0
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {[
                { label: 'Total Executions', value: stats.totalTasks || 0, icon: <Activity className="text-indigo-500" /> },
                { label: 'Success Rate', value: '99.2%', icon: <CheckCircle className="text-emerald-500" /> },
                { label: 'Compute Usage', value: '1.24kW/h', icon: <Cpu className="text-amber-500" /> },
                { label: 'Memory Retention', value: '94%', icon: <Layers className="text-purple-500" /> }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-white/60 shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{item.value}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">{item.icon}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-[3rem] p-8 border border-white/60 shadow-2xl min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-2xl">
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Task Ledger</h2>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors">Export Logs</button>
              </div>

              <div className="space-y-4">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm font-black text-xs">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{log.message || log.text}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.timestamp?.seconds * 1000).toLocaleString()}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-all translate-x-0 group-hover:translate-x-1" />
                  </div>
                )) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-medium">No archived tasks found for this agent.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
        Powered by solu AI Autonomous Engine • Enterprise Grade
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
