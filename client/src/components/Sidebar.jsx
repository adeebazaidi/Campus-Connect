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
  admin: 'bg-[#3A0F34] text-white border border-[#3A0F34] shadow-[1px_1px_0px_#EAAA00]',
  staff: 'bg-[#DDE3E8] text-[#3A0F34] border border-[#3A0F34]',
  student: 'bg-[#EAAA00] text-[#3A0F34] border border-[#3A0F34]',
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
    <nav className="flex flex-col gap-1.5 px-3">
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
        <div className="px-5 py-4 border-b-2 border-[#3A0F34] shrink-0 bg-[#3A0F34] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-white shadow-[2px_2px_0px_#EAAA00] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <div>
              <p className="text-base font-black text-white leading-tight font-display tracking-tight">CampusConnect</p>
              <p className="text-[10px] font-bold text-[#EAAA00] uppercase tracking-wider">Complaint Portal</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-3.5 border-b-2 border-[#3A0F34]/15 bg-[#DDE3E8]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3A0F34] text-[#EAAA00] border-2 border-[#3A0F34] shadow-[2px_2px_0px_#EAAA00] flex items-center justify-center text-xs font-black shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-[#3A0F34] truncate">{user.name}</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full capitalize ${roleBadge[user.role]}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 py-4 overflow-y-auto">
          <p className="section-label">Navigation</p>
          <NavItems />
        </div>

        {/* Logout & Footer */}
        <div className="px-3 py-3 border-t-2 border-[#3A0F34]/15 shrink-0 bg-white">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
          <div className="mt-2.5 pt-2 border-t border-[#3A0F34]/15 text-center select-none">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#3A0F34]">CampusConnect</p>
            <p className="text-[10px] font-semibold text-[#3A0F34]/60">Student & Staff Portal</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile drawer overlay ─────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-[#3A0F34]/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r-2 border-[#3A0F34] flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-4 border-b-2 border-[#3A0F34] flex items-center justify-between bg-[#3A0F34] text-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-white flex items-center justify-center font-black text-xs">
              CC
            </div>
            <p className="font-black text-white font-display text-base">CampusConnect</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1 text-white hover:bg-[#55184d] rounded-md border-2 border-transparent hover:border-[#EAAA00]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 py-3 overflow-y-auto">
          <NavItems onSelect={() => setMobileOpen(false)} />
        </div>
        <div className="px-3 py-3 border-t-2 border-[#3A0F34]/15">
          <button onClick={handleLogout} className="nav-item w-full text-rose-600 hover:bg-rose-50">
            Sign Out
          </button>
          <div className="mt-2.5 pt-2 border-t border-[#3A0F34]/15 text-center select-none">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#3A0F34]">CampusConnect</p>
            <p className="text-[10px] font-semibold text-[#3A0F34]/60">Student & Staff Portal</p>
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
