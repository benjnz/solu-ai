import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateBlueprintFromJobDescription } from '../services/geminiService';
import { Blueprint } from '../types';
import { useUser } from '../contexts/UserContext';
import { BrainCircuit, FileText, Zap, Loader2, Building2, User, Bot, ArrowRight, ArrowLeft } from 'lucide-react';
import SetupTutorial from './SetupTutorial';

interface InstantToolProps {
  variant?: 'full' | 'compact' | 'advanced';
  onSuccess?: (blueprint: Blueprint, identity: { companyName: string; contactName: string; agentName: string }) => void;
}

const InstantTool: React.FC<InstantToolProps> = ({ variant = 'full', onSuccess }) => {
  const [jobInput, setJobInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'identity'>('input');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [agentName, setAgentName] = useState('');
  const navigate = useNavigate();
  const { loading: authLoading, isInitialized } = useUser();
  const [budget, setBudget] = useState<string | number>('auto');
  const [specialization, setSpecialization] = useState('auto');

  const handleProceedToIdentity = () => {
    if (!jobInput.trim()) return;
    setStep('identity');
  };

  const handleAnalysis = async () => {
    if (!jobInput || !isInitialized) return;
    setIsLoading(true);
    try {
      const result = await generateBlueprintFromJobDescription(jobInput, budget, specialization);
      const resolvedAgentName = agentName.trim() || `${companyName || 'Custom'} ${result.jobTitle} Agent`;
      if (onSuccess) {
        onSuccess(result, { companyName, contactName, agentName: resolvedAgentName });
      } else {
        navigate('/client', { state: { blueprint: result, companyName, contactName, agentName: resolvedAgentName } });
      }
    } catch (e: any) {
      alert(`Analysis failed: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 p-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/50 transition-all">
        <input
          type="text"
          placeholder="Paste job URL..."
          className="bg-transparent border-none text-white text-xs px-3 py-1 outline-none w-48 placeholder:text-white/40"
          value={jobInput}
          onChange={(e) => setJobInput(e.target.value)}
        />
        <button
          onClick={handleProceedToIdentity}
          disabled={!jobInput || authLoading || !isInitialized || isLoading}
          className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-900 p-1.5 rounded-lg transition-colors group"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white">

        {step === 'input' && (
          <>
            {variant === 'advanced' && (
              <div className="mb-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Budget</label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value === 'auto' ? 'auto' : Number(e.target.value))}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                    >
                      <option value="auto">Auto-Analyze</option>
                      <option value={1000}>$1k - $5k</option>
                      <option value={5000}>$5k - $15k</option>
                      <option value={15000}>$15k+</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agent Focus</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                    >
                      <option value="auto">Auto-Detect</option>
                      <option value="Sales & Growth">Sales & Growth</option>
                      <option value="Customer Success">Customer Success</option>
                      <option value="Backend Operations">Backend Operations</option>
                      <option value="Code & Engineering">Code & Engineering</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex bg-slate-100/80 p-1.5 mb-8 rounded-2xl w-fit mx-auto border border-slate-200/50">
              <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-slate-900 bg-white shadow-sm">
                <FileText className="w-4 h-4 text-amber-500" /> Job description or hiring needs
              </div>
            </div>

            <div className="transition-all duration-500 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <textarea
                className="relative w-full h-40 p-6 rounded-2xl bg-white/90 border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none resize-none transition-all text-slate-700 text-lg leading-relaxed placeholder:text-slate-400"
                placeholder="Paste the job description or hiring needs here..."
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
              />
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleProceedToIdentity}
                disabled={!jobInput.trim() || authLoading || !isInitialized}
                className={`group flex items-center justify-center gap-3 px-8 py-4 w-full md:w-auto rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all duration-300
                  ${!jobInput.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black shadow-xl hover:shadow-2xl hover:-translate-y-1'}`}
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                Continue — Add Company Details
              </button>
            </div>
          </>
        )}

        {step === 'identity' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Step 2 of 2</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Agent Setup</h3>
              <p className="text-xs text-slate-400">This helps us personalise the agent and track requests in the admin console.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <User className="w-3 h-3" /> Your Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Bot className="w-3 h-3" /> Agent Name
                  <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Acme Operations Agent"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="px-6 py-4 bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleAnalysis}
                disabled={!companyName.trim() || !contactName.trim() || isLoading}
                className={`flex-1 group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all duration-300
                  ${!companyName.trim() || !contactName.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black shadow-xl hover:shadow-2xl hover:-translate-y-0.5'}`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />}
                {isLoading ? 'Generating Blueprint...' : 'Generate AI Blueprint'}
              </button>
            </div>
          </div>
        )}
      </div>
      {(variant === 'full' || variant === 'advanced') && <SetupTutorial />}
    </div>
  );
};

export default InstantTool;
