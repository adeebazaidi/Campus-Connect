import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

import {
  BellIcon,
  PencilIcon,
  UserIcon,
  ArrowPathIcon,
  ChatIcon,
  CheckCircleIcon,
} from './Icons';

/* Map route → title / subtitle */
const ROUTE_META = {
  '/':                 { title: 'Dashboard',        subtitle: 'Operational command and grievance triage' },
  '/submit':           { title: 'Submit Complaint', subtitle: 'Describe your issue and attach any relevant files' },
  '/admin/complaints': { title: 'All Complaints',   subtitle: 'Manage, assign, and update complaint status' },
  '/admin/stats':      { title: 'Statistics',       subtitle: 'Platform analytics, category distribution & staff workload' },
};

const renderNotifIcon = (type) => {
  switch (type) {
    case 'complaint_submitted':
      return <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0"><PencilIcon className="w-3.5 h-3.5" /></div>;
    case 'complaint_assigned':
      return <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 shrink-0"><UserIcon className="w-3.5 h-3.5" /></div>;
    case 'status_changed':
      return <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 shrink-0"><ArrowPathIcon className="w-3.5 h-3.5" /></div>;
    case 'comment_added':
      return <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0"><ChatIcon className="w-3.5 h-3.5" /></div>;
    case 'complaint_resolved':
      return <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0"><CheckCircleIcon className="w-3.5 h-3.5" /></div>;
    default:
      return <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0"><BellIcon className="w-3.5 h-3.5" /></div>;
  }
};

const Topbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const isDynamic = pathname.startsWith('/complaints/');
  const meta = isDynamic
    ? { title: 'Complaint Details', subtitle: 'Full complaint information and comments' }
    : (ROUTE_META[pathname] ?? { title: 'CampusConnect', subtitle: '' });

  const handleBellOpen = () => setBellOpen((o) => !o);

  const handleNotifClick = (notif) => {
    if (!notif.read) markRead(notif._id);
    setBellOpen(false);
  };

  return (
    <header className="topbar">
      {/* Left: mobile menu trigger + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border-2 border-[#3A0F34] bg-white shadow-[2px_2px_0px_#3A0F34] hover:bg-[#DDE3E8] text-[#3A0F34] shrink-0"
          aria-label="Open navigation"
          onClick={() => document.getElementById('mobile-menu-trigger')?.click()}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-black text-[#3A0F34] truncate font-display">{meta.title}</h1>
          {meta.subtitle && (
            <p className="text-xs font-semibold text-[#3A0F34]/70 truncate hidden sm:block">{meta.subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: notification bell + user info */}
      {user && (
        <div className="flex items-center gap-3 shrink-0">
          {/* Bell */}
          <div className="relative" ref={bellRef}>
            <button
              id="notif-bell"
              onClick={handleBellOpen}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg border-2 border-[#3A0F34] bg-white shadow-[2px_2px_0px_#3A0F34] hover:bg-[#DDE3E8] hover:translate-x-[1px] hover:translate-y-[1px] text-[#3A0F34] transition-all"
              aria-label="Notifications"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] text-[9px] font-black flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setBellOpen(false)} />
                <div className="absolute right-0 top-12 z-40 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-[6px_6px_0px_#3A0F34] border-2 border-[#3A0F34] overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#3A0F34] text-white border-b-2 border-[#3A0F34]">
                    <p className="text-xs font-black uppercase tracking-wider text-white">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-1.5 text-xs text-[#EAAA00]">({unreadCount} new)</span>
                      )}
                    </p>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-[#EAAA00] hover:text-white hover:underline font-black cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y-2 divide-[#3A0F34]/10">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center text-[#3A0F34]/60">
                        <BellIcon className="w-8 h-8 text-[#3A0F34]/40 mb-2" />
                        <p className="text-xs font-bold">No notifications yet</p>
                      </div>
                    ) : (
                      <>
                        {notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-[#DDE3E8]/30 transition-colors ${!n.read ? 'bg-[#EAAA00]/15' : ''}`}
                          >
                            {renderNotifIcon(n.type)}
                            <div className="min-w-0 flex-1">
                              {n.complaintId ? (
                                <Link
                                  to={`/complaints/${n.complaintId}`}
                                  onClick={() => handleNotifClick(n)}
                                  className="text-xs text-[#3A0F34] hover:underline font-bold leading-snug block"
                                >
                                  {n.message}
                                </Link>
                              ) : (
                                <p className="text-xs text-[#3A0F34] font-bold leading-snug">{n.message}</p>
                              )}
                              <p className="text-[10px] font-semibold text-[#3A0F34]/60 mt-0.5">
                                {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.read && (
                              <button
                                onClick={() => markRead(n._id)}
                                className="w-2.5 h-2.5 rounded-full bg-[#EAAA00] border border-[#3A0F34] shrink-0 mt-1.5"
                                title="Mark as read"
                              />
                            )}
                          </div>
                        ))}
                        <div className="p-2 bg-[#DDE3E8]/30 border-t-2 border-[#3A0F34]/15 text-center text-[10px] font-bold text-[#3A0F34]/70">
                          Live activity updates
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User info */}
          <div className="hidden sm:block text-right">
            <p className="text-xs font-black text-[#3A0F34]">{user.name}</p>
            <p className="text-[11px] font-bold capitalize text-[#3A0F34]/70">{user.department || user.role}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#3A0F34] text-[#EAAA00] border-2 border-[#3A0F34] shadow-[2px_2px_0px_#EAAA00] flex items-center justify-center text-xs font-black shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;
