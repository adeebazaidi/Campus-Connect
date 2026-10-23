import { useEffect, useState } from 'react';
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
  UsersIcon,
  WarningIcon,
  ClipboardIcon,
  UserIcon,
} from '../components/Icons';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [statsRes, compRes, staffRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/complaints/all'),
        api.get('/api/admin/staff'),
      ]);
      setStats(statsRes.data);
      setComplaints(Array.isArray(compRes.data) ? compRes.data : []);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAssignStaff = async (id, staffId) => {
    if (!staffId) return;
    setUpdating((prev) => ({ ...prev, [id]: 'assign' }));
    try {
      const { data } = await api.patch(`/api/complaints/${id}/assign`, { assignedTo: staffId });
      const staffObj =
        data.assignedTo && typeof data.assignedTo === 'object' && data.assignedTo.name
          ? data.assignedTo
          : staff.find((s) => s._id === staffId) || { _id: staffId, name: 'Staff' };

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, assignedTo: staffObj, status: data.status || c.status }
            : c
        )
      );
      addToast(`Assigned to ${staffObj.name}.`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Staff assignment failed.', 'error');
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdating((prev) => ({ ...prev, [id]: 'status' }));
    try {
      await api.patch(`/api/complaints/${id}/status`, { status });
      setComplaints((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
      addToast('Status updated.');
    } catch (err) {
      addToast(err.response?.data?.message || 'Status update failed.', 'error');
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  if (loading) return <Loader />;

  if (error || !stats) {
    return (
      <div className="empty-state">
        <WarningIcon className="w-10 h-10 text-[#3A0F34] mb-3" />
        <p className="empty-state-title">{error || 'No operational data available.'}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary btn-sm mt-4">Retry</button>
      </div>
    );
  }

  const unassignedComplaints = complaints.filter((c) => !c.assignedTo || !c.assignedTo.name);
  const recentComplaints = complaints.slice(0, 8);

  const values = {
    total:      stats.complaints.total || complaints.length,
    pending:    stats.complaints.pending || 0,
    inProgress: stats.complaints.inProgress || 0,
    resolved:   stats.complaints.resolved || 0,
    users:      stats.users || 0,
    unassigned: unassignedComplaints.length,
  };

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* ── Operational Command Hero Banner (#3A0F34 Plum Neo-Brutalist) ── */}
      <div className="bg-[#3A0F34] text-white p-6 rounded-xl border-2 border-[#3A0F34] shadow-[5px_5px_0px_#EAAA00] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#EAAA00] text-[#3A0F34] text-xs font-black uppercase tracking-wider mb-2 border border-white">
            Live Command Center
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-display tracking-tight">
            Admin Operational Dashboard
          </h1>
          <p className="text-xs md:text-sm font-semibold text-white/80 mt-1 max-w-xl">
            Welcome back, {user?.name || 'Administrator'} • Active operational triage, instant staff assignment, and grievance routing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            to="/admin/complaints"
            className="btn bg-[#EAAA00] text-[#3A0F34] shadow-[3px_3px_0px_white] hover:bg-[#f2b305] text-xs font-black py-2.5 px-4 flex items-center gap-2"
          >
            <DocumentIcon className="w-4 h-4" />
            Manage All Complaints
          </Link>
          <Link
            to="/admin/stats"
            className="btn bg-white text-[#3A0F34] shadow-[3px_3px_0px_#EAAA00] hover:bg-[#DDE3E8] text-xs font-black py-2.5 px-4 flex items-center gap-2"
          >
            <UsersIcon className="w-4 h-4" />
            Platform Statistics →
          </Link>
        </div>
      </div>

      {/* ── Operational KPI Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Urgent Unassigned Callout */}
        <div
          className={`stat-card transition-all ${
            values.unassigned > 0
              ? 'bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[4px_4px_0px_#3A0F34]'
              : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="stat-label">Unassigned</span>
            <div className="p-1.5 rounded-lg bg-white border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]">
              <WarningIcon className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <p className="stat-value">{values.unassigned}</p>
          <span className="text-[10px] font-bold text-[#3A0F34]/80">
            {values.unassigned > 0 ? 'Requires staff allocation' : 'All complaints assigned'}
          </span>
        </div>

        {/* Card 2: Pending */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="stat-label">Pending</span>
            <div className="p-1.5 rounded-lg bg-[#EAAA00] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]">
              <ClockIcon className="w-4 h-4 text-[#3A0F34]" />
            </div>
          </div>
          <p className="stat-value">{values.pending}</p>
          <span className="text-[10px] font-bold text-[#3A0F34]/60">Awaiting action</span>
        </div>

        {/* Card 3: In Progress */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="stat-label">In Progress</span>
            <div className="p-1.5 rounded-lg bg-sky-200 border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]">
              <CogIcon className="w-4 h-4 text-[#3A0F34]" />
            </div>
          </div>
          <p className="stat-value">{values.inProgress}</p>
          <span className="text-[10px] font-bold text-[#3A0F34]/60">Under remediation</span>
        </div>

        {/* Card 4: Resolved */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="stat-label">Resolved</span>
            <div className="p-1.5 rounded-lg bg-emerald-300 border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]">
              <CheckCircleIcon className="w-4 h-4 text-[#3A0F34]" />
            </div>
          </div>
          <p className="stat-value">{values.resolved}</p>
          <span className="text-[10px] font-bold text-[#3A0F34]/60">Closed successfully</span>
        </div>

        {/* Card 5: Total Complaints */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="stat-label">Total Volume</span>
            <div className="p-1.5 rounded-lg bg-[#DDE3E8] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]">
              <DocumentIcon className="w-4 h-4 text-[#3A0F34]" />
            </div>
          </div>
          <p className="stat-value">{values.total}</p>
          <span className="text-[10px] font-bold text-[#3A0F34]/60">Lifetime logged</span>
        </div>
      </div>

      {/* ── Operational Shortcut Filters ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[
          { label: 'Pending Queue', status: 'pending', bg: 'bg-[#EAAA00]', count: values.pending, icon: ClockIcon },
          { label: 'Active In-Progress', status: 'in-progress', bg: 'bg-white', count: values.inProgress, icon: CogIcon },
          { label: 'Resolved Archive', status: 'resolved', bg: 'bg-emerald-300', count: values.resolved, icon: CheckCircleIcon },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.status}
              to={`/admin/complaints?status=${item.status}`}
              className={`flex items-center justify-between rounded-xl border-2 border-[#3A0F34] shadow-[3.5px_3.5px_0px_#3A0F34] px-4 py-3.5 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#3A0F34] ${item.bg}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/80 border-2 border-[#3A0F34] shadow-[1px_1px_0px_#3A0F34]">
                  <Icon className="w-4 h-4 text-[#3A0F34]" />
                </div>
                <span className="text-sm font-black text-[#3A0F34] tracking-tight">{item.label}</span>
              </div>
              <span className="text-xl font-black text-[#3A0F34]">{item.count}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Section: Urgent Attention (Unassigned Complaints) ── */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#3A0F34]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]">
              <WarningIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#3A0F34] font-display uppercase tracking-wider">
                Urgent Attention: Unassigned Complaints
              </h2>
              <p className="text-xs font-semibold text-[#3A0F34]/70 mt-0.5">
                Assign staff members immediately to start investigation and remediation
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-md text-xs font-black border-2 border-[#3A0F34] shadow-[2px_2px_0px_#3A0F34] self-start sm:self-auto ${
              unassignedComplaints.length > 0 ? 'bg-[#EAAA00] text-[#3A0F34]' : 'bg-emerald-300 text-[#3A0F34]'
            }`}
          >
            {unassignedComplaints.length} Unassigned
          </span>
        </div>

        {unassignedComplaints.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border-2 border-[#3A0F34] shadow-[2px_2px_0px_#3A0F34]">
            <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-black text-[#3A0F34]">Operational Queue Clean!</p>
              <p className="text-xs font-semibold text-[#3A0F34]/70 mt-0.5">
                All submitted complaints have been assigned to designated staff personnel.
              </p>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Grievance</th>
                  <th>Category</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                  <th>Assign Staff Member</th>
                  <th className="pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {unassignedComplaints.slice(0, 5).map((c) => (
                  <tr key={c._id}>
                    <td className="max-w-xs">
                      <p className="font-black text-[#3A0F34] truncate">{c.title}</p>
                      <p className="text-[11px] font-bold text-[#3A0F34]/60 truncate">{c.description}</p>
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#DDE3E8] border border-[#3A0F34] text-[11px] font-black capitalize text-[#3A0F34]">
                        {c.category}
                      </span>
                    </td>
                    <td>
                      <p className="text-xs font-bold text-[#3A0F34]">{c.createdBy?.name || 'Student'}</p>
                      <p className="text-[11px] font-medium text-[#3A0F34]/60">{c.createdBy?.department || 'Campus'}</p>
                    </td>
                    <td className="text-xs font-bold text-[#3A0F34]/70">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <select
                        defaultValue=""
                        disabled={updating[c._id] === 'assign'}
                        onChange={(e) => handleAssignStaff(c._id, e.target.value)}
                        className="select-sm w-48 font-bold"
                      >
                        <option value="" disabled>
                          Select Staff...
                        </option>
                        {staff.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.department || 'Staff'})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="pr-4 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[2px_2px_0px_#3A0F34] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#3A0F34] transition-all"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section: Recent Operational Activity ── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#3A0F34]/15 pb-3">
          <div>
            <h2 className="text-base font-black text-[#3A0F34] font-display uppercase tracking-wider">
              Recent Complaints Activity
            </h2>
            <p className="text-xs font-semibold text-[#3A0F34]/70 mt-0.5">
              Live incoming complaints across campus departments
            </p>
          </div>
          <Link to="/admin/complaints" className="text-xs font-black text-[#3A0F34] hover:underline flex items-center gap-1">
            View All ({complaints.length}) →
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="empty-state">
            <ClipboardIcon className="w-8 h-8 text-[#3A0F34]/40 mb-2" />
            <p className="empty-state-title">No complaints logged yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Status</th>
                  <th>Submitted By</th>
                  <th>Assigned Staff</th>
                  <th>Date</th>
                  <th className="pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((c) => (
                  <tr key={c._id}>
                    <td className="max-w-xs">
                      <p className="font-black text-[#3A0F34] truncate">{c.title}</p>
                      <p className="text-[11px] font-bold text-[#3A0F34]/60 mt-0.5 capitalize">{c.category}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={c.status} />
                        <select
                          value={c.status}
                          disabled={updating[c._id] === 'status'}
                          onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          className="select-sm w-32 capitalize"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </td>
                    <td className="text-xs font-bold text-[#3A0F34]">
                      {c.createdBy?.name || '—'}
                    </td>
                    <td className="text-xs font-bold text-[#3A0F34]">
                      {c.assignedTo?.name ? (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#DDE3E8] border border-[#3A0F34] text-[11px] font-black text-[#3A0F34]">
                          {c.assignedTo.name}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-black">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="text-xs font-bold text-[#3A0F34]/70">
                      {new Date(c.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="pr-4 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[2px_2px_0px_#3A0F34] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#3A0F34] transition-all"
                      >
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
    </div>
  );
};

export default AdminDashboard;
