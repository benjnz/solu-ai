import React from 'react';
import { Cpu, Database, Sparkles, Target, Zap } from 'lucide-react';

interface InfrastructureConfigProps {
  model: string;
  setModel: (val: string) => void;
  memoryType: string;
  setMemoryType: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  topP: number;
  setTopP: (val: number) => void;
  maxTokens: number;
  setMaxTokens: (val: number) => void;
}

const InfrastructureConfig: React.FC<InfrastructureConfigProps> = ({
  model, setModel,
  memoryType, setMemoryType,
  temperature, setTemperature,
  topP, setTopP,
  maxTokens, setMaxTokens
}) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Primary Intelligence & Memory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> Thinking Core
            </label>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">Select the primary intelligence engine for your agent.</p>
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#0b0f19] border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-all shadow-xl"
          >
            <option className="bg-slate-900" value="gemini-2.5-flash">Gemini 2.5 Flash (Sovereign Speed)</option>
            <option className="bg-slate-900" value="claude-4.6-sonnet">Claude 4.6 Sonnet (Strategic Logic)</option>
            <option className="bg-slate-900" value="gpt-5.4-mini">GPT 5.4 Mini (Industrial Efficiency)</option>
          </select>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Memory System
            </label>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">Determines how the agent remembers past interactions.</p>
          </div>
          <select
            value={memoryType}
            onChange={(e) => setMemoryType(e.target.value)}
            className="w-full bg-[#0b0f19] border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all shadow-xl"
          >
            <option className="bg-slate-900" value="Vector Storage (Pinecone)">Long-term (Remembers facts across weeks)</option>
            <option className="bg-slate-900" value="Ephemeral (Context Window)">Short-term (Remembers current conversation only)</option>
            <option className="bg-slate-900" value="Semantic Graph (LangGraph)">Relational (Remembers complex task hierarchies)</option>
          </select>
        </div>
      </div>

      {/* Thinking Style (Model Tuning) */}
      <div className="space-y-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> Cognitive Calibration
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-[#0b0f19] border border-white/5 p-10 rounded-[3rem] shadow-inner">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  Creativity Level
                </label>
                <span className="text-[10px] font-black text-indigo-400">{(temperature * 100).toFixed(0)}%</span>
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Lower = Consistent/Factual. Higher = Creative/Unexpected.</p>
              <input
                type="range" min="0" max="1" step="0.05"
                value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-white/5 h-1 rounded-full appearance-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  Focus Precision
                </label>
                <span className="text-[10px] font-black text-emerald-400">{(topP * 100).toFixed(0)}%</span>
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Controls the "narrowness" of the agent's decision making.</p>
              <input
                type="range" min="0" max="1" step="0.01"
                value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-white/5 h-1 rounded-full appearance-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                Output Limit (Tokens)
              </label>
              <span className="text-[10px] font-black text-amber-400">{maxTokens}</span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">The maximum length of a single response from the agent.</p>
            <input
              type="range" min="256" max="16384" step="128"
              value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full accent-amber-500 bg-white/5 h-1 rounded-full appearance-none transition-all"
            />
            <div className="flex justify-between pt-2">
              <span className="text-[8px] font-black text-slate-600 uppercase">Short (Fast)</span>
              <span className="text-[8px] font-black text-slate-600 uppercase">Long (Comprehensive)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureConfig;
