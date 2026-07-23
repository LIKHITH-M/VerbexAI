import React from 'react';
import { useFetch } from '../hooks/useFetch';
import { API_BASE_URL } from '../utils/api';
import type { Task, Meeting } from '../types.ts';
import { 
  Info,
  ExternalLink,
  RefreshCcw
} from 'lucide-react';

const TaskCard = ({ task, index, onSync }: { task: Task, index: number, onSync?: (id: string) => Promise<void> }) => {
  const [syncing, setSyncing] = React.useState(false);

  const handleSync = async () => {
    if (!onSync) return;
    setSyncing(true);
    try {
      await onSync(task.id);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={`corporate-card p-5 interactive-hover mb-4 stagger-${(index % 5) + 1} group`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
          }`}></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            {task.priority}-PRIORITY
          </span>
        </div>
        {task.github_issue_url && (
          <a 
            href={task.github_issue_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent-teal hover:text-teal-600 transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
      
      <h4 className="font-bold text-[14px] text-primary mb-2 leading-snug group-hover:text-accent-teal transition-colors tracking-tight">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-slate-500 text-[13px] line-clamp-2 mb-4 leading-relaxed font-medium">
          {task.description}
        </p>
      )}

      {task.source_quote && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-slate-600 mb-1.5">
            <Info size={14} className="text-accent-teal" />
            <span className="text-[11px] font-bold uppercase tracking-tight">Contextual Reference</span>
          </div>
          <p className="text-[11px] text-slate-500 italic leading-relaxed">
            "{task.source_quote}"
          </p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Assignee: {task.assignee_name || 'Unassigned'}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${task.confidence_score >= 0.75 ? 'bg-accent-teal' : task.confidence_score >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`}               style={{ width: `${task.confidence_score * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-400">{(task.confidence_score * 100).toFixed(0)}%</span>
        </div>
        
        {!task.github_issue_url ? (
          <button 
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight transition-all ${
              syncing ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black shadow-sm'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {syncing ? 'Syncing...' : 'Push to GitHub'}
          </button>
        ) : (
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Synced
          </span>
        )}
      </div>
    </div>
  );
};

const TaskBoard: React.FC = () => {
  const { data: tasks, loading, mutate } = useFetch<Task[]>('/meetings/tasks/all');
  const { data: recentMeetings } = useFetch<Meeting[]>('/meetings');
  const [syncingAll, setSyncingAll] = React.useState(false);

  const handleSync = async (taskId: string) => {
    try {
      const task = tasks?.find(t => t.id === taskId);
      if (!task) return;

      const response = await fetch(`${API_BASE_URL}/meetings/${task.meeting_id}/tasks/${taskId}/push`, {
        method: 'POST',
      });

      const result = await response.json();
      if (response.ok && result.github?.success) {
        mutate();
      } else if (response.ok && result.github === null) {
        alert('GitHub push failed: No GitHub token configured. Please set GITHUB_TOKEN in backend/.env or Employee Manager.');
      } else {
        const errorMsg = result?.github?.error || result?.detail || result?.message || 'Failed to push to GitHub';
        alert(`GitHub Sync Notice: ${errorMsg}`);
        mutate();
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      alert(`Sync failed: ${err.message || 'Network error'}`);
    }
  };

  const handleGlobalSync = async () => {
    if (!recentMeetings || recentMeetings.length === 0) return;
    setSyncingAll(true);
    try {
      // Sync the most recent meeting's tasks
      const meetingId = recentMeetings[0].id;
      await fetch(`${API_BASE_URL}/meetings/${meetingId}/sync`);
      mutate();
    } catch (err) {
      console.error('Global sync failed:', err);
    } finally {
      setSyncingAll(false);
    }
  };

  // Tasks with missing credentials (no employee_id or no employee.github_username) MUST STAY IN GATE 2!
  const autoPushed = tasks?.filter(t => 
    t.status === 'approved' && 
    !!t.employee_id && 
    !!t.employee?.github_username
  ) || [];

  const needsReview = tasks?.filter(t => 
    (t.status === 'pending_review' || !t.employee_id || !t.employee?.github_username) && 
    !t.github_issue_url &&
    (t.status as string) !== 'completed' && 
    (t.status as string) !== 'discarded'
  ) || [];

  const completed = tasks?.filter(t => t.status === 'completed') || [];

  const latestTLDR = recentMeetings && recentMeetings.length > 0 ? recentMeetings[0].tldr : null;

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="glass-panel p-6 mb-10 flex items-center justify-between relative overflow-hidden bg-slate-900 text-white border-none shadow-premium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-teal/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-accent-teal/20 text-accent-teal text-[10px] font-bold uppercase tracking-widest rounded border border-accent-teal/30">
              Latest Intel
            </span>
            <h2 className="text-xl font-bold tracking-tight uppercase tracking-[0.1em]">Strategy TL;DR</h2>
          </div>
          <p className="text-slate-400 text-[14px] font-medium max-w-2xl leading-relaxed">
            {latestTLDR || "Strategic task registry. Action items are categorized by algorithmic confidence."}
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col items-end gap-3 ml-6">
           <button 
             onClick={handleGlobalSync}
             disabled={syncingAll}
             className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
               syncingAll ? 'bg-slate-700 text-slate-400' : 'bg-accent-teal text-white hover:bg-teal-600 shadow-lg shadow-teal-900/20'
             }`}
           >
             <RefreshCcw size={14} className={syncingAll ? 'animate-spin' : ''} />
             {syncingAll ? 'Syncing with GitHub...' : 'Sync All Statuses'}
           </button>
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             {completed.length} Tasks Completed Total
           </div>
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-teal shadow-[0_0_8px_rgba(17,94,89,0.3)]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
              <h3 className="text-base font-bold text-primary tracking-tight">Confidence Gate 1</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Pushed</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-4 h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
            {loading ? <p className="p-4 text-xs font-bold text-slate-400 animate-pulse uppercase">Scanning Registry...</p> : autoPushed.map((task, i) => <TaskCard key={task.id} task={task} index={i} onSync={handleSync} />)}
            {!loading && autoPushed.length === 0 && <p className="p-4 text-xs italic text-slate-400 text-center uppercase">No high confidence tasks</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <h3 className="text-base font-bold text-primary tracking-tight">Confidence Gate 2</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Needs Review</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-4 h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
            {loading ? <p className="p-4 text-xs font-bold text-slate-400 animate-pulse uppercase">Scanning Registry...</p> : needsReview.map((task, i) => <TaskCard key={task.id} task={task} index={i} onSync={handleSync} />)}
            {!loading && needsReview.length === 0 && <p className="p-4 text-xs italic text-slate-400 text-center uppercase">No pending reviews</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
              <h3 className="text-base font-bold text-primary tracking-tight">Final Registry</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</span>
          </div>
          <div className="bg-emerald-50/30 border border-emerald-100 rounded p-4 h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
             {loading ? <p className="p-4 text-xs font-bold text-slate-400 animate-pulse uppercase">Scanning Registry...</p> : completed.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
             {!loading && completed.length === 0 && <p className="p-4 text-xs italic text-slate-400 text-center uppercase">No completed tasks yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
