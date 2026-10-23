const Loader = ({ className = '' }) => (
  <div className={`flex items-center justify-center py-16 ${className}`}>
    <div className="relative">
      <div className="w-9 h-9 rounded-full border-[3px] border-[#3A0F34]/20" />
      <div className="absolute inset-0 w-9 h-9 rounded-full border-[3px] border-[#3A0F34] border-t-[#EAAA00] animate-spin" />
    </div>
  </div>
);

export default Loader;
