import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import type { Decision } from '../types.ts';
import { Quote, CheckCircle2, MoreVertical, ShieldCheck, History } from 'lucide-react';

const DecisionCard = ({ decision, index }: { decision: Decision, index: number }) => {
  return (
    <div className={`corporate-card p-6 stagger-${(index % 5) + 1} flex gap-8 relative group mb-4`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-accent-teal`}></div>
      
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">
            REF-DEC-{decision.id.substring(0, 8)}
          </p>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <p className="text-slate-500 text-[11px] font-semibold">{new Date(decision.created_at).toLocaleString()}</p>
        </div>

        <h3 className="text-lg font-bold text-primary mb-3 leading-snug tracking-tight">
          {decision.title}
        </h3>

        {decision.source_quote && (
          <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 relative">
            <Quote size={24} className="text-slate-200 absolute -top-2 -left-2 rotate-12" />
            <p className="text-slate-600 text-[13px] italic font-medium leading-relaxed relative z-10 pr-4">
              {decision.source_quote}
            </p>
          </div>
        )}

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-teal-600" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Decided By</span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{decision.decided_by_name || 'Group Consent'}</span>
          </div>
        </div>
      </div>

      <div className="w-64 border-l border-slate-100 pl-6 flex flex-col justify-center">
        <div className="bg-teal-50/50 border border-teal-100 rounded p-4 space-y-2 opacity-60">
          <div className="flex items-center gap-2 text-teal-700">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Audit Verified</span>
          </div>
          <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase tracking-tighter">Consistent with established project architecture.</p>
        </div>
      </div>

      <button className="absolute top-4 right-4 p-2 text-slate-300 hover:text-primary transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>
  );
};

const DecisionLog: React.FC = () => {
  const { data: decisions, loading } = useFetch<Decision[]>('/meetings/decisions/all');
  const [viewMode, setViewMode] = useState<'chronological' | 'highlights'>('chronological');

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="bg-slate-100 p-1 rounded flex">
          <button 
            onClick={() => setViewMode('chronological')}
            className={`flex items-center gap-2 px-6 py-2 rounded text-[13px] font-bold transition-all ${
              viewMode === 'chronological' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <History size={16} />
            Master Log
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-slate-100 border-t-accent-teal rounded-full animate-spin"></div>
          </div>
        ) : (
          decisions?.map((decision, i) => (
            <DecisionCard key={decision.id} decision={decision} index={i} />
          ))
        )}
        {!loading && (!decisions || decisions.length === 0) && (
          <div className="corporate-card p-20 text-center bg-slate-50">
             <Quote size={40} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No strategic decisions recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionLog;
