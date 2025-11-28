import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', roles: ['student', 'staff', 'admin'] },
  {
    to: '/submit',
    label: 'Submit Complaint',
    icon: '➕',
    roles: ['student'],
  },
  {
    to: '/admin/complaints',
    label: 'Manage Complaints',
    icon: '📋',
    roles: ['admin', 'staff'],
  },
  {
    to: '/admin/stats',
    label: 'Admin Dashboard',
    icon: '📈',
    roles: ['admin'],
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="w-72 border-r border-slate-200 bg-white/50 backdrop-blur-sm">
      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Navigation</p>
        <nav className="flex flex-col gap-2">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                      : 'text-slate-600 hover:bg-slate-100 hover:scale-105'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;


