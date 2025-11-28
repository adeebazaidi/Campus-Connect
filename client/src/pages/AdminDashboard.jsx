import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/stats');
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (!stats) return <p className="text-sm text-red-500">Failed to load stats.</p>;

  const cards = [
    { label: 'Total Complaints', value: stats.complaints.total },
    { label: 'Pending', value: stats.complaints.pending },
    { label: 'In Progress', value: stats.complaints.inProgress },
    { label: 'Resolved', value: stats.complaints.resolved },
    { label: 'Total Users', value: stats.users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">
          Monitor platform-wide activity and spot bottlenecks.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card, index) => {
          const gradients = [
            'from-primary-500 to-primary-600',
            'from-amber-500 to-amber-600',
            'from-blue-500 to-blue-600',
            'from-emerald-500 to-emerald-600',
            'from-purple-500 to-purple-600',
          ];
          return (
            <div 
              key={card.label} 
              className={`card bg-gradient-to-br ${gradients[index]} text-white hover:scale-105 transition-transform animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-sm font-medium text-white/90">{card.label}</p>
              <p className="mt-2 text-4xl font-bold">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;


