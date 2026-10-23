import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  DocumentIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  ClipboardIcon,
} from '../components/Icons';

const STAT_CARDS = [
  { key: 'total',      filterVal: 'all',         label: 'Total Assigned', Icon: DocumentIcon,    iconColor: 'text-slate-500',    colorCls: 'text-slate-800',    border: 'border-l-slate-400' },
  { key: 'pending',    filterVal: 'pending',     label: 'Pending',        Icon: ClockIcon,       iconColor: 'text-amber-500',    colorCls: 'text-amber-600',   border: 'border-l-amber-400' },
  { key: 'inProgress', filterVal: 'in-progress', label: 'In Progress',    Icon: CogIcon,         iconColor: 'text-blue-500',     colorCls: 'text-blue-600',    border: 'border-l-blue-400' },
  { key: 'resolved',   filterVal: 'resolved',    label: 'Resolved',       Icon: CheckCircleIcon, iconColor: 'text-emerald-500',  colorCls: 'text-emerald-600', border: 'border-l-emerald-400' },
];

const StaffDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filter, setFilter]         = useState('all');
  const [updating, setUpdating]     = useState({});

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/complaints/all');
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assigned complaints.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const stats = useMemo(() => {
    const base = { total: complaints.length, pending: 0, inProgress: 0, resolved: 0 };
    complaints.forEach((c) => {
      if (c.status === 'pending')     base.pending     += 1;
      if (c.status === 'in-progress') base.inProgress  += 1;
      if (c.status === 'resolved')    base.resolved    += 1;
    });
    return base;
  }, [complaints]);

  const filtered = useMemo(() => {
    if (filter === 'all') return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  const updateStatus = async (id, status) => {
    setUpdating((p) => ({ ...p, [id]: true }));
    try {
      await api.patch(`/api/complaints/${id}/status`, { status });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
      addToast(`Status updated to ${status.replace('-', ' ')}.`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setUpdating((p) => ({ ...p, [id]: false }));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5 w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="page-title">Hello, {user?.name?.split(' ')[0]}</h2>
          <p className="page-subtitle">Your assigned complaints and workload overview.</p>
        </div>
        <Link to="/admin/complaints" className="btn-primary btn-sm shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          All Complaints
        </Link>
      </div>

      {/* Stats row with interactive filter shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ key, filterVal, label, Icon, iconColor, colorCls, border }) => (
          <button
            key={key}
            onClick={() => setFilter(filterVal)}
            className={`stat-card border-l-4 ${border} text-left transition-all ${
              filter === filterVal ? 'ring-2 ring-primary-500 shadow-md bg-slate-50/80' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="stat-label">{label}</span>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <p className={`stat-value ${colorCls}`}>{stats[key]}</p>
          </button>
        ))}
      </div>

      {/* Error banner with retry */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchComplaints} className="btn-secondary btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Assigned complaints section */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Assigned Complaints
            <span className="ml-2 text-xs font-medium text-slate-400">
              ({filtered.length} shown of {complaints.length} total)
            </span>
          </h2>
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {['all', 'pending', 'in-progress', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'in-progress' ? 'In Progress' : f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && !error ? (
          <div className="empty-state border border-dashed border-slate-200 rounded-xl">
            <ClipboardIcon className="w-8 h-8 text-slate-300 mb-2" />
            <p className="empty-state-title">
              {complaints.length === 0
                ? 'No complaints assigned yet'
                : `No ${filter.replace('-', ' ')} complaints`}
            </p>
            <p className="empty-state-body">
              {complaints.length === 0
                ? 'Complaints assigned to you by administrators will appear here.'
                : 'Try selecting a different filter above.'}
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="btn-secondary btn-sm mt-3">
                Show All Complaints
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Current Status</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                  <th>Update Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td className="max-w-xs">
                      <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{c.category}</p>
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-xs text-slate-600">
                      {c.createdBy?.name ?? '—'}
                      {c.createdBy?.department && (
                        <span className="block text-[10px] text-slate-400">{c.createdBy.department}</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                        disabled={updating[c._id]}
                        className="input-field text-xs py-1 w-32 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <Link
                        to={`/complaints/${c._id}`}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
                      >
                        Details & Comments →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
