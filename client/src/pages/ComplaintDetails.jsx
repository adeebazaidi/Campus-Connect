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
  infrastructure: 'bg-[#EAAA00] text-[#3A0F34] border border-[#3A0F34]',
  academics:      'bg-[#DDE3E8] text-[#3A0F34] border border-[#3A0F34]',
  hostel:         'bg-purple-200 text-[#3A0F34] border border-[#3A0F34]',
  finance:        'bg-emerald-200 text-[#3A0F34] border border-[#3A0F34]',
  other:          'bg-white text-[#3A0F34] border border-[#3A0F34]',
};

const TIMELINE_ICONS = {
  created:        { Icon: PencilIcon,         color: 'bg-white text-[#3A0F34]' },
  assigned:       { Icon: UserIcon,           color: 'bg-[#DDE3E8] text-[#3A0F34]' },
  reassigned:     { Icon: ArrowRightLeftIcon, color: 'bg-indigo-100 text-[#3A0F34]' },
  status_changed: { Icon: ArrowPathIcon,      color: 'bg-[#EAAA00] text-[#3A0F34]' },
  comment_added:  { Icon: ChatIcon,           color: 'bg-purple-100 text-[#3A0F34]' },
  resolved:       { Icon: CheckCircleIcon,    color: 'bg-emerald-300 text-[#3A0F34]' },
  deleted:        { Icon: TrashIcon,          color: 'bg-rose-200 text-rose-900' },
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

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const { data } = await api.patch(`/api/complaints/${id}/status`, { status: newStatus });
      setComplaint((prev) => ({ ...prev, status: newStatus }));
      addToast(`Status updated to ${newStatus}.`);
      await fetchComplaint();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignChange = async (newStaffId) => {
    if (!newStaffId) return;
    setAssigning(true);
    try {
      const { data } = await api.patch(`/api/complaints/${id}/assign`, { assignedTo: newStaffId });
      const staffObj =
        data.assignedTo && typeof data.assignedTo === 'object' && data.assignedTo.name
          ? data.assignedTo
          : staffList.find((s) => s._id === newStaffId) || { _id: newStaffId, name: 'Staff' };

      setComplaint((prev) => ({
        ...prev,
        assignedTo: staffObj,
        status: data.status || prev.status,
      }));
      addToast('Complaint assigned successfully.');
      await fetchComplaint();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to assign complaint.', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/api/complaints/${id}/comments`, { message });
      setComments((prev) => [...prev, data]);
      setMessage('');
      await fetchComplaint();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post comment.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint? This cannot be undone.')) return;
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
        <WarningIcon className="w-10 h-10 text-[#3A0F34] mb-2" />
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
    <div className="w-full space-y-5 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-secondary btn-sm inline-flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Main card */}
      <div className="card space-y-4 bg-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${CATEGORY_COLORS[complaint.category] ?? 'bg-[#DDE3E8] text-[#3A0F34] border border-[#3A0F34]'}`}>
                {complaint.category}
              </span>
              <StatusBadge status={complaint.status} />
            </div>
            <h1 className="text-xl font-black text-[#3A0F34] leading-snug font-display">{complaint.title}</h1>
          </div>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg border-2 border-[#3A0F34] text-rose-600 bg-white hover:bg-rose-50 shadow-[2px_2px_0px_#3A0F34] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#3A0F34] transition-all shrink-0 cursor-pointer"
              title="Delete complaint"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Management toolbar for Admin and Assigned Staff */}
        {(canUpdateStatus || canAssign) && (
          <div className="flex flex-wrap items-center gap-4 p-3.5 bg-[#DDE3E8]/40 border-2 border-[#3A0F34] rounded-xl shadow-[2px_2px_0px_#3A0F34]">
            {canUpdateStatus && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-[#3A0F34]">Update Status:</label>
                <select
                  value={complaint.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="select-sm py-1.5 px-3 pr-7 w-36 capitalize font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            )}
            {canAssign && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-[#3A0F34]">Assign Staff:</label>
                <select
                  value={complaint.assignedTo?._id || ''}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  disabled={assigning}
                  className="select-sm py-1.5 px-3 pr-7 font-bold"
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
        <div className="border-t-2 border-[#3A0F34]/15 pt-4">
          <p className="whitespace-pre-line text-sm text-[#3A0F34] leading-relaxed font-medium">{complaint.description}</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 border-t-2 border-[#3A0F34]/15 pt-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#3A0F34]/60">Created by</p>
            <p className="text-sm font-black text-[#3A0F34] mt-0.5">{complaint.createdBy?.name ?? '—'}</p>
            {complaint.createdBy?.department && (
              <p className="text-[11px] font-bold text-[#3A0F34]/60">{complaint.createdBy.department}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#3A0F34]/60">Assigned to</p>
            <p className="text-sm font-black text-[#3A0F34] mt-0.5">{complaint.assignedTo?.name ?? 'Unassigned'}</p>
            {complaint.assignedTo?.email && (
              <p className="text-[11px] font-bold text-[#3A0F34]/60">{complaint.assignedTo.email}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#3A0F34]/60">Submitted</p>
            <p className="text-sm font-black text-[#3A0F34] mt-0.5">
              {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#3A0F34]/60">Last updated</p>
            <p className="text-sm font-black text-[#3A0F34] mt-0.5">
              {new Date(complaint.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Attachments */}
        {complaint.attachments?.length > 0 && (
          <div className="border-t-2 border-[#3A0F34]/15 pt-4">
            <p className="text-xs font-black uppercase tracking-wider text-[#3A0F34] mb-2.5">Attachments</p>
            <div className="flex flex-wrap gap-2.5">
              {complaint.attachments.map((file, idx) => (
                <a
                  key={file.publicId ?? idx}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border-2 border-[#3A0F34] bg-white px-3 py-1.5 text-xs text-[#3A0F34] font-black shadow-[2px_2px_0px_#3A0F34] hover:bg-[#EAAA00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#3A0F34] transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
      <div className="card space-y-3 bg-white">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#3A0F34] font-display">Activity Timeline</h2>
        {timeline.length === 0 ? (
          <div className="py-6 text-center text-[#3A0F34]/50">
            <ClipboardIcon className="w-8 h-8 text-[#3A0F34]/30 mx-auto mb-2" />
            <p className="text-xs font-bold">No activity recorded for this complaint.</p>
            <p className="text-[11px] font-medium text-[#3A0F34]/50 mt-1">Events from status updates and comments will appear here.</p>
          </div>
        ) : (
          <ol className="relative border-l-2 border-[#3A0F34] ml-3 space-y-4 my-2">
            {timeline.map((event) => {
              const meta = TIMELINE_ICONS[event.type] ?? { Icon: ArrowPathIcon, color: 'bg-white text-[#3A0F34]' };
              const IconComp = meta.Icon;
              return (
                <li key={event._id} className="ml-5">
                  <span className={`absolute -left-[14px] flex items-center justify-center w-6 h-6 rounded-lg text-xs ${meta.color} border-2 border-[#3A0F34] shadow-[1px_1px_0px_#3A0F34]`}>
                    <IconComp className="w-3 h-3" />
                  </span>
                  <div className="pl-1">
                    <p className="text-xs font-black text-[#3A0F34]">{event.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {event.actorId?.name && (
                        <span className="text-[11px] font-bold text-[#3A0F34]/70">by {event.actorId.name}</span>
                      )}
                      <span className="text-[11px] font-semibold text-[#3A0F34]/50">
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
      <div className="card space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#3A0F34] font-display">
            Comments & Discussion
            {comments.length > 0 && (
              <span className="ml-2 text-xs font-bold text-[#3A0F34]/60">({comments.length})</span>
            )}
          </h2>
        </div>

        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <div className="empty-state py-8">
              <ChatIcon className="w-8 h-8 text-[#3A0F34]/30 mb-2" />
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

        <form onSubmit={handleComment} className="flex gap-2.5 border-t-2 border-[#3A0F34]/15 pt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a comment or reply…"
            className="input-field flex-1 font-bold"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="btn-primary btn-sm shrink-0"
          >
            {sending ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[#3A0F34] border-t-transparent animate-spin" />
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
