import { Link } from 'react-router-dom';

const statusColors = {
  pending: 'text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200',
  'in-progress': 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200',
  resolved: 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200',
};

const ComplaintCard = ({ complaint }) => (
  <article className="card group hover:scale-[1.02] transition-all duration-300 animate-slide-up">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
          {complaint.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 leading-relaxed">
          {complaint.description}
        </p>
      </div>
      <span
        className={`status-badge border-2 ${
          statusColors[complaint.status] || 'text-slate-700 bg-slate-50 border-slate-200'
        }`}
      >
        {complaint.status}
      </span>
    </div>
    <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>📅</span>
        <span>{new Date(complaint.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}</span>
      </div>
      <Link
        to={`/complaints/${complaint._id}`}
        className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 group/link"
      >
        View details
        <span className="group-hover/link:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  </article>
);

export default ComplaintCard;


