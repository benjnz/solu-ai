import React from 'react';
import { User, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { JobPost } from '../../types';

interface RequestManagerProps {
  requests: JobPost[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const RequestManager: React.FC<RequestManagerProps> = ({ requests, onApprove, onReject }) => {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
        <div className="p-6 bg-white/5 rounded-full">
          <CheckCircle className="w-12 h-12 opacity-20" />
        </div>
        <p className="font-black uppercase tracking-[0.2em] text-xs">No Pending Requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Incoming Blueprints ({requests.length})</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:bg-white/10 transition-all group relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-black uppercase text-sm tracking-tight">{req.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{req.company}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Mail className="w-3 h-3" /> {req.contactEmail || 'user@client.com'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Calendar className="w-3 h-3" /> {req.id.substring(0, 8)}
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Requirements Outline</p>
                  <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-2">"{req.description}"</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 justify-end">
                <button 
                  onClick={() => onApprove(req.id)}
                  className="flex-1 md:flex-none p-4 bg-emerald-500 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button 
                  onClick={() => onReject(req.id)}
                  className="flex-1 md:flex-none p-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestManager;
