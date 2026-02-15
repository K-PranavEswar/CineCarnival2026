import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, Ticket, Film, ShieldCheck, User } from "lucide-react";

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { name: "Movies", path: "/", icon: <Film size={18} /> },
    { name: "My Tickets", path: "/my-tickets", icon: <Ticket size={18} /> },
  ];

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 text-sm font-medium transition-all duration-200
     ${
       isActive
         ? "text-carnival-primary"
         : "text-slate-400 hover:text-white"
     }`;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0a0a0b] text-slate-100">

      {/* HEADER */}
      <header className="sticky top-0 z-[60] bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* LOGO */}
          <NavLink
            to="/"
            className="flex items-center gap-3 group select-none"
          >
            <div className="w-8 h-8 bg-carnival-primary rounded-lg rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-lg shadow-carnival-primary/40" />

            <span className="text-xl font-black tracking-tight">
              CINE
              <span className="text-carnival-primary ml-1">
                CARNIVAL
              </span>
            </span>
          </NavLink>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-6">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={navLinkClass}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink
                to="/admin"
                className="flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition"
              >
                <ShieldCheck size={18} />
                Admin
              </NavLink>
            )}

          </nav>

          {/* DESKTOP USER */}
          <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-5">

            <div className="text-right">

              <div className="text-xs font-semibold truncate max-w-[140px]">
                {user?.name || "Guest"}
              </div>

              <button
                onClick={handleLogout}
                className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-carnival-primary transition"
              >
                Sign Out
              </button>

            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center">
              <User size={18} className="text-slate-400" />
            </div>

          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[55] md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >

        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* PANEL */}
        <nav
          className={`absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-[#111] border-l border-white/10 p-8 flex flex-col gap-6 shadow-2xl transform transition-transform duration-300 ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >

          {/* USER */}
          <div className="flex items-center gap-4 pb-6 border-b border-white/5">

            <div className="w-12 h-12 rounded-full bg-carnival-primary/20 flex items-center justify-center">
              <User size={24} className="text-carnival-primary" />
            </div>

            <div>

              <div className="font-bold">
                {user?.name || "User"}
              </div>

              <div className="text-xs text-slate-500">
                {user?.email || ""}
              </div>

            </div>

          </div>

          {/* NAV ITEMS */}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-4 text-lg font-medium text-slate-300 hover:text-carnival-primary transition"
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className="flex items-center gap-4 text-lg font-medium text-amber-400"
            >
              <ShieldCheck />
              Admin Panel
            </NavLink>
          )}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-4 text-lg font-medium text-red-400 hover:text-red-300 transition"
          >
            <LogOut />
            Logout
          </button>

        </nav>

      </div>

      {/* MAIN */}
      <main className="flex-1">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>

      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-white/5 text-center text-slate-500 text-sm">
        © 2026 Cine Carnival. Developed by Pranav Eswar.
      </footer>

    </div>
  );
}
