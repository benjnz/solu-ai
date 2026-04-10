import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { getAuth, signInAnonymously } from "firebase/auth";

// Components
import ClientDashboard from './components/ClientDashboard';
import AssociateDashboard from './components/AssociateDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import BusinessLogin from './components/BusinessLogin';
import InstantTool from './components/InstantTool';
import HowItWorks from './components/HowItWorks';
import LoadingAnimation from './components/LoadingAnimation';
import EmployeePortal from './components/EmployeePortal';
import { getBuildRequests, updateBuildRequestStatus, createBuildRequest, getAgentBySubdomain } from './services/db';
import { JobPost } from './types';
import { Terminal, Users, LayoutDashboard, LogOut, User as UserIcon, Zap, ArrowRight, BrainCircuit, Menu, X, ShieldCheck, Activity, Cpu, Layers } from 'lucide-react';
import { db } from './firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// Diagnostic Boot Sequence
console.log("[solu-boot] Initializing Sovereignty Engine...");
console.log("[solu-boot] Domain context:", {
  host: window.location.hostname,
  path: window.location.pathname,
  protocol: window.location.protocol
});


// --- 1. Protected Route Wrapper ---
const ProtectedRoute = () => {
  const { user, isInitialized } = useUser();
  const location = useLocation();

  if (!isInitialized) return null; // Wait for auth to initialize

  if (!user) {
    // If not logged in, redirect to login
    // Determine which login page based on where they were trying to go
    if (location.pathname.includes('/admin') || location.pathname.includes('/associate')) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/business-login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const AppContent: React.FC = () => {
  const [activeJobs, setActiveJobs] = useState<JobPost[]>([]);
  const [isToolOpen, setIsToolOpen] = useState(false);
  const [isToolAdvanced, setIsToolAdvanced] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deployedAgents, setDeployedAgents] = useState<any[]>([]);
  const { user, logout, isInitialized } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const hasInitializedPortal = React.useRef<string | null>(null);
  const [portalAgent, setPortalAgent] = useState<any>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(true);

  // Subdomain Detection Logic
  const getSubdomain = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const agentParam = urlParams.get('agent');
    if (agentParam) {
      console.log(`[App:Debug] Manual override detected: ${agentParam}`);
      return agentParam.toLowerCase();
    }

    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    console.info(`[App:Debug] Resolving domain context for: "${hostname}"`);

    // Domain Safelist: Skip resolution for explicitly defined root domains
    const rootDomains = ['localhost', 'solu.uk', 'www.solu.uk', 'soluaiblueprint-62038680-8d4ee.web.app', 'soluaiblueprint-62038680-8d4ee.firebaseapp.com'];
    if (rootDomains.includes(hostname)) {
      return null;
    }

    // 1. Localhost Testing (agent1.localhost)
    if (hostname.endsWith('localhost') && parts.length >= 2) {
      return parts[0].toLowerCase();
    }

    // 2. Production Anchor Detection (e.g. agent1.solu.uk or www.agent1.solu.uk)
    // We look for 'solu' as the anchor domain name
    const domainAnchorIndex = parts.indexOf('solu');
    if (domainAnchorIndex > 0) {
        // The subdomain is the part immediately before 'solu'
        // If it's agent1.solu.uk -> index 0
        // If it's www.agent1.solu.uk -> index 1
        const subdomain = parts[domainAnchorIndex - 1];
        if (subdomain !== 'www') {
            console.log(`[App:Debug] Anchor-based subdomain located: ${subdomain}`);
            return subdomain.toLowerCase();
        }
    }

    // 3. Fallback: Standard Production Subdomains (agent1.anything.com)
    if (!hostname.includes('.web.app') && !hostname.includes('.firebaseapp.com') && parts.length >= 3) {
      return parts[0].toLowerCase();
    }

    return null;
  };

  const [agentNotFound, setAgentNotFound] = useState(false);

  useEffect(() => {
    const subdomain = getSubdomain();
    if (subdomain) {
      console.log(`[App:Registry] Starting lookup for: ${subdomain}`);
      getAgentBySubdomain(subdomain).then(agent => {
        if (agent) {
          console.info(`[App:Registry] Agent located for [${subdomain}]: ${agent.id}`, agent.portalConfig);
          setPortalAgent(agent);
          if (agent.portalConfig && hasInitializedPortal.current !== agent.id) {
            hasInitializedPortal.current = agent.id;
          }
        } else {
          console.warn(`[App:Registry] No agent record found in Sovereignty Registry for: ${subdomain}`);
          setAgentNotFound(true);
        }
        setIsPortalLoading(false);
      }).catch(err => {
        console.error(`[App:Registry] Lookup FAILED for ${subdomain}:`, err);
        setIsPortalLoading(false);
      });
    } else {
      setIsPortalLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'deployed_agents'), orderBy('deployedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setDeployedAgents(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubscribe = getBuildRequests((jobs) => {
      setActiveJobs(jobs);
    });
    return () => unsubscribe();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <LoadingAnimation message="Securing Session" submessage="Re-establishing your autonomous connection..." />
      </div>
    );
  }

  if (isPortalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <LoadingAnimation message="Resolving Autonomous Domain" submessage="Querying the Sovereignty Agent Registry..." />
      </div>
    );
  }

  if (agentNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] p-6 text-center">
        <div className="max-w-md space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldCheck className="w-12 h-12 text-rose-500 opacity-50" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Domain Unresolved</h1>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
              The requested agent namespace is not registered in the Solu AI Collective.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = 'https://solu.uk'}
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
          >
            Return to Headquarters
          </button>
        </div>
      </div>
    );
  }

  // If we are in a subdomain and found an agent, show the portal
  if (portalAgent) {
    return <EmployeePortal agent={portalAgent} />;
  }

  const handlePostJob = async (newJob: JobPost) => {
    try {
      await createBuildRequest(newJob);
    } catch (err) {
      console.error("Failed to create build request:", err);
    }
  };

  const handleUpdateJob = async (jobId: string, status: JobPost['status']) => {
    try {
      await updateBuildRequestStatus(jobId, status);
    } catch (err) {
      console.error("Failed to update job status:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const isClient = location.pathname.includes('client');
  const isBusinessLogin = location.pathname === '/business-login';
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-10 h-10 flex items-center justify-center transition-transform duration-300 p-1">
                  <img src="/logo.png" alt="solu AI Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-black text-xl tracking-tighter text-slate-900">solu<span className="text-amber-500">AI</span></span>
              </Link>

              <div className="flex md:flex items-center gap-4">
                <Link
                  to="/how-it-works"
                  className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  How it works
                </Link>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex md:flex items-center gap-4">
                <button
                  onClick={() => setIsToolOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20 hover:bg-amber-500/30 transition-all shadow-sm"
                >
                  <Zap className="w-3 h-3" /> Instant Blueprint
                </button>

                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
                    </div>
                    <div className="flex items-center gap-2">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || 'User'} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
                          <UserIcon className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-700">{user.name || 'Anonymous User'}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login" className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Associates</Link>
                    <Link to="/business-login" className={`px-4 py-2 rounded-xl text-sm font-bold transition-all bg-slate-900 text-white hover:bg-black shadow-lg`}>For Business</Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden h-screen flex flex-col pt-16">
            <div className="flex-1 bg-white p-6 space-y-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
              <div className="space-y-4">
                <Link
                  to="/how-it-works"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-left px-4 py-3 text-lg font-bold text-slate-900 flex items-center gap-3 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  <BrainCircuit className="w-5 h-5 text-amber-500" />
                  How it works
                </Link>
                <button
                  onClick={() => { setIsToolOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-lg font-bold text-slate-900 flex items-center gap-3 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  <Zap className="w-5 h-5 text-amber-500" />
                  Instant Blueprint
                </button>
              </div>

              <div className="pt-8 border-t border-slate-100">
                {user ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 px-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || 'User'} className="w-12 h-12 rounded-full border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-slate-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{user.name || 'Expert'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold transition-all"
                    >
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-center py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-lg"
                    >
                      Associate Login
                    </Link>
                    <Link
                      to="/business-login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-center py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20"
                    >
                      Client Portal
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>


      {/* Global Mission Awareness Banner */}
      {(location.pathname.includes('client') || location.pathname.includes('associate') || location.pathname.includes('admin')) && (
        <div className="bg-slate-900 border-b border-white/5 py-3 px-4 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-rose-500/10 opacity-50" />
          <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-8 md:gap-12 relative text-white overflow-x-auto scrollbar-none py-1">
            
            {user?.role === 'client' && user.companyDetails && (
              <>
                <div className="flex items-center gap-3 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">Enterprise</span>
                    <span className="text-[10px] md:text-xs font-black tracking-tighter truncate max-w-[100px] md:max-w-[120px] leading-tight">{user.companyDetails.name}</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-white/10 shrink-0" />
                <div className="flex items-center gap-3 shrink-0">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">Industry</span>
                    <span className="text-[10px] md:text-xs font-black tracking-tighter leading-tight whitespace-nowrap">{user.companyDetails.industry}</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-white/10 shrink-0" />
              </>
            )}

            <div className="flex items-center gap-3 shrink-0">
              <Activity className="w-4 h-4 text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">
                  {user?.role === 'client' ? 'Deployed' : 'Active Agents'}
                </span>
                <span className="text-[10px] md:text-sm font-black tracking-tighter leading-tight whitespace-nowrap">
                  {user?.role === 'client' 
                    ? deployedAgents.filter(a => a.clientId === user.uid || (!a.clientId && (a.clientName === user.name || a.clientName === user.email))).length
                    : deployedAgents.length} 
                  <span className="text-[8px] text-indigo-400 uppercase tracking-widest ml-1">Live</span>
                </span>
              </div>
            </div>
            
            <div className="h-6 w-px bg-white/10 shrink-0" />
            
            <div className="flex items-center gap-3 shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">
                  {user?.role === 'client' ? 'Awaiting' : 'Consumption'}
                </span>
                <span className="text-[10px] md:text-sm font-black tracking-tighter leading-tight whitespace-nowrap">
                  {user?.role === 'client'
                    ? activeJobs.filter(j => (j.clientId === user.uid || (!j.clientId && (j.clientName === user.name || j.clientName === user.email))) && (j.status === 'Open' || j.status === 'open')).length
                    : `$${deployedAgents.reduce((acc, a) => acc + (a.total_cost_usd || 0), 0).toFixed(4)}`}
                  <span className="text-[8px] text-indigo-400 uppercase tracking-widest ml-1">
                    {user?.role === 'client' ? 'Requests' : 'Live'}
                  </span>
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 shrink-0" />

            <div className="flex items-center gap-3 shrink-0">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">
                  {user?.role === 'client' ? 'Fleet Cost' : 'Latency'}
                </span>
                <span className="text-[10px] md:text-sm font-black tracking-tighter leading-tight whitespace-nowrap">
                  {user?.role === 'client'
                    ? `$${deployedAgents.filter(a => a.clientId === user.uid || (!a.clientId && (a.clientName === user.name || a.clientName === user.email))).reduce((acc, a) => acc + (a.total_cost_usd || 0), 0).toFixed(4)}`
                    : '124ms'} 
                  <span className="text-[8px] text-indigo-400 uppercase tracking-widest ml-1">Real-time</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


        <Routes>
          <Route path="/" element={<Home user={user} onOpenTool={() => setIsToolOpen(true)} />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/business-login" element={<BusinessLogin />} />
          <Route
            path="/client"
            element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <ClientDashboard onPostJob={handlePostJob} onOpenTool={() => { setIsToolAdvanced(true); setIsToolOpen(true); }} activeJobs={activeJobs} />}
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/associate"
              element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AssociateDashboard availableJobs={activeJobs} />}
            />
            <Route
              path="/admin"
              element={<AdminDashboard jobs={activeJobs} onUpdateJob={handleUpdateJob} deployedAgents={deployedAgents} />}
            />
            <Route
              path="/admin/request/:id"
              element={<AdminDashboard jobs={activeJobs} onUpdateJob={handleUpdateJob} deployedAgents={deployedAgents} />}
            />
          </Route>
        </Routes>
      </main>

      {/* Instant Tool Modal */}
      {isToolOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsToolOpen(false)}
        >
          <div
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setIsToolOpen(false); setIsToolAdvanced(false); }}
              className="absolute top-8 right-8 p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all z-10"
            >
              <LogOut className="w-6 h-6 rotate-180" />
            </button>
            <div className="p-8 md:p-12">
              <InstantTool
                variant={isToolAdvanced ? 'advanced' : 'full'}
                onSuccess={(blueprint) => {
                  setIsToolOpen(false);
                  setIsToolAdvanced(false);

                  // Auto-submit to admin queue
                  const newJob: JobPost = {
                    id: Math.random().toString(36).substr(2, 9),
                    clientId: user?.uid,
                    clientName: user?.name || user?.email || "New Client",
                    blueprint: blueprint,
                    status: 'Open',
                    postedDate: new Date().toLocaleDateString(),
                    budgetRange: blueprint.recommendedBudget || "auto"
                  };
                  if (user?.companyDetails) {
                    newJob.companyDetails = user.companyDetails;
                  }
                  
                  handlePostJob(newJob);

                  navigate('/client', { state: { blueprint } });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} solu AI. All rights reserved. Powered by Gemini.
        </div>
      </footer>
    </div>
  );
};

const Home: React.FC<{ user: any; onOpenTool: () => void }> = ({ user, onOpenTool }) => {
  return (
    <div className="w-full flex flex-col items-center space-y-16 py-12">
      <div className="flex flex-col items-center text-center max-w-4xl space-y-8 animate-in fade-in slide-in-from-top-10 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-black uppercase tracking-widest border border-amber-500/20 mx-auto">
          <Zap className="w-4 h-4" /> The AI Readiness Engine
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[1.3] mb-8 pb-8">
          Turn Roles into <br />
          <span className="text-amber-500 px-8 py-3 inline-block">Automations</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Input a job description to instantly generate a step-by-step technological architecture for automating any professional role.
        </p>
        <div className="pt-8">
          <button
            onClick={onOpenTool}
            className="px-10 py-5 bg-amber-500 text-slate-900 font-extrabold text-xl rounded-2xl shadow-2xl shadow-amber-500/20 hover:bg-amber-400 hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            <Zap className="w-6 h-6" /> Instant Blueprint Tool
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl">
        <Link to={user?.role === 'admin' ? "/admin" : (user?.role === 'client' ? "/client" : "/business-login")} className="group bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4 flex items-center gap-2">I need Automation <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></h3>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">Scale your business by deconstructing roles and deploying intelligent, automated AI agents.</p>
        </Link>

        <Link to={user?.role === 'admin' ? "/admin" : (user?.role === 'associate' ? "/associate" : "/login")} className="group bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-800 hover:shadow-amber-500/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]"></div>
          <div className="w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
            <Terminal className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-black text-white mb-4 flex items-center gap-2">I am an Associate <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></h3>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">Join the elite network of automation experts building the next generation of business infrastructure.</p>
        </Link>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // We remove the direct signInAnonymously from here because it's better handled 
  // in specific flows (like InstantTool) or as a fallback in UserContext if needed.
  // Keeping it here might overwrite a real session during reload before onAuthChanged fires.
  
  return (
    <UserProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </UserProvider>
  );
};

export default App;