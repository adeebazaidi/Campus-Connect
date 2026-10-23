import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-[#DDE3E8] flex items-center justify-center px-4">
    <div className="bg-white p-8 rounded-2xl border-2 border-[#3A0F34] shadow-[6px_6px_0px_#3A0F34] text-center max-w-sm animate-fade-in">
      <p className="text-7xl font-black text-[#EAAA00] font-display" style={{ textShadow: '3px 3px 0px #3A0F34' }}>
        404
      </p>
      <h1 className="text-xl font-black text-[#3A0F34] font-display mt-3 mb-1">Page not found</h1>
      <p className="text-xs font-bold text-[#3A0F34]/70 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary btn-sm inline-flex">← Back to Dashboard</Link>
    </div>
  </div>
);

export default NotFound;
