import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const data = await api('/auth/me');
      setUser(data.user);
      setSettings(data.settings);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMe(); }, []);

  const login = async (username, password) => {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    localStorage.setItem('token', data.access_token);
    await loadMe();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, settings, setSettings, loading, login, logout, refresh: loadMe }}>{children}</AuthContext.Provider>;
}
