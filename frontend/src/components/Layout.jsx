import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, Ticket, Film, ShieldCheck, User } from "lucide-react";

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { name: "Movies", path: "/", icon: <Film size={20} /> },
    { name: "My Tickets", path: "/my-tickets", icon: <Ticket size={20} /> },
  ];

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 text-sm font-semibold transition-all duration-300 px-3 py-2 rounded-lg
     ${isActive 
       ? "text-white bg-white/10 shadow-sm" 
       : "text-slate-400 hover:text-white hover:bg-white/5"}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b] text-slate-100 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-[60] bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* LOGO */}
          <NavLink to="/" className="flex items-center gap-3 group select-none">
            <div className="w-10 h-10 bg-carnival-primary rounded-xl rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-carnival-primary/30 flex items-center justify-center">
               <Film className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">
              CINE <span className="text-carnival-primary">CARNIVAL</span>
            </span>
          </NavLink>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={navLinkClass}>
                {item.icon}
                {item.name}
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink
                to="/admin"
                className="ml-2 flex items-center gap-2 text-sm font-semibold text-amber-400 hover:bg-amber-400/10 px-3 py-2 rounded-lg transition"
              >
                <ShieldCheck size={20} />
                Admin
              </NavLink>
            )}
          </nav>

          {/* DESKTOP USER PROFILE */}
          <div className="hidden md:flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold leading-none">{user?.name || "Guest User"}</span>
              <button 
                onClick={handleLogout}
                className="text-[11px] font-bold text-slate-500 hover:text-carnival-primary uppercase tracking-widest mt-1"
              >
                Logout
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
              <User size={20} className="text-slate-400" />
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isMobileMenuOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Side Panel */}
        <nav className={`absolute right-0 top-0 bottom-0 w-[300px] bg-[#111] border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-500 ease-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          {/* SIDEBAR HEADER - FIX FOR ALIGNMENT */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-white/5 bg-[#0d0d0e]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-carnival-primary rounded shadow-sm shadow-carnival-primary/50" />
              <span className="font-black text-sm tracking-tighter uppercase italic">
                CINE <span className="text-carnival-primary">CARNIVAL</span>
              </span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* USER INFO SECTION */}
          <div className="px-6 py-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-carnival-primary flex items-center justify-center shadow-lg shadow-carnival-primary/20 shrink-0">
                <User size={24} className="text-white" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-white text-base truncate">{user?.name || "User"}</span>
                <span className="text-xs text-slate-500 truncate">{user?.email || "No email available"}</span>
              </div>
            </div>
          </div>

          {/* MENU ITEMS */}
          <div className="px-4 py-6 flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({isActive}) => `flex items-center gap-4 px-4 py-4 rounded-xl text-base font-semibold transition-all duration-300 ${isActive ? "bg-carnival-primary text-white shadow-lg shadow-carnival-primary/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                {item.icon}
                <span className="uppercase tracking-wider text-sm">{item.name}</span>
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink to="/admin" className="flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold text-amber-400 hover:bg-amber-400/5 transition-all">
                <ShieldCheck size={20}/> ADMIN PANEL
              </NavLink>
            )}
          </div>

          {/* LOGOUT AT BOTTOM */}
          <div className="mt-auto p-6 border-t border-white/5 bg-[#0d0d0e]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all duration-300"
            >
              <LogOut size={20} />
              SIGN OUT
            </button>
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm font-medium tracking-wide">
                &copy; 2026 <span className="text-slate-300 uppercase">Cine Carnival</span>. 
                <span className="hidden sm:inline"> Crafted by </span>
                <span className="text-carnival-primary">Pranav Eswar</span>.
            </p>
        </div>
      </footer>
    </div>
  );
}