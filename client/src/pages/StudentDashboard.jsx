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
  { key: 'total',      label: 'Total',       Icon: DocumentIcon,    iconBg: 'bg-[#DDE3E8]' },
  { key: 'pending',    label: 'Pending',     Icon: ClockIcon,       iconBg: 'bg-[#EAAA00]' },
  { key: 'inProgress', label: 'In Progress', Icon: CogIcon,         iconBg: 'bg-sky-200' },
  { key: 'resolved',   label: 'Resolved',    Icon: CheckCircleIcon, iconBg: 'bg-emerald-300' },
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
    <div className="space-y-6 w-full animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-[#3A0F34] text-white p-5 rounded-xl border-2 border-[#3A0F34] shadow-[4px_4px_0px_#EAAA00]">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight font-display">Hello, {user?.name?.split(' ')[0]}</h2>
          <p className="text-xs font-semibold text-white/80 mt-0.5">Track and manage your campus complaints in real time.</p>
        </div>
        <Link to="/submit" className="btn bg-[#EAAA00] text-[#3A0F34] shadow-[2.5px_2.5px_0px_white] hover:bg-[#f2b305] text-xs font-black py-2 px-3.5 shrink-0 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Complaint
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {STAT_CARDS.map((card) => {
          const Icon = card.Icon;
          return (
            <div key={card.key} className="stat-card">
              <div className="flex items-center justify-between mb-1.5">
                <span className="stat-label">{card.label}</span>
                <div className={`p-1.5 rounded-lg border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34] ${card.iconBg}`}>
                  <Icon className="w-4 h-4 text-[#3A0F34]" />
                </div>
              </div>
              <p className="stat-value">{stats[card.key]}</p>
            </div>
          );
        })}
      </div>

      {/* Complaint list */}
      <div>
        {/* List header + filter */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#3A0F34] font-display">Your Complaints</h2>
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
                {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-100 border-2 border-[#3A0F34] px-4 py-3 text-sm font-bold text-rose-950 mb-3.5 shadow-[3px_3px_0px_#3A0F34]">
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <ClipboardIcon className="w-8 h-8 text-[#3A0F34]/40 mb-2" />
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
          <div className="grid gap-4 sm:grid-cols-2">
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
