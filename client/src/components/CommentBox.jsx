const CommentBox = ({ comment }) => (
  <div className="rounded-xl border-2 border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 text-sm shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs">
          {comment.userId.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-slate-800">{comment.userId.name}</p>
          <p className="text-xs text-primary-600 font-medium capitalize">{comment.userId.role}</p>
        </div>
      </div>
      <span className="text-xs text-slate-400">
        {new Date(comment.createdAt).toLocaleString()}
      </span>
    </div>
    <p className="text-slate-700 leading-relaxed">{comment.message}</p>
  </div>
);

export default CommentBox;


