import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="text-center animate-fade-in">
      <p className="text-6xl font-extrabold text-slate-200 mb-2">404</p>
      <h1 className="text-xl font-bold text-slate-800 mb-1">Page not found</h1>
      <p className="text-sm text-slate-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary btn-sm">← Back to Dashboard</Link>
    </div>
  </div>
);

export default NotFound;
