import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { getSharedBlueprint, createBuildRequest } from '../services/db';
import { refineBlueprintFromFeedback } from '../services/geminiService';
import { Blueprint, JobPost } from '../types';
import LoadingAnimation from './LoadingAnimation';
import BusinessDashboard from './BusinessDashboard';
import { LayoutDashboard, FileText, Sparkles, Send, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import OnboardingForm from './OnboardingForm';

interface ClientDashboardProps {
  onPostJob: (job: JobPost) => void;
  onOpenTool: () => void;
  activeJobs: JobPost[];
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onPostJob, onOpenTool, activeJobs }) => {
  const { user } = useUser();
  const [isDeployed, setIsDeployed] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isAwaitingDeployment, setIsAwaitingDeployment] = useState(false);
  const [pendingJob, setPendingJob] = useState<JobPost | null>(null);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [view, setView] = useState<'dashboard' | 'blueprint'>('dashboard');
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showApprovalSuccess, setShowApprovalSuccess] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && user.role === 'client' && user.onboarded === false) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [user]);

  // Handle incoming blueprint (Mark as deployed)
  useEffect(() => {
    if (location.state?.blueprint) {
      setBlueprint(location.state.blueprint);
      setIsDeployed(true);
      setView('blueprint');
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Check for shared URL ID on mount
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
       setIsLoading(true);
       getSharedBlueprint(id).then(data => {
          if (data) {
             setBlueprint(data as Blueprint);
             setIsDeployed(true);
             setView('blueprint');
          }
       }).catch(e => {
          console.error("Shared blueprint load failed:", e);
       }).finally(() => {
          setIsLoading(false);
       });
    }
  }, [searchParams]);

  const handleRefine = async () => {
    if (!blueprint || !feedback.trim()) return;
    setIsRefining(true);
    try {
      const refined = await refineBlueprintFromFeedback(blueprint, feedback);
      setBlueprint(refined);
      setFeedback('');
    } catch (e: any) {
      alert(`Refinement failed: ${e.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  const handleApprove = async () => {
    if (!blueprint) return;
    setIsApproving(true);
    try {
      const newJob: JobPost = {
        id: Math.random().toString(36).substr(2, 9),
        clientId: user?.uid,
        clientName: location.state?.companyName || user?.name || user?.email || "New Client",
        blueprint: blueprint,
        status: 'Open',
        postedDate: new Date().toLocaleDateString(),
        // Identity Metadata
        contactName: location.state?.contactName || '',
        agentName: location.state?.agentName || blueprint.jobTitle,
      } as any;
      
      if (user?.companyDetails) {
        newJob.companyDetails = user.companyDetails;
      }
      await createBuildRequest({
        ...newJob,
        status: 'Awaiting Deployment'
      });
      setIsAwaitingDeployment(true);
      setPendingJob(newJob);
      setView('dashboard');
    } catch (e: any) {
      alert(`Approval failed: ${e.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!pendingJob?.id || !notificationEmail) return;
    setEmailStatus('saving');
    try {
      const { updateBuildRequestMeta } = await import('../services/db');
      await updateBuildRequestMeta(pendingJob.id, { notificationEmail });
      setEmailStatus('saved');
    } catch (e) {
      console.error("Failed to save notification email:", e);
      setEmailStatus('idle');
    }
  };

  // Use global jobs state to sync deployment status
  const [deployedFleet, setDeployedFleet] = useState<JobPost[]>([]);
  const [pendingFleet, setPendingFleet] = useState<JobPost[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Filter all jobs for this client
    const myJobs = activeJobs.filter(j => j.clientId === user.uid || (!j.clientId && j.clientName === (user.name || user.email)));
    
    const myDeployed = myJobs.filter(j => j.status === 'Deployed');
    const myPending = myJobs.filter(j => j.status !== 'Deployed' && j.status !== 'Completed');
    
    setDeployedFleet(myDeployed);
    setPendingFleet(myPending);
    
    // Auto-select first available if none selected
    if (!selectedAgentId) {
      if (myDeployed.length > 0) setSelectedAgentId(myDeployed[0].id);
      else if (myPending.length > 0) setSelectedAgentId(myPending[0].id);
    }
    
    const activeEntry = myJobs.find(j => j.id === selectedAgentId) || myJobs[0];
    
    if (activeEntry) {
      if (activeEntry.status === 'Deployed') {
        setIsDeployed(true);
        setIsProvisioning(false);
        setIsAwaitingDeployment(false);
        setBlueprint(activeEntry.blueprint || null);
      } else if (activeEntry.status === 'Awaiting Deployment') {
        setIsDeployed(false);
        setIsProvisioning(false);
        setIsAwaitingDeployment(true);
        setPendingJob(activeEntry);
        setBlueprint(activeEntry.blueprint || null);
      } else {
        setIsDeployed(false);
        setIsProvisioning(true);
        setIsAwaitingDeployment(false);
        setBlueprint(activeEntry.blueprint || null);
      }
    } else {
      setIsDeployed(false);
      setIsProvisioning(false);
      setIsAwaitingDeployment(false);
    }
  }, [activeJobs, user, selectedAgentId]);


  if (isLoading || isRefining) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
        <LoadingAnimation 
          message={isRefining ? "AI: Refitting Architecture..." : "Connecting to Infrastructure..."} 
          submessage={isRefining ? "Gemini is iteratively adjusting your blueprint based on your feedback." : "Retrieving your custom AI configuration."} 
        />
      </div>
    );
  }

  return (
    <div className="w-full pb-20 animate-in fade-in duration-700">
      {showOnboarding && user && (
        <OnboardingForm uid={user.uid} onComplete={() => setShowOnboarding(false)} />
      )}
      {(isDeployed || deployedFleet.length > 0 || pendingFleet.length > 0) && (
        <div className="flex flex-col items-center mb-12 space-y-6">
          <div className="flex items-center gap-4 bg-white border border-slate-200 px-6 py-3 rounded-3xl shadow-sm animate-in slide-in-from-top-4 duration-500">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Agent Fleet:</span>
            <select 
              value={selectedAgentId || ''} 
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-transparent text-slate-900 font-bold text-xs focus:ring-0 border-none appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJibGFjayI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0xOSA5bC03IDctNy03Ii8+PC9zdmc+')] bg-[length:16px] bg-[right_center] bg-no-repeat"
            >
              <optgroup label="Deployed & Active">
                {deployedFleet.map(agent => (
                  <option key={agent.id} value={agent.id} className="bg-white text-slate-900">
                    🟢 {agent.blueprint?.jobTitle || agent.agentName || agent.id}
                  </option>
                ))}
              </optgroup>
              {pendingFleet.length > 0 && (
                <optgroup label="Pending Infrastructure">
                  {pendingFleet.map(agent => (
                    <option key={agent.id} value={agent.id} className="bg-white text-slate-900">
                      ⏳ {agent.blueprint?.jobTitle || agent.agentName || 'New Request'} ({agent.status})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <button 
              onClick={onOpenTool}
              className="ml-4 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 group"
              title="Request New Agent"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
          
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex gap-1">
             <button onClick={() => setView('dashboard')} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <LayoutDashboard className="w-3.5 h-3.5" /> Monitoring
             </button>
             <button onClick={() => setView('blueprint')} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'blueprint' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <FileText className="w-3.5 h-3.5" /> Strategy
             </button>
          </div>
        </div>
      )}


      {view === 'blueprint' && blueprint ? (
        <div className="animate-in fade-in zoom-in-95 duration-700 space-y-12 max-w-6xl mx-auto">
          <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">{blueprint.jobTitle}</h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-4xl">{blueprint.summary}</p>
              
              <div className="mt-10 flex flex-wrap gap-6 text-center sm:text-left">
                <div className="flex-1 min-w-[240px] bg-emerald-50 border border-emerald-100 px-8 py-6 rounded-3xl shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 block mb-2">Projected Annual Savings</span>
                  <span className="text-4xl font-black text-slate-900">${blueprint.estimatedAnnualSavings.toLocaleString()}</span>
                </div>
                <div className="flex-1 min-w-[240px] bg-indigo-50 border border-indigo-100 px-8 py-6 rounded-3xl shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 block mb-2">Efficiency Break-even</span>
                  <span className="text-4xl font-black text-slate-900">{blueprint.breakEvenMonth} Months</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black mb-6 flex items-center gap-3 tracking-tight uppercase">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                    Strategy Adjustment
                  </h3>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Request specific adjustments to this automation strategy..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-base text-slate-300 focus:outline-none focus:border-indigo-500/50 resize-none h-40 mb-8 placeholder:text-slate-600 font-medium"
                  />
                </div>
                <button 
                  onClick={handleRefine}
                  disabled={!feedback.trim() || isRefining}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/40"
                >
                  <Send className="w-4 h-4" />
                  Apply Strategy Change
                </button>
              </div>

              <div className="flex flex-col justify-center gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Executive Summary
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    This blueprint has been custom-baked by our AI engine to optimize your business operations. Review the tasks below and initialize clinical-grade automation handles once satisfied.
                  </p>
                </div>

                {showApprovalSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3rem] text-center animate-in zoom-in-95 duration-500">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <p className="font-black text-emerald-600 uppercase tracking-widest text-xs mb-2">Build Request Active</p>
                    <p className="text-slate-400 text-sm font-medium">Our orchestration team will contact you shortly.</p>
                  </div>
                ) : (
                  <button 
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="w-full py-8 bg-slate-900 text-white font-black rounded-[2.5rem] shadow-2xl shadow-slate-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-5 active:scale-95 text-xs uppercase tracking-[0.3em]"
                  >
                    {isApproving ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Approve & Initialize Factory
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blueprint.tasks.map((task, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3 group hover:border-amber-500/20 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{task.taskName}</h4>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">{task.automationScore}% AI</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{task.reasoning}</p>
                {task.recommendedTools && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {task.recommendedTools.map((tool, i) => (
                      <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-1 rounded-md">{tool}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <BusinessDashboard 
          isDeployed={isDeployed} 
          isProvisioning={isProvisioning}
          isAwaitingDeployment={isAwaitingDeployment}
          onOpenTool={onOpenTool} 
          activeJobs={activeJobs}
          agentId={selectedAgentId || activeJobs.find(j => j.clientId === user?.uid || j.clientName === (user?.name || user?.email))?.id}
          blueprint={deployedFleet.find(a => a.id === selectedAgentId)?.blueprint || activeJobs.find(j => j.clientId === user?.uid || j.clientName === (user?.name || user?.email))?.blueprint}
        />

      )}
    </div>
  );
};

export default ClientDashboard;
