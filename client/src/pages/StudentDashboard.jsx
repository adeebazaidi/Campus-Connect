import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  DocumentIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  ClipboardIcon,
} from '../components/Icons';

const STAT_CARDS = [
  { key: 'total',      label: 'Total',       Icon: DocumentIcon,    iconColor: 'text-slate-500',    colorCls: 'text-slate-800' },
  { key: 'pending',    label: 'Pending',     Icon: ClockIcon,       iconColor: 'text-amber-500',    colorCls: 'text-amber-600' },
  { key: 'inProgress', label: 'In Progress', Icon: CogIcon,         iconColor: 'text-blue-500',     colorCls: 'text-blue-600' },
  { key: 'resolved',   label: 'Resolved',    Icon: CheckCircleIcon, iconColor: 'text-emerald-500',  colorCls: 'text-emerald-600' },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await api.get('/api/complaints/my');
        setComplaints(data);
      } catch {
        setError('Failed to load complaints. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const stats = useMemo(() => {
    const base = { total: complaints.length, pending: 0, inProgress: 0, resolved: 0 };
    complaints.forEach((c) => {
      if (c.status === 'pending') base.pending += 1;
      if (c.status === 'in-progress') base.inProgress += 1;
      if (c.status === 'resolved') base.resolved += 1;
    });
    return base;
  }, [complaints]);

  const filtered = useMemo(() => {
    if (filter === 'all') return complaints;
    if (filter === 'in-progress') return complaints.filter((c) => c.status === 'in-progress');
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-5 w-full animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="page-title">Hello, {user?.name?.split(' ')[0]}</h2>
          <p className="page-subtitle">Track and manage your campus complaints.</p>
        </div>
        <Link to="/submit" className="btn-primary btn-sm shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Complaint
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ key, label, Icon, iconColor, colorCls }) => (
          <div key={key} className="stat-card">
            <div className="flex items-center justify-between mb-1">
              <span className="stat-label">{label}</span>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <p className={`stat-value ${colorCls}`}>{stats[key]}</p>
          </div>
        ))}
      </div>

      {/* Complaint list */}
      <div>
        {/* List header + filter */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Your Complaints</h2>
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
                {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-3">
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state border border-dashed border-slate-200 rounded-xl">
            <ClipboardIcon className="w-8 h-8 text-slate-300 mb-2" />
            <p className="empty-state-title">
              {filter === 'all' ? 'No complaints yet' : `No ${filter} complaints`}
            </p>
            <p className="empty-state-body">
              {filter === 'all'
                ? 'Submit your first complaint using the button above.'
                : 'Try a different filter to see your complaints.'}
            </p>
            {filter === 'all' && (
              <Link to="/submit" className="btn-primary btn-sm mt-4">
                Submit a Complaint
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
