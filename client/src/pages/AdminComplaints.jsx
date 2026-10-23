import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SearchIcon } from '../components/Icons';

const STATUS_OPTIONS = ['pending', 'in-progress', 'resolved'];
const CATEGORIES     = ['all', 'infrastructure', 'academics', 'hostel', 'finance', 'other'];

const AdminComplaints = () => {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [staff,      setStaff]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [exporting,  setExporting]  = useState(false);

  // Filters — initialise from URL query params so quick-filter links from AdminDashboard work
  const [search,         setSearch]   = useState('');
  const [statusFilter,   setStatus]   = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategory] = useState('all');
  const [dateFrom,       setDateFrom] = useState('');
  const [dateTo,         setDateTo]   = useState('');

  const [updating, setUpdating] = useState({});
  const exportRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter   !== 'all') params.status   = statusFilter;
      if (categoryFilter !== 'all') params.category  = categoryFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo)   params.to   = dateTo;

      const [{ data: cData }, staffRes] = await Promise.all([
        api.get('/api/complaints/all', { params }),
        isAdmin ? api.get('/api/admin/users') : Promise.resolve({ data: [] }),
      ]);
      setComplaints(Array.isArray(cData) ? cData : []);
      if (isAdmin) setStaff(staffRes.data.filter((u) => u.role === 'staff'));
    } catch {
      addToast('Failed to load complaints.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, addToast, statusFilter, categoryFilter, dateFrom, dateTo]);

  useEffect(() => { loadData(); }, [loadData]);

  // Sync status from URL param (from AdminDashboard quick-filter links)
  useEffect(() => {
    const s = searchParams.get('status');
    if (s && s !== statusFilter) setStatus(s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return complaints;
    const q = search.toLowerCase();
    return complaints.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.createdBy?.name?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    );
  }, [complaints, search]);

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setCategory('all');
    setDateFrom('');
    setDateTo('');
    setSearchParams({});
  };

  const updateStatus = async (id, status) => {
    setUpdating((p) => ({ ...p, [id]: 'status' }));
    try {
      await api.patch(`/api/complaints/${id}/status`, { status });
      setComplaints((prev) => prev.map((c) => c._id === id ? { ...c, status } : c));
      addToast('Status updated.');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setUpdating((p) => ({ ...p, [id]: undefined }));
    }
  };

  const assignStaff = async (id, staffId) => {
    if (!staffId) return;
    setUpdating((p) => ({ ...p, [id]: 'assign' }));
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
      addToast('Staff assigned.');
    } catch (err) {
      addToast(err.response?.data?.message || 'Assignment failed.', 'error');
    } finally {
      setUpdating((p) => ({ ...p, [id]: undefined }));
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = {};
      if (statusFilter   !== 'all') params.status   = statusFilter;
      if (categoryFilter !== 'all') params.category  = categoryFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo)   params.to   = dateTo;

      const response = await api.get('/api/complaints/export', {
        params,
        responseType: 'blob',
      });
      const url  = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href  = url;
      link.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('CSV exported successfully.');
    } catch {
      addToast('CSV export failed.', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Loader />;

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || dateFrom || dateTo || search;

  return (
    <div className="space-y-4 w-full animate-fade-in">
      {/* Filters bar */}
      <div className="card py-3 space-y-3">
        {/* Row 1: Search + Status + Category */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, name, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 text-xs"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="input-field w-auto text-xs">
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('-', ' ')}</option>
            ))}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategory(e.target.value)} className="input-field w-auto text-xs capitalize">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {/* Row 2: Date range + actions */}
        <div className="flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 shrink-0">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
              className="input-field text-xs w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 shrink-0">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="input-field text-xs w-36"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilters && (
              <button onClick={handleReset} className="btn-ghost btn-sm text-xs">
                Reset filters
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleExportCSV}
                disabled={exporting || filtered.length === 0}
                className="btn-secondary btn-sm text-xs flex items-center gap-1.5"
                title="Export current results as CSV"
              >
                {exporting ? (
                  <span className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                Export CSV
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          {filtered.length} complaint{filtered.length !== 1 ? 's' : ''} shown
          {complaints.length !== filtered.length && ` of ${complaints.length}`}
        </p>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state border border-dashed border-slate-200 rounded-xl">
          <SearchIcon className="w-8 h-8 text-slate-300 mb-2" />
          <p className="empty-state-title">No complaints match your filters</p>
          <p className="empty-state-body">Try adjusting the search or filter options.</p>
          {hasActiveFilters && (
            <button onClick={handleReset} className="btn-secondary btn-sm mt-4">Reset filters</button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[220px]">Complaint</th>
                <th className="w-28">Status</th>
                <th className="w-40">Assigned To</th>
                {isAdmin && <th className="w-44">Assign Staff</th>}
                <th className="w-36">Update Status</th>
                <th className="w-24 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((complaint) => (
                <tr key={complaint._id}>
                  <td className="max-w-md">
                    <p className="font-semibold text-slate-800 truncate">{complaint.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {complaint.createdBy?.name || 'Student'} · {complaint.category} ·{' '}
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td><StatusBadge status={complaint.status} /></td>
                  <td>
                    <span className="text-xs font-semibold text-slate-700">
                      {complaint.assignedTo?.name ||
                        (typeof complaint.assignedTo === 'string' &&
                          staff.find((s) => s._id === complaint.assignedTo)?.name) || (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <select
                        value={
                          complaint.assignedTo?._id ||
                          (typeof complaint.assignedTo === 'string' ? complaint.assignedTo : '')
                        }
                        onChange={(e) => assignStaff(complaint._id, e.target.value)}
                        disabled={!!updating[complaint._id]}
                        className="input-field text-xs py-1"
                      >
                        <option value="">Select staff…</option>
                        {staff.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td>
                    <select
                      value={complaint.status}
                      onChange={(e) => updateStatus(complaint._id, e.target.value)}
                      disabled={!!updating[complaint._id]}
                      className="input-field text-xs py-1 w-32"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace('-', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-right pr-4">
                    <Link
                      to={`/complaints/${complaint._id}`}
                      className="btn-ghost btn-xs text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1"
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
      <div ref={exportRef} />
    </div>
  );
};

export default AdminComplaints;
