import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { api } from '../utils/api';
import type { Employee } from '../types';
import {
  Users,
  UserPlus,
  Building2,
  Hash,
  Github,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Lock
} from 'lucide-react';

const EmployeeManager: React.FC = () => {
  const { data: employees, mutate } = useFetch<Employee[]>('/employees');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    emp_id: '',
    department: '',
    github_username: '',
    gh_token: '',
    gh_owner: '',
    gh_repo: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, formData);
        setStatus({ type: 'success', message: 'Employee updated successfully!' });
      } else {
        await api.post('/employees', formData);
        setStatus({ type: 'success', message: 'Employee added successfully!' });
      }
      setFormData({
        name: '',
        emp_id: '',
        department: '',
        github_username: '',
        gh_token: '',
        gh_owner: '',
        gh_repo: ''
      });
      setIsAdding(false);
      setEditingId(null);
      mutate();
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || `Failed to ${editingId ? 'update' : 'add'} employee` });
    }
  };

  const handleEdit = (emp: Employee) => {
    setFormData({
      name: emp.name,
      emp_id: emp.emp_id,
      department: emp.department || '',
      github_username: emp.github_username || '',
      gh_token: emp.gh_token || '',
      gh_owner: emp.gh_owner || '',
      gh_repo: emp.gh_repo || ''
    });
    setEditingId(emp.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      mutate();
    } catch (err: any) {
      alert('Failed to delete employee');
    }
  };

  const filteredEmployees = employees?.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page p-8 max-w-7xl mx-auto space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="stagger-1">
          <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">Employee Directory</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Intelligence-ready workforce management.</p>
        </div>
        <div className="flex items-center gap-3 stagger-2">
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              if (isAdding) {
                setEditingId(null);
                setFormData({
                  name: '',
                  emp_id: '',
                  department: '',
                  github_username: '',
                  gh_token: '',
                  gh_owner: '',
                  gh_repo: ''
                });
              }
            }}
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${isAdding
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                : 'bg-accent-teal text-white hover:bg-accent-teal/90'
              }`}
          >
            {isAdding ? 'Cancel' : <><UserPlus size={16} /> Add Member</>}
          </button>
          {!isAdding && (
            <button className="px-5 py-2 rounded-lg font-bold text-sm bg-primary text-white hover:bg-primary/95 shadow-sm">
              Export Data
            </button>
          )}
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 animate-slideIn ${status.type === 'success' ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span className="text-sm font-bold tracking-tight">{status.message}</span>
        </div>
      )}

      {isAdding && (
        <div className="corporate-card p-8 stagger-2 border-accent-teal/10">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-primary">{editingId ? 'Edit Member Details' : 'Member Onboarding'}</h3>
            <p className="text-xs text-slate-400 font-medium tracking-tight">
              {editingId ? 'Update credentials and linkage for this member.' : 'Enter credentials to link this member to meeting intelligence.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Identity</label>
                <div className="relative group">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-accent-teal group-focus-within:h-1/2 transition-all"></div>
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent-teal transition-colors" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border-slate-100 rounded-lg py-3.5 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-accent-teal/5 transition-all text-sm font-bold text-primary placeholder:text-slate-300"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Employee Hash (UID)</label>
                <div className="relative group">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-accent-teal group-focus-within:h-1/2 transition-all"></div>
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent-teal transition-colors" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="e.g. BE102"
                    className="w-full bg-slate-50 border-slate-100 rounded-lg py-3.5 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-accent-teal/5 transition-all text-sm font-bold text-primary placeholder:text-slate-300"
                    value={formData.emp_id}
                    onChange={e => setFormData({ ...formData, emp_id: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Logic Department</label>
                <div className="relative group">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-accent-teal group-focus-within:h-1/2 transition-all"></div>
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent-teal transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. Backend Engineering"
                    className="w-full bg-slate-50 border-slate-100 rounded-lg py-3.5 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-accent-teal/5 transition-all text-sm font-bold text-primary placeholder:text-slate-300"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">GitHub Access (Logic Bind)</label>
                <div className="relative group">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-accent-teal group-focus-within:h-1/2 transition-all"></div>
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent-teal transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. rahul-sharma"
                    className="w-full bg-slate-50 border-slate-100 rounded-lg py-3.5 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-accent-teal/5 transition-all text-sm font-bold text-primary placeholder:text-slate-300"
                    value={formData.github_username}
                    onChange={e => setFormData({ ...formData, github_username: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Lock size={16} className="text-accent-teal" />
                  Integration Credentials (Optional)
                </h4>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-1">These will override the global .env settings for this employee.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* GitHub Section */}
                <div className="space-y-4 md:col-span-3 pb-4 border-b border-slate-50">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Github size={12} /> GitHub Configuration
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Personal Access Token</label>
                      <input
                        type="password"
                        placeholder="ghp_..."
                        className="w-full bg-slate-50 border-slate-100 rounded-lg py-2.5 px-4 text-xs font-bold text-primary focus:bg-white transition-all"
                        value={formData.gh_token}
                        onChange={e => setFormData({ ...formData, gh_token: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Repo Owner</label>
                      <input
                        type="text"
                        placeholder="e.g. verbex-ai"
                        className="w-full bg-slate-50 border-slate-100 rounded-lg py-2.5 px-4 text-xs font-bold text-primary focus:bg-white transition-all"
                        value={formData.gh_owner}
                        onChange={e => setFormData({ ...formData, gh_owner: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Repo Name</label>
                      <input
                        type="text"
                        placeholder="e.g. main-repo"
                        className="w-full bg-slate-50 border-slate-100 rounded-lg py-2.5 px-4 text-xs font-bold text-primary focus:bg-white transition-all"
                        value={formData.gh_repo}
                        onChange={e => setFormData({ ...formData, gh_repo: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-primary/95 transition-all shadow-premium text-sm tracking-tight"
              >
                {editingId ? 'Update Member Profile' : 'Sync Member to Repository'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="corporate-card stagger-3">
        {filteredEmployees?.some(e => !e.github_username) && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              ⚡ Auto-Discovered Members: {filteredEmployees.filter(e => !e.github_username).length} employee profile(s) auto-added from recent meetings require GitHub credentials.
            </div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-200/60 px-2 py-0.5 rounded">Action Required</span>
          </div>
        )}

        <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent-teal transition-colors" size={15} />
            <input
              type="text"
              placeholder="Filter by identity, ID, or zone..."
              className="w-full bg-slate-50/50 border border-slate-100 rounded-lg py-2.5 pl-10 pr-4 text-[13px] font-medium focus:bg-white focus:ring-4 focus:ring-accent-teal/5 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Pool</span>
            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded border border-slate-200">
              {filteredEmployees?.length || 0}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Member Identity</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Unique ID</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Logical Department</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Repository Handle</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees?.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded bg-white shadow-sm flex items-center justify-center font-bold text-primary text-[11px] border border-slate-100 group-hover:border-accent-teal/20 transition-all">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-primary text-sm tracking-tight">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-[11px] font-bold text-accent-teal bg-teal-50 px-2 py-1 rounded border border-teal-100/50">{emp.emp_id}</span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-[13px] font-medium tracking-tight">
                    {emp.department || 'Float'}
                  </td>
                  <td className="px-8 py-5">
                    {emp.github_username ? (
                      <a
                        href={`https://github.com/${emp.github_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-accent-teal font-bold text-[12px] transition-colors"
                      >
                        <Github size={13} className="text-slate-400" />
                        {emp.github_username}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text.amber-800 bg-amber-100/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        NEEDS CREDENTIALS
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(emp)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-bold transition-all ${!emp.github_username
                            ? 'bg-accent-teal text-white hover:bg-accent-teal/90 shadow-sm'
                            : 'p-2 text-slate-300 hover:text-accent-teal hover:bg-teal-50 opacity-0 group-hover:opacity-100'
                          }`}
                        title="Edit member credentials"
                      >
                        <Edit2 size={14} />
                        {!emp.github_username && <span>Add Credentials</span>}
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                        <Users size={24} strokeWidth={1} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Identity Cache Empty</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManager;
