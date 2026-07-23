import React from 'react';
import { useFetch } from '../hooks/useFetch';
import type { Task } from '../types.ts';
import { AlertCircle, ArrowRight, ExternalLink, RefreshCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';

const StaleTaskItem = ({ task, index }: { task: Task, index: number }) => {
  return (
    <div className={`corporate-card p-5 interactive-hover mb-4 stagger-${(index % 5) + 1} flex items-center gap-6 group`}>
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
      
      <div className="w-10 h-10 rounded bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
        <AlertCircle size={20} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-rose-50 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-widest">
            {task.days_overdue} Days Overdue
          </span>
          <p className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
             <RefreshCcw size={12} />
             Referenced in Meeting #{task.mentioned_in_meeting_id}
          </p>
        </div>
        <h3 className="text-lg font-bold text-primary group-hover:text-accent-teal transition-colors tracking-tight">
          {task.title}
        </h3>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
           Assignee: <span className="text-primary flex items-center gap-1.5">
             <div className={`w-5 h-5 rounded-full ${task.assignee_color} flex items-center justify-center text-[7px] font-bold border border-white shadow-sm text-primary`}>
               {task.assignee_initials}
             </div>
             {task.assignee_name}
           </span>
        </p>
      </div>

      <div className="flex items-center gap-4 text-nowrap">
        <button className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-600 rounded text-[12px] font-bold border border-slate-200 hover:bg-white hover:border-slate-300 transition-all uppercase tracking-tight">
          Escalate
          <ArrowRight size={14} />
        </button>
        <button className="p-2 text-slate-300 hover:text-accent-teal transition-colors">
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
};

const StaleTasks: React.FC = () => {
  const { data: tasks } = useFetch<Task[]>('/stale-tasks');

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10 py-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center text-white shadow-md">
             <ShieldAlert size={20} />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-primary tracking-tight">Stale Dependency Tracking</h2>
             <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Management Intervention Required</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-rose-50 text-rose-700 px-4 py-1.5 rounded border border-rose-100 font-bold text-base uppercase tracking-widest">
              {tasks?.length || 0} Critical
           </div>
        </div>
      </div>

      <div className="space-y-2">
        {tasks?.map((task, i) => (
          <StaleTaskItem key={task.id} task={task} index={i} />
        ))}
      </div>
      
      {tasks?.length === 0 && (
        <div className="h-96 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
             <CheckCircle2 size={40} />
           </div>
           <h3 className="font-serif text-2xl font-bold text-primary">Operations Healthy</h3>
           <p className="text-slate-500 max-w-xs mt-2">No overdue tasks or stale dependencies currently detected in the system.</p>
        </div>
      )}
    </div>
  );
};

export default StaleTasks;
