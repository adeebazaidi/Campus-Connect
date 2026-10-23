import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cc_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistToken = (value) => {
    setToken(value);
    if (value) {
      localStorage.setItem('cc_token', value);
    } else {
      localStorage.removeItem('cc_token');
    }
  };

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const { data } = await api.post('/api/auth/login', credentials);
      persistToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      // Re-throw with more specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/api/auth/register', payload);
    persistToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/auth/profile');
        setUser(data.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff',
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


