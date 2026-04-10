import React, { useState } from 'react';
import { HelpCircle, X, ChevronRight, Zap, Info, Bot, Sparkles } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: TutorialStep[] = [
  {
    title: "Define the Role",
    description: "Start by pasting a job description or briefly describing the role you want to automate. Our AI analyzes the core responsibilities to build the agent logic.",
    icon: <Zap className="w-5 h-5 text-amber-500" />
  },
  {
    title: "Advanced Tuning",
    description: "Use the Advanced options to set a specific budget or focus the agent's specialization (e.g., Sales, Operations, or Engineering).",
    icon: <Sparkles className="w-5 h-5 text-indigo-500" />
  },
  {
    title: "Agent Identity",
    description: "Give your agent a name and link it to your company. This ensures all generated documents and communications are perfectly branded.",
    icon: <Bot className="w-5 h-5 text-emerald-500" />
  },
  {
    title: "Generate Blueprint",
    description: "Once ready, click 'Generate AI Blueprint'. We'll architect a full technological stack and operational flow for your new sovereign AI agent.",
    icon: <Sparkles className="w-5 h-5 text-orange-500" />
  }
];

const SetupTutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      setCurrentStep(0);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-black hover:scale-110 transition-all group"
        >
          <HelpCircle className="w-6 h-6 md:w-7 md:h-7" />
          <span className="hidden md:block absolute right-full mr-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            How it works
          </span>
        </button>
      ) : (
        <div className="w-[calc(100vw-3rem)] sm:w-80 bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                {steps[currentStep].icon}
              </div>
              <button 
                onClick={() => { setIsOpen(false); setCurrentStep(0); }}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">Phase 0{currentStep + 1}</p>
                 <div className="flex-1 h-px bg-slate-100" />
              </div>
              <h4 className="text-lg font-black text-slate-900 leading-tight">
                {steps[currentStep].title}
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4">
              <div className="flex gap-1.5">
                {steps.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-100'}`} 
                  />
                ))}
              </div>
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-500/5 p-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-[9px] text-indigo-800/60 font-medium leading-tight">
                Follow the highlighted steps to provision your sovereign agent.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupTutorial;
