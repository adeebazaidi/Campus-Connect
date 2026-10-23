const CommentBox = ({ comment }) => {
  const initials = comment.userId?.name?.charAt(0).toUpperCase() ?? '?';
  const isStaff = comment.userId?.role === 'staff' || comment.userId?.role === 'admin';

  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
          isStaff ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}
      >
        {initials}
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-800">{comment.userId?.name}</span>
          {isStaff && (
            <span className="text-[10px] font-semibold bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-full capitalize">
              {comment.userId?.role}
            </span>
          )}
          <span className="text-[11px] text-slate-400 ml-auto shrink-0">
            {new Date(comment.createdAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
        <div className={`rounded-xl px-3 py-2 text-sm text-slate-700 leading-relaxed ${
          isStaff ? 'bg-primary-50 border border-primary-100' : 'bg-slate-50 border border-slate-100'
        }`}>
          {comment.message}
        </div>
      </div>
    </div>
  );
};

export default CommentBox;
