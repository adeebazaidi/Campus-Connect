import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-4 text-center">
    <p className="text-8xl font-black text-primary">404</p>
    <p className="text-lg text-slate-600">
      Oops, the page you are looking for does not exist.
    </p>
    <Link
      to="/"
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
    >
      Back to dashboard
    </Link>
  </div>
);

export default NotFound;


