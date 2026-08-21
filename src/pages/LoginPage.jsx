import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const redirectTo = location.state?.from?.pathname ?? '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-brand-red text-white rounded-lg flex items-center justify-center mb-3">
            <Lock size={22} />
          </div>
          <h1 className="text-lg font-bold">Admin Login</h1>
          <p className="text-xs text-gray-500">Ferentino Price List</p>
        </div>

        <label className="block text-xs font-semibold text-gray-600 mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4 outline-none focus:border-brand-red"
          autoFocus
        />

        <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4 outline-none focus:border-brand-red"
        />

        {error && <p className="text-xs text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-brand-red text-white rounded-md py-2 text-sm font-semibold hover:bg-brand-redDark transition-colors"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
