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

  // Filters
  const [search,         setSearch]   = useState('');
  const [statusFilter,   setStatus]   = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategory] = useState('all');
  const [dateFrom,       setDateFrom] = useState('');
  const [dateTo,         setDateTo]   = useState('');
  const [updating,       setUpdating] = useState({});

  const exportRef = useRef(null);

  // Synchronise state with URL params
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus && STATUS_OPTIONS.includes(urlStatus)) {
      setStatus(urlStatus);
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const requests = [api.get('/api/complaints/all')];
      if (isAdmin) {
        requests.push(api.get('/api/admin/staff'));
      }
      const [compRes, staffRes] = await Promise.all(requests);
      setComplaints(compRes.data);
      if (staffRes) {
        setStaff(staffRes.data);
      }
    } catch {
      addToast('Failed to load complaints.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filtering
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter   !== 'all' && c.status   !== statusFilter)   return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (dateFrom && new Date(c.createdAt) < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(c.createdAt) > to) return false;
      }
      return true;
    }).filter((c) =>
      !search.trim() ? true :
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.createdBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [complaints, search, statusFilter, categoryFilter, dateFrom, dateTo]);

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
      addToast('CSV export downloaded.');
    } catch {
      addToast('Failed to export CSV.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const hasActiveFilters =
    statusFilter !== 'all' || categoryFilter !== 'all' || search || dateFrom || dateTo;

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-[#3A0F34] text-white p-5 rounded-xl border-2 border-[#3A0F34] shadow-[4px_4px_0px_#EAAA00]">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight font-display">All Complaints</h2>
          <p className="text-xs font-semibold text-white/80 mt-0.5">Filter, assign, update, and export complaints across departments.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleExportCSV}
              disabled={exporting || filtered.length === 0}
              className="btn bg-[#EAAA00] text-[#3A0F34] shadow-[2.5px_2.5px_0px_white] hover:bg-[#f2b305] text-xs font-black py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              {exporting ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-[#3A0F34] border-t-transparent animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <div className="card space-y-3 bg-white">
        {/* Row 1: Search + Status + Category */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A0F34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, name, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9.5 text-xs font-bold"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="select-sm py-2 px-3 pr-8 text-xs font-bold capitalize">
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('-', ' ')}</option>
            ))}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategory(e.target.value)} className="select-sm py-2 px-3 pr-8 text-xs font-bold capitalize">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {/* Row 2: Date range + actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex items-center gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-[#3A0F34] shrink-0">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
              className="input-field text-xs w-36 font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-[#3A0F34] shrink-0">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="input-field text-xs w-36 font-bold"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilters && (
              <button onClick={handleReset} className="btn-secondary btn-sm text-xs font-black">
                Reset filters
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] font-bold text-[#3A0F34]/70 pt-1">
          {filtered.length} complaint{filtered.length !== 1 ? 's' : ''} shown
          {complaints.length !== filtered.length && ` of ${complaints.length}`}
        </p>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <SearchIcon className="w-8 h-8 text-[#3A0F34]/40 mb-2" />
          <p className="empty-state-title">No complaints match your filters</p>
          <p className="empty-state-body">Try adjusting the search query or resetting filters.</p>
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
                    <p className="font-black text-[#3A0F34] truncate">{complaint.title}</p>
                    <p className="text-[11px] font-bold text-[#3A0F34]/60 mt-0.5">
                      {complaint.createdBy?.name || 'Student'} · {complaint.category} ·{' '}
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td><StatusBadge status={complaint.status} /></td>
                  <td>
                    <span className="text-xs font-bold text-[#3A0F34]">
                      {complaint.assignedTo?.name ||
                        (typeof complaint.assignedTo === 'string' &&
                          staff.find((s) => s._id === complaint.assignedTo)?.name) ? (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#DDE3E8] border border-[#3A0F34] text-[11px] font-bold">
                              {complaint.assignedTo?.name || staff.find((s) => s._id === complaint.assignedTo)?.name}
                            </span>
                          ) : (
                            <span className="text-[#3A0F34]/40 italic font-normal">Unassigned</span>
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
                        className="select-sm w-44 font-bold"
                      >
                        <option value="">Select staff…</option>
                        {staff.map((s) => (
                          <option key={s._id} value={s._id}>{s.name} ({s.department || 'Staff'})</option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td>
                    <select
                      value={complaint.status}
                      onChange={(e) => updateStatus(complaint._id, e.target.value)}
                      disabled={!!updating[complaint._id]}
                      className="select-sm w-32 font-bold capitalize"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace('-', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-right pr-4">
                    <Link
                      to={`/complaints/${complaint._id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[2px_2px_0px_#3A0F34] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#3A0F34] transition-all"
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
