import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('abesec_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('abesec_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('abesec_token')));

  useEffect(() => {
    let active = true;
    async function verifySession() {
      const storedToken = localStorage.getItem('abesec_token');
      if (!storedToken) {
        if (active) setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (active && data?.user) {
          setUser(data.user);
          localStorage.setItem('abesec_user', JSON.stringify(data.user));
        }
      } catch {
        if (active) {
          localStorage.removeItem('abesec_token');
          localStorage.removeItem('abesec_user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    verifySession();
    return () => {
      active = false;
    };
  }, []);

  function saveAuth(nextToken, nextUser) {
    localStorage.setItem('abesec_token', nextToken);
    localStorage.setItem('abesec_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    saveAuth(data.token, data.user);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    saveAuth(data.token, data.user);
    return data.user;
  }

  async function logout() {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignore network errors on stateless logout
    } finally {
      localStorage.removeItem('abesec_token');
      localStorage.removeItem('abesec_user');
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
