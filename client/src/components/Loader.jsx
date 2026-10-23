const Loader = ({ className = '' }) => (
  <div className={`flex items-center justify-center py-16 ${className}`}>
    <div className="relative">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200" />
      <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
    </div>
  </div>
);

export default Loader;
