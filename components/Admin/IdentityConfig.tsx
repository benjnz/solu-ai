import React from 'react';
import { User, Shield, Palette, Image as ImageIcon, Smile } from 'lucide-react';

interface IdentityConfigProps {
  agentName: string;
  setAgentName: (val: string) => void;
  agentRole: string;
  setAgentRole: (val: string) => void;
  agentTone: 'Professional' | 'Friendly' | 'Technical' | 'Creative';
  setAgentTone: (val: any) => void;
  avatarUrl: string;
  setAvatarUrl: (val: string) => void;
  themeColor: string;
  setThemeColor: (val: string) => void;
}

const IdentityConfig: React.FC<IdentityConfigProps> = ({ 
  agentName, setAgentName, 
  agentRole, setAgentRole,
  agentTone, setAgentTone, 
  avatarUrl, setAvatarUrl, 
  themeColor, setThemeColor 
}) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 text-white">
      {/* Name & Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> Public Name
            </label>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">How the agent identifies itself to users.</p>
          </div>
          <input 
            value={agentName} 
            onChange={(e) => setAgentName(e.target.value)} 
            placeholder="e.g. Atlas Prime"
            className="w-full bg-[#0b0f19] border border-white/10 rounded-2xl p-6 text-sm font-black focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-xl" 
          />
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Professional Role
            </label>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">The specific job or function this agent performs.</p>
          </div>
          <input 
            value={agentRole} 
            onChange={(e) => setAgentRole(e.target.value)} 
            placeholder="e.g. Lead Cybersecurity Analyst"
            className="w-full bg-[#0b0f19] border border-white/10 rounded-2xl p-6 text-sm font-black focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-xl" 
          />
        </div>
      </div>

      {/* Personality & Tone */}
      <div className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Smile className="w-4 h-4 text-amber-400" /> Personality Tone
          </label>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">Determines the "vibe" and vocabulary the agent uses.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {['Professional', 'Friendly', 'Technical', 'Creative'].map((tone) => (
            <button
              key={tone}
              onClick={() => setAgentTone(tone)}
              className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${agentTone === tone ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-lg shadow-amber-500/10' : 'bg-[#0b0f19] border-white/5 text-slate-400 hover:border-white/10'}`}
            >
              <span className="text-xs font-black uppercase tracking-widest">{tone}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Identity */}
      <div className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Palette className="w-4 h-4 text-rose-400" /> Visual Identity
          </label>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">Customize the agent's appearance in the platform interface.</p>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-10 p-10 bg-[#0b0f19] border border-white/5 rounded-[3rem] shadow-inner">
          <div className={`w-24 h-24 rounded-[2rem] bg-${themeColor}-500 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-${themeColor}-500/20 relative overflow-hidden group`}>
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : agentName[0] || 'A'}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div className="flex-1 space-y-8 w-full">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Brand Accent Color</p>
              <div className="flex gap-4">
                {['indigo', 'emerald', 'amber', 'rose', 'sky'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setThemeColor(c)} 
                    className={`w-8 h-8 rounded-full border-2 ${themeColor === c ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:scale-105'} bg-${c}-500 transition-all`} 
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 italic">
                <ImageIcon className="w-3 h-3" /> Profile Image URL
              </p>
              <input 
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)} 
                placeholder="Paste an image link (optional)" 
                className="w-full bg-transparent border-b border-white/10 text-xs py-2 focus:border-rose-500 outline-none transition-all placeholder-slate-600 font-mono" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityConfig;
