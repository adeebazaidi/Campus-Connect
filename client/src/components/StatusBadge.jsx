/** Reusable Neo-Brutalist status badge component */
const statusConfig = {
  pending: {
    cls: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-black bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]',
    label: 'Pending',
    dot: 'bg-[#3A0F34]',
  },
  'in-progress': {
    cls: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-black bg-[#DDE3E8] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]',
    label: 'In Progress',
    dot: 'bg-[#3A0F34]',
  },
  resolved: {
    cls: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-black bg-emerald-300 text-[#3A0F34] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]',
    label: 'Resolved',
    dot: 'bg-[#3A0F34]',
  },
};

export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] ?? {
    cls: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-black bg-white text-[#3A0F34] border-2 border-[#3A0F34] shadow-[1.5px_1.5px_0px_#3A0F34]',
    label: status,
    dot: 'bg-[#3A0F34]',
  };
  return (
    <span className={cfg.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
