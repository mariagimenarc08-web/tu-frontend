import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchUser();
    else setLoading(false);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/perfil', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch {
      logout();
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesion');
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.usuario);
    return data.usuario;
  };

  const register = async (data) => {
    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, email: data.email.toLowerCase().trim() })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || (result.errores?.join(', ')) || 'Error al registrarse');
    localStorage.setItem('token', result.token);
    setToken(result.token);
    setUser(result.usuario);
    return result.usuario;
  };

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/perfil', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUser(await res.json());
    } catch (e) { console.error(e); }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
