import { useCallback, useEffect, useState } from 'react';
import Loader from '../components/Loader';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['pending', 'in-progress', 'resolved'];

const AdminComplaints = () => {
  const { isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: complaintData }, staffRes] = await Promise.all([
        api.get('/api/complaints/all'),
        isAdmin ? api.get('/api/admin/users') : Promise.resolve({ data: [] }),
      ]);

      setComplaints(complaintData);
      if (isAdmin) {
        setStaff(staffRes.data.filter((user) => user.role === 'staff'));
      } else {
        setStaff([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/complaints/${id}/status`, { status });
      setMessage('Status updated');
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update');
    }
  };

  const assignStaff = async (id, staffId) => {
    if (!staffId) return;
    try {
      await api.patch(`/api/complaints/${id}/assign`, { assignedTo: staffId });
      setMessage('Staff assigned');
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Assignment failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manage complaints</h1>
        <p className="text-sm text-slate-500">
          Assign complaints, update statuses, and keep everyone informed.
        </p>
      </div>
      {message && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <div
            key={complaint._id}
            className="card"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {complaint.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {complaint.createdBy?.name} • {complaint.category}
                </p>
              </div>
              <span className={`status-badge border-2 ${
                complaint.status === 'pending' 
                  ? 'text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
                  : complaint.status === 'in-progress'
                  ? 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
                  : 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200'
              }`}>
                {complaint.status}
              </span>
            </div>
            <p className="mt-3 max-h-12 overflow-hidden text-sm text-slate-600">
              {complaint.description}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Update status
                </label>
                <select
                  value={complaint.status}
                  onChange={(e) => updateStatus(complaint._id, e.target.value)}
                  className="input-field text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">Assigned to</p>
                <p className="mt-1 text-sm text-slate-700">
                  {complaint.assignedTo?.name || 'Not assigned'}
                </p>
              </div>

              {isAdmin && (
                <div>
                  <label className="text-xs font-semibold text-slate-500">
                    Assign staff
                  </label>
                  <select
                    value={complaint.assignedTo?._id || ''}
                    onChange={(e) => assignStaff(complaint._id, e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Select staff</option>
                    {staff.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminComplaints;


