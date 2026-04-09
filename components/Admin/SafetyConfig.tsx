import React from 'react';
import { Shield, Lock, AlertOctagon } from 'lucide-react';

interface SafetyConfigProps {
  maskPII: boolean;
  setMaskPII: (val: boolean) => void;
  enforceTone: boolean;
  setEnforceTone: (val: boolean) => void;
  restrictedTopics: string[];
  setRestrictedTopics: (val: string[]) => void;
  newTopic: string;
  setNewTopic: (val: string) => void;
}

const SafetyConfig: React.FC<SafetyConfigProps> = ({ 
  maskPII, setMaskPII, 
  enforceTone, setEnforceTone, 
  restrictedTopics, setRestrictedTopics,
  newTopic, setNewTopic 
}) => {
  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setRestrictedTopics([...restrictedTopics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setRestrictedTopics(restrictedTopics.filter(t => t !== topic));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="font-extrabold uppercase tracking-tight text-sm">PII Redaction</p>
              <p className="text-[10px] text-slate-500">Automatically mask sensitive data in logs.</p>
            </div>
          </div>
          <button 
            onClick={() => setMaskPII(!maskPII)} 
            className={`w-12 h-7 rounded-full p-1 transition-colors ${maskPII ? 'bg-indigo-500' : 'bg-white/10'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${maskPII ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-extrabold uppercase tracking-tight text-sm">Tone Enforcement</p>
              <p className="text-[10px] text-slate-500">Force alignment with brand voice guidelines.</p>
            </div>
          </div>
          <button 
            onClick={() => setEnforceTone(!enforceTone)} 
            className={`w-12 h-7 rounded-full p-1 transition-colors ${enforceTone ? 'bg-emerald-500' : 'bg-white/10'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enforceTone ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" /> Restricted Knowledge Domains
        </label>
        <div className="flex gap-4">
          <input 
            value={newTopic} 
            onChange={(e) => setNewTopic(e.target.value)} 
            placeholder="Add restricted topic (e.g. medical advice)..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-rose-500/50 outline-none transition-all" 
          />
          <button onClick={handleAddTopic} className="px-6 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs transition-all uppercase">Add</button>
        </div>
        <div className="flex flex-wrap gap-3">
          {restrictedTopics.map(topic => (
            <span key={topic} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
              {topic}
              <button onClick={() => handleRemoveTopic(topic)} className="hover:text-rose-200">×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyConfig;
