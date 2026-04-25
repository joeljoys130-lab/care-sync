import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // true while we read localStorage

  /* ── Bootstrap from localStorage on app start ── */
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser  = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // corrupted storage — clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── login: called by Login page after successful API response ── */
  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user',  JSON.stringify(userData));
    localStorage.setItem('role',  userData?.role || 'patient');
  }, []);

  /* ── logout: clears everything ── */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }, []);

  /* ── updateUser: patch user fields without a full re-login ── */
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      localStorage.setItem('role', next?.role || 'patient');
      return next;
    });
  }, []);

  /* ── register: called by Register page ── */
  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    return res.data;
  }, []);

  /* ── verifyOTP: confirms the 6-digit code ── */
  const verifyOTP = useCallback(async (data) => {
    const res = await authAPI.verifyOtp(data);
    const { user: userData, token: authToken } = res.data;
    login(userData, authToken);
    return userData;
  }, [login]);

  /* ── sendOTP: triggers a new code ── */
  const sendOTP = useCallback(async (data) => {
    const res = await authAPI.sendOtp(data);
    return res.data;
  }, []);

  const value = { user, token, loading, login, logout, register, verifyOTP, sendOTP, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ── useAuth hook ── */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
