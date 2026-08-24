import { Phone, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-white text-brand-red' : 'text-white/85 hover:bg-white/15'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-brand-red text-white flex flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <img
  src="/ferentino-logo.png"
  alt="Ferentino Tyre Corporation logo"
  className="w-10 h-10 shrink-0 rounded-md object-contain bg-white"
/>
        <div className="min-w-0">
          <h1 className="font-bold text-base leading-tight sm:text-lg">FERENTINO — Retail Price List</h1>
          <p className="text-xs text-white/80 leading-tight truncate">Horana-Ferentino Tyre Corporation (Pvt) Ltd.</p>
        </div>
      </div>

      <nav className="flex w-full items-center gap-1 overflow-x-auto bg-white/10 rounded-lg p-1 lg:w-auto">
        <NavLink to="/" end className={navClass}>
          Dashboard
        </NavLink>
        <NavLink to="/prices" className={navClass}>
          Price List
        </NavLink>
        <NavLink to="/admin" className={navClass}>
          Admin
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/admin/landing-price" className={navClass}>
            Landing Price
          </NavLink>
        )}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-white/85 hover:bg-white/15 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        )}
      </nav>

      <div className="flex items-center gap-2 self-start bg-white/15 rounded-full px-3 py-2 text-xs sm:text-sm lg:self-auto">
        <Phone size={16} />
        <span>Hotline</span>
        <span className="font-semibold">071 146 8888</span>
      </div>
    </header>
  );
}
