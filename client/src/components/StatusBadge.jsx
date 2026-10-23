/** Reusable status badge component */
const statusConfig = {
  pending:     { cls: 'badge-pending',     label: 'Pending',     dot: 'bg-amber-400' },
  'in-progress': { cls: 'badge-in-progress', label: 'In Progress', dot: 'bg-blue-400' },
  resolved:    { cls: 'badge-resolved',    label: 'Resolved',    dot: 'bg-emerald-400' },
};

export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] ?? { cls: 'badge bg-slate-100 text-slate-600 ring-1 ring-slate-200', label: status, dot: 'bg-slate-400' };
  return (
    <span className={cfg.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
