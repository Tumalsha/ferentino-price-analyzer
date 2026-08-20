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
    <header className="bg-brand-red text-white flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white text-brand-red font-bold rounded-md flex items-center justify-center text-lg">
          F
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">FERENTINO — Retail Price List</h1>
          <p className="text-xs text-white/80 leading-tight">Horana-Ferentino Tyre Corporation (Pvt) Ltd.</p>
        </div>
      </div>

      <nav className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
        <NavLink to="/" end className={navClass}>
          View
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

      <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm">
        <Phone size={16} />
        <span>Hotline</span>
        <span className="font-semibold">071 146 8888</span>
      </div>
    </header>
  );
}
