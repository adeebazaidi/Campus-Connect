import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  DocumentIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  UsersIcon,
  WarningIcon,
  ClipboardIcon,
  UserIcon,
} from '../components/Icons';

const STAT_CARDS = [
  { key: 'total',      label: 'Total Complaints', Icon: DocumentIcon,    iconColor: 'text-slate-500',    colorCls: 'text-slate-800',    border: 'border-l-slate-400' },
  { key: 'pending',    label: 'Pending',          Icon: ClockIcon,       iconColor: 'text-amber-500',    colorCls: 'text-amber-600',   border: 'border-l-amber-400' },
  { key: 'inProgress', label: 'In Progress',      Icon: CogIcon,         iconColor: 'text-blue-500',     colorCls: 'text-blue-600',    border: 'border-l-blue-400' },
  { key: 'resolved',   label: 'Resolved',         Icon: CheckCircleIcon, iconColor: 'text-emerald-500',  colorCls: 'text-emerald-600', border: 'border-l-emerald-400' },
  { key: 'users',      label: 'Total Users',      Icon: UsersIcon,       iconColor: 'text-purple-500',   colorCls: 'text-purple-600',  border: 'border-l-purple-400' },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats,            setStats]    = useState(null);
  const [recentComplaints, setRecent]   = useState([]);
  const [workload,         setWorkload] = useState([]);
  const [loading,          setLoading]  = useState(true);
  const [error,            setError]    = useState('');
  const [activeTab,        setTab]      = useState('overview'); // 'overview' | 'workload'

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, complaintsRes, workloadRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/complaints/all'),
          api.get('/api/admin/workload'),
        ]);
        setStats(statsRes.data);
        setRecent(Array.isArray(complaintsRes.data) ? complaintsRes.data.slice(0, 8) : []);
        setWorkload(Array.isArray(workloadRes.data) ? workloadRes.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Loader />;

  if (error || !stats) {
    return (
      <div className="empty-state">
        <WarningIcon className="w-8 h-8 text-amber-500 mb-2" />
        <p className="empty-state-title">{error || 'No statistics available.'}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary btn-sm mt-4">Retry</button>
      </div>
    );
  }

  const values = {
    total:      stats.complaints.total,
    pending:    stats.complaints.pending,
    inProgress: stats.complaints.inProgress,
    resolved:   stats.complaints.resolved,
    users:      stats.users,
  };

  const resolutionRate = values.total > 0 ? Math.round((values.resolved  / values.total) * 100) : 0;
  const pendingRate    = values.total > 0 ? Math.round((values.pending   / values.total) * 100) : 0;

  return (
    <div className="space-y-5 w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-subtitle">Welcome back, {user?.name || 'Administrator'} • Platform-wide complaint analytics and workload.</p>
        </div>
        <Link to="/admin/complaints" className="btn-primary btn-sm shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Manage All Complaints
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map(({ key, label, Icon, iconColor, colorCls, border }) => (
          <div key={key} className={`stat-card border-l-4 ${border}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="stat-label">{label}</span>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className={`stat-value ${colorCls}`}>{values[key]}</p>
          </div>
        ))}
      </div>

      {/* Quick-filter shortcuts */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending',     status: 'pending',     color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',       Icon: ClockIcon,       iconColor: 'text-amber-600', count: values.pending },
          { label: 'In Progress', status: 'in-progress', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',           Icon: CogIcon,         iconColor: 'text-blue-600',  count: values.inProgress },
          { label: 'Resolved',    status: 'resolved',    color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100', Icon: CheckCircleIcon, iconColor: 'text-emerald-600', count: values.resolved },
        ].map(({ label, status, color, Icon, iconColor, count }) => (
          <Link
            key={status}
            to={`/admin/complaints?status=${status}`}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${color}`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <span className="text-sm font-semibold">{label}</span>
            </div>
            <span className="text-lg font-bold">{count}</span>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          { id: 'overview',  label: 'Overview' },
          { id: 'workload',  label: `Staff Workload (${workload.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === id
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Breakdown */}
          <div className="card space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Complaint Breakdown</h2>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-600 font-medium">Resolution Rate</span>
                <span className="text-xs font-bold text-emerald-600">{resolutionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${resolutionRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-600 font-medium">Pending Rate</span>
                <span className="text-xs font-bold text-amber-600">{pendingRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pendingRate}%` }} />
              </div>
            </div>

            {values.total > 0 && (
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1.5">Status Distribution</p>
                <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
                  <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${(values.resolved / values.total) * 100}%` }} />
                  <div className="bg-blue-500 transition-all duration-700"    style={{ width: `${(values.inProgress / values.total) * 100}%` }} />
                  <div className="bg-amber-400 transition-all duration-700"   style={{ width: `${(values.pending / values.total) * 100}%` }} />
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {[
                    { label: 'Resolved',    color: 'bg-emerald-500', value: values.resolved },
                    { label: 'In Progress', color: 'bg-blue-500',    value: values.inProgress },
                    { label: 'Pending',     color: 'bg-amber-400',   value: values.pending },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
                      {item.label} ({item.value})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Complaints */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">Recent Complaints</h2>
              <Link to="/admin/complaints" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                View all →
              </Link>
            </div>

            {recentComplaints.length === 0 ? (
              <div className="empty-state border border-dashed border-slate-200 rounded-xl">
                <ClipboardIcon className="w-8 h-8 text-slate-300 mb-2" />
                <p className="empty-state-title">No complaints yet</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Complaint</th>
                      <th>Status</th>
                      <th>Submitted By</th>
                      <th>Assigned To</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map((c) => (
                      <tr key={c._id}>
                        <td className="max-w-xs">
                          <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{c.category}</p>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td className="text-xs text-slate-600">{c.createdBy?.name ?? '—'}</td>
                        <td className="text-xs text-slate-500">
                          {c.assignedTo?.name ?? <span className="text-slate-300">Unassigned</span>}
                        </td>
                        <td className="text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <Link to={`/complaints/${c._id}`} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary table */}
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Count</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Total Complaints', value: values.total,      share: '100%' },
                  { label: 'Resolved',         value: values.resolved,   share: `${resolutionRate}%` },
                  { label: 'In Progress',      value: values.inProgress, share: values.total > 0 ? `${Math.round((values.inProgress / values.total) * 100)}%` : '0%' },
                  { label: 'Pending',          value: values.pending,    share: `${pendingRate}%` },
                  { label: 'Registered Users', value: values.users,      share: '—' },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="font-medium text-slate-700">{row.label}</td>
                    <td className="font-bold text-slate-800">{row.value}</td>
                    <td className="text-slate-500">{row.share}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab: Staff Workload */}
      {activeTab === 'workload' && (
        <div>
          <p className="text-xs text-slate-500 mb-3">
            Complaint assignments per staff member. Counts reflect currently stored records.
          </p>
          {workload.length === 0 ? (
            <div className="empty-state border border-dashed border-slate-200 rounded-xl">
              <UserIcon className="w-8 h-8 text-slate-300 mb-2" />
              <p className="empty-state-title">No staff members found</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Department</th>
                    <th>Pending</th>
                    <th>In Progress</th>
                    <th>Resolved</th>
                    <th>Total Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {workload.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        <p className="text-[11px] text-slate-400">{s.email}</p>
                      </td>
                      <td className="text-xs text-slate-600">{s.department ?? '—'}</td>
                      <td>
                        <span className={`text-xs font-bold ${s.pending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {s.pending}
                        </span>
                      </td>
                      <td>
                        <span className={`text-xs font-bold ${s.inProgress > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                          {s.inProgress}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-emerald-600">{s.resolved}</span>
                      </td>
                      <td>
                        <span className={`text-xs font-bold ${s.total === 0 ? 'text-slate-300' : 'text-slate-800'}`}>
                          {s.total}
                        </span>
                        {s.total === 0 && (
                          <span className="ml-2 text-[10px] text-slate-400 italic">No open assignments</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
