import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  BrainCircuit, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Cpu, 
  ChevronRight, 
  CheckCircle2, 
  Terminal,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-amber-500/5 to-transparent -z-10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-black uppercase tracking-[0.2em] border border-amber-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <TrendingUp className="w-4 h-4" /> The ROI of Automation
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Stop hiring for repetitive roles.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Build them instead.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Solu AI deconstructs complex professional roles into granular, automated architectures, allowing your best employees to focus on high-value growth.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
             <Link to="/business-login" className="px-10 py-5 bg-slate-900 text-white font-extrabold text-lg rounded-2xl shadow-2xl hover:bg-black hover:-translate-y-1 transition-all flex items-center gap-3">
               Start Automating <ArrowRight className="w-5 h-5" />
             </Link>
          </div>
        </div>
      </section>

      {/* The Sovereign AI Lifecycle */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">The Sovereign AI Lifecycle</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">How we transform a vague job description into a self-improving, sustainable, and strategically aligned automation engine.</p>
          </div>

          <div className="space-y-32">
            {/* Step 1: Deconstruction */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 font-black text-2xl">01</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Granular Deconstruction</h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  We deconstruct professional roles into granular cognitive tasks. Our engine identifies every decision point, ensuring that the resulting AI fleet operates with surgical precision within your existing business rules.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-3 text-slate-700 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" /> Cognitive Task Hierarchy Extraction
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" /> Proprietary Capability Matrix
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full max-w-xl">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 overflow-hidden relative group">
                  <div className="bg-slate-900 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col items-center gap-2">
                      <Zap className="w-6 h-6 text-amber-500" />
                      <span className="text-[10px] font-black uppercase text-amber-600 text-center leading-none">Inference<br/>Tuning</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-slate-400" />
                      <span className="text-[10px] font-black uppercase text-slate-500 text-center leading-none">Security<br/>Mapping</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Architecture */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="flex-1 space-y-6 text-right lg:text-left">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl ml-auto lg:ml-0">02</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Sovereign Architecture Mapping</h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                   Gemini 2.5 Flash acts as the lead architect, mapping each requirement to our Sovereign Tool Matrix. It ensures every agent is equipped with the correct reasoning models, long-term memory, and ESG-compliant compute paths.
                </p>
                <div className="flex flex-wrap gap-2 pt-4 justify-end lg:justify-start">
                   {['Reasoning Layer', 'Memory Stores', 'API Connectors', 'ESG Controls'].map(tech => (
                     <span key={tech} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm">{tech}</span>
                   ))}
                </div>
              </div>
              <div className="flex-1 w-full max-w-xl">
                <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden h-[300px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-rose-500/10 opacity-30" />
                  <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="w-20 h-20 bg-indigo-500 rounded-[2rem] flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                      <BrainCircuit className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Execution */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-2xl">03</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Autonomous Execution (Crews)</h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  We deploy sophisticated clusters of AI agents that work together in a real-time worker pool. These agents handle CRM manipulation, email synthesis, and document processing with industrial-grade resilience and zero-latency failover.
                </p>
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Zero-Trust Orchestration
                  </p>
                  <p className="text-emerald-700 text-sm font-medium mt-2">Every action is performed within our sandboxed sovereign environment for absolute data security.</p>
                </div>
              </div>
              <div className="flex-1 w-full max-w-xl">
                 <div className="bg-[#0f172a] rounded-[2.5rem] shadow-2xl p-6 font-mono text-xs overflow-hidden h-[300px]">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-500 uppercase tracking-widest text-[9px]">Sovereign Runtime</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-emerald-400">{'>'} initializing_sovereign_crew: ENTERPRISE_V1</p>
                      <p className="text-slate-500">{'>'} verified: [soc2_compliance, gdp_guard, esg_monitor]</p>
                      <div className="flex items-center gap-2 py-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                        <p className="text-emerald-400">Agent Alpha: Executing Carbon-Aware Compute Path</p>
                      </div>
                      <p className="text-indigo-400 mt-6 animate-pulse">{'>'} COMPLETE: Strategic Alignment Verified.</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Step 4: Neural Reflection & Evolution */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="flex-1 space-y-6 text-right lg:text-left">
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 font-black text-2xl ml-auto lg:ml-0">04</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Neural Reflection & Collective Wisdom</h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  The ecosystem autonomously learns from every execution session. Post-mission reflection allows the system to synthesize "Collective Wisdom," optimizing future work and archiving high-fidelity audit reports for your corporate governance.
                </p>
                <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-rose-500 shrink-0" />
                  <div className="text-left">
                    <p className="text-rose-800 font-bold">Self-Improving Agents</p>
                    <p className="text-rose-700 text-sm font-medium">Your automation architecture becomes smarter and more strategically aligned with every task it performs.</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full max-w-xl">
                 <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-50" />
                    <div className="relative z-10 flex flex-col gap-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5 text-rose-500" /></div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Synthesizing Collective Wisdom...</p>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                          <div className="h-2 w-full bg-slate-200 rounded animate-pulse" />
                          <div className="h-2 w-3/4 bg-slate-200 rounded animate-pulse delay-75" />
                          <div className="h-2 w-1/2 bg-rose-500/30 rounded animate-pulse delay-150" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ROI & Reallocation Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-slate-900 rounded-[4rem] p-8 md:p-20 text-white relative flex flex-col items-center text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
              
              <Sparkles className="w-12 h-12 text-amber-500 mb-8" />
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">A New Way to Scale.</h2>
              <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed mb-16">
                Solu AI is currently in its Pilot Phase. We are working with initial partners to refine the modular agent infrastructure 
                to ensure maximum efficiency and seamless integration into existing business workflows.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-4xl">
                 <div className="text-center md:border-r border-slate-800 pb-8 md:pb-0">
                    <p className="text-5xl font-black text-amber-500 mb-2">Alpha</p>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Pilot Status</p>
                 </div>
                 <div className="text-center md:border-r border-slate-800 pb-8 md:pb-0">
                    <p className="text-5xl font-black text-amber-500 mb-2">Modular</p>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Build Infrastructure</p>
                 </div>
                 <div className="text-center">
                    <p className="text-5xl font-black text-amber-500 mb-2">Real-time</p>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Execution Monitoring</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 text-center">
         <h3 className="text-3xl font-black text-slate-900 mb-8">Ready to automate your architecture?</h3>
         <div className="flex items-center justify-center gap-4">
            <Link to="/business-login" className="px-10 py-5 bg-amber-500 text-slate-900 font-black rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20">
               Access Client Portal
            </Link>
            <Link to="/" className="px-10 py-5 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all">
               Run Trial Tool
            </Link>
         </div>
      </section>
    </div>
  );
};

export default HowItWorks;
