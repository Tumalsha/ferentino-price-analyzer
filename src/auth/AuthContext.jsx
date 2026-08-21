import { createContext, useContext, useState } from 'react';

const SESSION_KEY = 'ferentino-admin-session';
const TOKEN_KEY = 'ferentino-admin-token';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(sessionStorage.getItem(TOKEN_KEY)));

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, error: result.error || `Login failed (${response.status})` };
      const { token } = result;
      if (!token) return { success: false, error: 'Login response did not include a token.' };
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to connect to the authentication server.' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
