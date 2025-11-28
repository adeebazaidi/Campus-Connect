import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link 
          to="/" 
          className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent hover:from-primary-700 hover:to-primary-900 transition-all duration-300"
        >
          CampusConnect
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="hidden md:block text-right">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs capitalize text-primary-600 font-medium">{user.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-md"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;


