import React from 'react';
import { useFetch } from '../hooks/useFetch';
import type { Speaker } from '../types.ts';
import { Quote, Award, Mic, Target, TrendingUp } from 'lucide-react';

const SpeakerCard = ({ speaker, index }: { speaker: Speaker, index: number }) => {
  return (
    <div className={`corporate-card p-6 stagger-${(index % 5) + 1} flex flex-col items-center text-center interactive-hover group`}>
      <div className={`w-16 h-16 rounded ${speaker.color} flex items-center justify-center text-xl font-serif font-bold text-primary shadow-inner mb-4 relative`}>
        {speaker.initials}
        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded border border-slate-100 shadow-sm">
           <Mic size={12} className="text-slate-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-primary tracking-tight">{speaker.name}</h3>
      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1 mb-6">{speaker.role}</p>
      
      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        <div className="bg-slate-50 border border-slate-100 rounded p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Items Owned</p>
          <div className="flex items-center justify-center gap-1.5">
            <Target size={12} className="text-accent-teal" />
            <p className="text-base font-bold text-primary">{speaker.tasks_owned}</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impact</p>
          <div className="flex items-center justify-center gap-1.5">
            <TrendingUp size={12} className="text-teal-600" />
            <p className="text-base font-bold text-primary">{speaker.decisions_triggered}</p>
          </div>
        </div>
      </div>

      <div className="w-full text-left bg-slate-50 border border-slate-100 rounded p-4 relative group-hover:bg-white group-hover:border-slate-200 transition-colors">
        <Quote size={20} className="text-slate-200 absolute -top-2 -left-1" />
        <p className="text-slate-600 text-[12px] italic font-medium leading-relaxed italic line-clamp-3">
          "{speaker.notable_quote}"
        </p>
      </div>
      
      <button className="w-full mt-6 py-2 px-4 border border-slate-200 rounded text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 uppercase tracking-tight">
        View Contributions
        <Award size={14} className="text-accent-gold" />
      </button>
    </div>
  );
};

const SpeakerMap: React.FC = () => {
  const { data: speakers } = useFetch<Speaker[]>('/speakers');
  
  const totalWords = speakers?.reduce((acc, s) => acc + (s.words_spoken || 0), 0) || 0;

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary mb-2">Team Contributions</h2>
          <p className="text-slate-500 text-[15px] font-medium">Algorithmic mapping of tasks and verbal commitments.</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-slate-200 p-2 rounded shadow-xs">
           <div className="text-right px-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Active Voices</p>
              <p className="text-[15px] font-bold text-primary">{speakers?.length || 0}</p>
           </div>
           <div className="h-8 w-px bg-slate-100"></div>
           <div className="px-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Words Indexed</p>
              <p className="text-[15px] font-bold text-primary">{(totalWords / 1000).toFixed(1)}k</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {speakers?.map((speaker, i) => (
          <SpeakerCard key={speaker.id} speaker={speaker} index={i} />
        ))}
      </div>
    </div>
  );
};

export default SpeakerMap;
