import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentBox from '../components/CommentBox';
import Loader from '../components/Loader';
import api from '../utils/api';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComplaint = async () => {
    const { data } = await api.get(`/api/complaints/${id}`);
    setComplaint(data.complaint);
    setComments(data.comments);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await fetchComplaint();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      const { data } = await api.post(`/api/comments/${id}`, { message });
      setComments((prev) => [...prev, data]);
      setMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loader />;
  if (!complaint)
    return (
      <p className="text-center text-sm text-red-500">
        Complaint could not be loaded.
      </p>
    );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              {complaint.category}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              {complaint.title}
            </h1>
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
        <p className="mt-4 whitespace-pre-line text-slate-600">
          {complaint.description}
        </p>

        <div className="mt-6 grid gap-4 text-sm text-slate-500 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-600">Created by</p>
            <p>{complaint.createdBy?.name}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-600">Assigned to</p>
            <p>{complaint.assignedTo?.name || 'Not assigned'}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-600">Created on</p>
            <p>{new Date(complaint.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-600">Updated on</p>
            <p>{new Date(complaint.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        {complaint.attachments?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-600">Attachments</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {complaint.attachments.map((file) => (
                <a
                  key={file.publicId}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-primary hover:bg-primary/10"
                >
                  {file.publicId}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-slate-800 mb-6">💬 Comments</h2>
        <form className="flex gap-3" onSubmit={handleComment}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a comment..."
            className="input-field flex-1"
          />
          <button
            type="submit"
            className="btn-primary px-6"
          >
            Send
          </button>
        </form>

        <div className="mt-4 space-y-3">
          {comments.length === 0 && (
            <p className="text-sm text-slate-500">No comments yet.</p>
          )}
          {comments.map((comment) => (
            <CommentBox key={comment._id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;


