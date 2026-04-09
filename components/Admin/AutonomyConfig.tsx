import React from 'react';

interface AutonomyConfigProps {
  autonomyLevel: 'HITL' | 'Semi-Autonomous' | 'Fully-Autonomous';
  setAutonomyLevel: (val: any) => void;
  allowRetries: boolean;
  setAllowRetries: (val: boolean) => void;
  maxBudget: number;
  setMaxBudget: (val: number) => void;
}

const AutonomyConfig: React.FC<AutonomyConfigProps> = ({ 
  autonomyLevel, setAutonomyLevel, 
  allowRetries, setAllowRetries, 
  maxBudget, setMaxBudget 
}) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-white">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Autonomy Tier</label>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 gap-1">
            {['HITL', 'Semi-Autonomous', 'Fully-Autonomous'].map(tier => (
              <button 
                key={tier} 
                onClick={() => setAutonomyLevel(tier as any)} 
                className={`flex-1 py-3 rounded-xl text-[10px] font-extrabold uppercase transition-all ${autonomyLevel === tier ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Budget ($)</label>
          <input 
            type="number" 
            value={maxBudget} 
            onChange={(e) => setMaxBudget(Number(e.target.value))} 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-amber-500/50 outline-none transition-all" 
          />
        </div>
      </div>
      <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem]">
        <div className="space-y-1">
          <p className="font-extrabold uppercase tracking-tight text-white">Enable Intelligent Retries</p>
          <p className="text-[10px] text-slate-500 italic">Agent will self-correct on tool failure based on reasoning loops.</p>
        </div>
        <button 
          onClick={() => setAllowRetries(!allowRetries)} 
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${allowRetries ? 'bg-indigo-500' : 'bg-white/10'}`}
        >
          <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${allowRetries ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  );
};

export default AutonomyConfig;
