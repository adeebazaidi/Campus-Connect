import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Nav items per role ─────────────────────────── */
const NAV = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    roles: ['student', 'staff', 'admin'],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/submit',
    label: 'New Complaint',
    end: false,
    roles: ['student'],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: '/admin/complaints',
    label: 'All Complaints',
    end: false,
    roles: ['admin', 'staff'],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: '/admin/stats',
    label: 'Statistics',
    end: false,
    roles: ['admin'],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

/* ── Role badges ─────────────────────────────────── */
const roleBadge = {
  admin: 'bg-purple-100 text-purple-700',
  staff: 'bg-blue-100 text-blue-700',
  student: 'bg-emerald-100 text-emerald-700',
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const visible = NAV.filter((n) => n.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItems = ({ onSelect }) => (
    <nav className="flex flex-col gap-0.5 px-2">
      {visible.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onSelect}
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────── */}
      <aside className="sidebar-panel">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">CampusConnect</p>
              <p className="text-[10px] text-slate-400">Complaint Portal</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${roleBadge[user.role]}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 py-3 overflow-y-auto">
          <p className="section-label">Menu</p>
          <NavItems />
        </div>

        {/* Logout & Attribution */}
        <div className="px-2 py-3 border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-center select-none">
            <p className="text-[11px] font-semibold text-slate-500">CampusConnect</p>
            <p className="text-[10px] text-slate-400">Created by Adeeba Fatima Zaidi</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile drawer overlay ─────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <p className="font-bold text-slate-800">CampusConnect</p>
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 py-3 overflow-y-auto">
          <NavItems onSelect={() => setMobileOpen(false)} />
        </div>
        <div className="px-2 py-3 border-t border-slate-100">
          <button onClick={handleLogout} className="nav-item w-full text-red-600 hover:bg-red-50">
            Sign Out
          </button>
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-center select-none">
            <p className="text-[11px] font-semibold text-slate-500">CampusConnect</p>
            <p className="text-[10px] text-slate-400">Created by Adeeba Fatima Zaidi</p>
          </div>
        </div>
      </div>

      {/* Mobile hamburger trigger — exposed to Topbar via DOM event, or just export setter */}
      <button
        id="mobile-menu-trigger"
        onClick={() => setMobileOpen(true)}
        className="hidden"
        aria-label="Open menu"
      />
    </>
  );
};

export default Sidebar;
