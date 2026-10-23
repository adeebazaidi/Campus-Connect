import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const CATEGORY_COLORS = {
  infrastructure: 'bg-[#EAAA00] text-[#3A0F34] border border-[#3A0F34]',
  academics:      'bg-[#DDE3E8] text-[#3A0F34] border border-[#3A0F34]',
  hostel:         'bg-purple-200 text-[#3A0F34] border border-[#3A0F34]',
  finance:        'bg-emerald-200 text-[#3A0F34] border border-[#3A0F34]',
  other:          'bg-white text-[#3A0F34] border border-[#3A0F34]',
};

const ComplaintCard = ({ complaint }) => (
  <article className="card-hover flex flex-col justify-between gap-3 animate-fade-in bg-white">
    {/* Header row */}
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-sm font-black text-[#3A0F34] leading-snug line-clamp-1 font-display">
          {complaint.title}
        </h3>
        <StatusBadge status={complaint.status} />
      </div>
      <p className="mt-1 text-xs text-[#3A0F34]/80 line-clamp-2 leading-relaxed font-medium">
        {complaint.description}
      </p>
    </div>

    {/* Footer row */}
    <div className="flex items-center justify-between pt-3 border-t-2 border-[#3A0F34]/15 mt-1">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${CATEGORY_COLORS[complaint.category] ?? 'bg-[#DDE3E8] text-[#3A0F34] border border-[#3A0F34]'}`}>
          {complaint.category}
        </span>
        <span className="text-[11px] font-bold text-[#3A0F34]/60">
          {new Date(complaint.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </span>
      </div>
      <Link
        to={`/complaints/${complaint._id}`}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[2px_2px_0px_#3A0F34] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#3A0F34] transition-all"
      >
        Details
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </article>
);

export default ComplaintCard;
