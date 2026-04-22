import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;

      // AuthContext is the single source of truth — stores to localStorage internally
      login(user, token);

      // Route by role — matches App.jsx route structure
      const role = user?.role;
      if (role === 'admin')  navigate('/admin/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      if (msg.toLowerCase().includes('verify')) {
        navigate('/verify-otp', { state: { email } });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden z-0 bg-sky-50 dark:bg-[#0a0f1a]">
      {/* ── Abstract Background Orbs (Optimized for performance) ── */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full filter blur-[100px] pointer-events-none -z-10"></div>
      <div className="fixed top-[40%] right-[-5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full filter blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-20%] left-[30%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full filter blur-[150px] pointer-events-none -z-10"></div>

      <div className="card w-full max-w-md relative z-10 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <span className="text-[#0a0f1a] text-xl">🏥</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CareSync</span>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Welcome back</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in to your account</p>

        {error && (
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 backdrop-blur-md text-white font-semibold rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-slate-300 dark:border-white/10 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
