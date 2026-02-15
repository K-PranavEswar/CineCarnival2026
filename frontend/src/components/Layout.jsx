import { Outlet } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col min-h-[100dvh]">
      <header className="sticky top-0 z-50 bg-carnival-dark/95 backdrop-blur border-b border-white/10 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-14 sm:h-16 gap-2">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <span className="text-lg sm:text-2xl font-bold text-carnival-primary truncate">Cine Carnival</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link to="/" className="text-xs sm:text-sm font-medium text-white/90 hover:text-white transition py-2 px-1 sm:px-2">
              Movies
            </Link>
            <Link to="/my-tickets" className="text-xs sm:text-sm font-medium text-white/90 hover:text-white transition py-2 px-1 sm:px-2">
              My Tickets
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-xs sm:text-sm font-medium text-amber-400 hover:text-amber-300 transition py-2 px-1 sm:px-2">
                Admin
              </Link>
            )}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-white/10">
              <span className="text-xs sm:text-sm text-white/70 max-w-[80px] sm:max-w-none truncate" title={user?.name}>
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm font-medium text-white/80 hover:text-carnival-primary transition py-2 px-1 sm:px-2 touch-manipulation"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
