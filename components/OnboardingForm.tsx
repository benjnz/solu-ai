import React, { useState } from 'react';
import { Building2, Target, Users, Zap, ArrowRight, Shield } from 'lucide-react';
import { updateUserProfile } from '../services/db';

interface OnboardingFormProps {
  uid: string;
  onComplete: () => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ uid, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    industry: '',
    size: '11-50',
    goals: '',
    bottleneck: '',
    compliance: 'Standard',
    esg_focus: 'Carbon Neutral'
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }


    setIsSubmitting(true);
    try {
      await updateUserProfile(uid, {
        onboarded: true,
        companyDetails: {
          name: formData.name,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          industry: formData.industry,
          size: formData.size,
          goals: formData.goals,
          compliance: formData.compliance,
          esg_focus: formData.esg_focus
        }
      });
      onComplete();
    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const industries = [
    "SaaS & Technology",
    "Professional Services",
    "Marketing & Creative",
    "E-commerce & Retail",
    "Financial Services",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Other"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 relative border border-white max-h-[92vh] flex flex-col">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 z-10">
          <div 
            className="h-full bg-amber-500 transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}

          />
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" /> Pilot Onboarding
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
              {step === 1 ? "Tell us about your business." : (step === 2 ? "What are your goals?" : "Sovereign Governance")}
            </h2>

            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              {step === 1 
                ? "We need a few details to tailor the AI architecture to your specific industry and scale."
                : "Help us understand what success looks like for your automation pilot."}
            </p>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Person</label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                      required
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      placeholder="Your Full Name"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Email</label>
                  <div className="relative group">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                      required
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      placeholder="contact@company.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Industry</label>
                  <select 
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                  >
                    <option value="">Select Industry</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Size</label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <select 
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all appearance-none"
                    >
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="200+">200+ Employees</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Automation Goals</label>
                <div className="relative group">
                  <Target className="absolute left-4 top-4 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                  <textarea 
                    required
                    value={formData.goals}
                    onChange={(e) => setFormData({...formData, goals: e.target.value})}
                    placeholder="e.g. Automating our customer support triage and initial document processing..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all placeholder:text-slate-300 h-20 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Biggest Operational Bottleneck</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-4 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                  <textarea 
                    required
                    value={formData.bottleneck}
                    onChange={(e) => setFormData({...formData, bottleneck: e.target.value})}
                    placeholder="e.g. Manual entry of Salesforce leads from email inquiries..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all placeholder:text-slate-300 h-20 resize-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 gap-6">
                  <div className="p-6 bg-slate-900 rounded-3xl space-y-4">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Regulatory Alignment</p>
                     <div className="flex gap-2">
                        {['Standard', 'SOC2', 'GDPR', 'Sovereign+'].map(lvl => (
                           <button
                              key={lvl}
                              type="button"
                              onClick={() => setFormData({...formData, compliance: lvl})}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.compliance === lvl ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                           >
                              {lvl}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sustainability Target (ESG)</p>
                     <div className="flex gap-2">
                        {['Carbon Neutral', 'Net Zero', 'Positive Impact'].map(target => (
                           <button
                              key={target}
                              type="button"
                              onClick={() => setFormData({...formData, esg_focus: target})}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.esg_focus === target ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                           >
                              {target}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                  <Shield className="w-5 h-5 shrink-0" />
                  <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tighter">Selection will apply global governance guardrails to all autonomous operations.</p>
               </div>
            </div>
          )}


          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl shadow-slate-900/20 hover:bg-black hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {step === 1 ? "Organization" : (step === 2 ? "Objectives" : "Deploy Fleet")}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>

              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest">
              Secured Pilot Access &bull; Confidential Data Handling
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;
