import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await api.get('/api/complaints/my');
        setComplaints(data);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const stats = useMemo(() => {
    const base = { total: complaints.length, pending: 0, inProgress: 0, resolved: 0 };
    complaints.forEach((complaint) => {
      if (complaint.status === 'pending') base.pending += 1;
      if (complaint.status === 'in-progress') base.inProgress += 1;
      if (complaint.status === 'resolved') base.resolved += 1;
    });
    return base;
  }, [complaints]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Hello, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500">
          Track and manage your complaints in one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:scale-105 transition-transform">
          <p className="text-sm font-medium text-primary-100">Total Complaints</p>
          <p className="mt-2 text-4xl font-bold">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:scale-105 transition-transform">
          <p className="text-sm font-medium text-amber-100">Pending</p>
          <p className="mt-2 text-4xl font-bold">
            {stats.pending}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:scale-105 transition-transform">
          <p className="text-sm font-medium text-emerald-100">Resolved</p>
          <p className="mt-2 text-4xl font-bold">
            {stats.resolved}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/submit"
          className="btn-primary"
        >
          ➕ Submit new complaint
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Recent complaints</h2>
          <span className="text-sm text-slate-500">
            {stats.total} total records
          </span>
        </div>
        {complaints.length === 0 && (
          <div className="card text-center py-12 border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-slate-500 font-medium">
              No complaints yet. Use the "Submit new complaint" button to create one.
            </p>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


