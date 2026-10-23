const CommentBox = ({ comment }) => {
  const initials = comment.userId?.name?.charAt(0).toUpperCase() ?? '?';
  const isStaff = comment.userId?.role === 'staff' || comment.userId?.role === 'admin';

  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34] flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
          isStaff ? 'bg-[#EAAA00] text-[#3A0F34]' : 'bg-[#DDE3E8] text-[#3A0F34]'
        }`}
      >
        {initials}
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black text-[#3A0F34]">{comment.userId?.name}</span>
          {isStaff && (
            <span className="text-[10px] font-black bg-[#3A0F34] text-white px-2 py-0.2 rounded-full capitalize border border-[#3A0F34]">
              {comment.userId?.role}
            </span>
          )}
          <span className="text-[11px] font-bold text-[#3A0F34]/60 ml-auto shrink-0">
            {new Date(comment.createdAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
        <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed text-[#3A0F34] border-2 border-[#3A0F34] shadow-[2px_2px_0px_#3A0F34] ${
          isStaff ? 'bg-[#EAAA00]/15' : 'bg-white'
        }`}>
          {comment.message}
        </div>
      </div>
    </div>
  );
};

export default CommentBox;
