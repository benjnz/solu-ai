import React, { useState } from 'react';
import { generateBlueprintFromJobDescription } from '../services/geminiService';
import { Blueprint, FinancialParams, JobPost } from '../types';
import BlueprintChart from './BlueprintChart';
import LoadingAnimation from './LoadingAnimation';
import { CheckCircle, BrainCircuit, ArrowRight, Download } from 'lucide-react';

interface ClientDashboardProps {
  onPostJob: (job: JobPost) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onPostJob }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  
  // Interactive Financial Model State
  const [financials, setFinancials] = useState<FinancialParams>({
    employeeSalary: 65000,
    implementationCost: 15000,
    monthlyMaintenance: 500,
    timeHorizonMonths: 24
  });

  const handleAnalysis = async () => {
    if (!jobDescription) return;
    setIsLoading(true);
    try {
      const result = await generateBlueprintFromJobDescription(jobDescription);
      setBlueprint(result);
      setStep(2);
    } catch (e) {
      alert("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    if (!blueprint) return;
    const newJob: JobPost = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: "Current Enterprise Client", // In a real app, from auth
      blueprint: blueprint,
      status: 'Open',
      postedDate: new Date().toLocaleDateString()
    };
    onPostJob(newJob);
    setStep(3);
  };

  const renderStep1 = () => {
    if (isLoading) {
      return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
           <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center">
              <LoadingAnimation 
                message="Deconstructing Role" 
                submessage="Our AI engine is identifying automation opportunities and calculating projected ROI." 
              />
           </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Automation Analysis</h2>
          <p className="text-slate-500">Paste a job description to generate an AI Readiness Blueprint.</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
          <textarea
            className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none resize-none transition-all"
            placeholder="Paste job description here (e.g., Data Entry Clerk, Customer Support Agent)..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalysis}
              disabled={!jobDescription}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all
                ${!jobDescription ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl'}`}
            >
              <BrainCircuit className="w-5 h-5" />
              Generate Blueprint
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Blueprint: {blueprint?.jobTitle}</h2>
          <p className="text-slate-500">{blueprint?.summary}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button 
            onClick={handleApprove}
            className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Approve Project <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Financials */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
              Financial Variables
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Annual Employee Salary</label>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">$30k</span>
                    <span className="font-bold text-slate-900">${financials.employeeSalary.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">$150k</span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="150000"
                  step="1000"
                  value={financials.employeeSalary}
                  onChange={(e) => setFinancials({...financials, employeeSalary: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Est. Implementation Cost</label>
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">$1k</span>
                    <span className="font-bold text-slate-900">${financials.implementationCost.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">$50k</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={financials.implementationCost}
                  onChange={(e) => setFinancials({...financials, implementationCost: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Monthly Maintenance</label>
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">$0</span>
                    <span className="font-bold text-slate-900">${financials.monthlyMaintenance.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">$2k</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={financials.monthlyMaintenance}
                  onChange={(e) => setFinancials({...financials, monthlyMaintenance: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white">
             <h4 className="text-sm uppercase tracking-wider text-slate-400 mb-1">Est. Annual Savings</h4>
             <div className="text-3xl font-bold text-amber-400">
               ${Math.max(0, financials.employeeSalary - (financials.monthlyMaintenance * 12 + (financials.implementationCost/3))).toLocaleString()}
             </div>
             <p className="text-xs text-slate-400 mt-2">*Amortized over 3 years</p>
          </div>
        </div>

        {/* Right Column: Chart and Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <BlueprintChart financials={financials} />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Task Decomposition</h3>
             </div>
             <div className="divide-y divide-slate-100">
               {blueprint?.tasks.map((task, idx) => (
                 <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="font-semibold text-slate-900">{task.taskName}</h4>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold
                        ${task.automationScore > 80 ? 'bg-green-100 text-green-700' : 
                          task.automationScore > 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {task.automationScore}% Auto
                     </span>
                   </div>
                   <p className="text-sm text-slate-600 mb-3">{task.reasoning}</p>
                   <div className="flex flex-wrap gap-2">
                      {task.recommendedTools.map((tool, tIdx) => (
                        <span key={tIdx} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-500">
                          {tool}
                        </span>
                      ))}
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-xl mx-auto text-center space-y-6 pt-12 animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900">Project Approved!</h2>
      <p className="text-slate-600 text-lg">
        Your project has been successfully listed on the solu AI marketplace. 
        Top-tier vetted associates will now be notified of this opportunity.
      </p>
      <div className="flex justify-center gap-4">
        <button onClick={() => { setStep(1); setJobDescription(''); setBlueprint(null); }} className="text-amber-600 font-semibold hover:underline">
          Post Another Job
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default ClientDashboard;