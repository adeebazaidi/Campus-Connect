import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentBox from '../components/CommentBox';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import {
  PencilIcon,
  UserIcon,
  ArrowRightLeftIcon,
  ArrowPathIcon,
  ChatIcon,
  CheckCircleIcon,
  TrashIcon,
  WarningIcon,
  ClipboardIcon,
} from '../components/Icons';

const CATEGORY_COLORS = {
  infrastructure: 'bg-orange-50 text-orange-700',
  academics:      'bg-blue-50 text-blue-700',
  hostel:         'bg-purple-50 text-purple-700',
  finance:        'bg-green-50 text-green-700',
  other:          'bg-slate-50 text-slate-600',
};

const TIMELINE_ICONS = {
  created:        { Icon: PencilIcon,         color: 'bg-slate-100 text-slate-600' },
  assigned:       { Icon: UserIcon,           color: 'bg-blue-100 text-blue-600' },
  reassigned:     { Icon: ArrowRightLeftIcon, color: 'bg-indigo-100 text-indigo-600' },
  status_changed: { Icon: ArrowPathIcon,      color: 'bg-amber-100 text-amber-600' },
  comment_added:  { Icon: ChatIcon,           color: 'bg-purple-100 text-purple-600' },
  resolved:       { Icon: CheckCircleIcon,    color: 'bg-emerald-100 text-emerald-600' },
  deleted:        { Icon: TrashIcon,          color: 'bg-red-100 text-red-600' },
};

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [complaint,      setComplaint]      = useState(null);
  const [comments,       setComments]       = useState([]);
  const [timeline,       setTimeline]       = useState([]);
  const [staffList,      setStaffList]      = useState([]);
  const [message,        setMessage]        = useState('');
  const [loading,        setLoading]        = useState(true);
  const [sending,        setSending]        = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning,      setAssigning]      = useState(false);
  const [loadError,      setLoadError]      = useState('');
  const commentsEndRef = useRef(null);

  const fetchComplaint = useCallback(async () => {
    const { data } = await api.get(`/api/complaints/${id}`);
    setComplaint(data.complaint);
    setComments(data.comments  ?? []);
    setTimeline(data.timeline  ?? []);
  }, [id]);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchComplaint();
        if (user?.role === 'admin') {
          const { data: users } = await api.get('/api/admin/users');
          setStaffList(users.filter((u) => u.role === 'staff'));
        }
      } catch (err) {
        setLoadError(err.response?.data?.message || 'Could not load complaint.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, user?.role, fetchComplaint]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`/api/comments/${id}`, { message });
      setComments((prev) => [...prev, data]);
      setTimeline((prev) => [
        ...prev,
        {
          _id: `opt-${Date.now()}`,
          type: 'comment_added',
          label: user?.role === 'student' ? 'Comment added' : 'Staff reply added',
          actorId: { name: user?.name, role: user?.role },
          createdAt: new Date().toISOString(),
        },
      ]);
      setMessage('');
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post comment.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!newStatus || newStatus === complaint?.status || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/api/complaints/${id}/status`, { status: newStatus });
      addToast(`Status updated to ${newStatus.replace('-', ' ')}.`);
      await fetchComplaint();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignChange = async (staffId) => {
    if (!staffId || staffId === complaint?.assignedTo?._id || assigning) return;
    setAssigning(true);
    try {
      const { data } = await api.patch(`/api/complaints/${id}/assign`, { assignedTo: staffId });
      addToast('Staff assigned successfully.');
      const staffObj =
        data.assignedTo && typeof data.assignedTo === 'object' && data.assignedTo.name
          ? data.assignedTo
          : staffList.find((s) => s._id === staffId) || { _id: staffId, name: 'Staff' };
      setComplaint((prev) => ({
        ...prev,
        assignedTo: staffObj,
        status: data.status || (prev.status === 'pending' ? 'in-progress' : prev.status),
      }));
      await fetchComplaint();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to assign staff.', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    try {
      await api.delete(`/api/complaints/${id}`);
      addToast('Complaint deleted.');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  if (loading) return <Loader />;

  if (loadError) {
    return (
      <div className="empty-state max-w-md mx-auto mt-8">
        <WarningIcon className="w-8 h-8 text-amber-500 mb-2" />
        <p className="empty-state-title">Cannot load complaint</p>
        <p className="empty-state-body">{loadError}</p>
        <button onClick={() => navigate('/')} className="btn-secondary btn-sm mt-4">← Back to Dashboard</button>
      </div>
    );
  }

  if (!complaint) return null;

  const isOwner =
    complaint.createdBy?._id === user?._id ||
    complaint.createdBy?._id?.toString() === user?._id?.toString() ||
    complaint.createdBy === user?._id;

  const isAssigned =
    complaint.assignedTo &&
    (complaint.assignedTo._id === user?._id ||
      complaint.assignedTo._id?.toString() === user?._id?.toString() ||
      complaint.assignedTo === user?._id);

  const canDelete = user?.role === 'admin' || isOwner;
  const canUpdateStatus = user?.role === 'admin' || isAssigned;
  const canAssign = user?.role === 'admin';

  return (
    <div className="w-full max-w-5xl space-y-4 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm -ml-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Main card */}
      <div className="card space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md capitalize ${CATEGORY_COLORS[complaint.category] ?? 'bg-slate-50 text-slate-600'}`}>
                {complaint.category}
              </span>
              <StatusBadge status={complaint.status} />
            </div>
            <h1 className="text-lg font-bold text-slate-800 leading-snug">{complaint.title}</h1>
          </div>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700 shrink-0"
              title="Delete complaint"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Management toolbar for Admin and Assigned Staff */}
        {(canUpdateStatus || canAssign) && (
          <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            {canUpdateStatus && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Update Status:</label>
                <select
                  value={complaint.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="input-field text-xs py-1 w-32 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            )}
            {canAssign && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Assign Staff:</label>
                <select
                  value={complaint.assignedTo?._id || ''}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  disabled={assigning}
                  className="input-field text-xs py-1 bg-white"
                >
                  <option value="">Select staff member…</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.department || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="border-t border-slate-100 pt-4">
          <p className="whitespace-pre-line text-sm text-slate-600 leading-relaxed">{complaint.description}</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Created by</p>
            <p className="text-sm text-slate-700 mt-0.5">{complaint.createdBy?.name ?? '—'}</p>
            {complaint.createdBy?.department && (
              <p className="text-[11px] text-slate-400">{complaint.createdBy.department}</p>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Assigned to</p>
            <p className="text-sm text-slate-700 mt-0.5">{complaint.assignedTo?.name ?? 'Unassigned'}</p>
            {complaint.assignedTo?.email && (
              <p className="text-[11px] text-slate-400">{complaint.assignedTo.email}</p>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Submitted</p>
            <p className="text-sm text-slate-700 mt-0.5">
              {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Last updated</p>
            <p className="text-sm text-slate-700 mt-0.5">
              {new Date(complaint.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Attachments */}
        {complaint.attachments?.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {complaint.attachments.map((file, idx) => (
                <a
                  key={file.publicId ?? idx}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-primary-600 font-medium hover:bg-primary-50 hover:border-primary-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {file.publicId ?? `File ${idx + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="card space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Activity Timeline</h2>
        {timeline.length === 0 ? (
          <div className="py-6 text-center text-slate-400">
            <ClipboardIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs">No activity recorded for this complaint.</p>
            <p className="text-[11px] text-slate-300 mt-1">Events from status updates and comments will appear here.</p>
          </div>
        ) : (
          <ol className="relative border-l border-slate-200 ml-2 space-y-4">
            {timeline.map((event) => {
              const meta = TIMELINE_ICONS[event.type] ?? { Icon: ArrowPathIcon, color: 'bg-slate-100 text-slate-500' };
              const IconComp = meta.Icon;
              return (
                <li key={event._id} className="ml-4">
                  <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full text-xs ${meta.color} ring-2 ring-white`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </span>
                  <div className="pl-1">
                    <p className="text-xs font-semibold text-slate-700">{event.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {event.actorId?.name && (
                        <span className="text-[11px] text-slate-500">by {event.actorId.name}</span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {new Date(event.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Comments section */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Comments & Discussion
            {comments.length > 0 && (
              <span className="ml-2 text-xs font-semibold text-slate-400">({comments.length})</span>
            )}
          </h2>
        </div>

        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <div className="empty-state py-8">
              <ChatIcon className="w-8 h-8 text-slate-300 mb-2" />
              <p className="empty-state-title">No comments yet</p>
              <p className="empty-state-body">Be the first to leave a comment or update.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentBox key={comment._id} comment={comment} />
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        <form onSubmit={handleComment} className="flex gap-2 border-t border-slate-100 pt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a comment or reply…"
            className="input-field flex-1"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="btn-primary btn-sm shrink-0"
          >
            {sending ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintDetails;
