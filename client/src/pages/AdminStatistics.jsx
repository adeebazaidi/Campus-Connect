import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  DocumentIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  UsersIcon,
  WarningIcon,
  ArrowDownTrayIcon,
} from '../components/Icons';

const AdminStatistics = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [statsRes, workloadRes, compRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/admin/workload'),
          api.get('/api/complaints/all'),
        ]);
        setStats(statsRes.data);
        setWorkload(Array.isArray(workloadRes.data) ? workloadRes.data : []);
        setAllComplaints(Array.isArray(compRes.data) ? compRes.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load platform analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/api/complaints/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `campus_complaints_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addToast('Full platform analytics report exported as CSV.');
    } catch {
      addToast('Failed to export CSV report.', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Loader />;

  if (error || !stats) {
    return (
      <div className="empty-state">
        <WarningIcon className="w-10 h-10 text-[#3A0F34] mb-3" />
        <p className="empty-state-title">{error || 'No platform statistics available.'}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary btn-sm mt-4">Retry</button>
      </div>
    );
  }

  const values = {
    total:      stats.complaints.total || 0,
    pending:    stats.complaints.pending || 0,
    inProgress: stats.complaints.inProgress || 0,
    resolved:   stats.complaints.resolved || 0,
    users:      stats.users || 0,
  };

  const resolutionRate = values.total > 0 ? Math.round((values.resolved   / values.total) * 100) : 0;
  const pendingRate    = values.total > 0 ? Math.round((values.pending    / values.total) * 100) : 0;
  const inProgressRate = values.total > 0 ? Math.round((values.inProgress / values.total) * 100) : 0;

  // Category counts from aggregate or client fallback
  const categoryCounts = stats.categories || {};
  if (Object.keys(categoryCounts).length === 0 && allComplaints.length > 0) {
    allComplaints.forEach((c) => {
      const cat = c.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  }

  const standardCategories = ['infrastructure', 'academics', 'hostel', 'finance', 'other'];
  const allCategoryKeys = Array.from(new Set([...standardCategories, ...Object.keys(categoryCounts)]));

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* ── Analytics Hero Banner (#3A0F34 Plum Neo-Brutalist) ── */}
      <div className="bg-[#3A0F34] text-white p-6 rounded-xl border-2 border-[#3A0F34] shadow-[5px_5px_0px_#EAAA00] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#EAAA00] text-[#3A0F34] text-xs font-black uppercase tracking-wider mb-2 border border-white">
            Platform Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-display tracking-tight">
            Platform Analytics & Performance
          </h1>
          <p className="text-xs md:text-sm font-semibold text-white/80 mt-1 max-w-xl">
            Campus-wide grievance trends, department resolution rates, and real-time staff workload metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            to="/"
            className="btn bg-white text-[#3A0F34] shadow-[3px_3px_0px_#EAAA00] hover:bg-[#DDE3E8] text-xs font-black py-2.5 px-4"
          >
            ← Operational Command
          </Link>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn bg-[#EAAA00] text-[#3A0F34] shadow-[3px_3px_0px_white] hover:bg-[#f2b305] text-xs font-black py-2.5 px-4 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export Full CSV Report'}
          </button>
        </div>
      </div>

      {/* ── Key Performance Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Featured Plum Resolution Rate */}
        <div className="bg-[#3A0F34] text-white rounded-xl border-2 border-[#3A0F34] p-5 shadow-[4px_4px_0px_#EAAA00] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#EAAA00]">Resolution Rate</span>
            <div className="p-1.5 rounded-lg bg-[#EAAA00] text-[#3A0F34] border border-white">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-white font-display">{resolutionRate}%</p>
            <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden border border-white/30">
              <div className="h-full bg-[#EAAA00] rounded-full" style={{ width: `${resolutionRate}%` }} />
            </div>
            <p className="text-[11px] font-bold text-white/70 mt-2">
              {values.resolved} of {values.total} complaints resolved
            </p>
          </div>
        </div>

        {/* Metric 2: Pending Backlog Ratio */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Pending Backlog</span>
            <div className="p-1.5 rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]">
              <ClockIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="stat-value">{values.pending}</p>
            <div className="w-full bg-[#DDE3E8] h-2 rounded-full mt-3 overflow-hidden border border-[#3A0F34]">
              <div className="h-full bg-[#EAAA00]" style={{ width: `${pendingRate}%` }} />
            </div>
            <p className="text-[11px] font-bold text-[#3A0F34]/70 mt-2">
              {pendingRate}% of total backlog awaiting resolution
            </p>
          </div>
        </div>

        {/* Metric 3: Active Remediation */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">In Progress</span>
            <div className="p-1.5 rounded-lg bg-sky-200 text-[#3A0F34] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]">
              <CogIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="stat-value">{values.inProgress}</p>
            <div className="w-full bg-[#DDE3E8] h-2 rounded-full mt-3 overflow-hidden border border-[#3A0F34]">
              <div className="h-full bg-sky-400" style={{ width: `${inProgressRate}%` }} />
            </div>
            <p className="text-[11px] font-bold text-[#3A0F34]/70 mt-2">
              {inProgressRate}% actively under staff investigation
            </p>
          </div>
        </div>

        {/* Metric 4: Platform User Community */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Platform Users</span>
            <div className="p-1.5 rounded-lg bg-purple-200 text-[#3A0F34] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="stat-value">{values.users}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-black text-[#3A0F34]">
              <span className="px-1.5 py-0.5 rounded bg-[#DDE3E8] border border-[#3A0F34]">
                {workload.length} Staff
              </span>
              <span className="text-[#3A0F34]/60">•</span>
              <span className="px-1.5 py-0.5 rounded bg-[#EAAA00] text-[#3A0F34] border border-[#3A0F34]">
                Active Campus
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#3A0F34]/70 mt-2">
              Authorized students, staff and administrators
            </p>
          </div>
        </div>
      </div>

      {/* ── Category Distribution & Lifecycle Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#3A0F34]/15 pb-3">
            <div>
              <h2 className="text-base font-black text-[#3A0F34] font-display uppercase tracking-wider">
                Grievances by Category
              </h2>
              <p className="text-xs font-semibold text-[#3A0F34]/70 mt-0.5">
                Volume distribution across campus departments
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-[#3A0F34] text-[#EAAA00] text-xs font-black border border-[#3A0F34]">
              {values.total} Total
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {allCategoryKeys.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const pct = values.total > 0 ? Math.round((count / values.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-[#3A0F34]">
                    <span className="capitalize font-black flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3A0F34] border border-[#EAAA00]" />
                      {cat}
                    </span>
                    <span className="font-mono">
                      <strong className="text-sm font-black">{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#DDE3E8] border-2 border-[#3A0F34] overflow-hidden p-0.5">
                    <div
                      className="h-full bg-[#3A0F34] rounded-full border-r border-[#EAAA00] transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lifecycle Distribution & Summary Table */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#3A0F34]/15 pb-3">
            <div>
              <h2 className="text-base font-black text-[#3A0F34] font-display uppercase tracking-wider">
                Resolution Lifecycle Matrix
              </h2>
              <p className="text-xs font-semibold text-[#3A0F34]/70 mt-0.5">
                Aggregated stage metrics and operational ratio
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-200 text-[#3A0F34] text-xs font-black border-2 border-[#3A0F34]">
              {resolutionRate}% Resolved
            </span>
          </div>

          {/* Segmented bar */}
          {values.total > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-black text-[#3A0F34] uppercase tracking-wider">Status Proportions</p>
              <div className="h-4 rounded-full overflow-hidden flex bg-[#DDE3E8] border-2 border-[#3A0F34] p-0.5">
                <div
                  className="bg-emerald-400 rounded-l-full border-r border-[#3A0F34] transition-all duration-700"
                  style={{ width: `${(values.resolved / values.total) * 100}%` }}
                  title={`Resolved: ${values.resolved}`}
                />
                <div
                  className="bg-sky-300 border-r border-[#3A0F34] transition-all duration-700"
                  style={{ width: `${(values.inProgress / values.total) * 100}%` }}
                  title={`In Progress: ${values.inProgress}`}
                />
                <div
                  className="bg-[#EAAA00] rounded-r-full transition-all duration-700"
                  style={{ width: `${(values.pending / values.total) * 100}%` }}
                  title={`Pending: ${values.pending}`}
                />
              </div>

              <div className="flex items-center gap-3 pt-1 flex-wrap text-xs font-bold text-[#3A0F34]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-400 border border-[#3A0F34]" />
                  Resolved: <span className="font-black">{values.resolved}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-sky-300 border border-[#3A0F34]" />
                  In Progress: <span className="font-black">{values.inProgress}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#EAAA00] border border-[#3A0F34]" />
                  Pending: <span className="font-black">{values.pending}</span>
                </div>
              </div>
            </div>
          )}

          {/* Metrics table */}
          <div className="overflow-hidden rounded-lg border-2 border-[#3A0F34]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#3A0F34] text-white">
                <tr>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Metric Indicator</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider text-right">Volume</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider text-right">Platform Share</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#3A0F34]/15 bg-white font-bold text-[#3A0F34]">
                <tr>
                  <td className="px-3 py-2">Total Grievances Submitted</td>
                  <td className="px-3 py-2 text-right font-black">{values.total}</td>
                  <td className="px-3 py-2 text-right font-black">100%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-emerald-800">Successfully Resolved</td>
                  <td className="px-3 py-2 text-right font-black text-emerald-800">{values.resolved}</td>
                  <td className="px-3 py-2 text-right font-black text-emerald-800">{resolutionRate}%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sky-800">Currently in Remediation</td>
                  <td className="px-3 py-2 text-right font-black text-sky-800">{values.inProgress}</td>
                  <td className="px-3 py-2 text-right font-black text-sky-800">{inProgressRate}%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-amber-800">Awaiting Initial Action</td>
                  <td className="px-3 py-2 text-right font-black text-amber-800">{values.pending}</td>
                  <td className="px-3 py-2 text-right font-black text-amber-800">{pendingRate}%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Registered Campus Users</td>
                  <td className="px-3 py-2 text-right font-black">{values.users}</td>
                  <td className="px-3 py-2 text-right font-black text-[#3A0F34]/50">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Staff Workload & Performance Intelligence Table ── */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#3A0F34]/15 pb-3">
          <div>
            <h2 className="text-base font-black text-[#3A0F34] font-display uppercase tracking-wider">
              Staff Performance & Workload Intelligence
            </h2>
            <p className="text-xs font-semibold text-[#3A0F34]/70 mt-0.5">
              Live task allocation and completion efficiency per departmental staff member
            </p>
          </div>
          <span className="px-3 py-1 rounded-md bg-[#3A0F34] text-white text-xs font-black border border-[#3A0F34] shadow-[2px_2px_0px_#EAAA00] self-start sm:self-auto">
            {workload.length} Staff Members Tracked
          </span>
        </div>

        {workload.length === 0 ? (
          <div className="empty-state">
            <UsersIcon className="w-8 h-8 text-[#3A0F34]/40 mb-2" />
            <p className="empty-state-title">No staff members found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Department</th>
                  <th>Pending Cases</th>
                  <th>In Progress</th>
                  <th>Resolved Cases</th>
                  <th>Total Assigned</th>
                  <th className="pr-4 text-right">Completion Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {workload.map((s) => {
                  const staffEfficiency = s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0;
                  return (
                    <tr key={s._id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#3A0F34] text-[#EAAA00] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#EAAA00] flex items-center justify-center font-black text-xs shrink-0">
                            {s.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className="font-black text-[#3A0F34]">{s.name}</p>
                            <p className="text-[11px] font-bold text-[#3A0F34]/60">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs font-bold text-[#3A0F34]">{s.department || 'General Services'}</td>
                      <td>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAAA00] text-[#3A0F34] border border-[#3A0F34] font-black text-xs">
                          {s.pending}
                        </span>
                      </td>
                      <td>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-200 text-[#3A0F34] border border-[#3A0F34] font-black text-xs">
                          {s.inProgress}
                        </span>
                      </td>
                      <td>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-300 text-[#3A0F34] border border-[#3A0F34] font-black text-xs">
                          {s.resolved}
                        </span>
                      </td>
                      <td>
                        <span className="inline-block px-3 py-0.5 rounded-lg bg-white border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34] font-black text-xs text-[#3A0F34]">
                          {s.total}
                        </span>
                      </td>
                      <td className="pr-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-20 bg-[#DDE3E8] h-2.5 rounded-full overflow-hidden border border-[#3A0F34]">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${staffEfficiency}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-black text-[#3A0F34] w-9 text-right">
                            {staffEfficiency}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStatistics;
