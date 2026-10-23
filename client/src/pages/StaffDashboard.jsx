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
  { key: 'total',      filterVal: 'all',         label: 'Total Assigned', Icon: DocumentIcon,    iconBg: 'bg-[#DDE3E8]' },
  { key: 'pending',    filterVal: 'pending',     label: 'Pending',        Icon: ClockIcon,       iconBg: 'bg-[#EAAA00]' },
  { key: 'inProgress', filterVal: 'in-progress', label: 'In Progress',    Icon: CogIcon,         iconBg: 'bg-sky-200' },
  { key: 'resolved',   filterVal: 'resolved',    label: 'Resolved',       Icon: CheckCircleIcon, iconBg: 'bg-emerald-300' },
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
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-[#3A0F34] text-white p-5 rounded-xl border-2 border-[#3A0F34] shadow-[4px_4px_0px_#EAAA00]">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight font-display">Hello, {user?.name?.split(' ')[0]}</h2>
          <p className="text-xs font-semibold text-white/80 mt-0.5">Your assigned complaints and departmental workload overview.</p>
        </div>
        <Link to="/admin/complaints" className="btn bg-[#EAAA00] text-[#3A0F34] shadow-[2.5px_2.5px_0px_white] hover:bg-[#f2b305] text-xs font-black py-2 px-3.5 shrink-0 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          All Complaints
        </Link>
      </div>

      {/* Stats row with interactive filter shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {STAT_CARDS.map(({ key, filterVal, label, Icon, iconBg }) => (
          <button
            key={key}
            onClick={() => setFilter(filterVal)}
            className={`stat-card text-left transition-all cursor-pointer ${
              filter === filterVal
                ? 'bg-[#EAAA00]/25 shadow-[5px_5px_0px_#3A0F34] -translate-y-0.5'
                : 'hover:bg-[#DDE3E8]/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="stat-label">{label}</span>
              <div className={`p-1.5 rounded-lg border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34] ${iconBg}`}>
                <Icon className="w-4 h-4 text-[#3A0F34]" />
              </div>
            </div>
            <p className="stat-value">{stats[key]}</p>
          </button>
        ))}
      </div>

      {/* Error banner with retry */}
      {error && (
        <div className="rounded-xl bg-rose-100 border-2 border-[#3A0F34] p-4 text-sm font-bold text-rose-950 flex items-center justify-between shadow-[3px_3px_0px_#3A0F34]">
          <span>{error}</span>
          <button onClick={fetchComplaints} className="btn-secondary btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Assigned complaints section */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#3A0F34] font-display">
            Assigned Complaints
            <span className="ml-2 text-xs font-bold text-[#3A0F34]/60">
              ({filtered.length} shown of {complaints.length} total)
            </span>
          </h2>
          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 bg-white border-2 border-[#3A0F34] rounded-lg p-1 shadow-[2px_2px_0px_#3A0F34]">
            {['all', 'pending', 'in-progress', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-black transition-all capitalize cursor-pointer ${
                  filter === f
                    ? 'bg-[#EAAA00] text-[#3A0F34] border border-[#3A0F34] shadow-[1px_1px_0px_#3A0F34]'
                    : 'text-[#3A0F34] hover:bg-[#DDE3E8]'
                }`}
              >
                {f === 'in-progress' ? 'In Progress' : f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && !error ? (
          <div className="empty-state">
            <ClipboardIcon className="w-8 h-8 text-[#3A0F34]/40 mb-2" />
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
              <button onClick={() => setFilter('all')} className="btn-secondary btn-sm mt-3.5">
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
                  <th className="text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td className="max-w-xs">
                      <p className="font-black text-[#3A0F34] truncate">{c.title}</p>
                      <p className="text-[11px] font-bold text-[#3A0F34]/60 mt-0.5 capitalize">{c.category}</p>
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-xs font-bold text-[#3A0F34]">
                      {c.createdBy?.name ?? '—'}
                      {c.createdBy?.department && (
                        <span className="block text-[10px] text-[#3A0F34]/60">{c.createdBy.department}</span>
                      )}
                    </td>
                    <td className="text-xs font-bold text-[#3A0F34]/70">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                        disabled={updating[c._id]}
                        className="select-sm w-36 capitalize font-bold"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="text-right pr-4">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[2px_2px_0px_#3A0F34] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#3A0F34] transition-all whitespace-nowrap"
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
