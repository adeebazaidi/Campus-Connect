import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const CATEGORY_COLORS = {
  infrastructure: 'bg-orange-50 text-orange-700',
  academics:      'bg-blue-50 text-blue-700',
  hostel:         'bg-purple-50 text-purple-700',
  finance:        'bg-green-50 text-green-700',
  other:          'bg-slate-50 text-slate-600',
};

const ComplaintCard = ({ complaint }) => (
  <article className="card-hover flex flex-col gap-3 animate-fade-in">
    {/* Header row */}
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-800 leading-tight truncate">
          {complaint.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>
      </div>
      <StatusBadge status={complaint.status} />
    </div>

    {/* Footer row */}
    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md capitalize ${CATEGORY_COLORS[complaint.category] ?? 'bg-slate-50 text-slate-600'}`}>
          {complaint.category}
        </span>
        <span className="text-[11px] text-slate-400">
          {new Date(complaint.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </span>
      </div>
      <Link
        to={`/complaints/${complaint._id}`}
        className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
      >
        Details
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </article>
);

export default ComplaintCard;
