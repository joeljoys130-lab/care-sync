import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'patient' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden z-0 bg-surface-50">
      {/* ── Abstract Glassmorphism Background Orbs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/40 rounded-full mix-blend-multiply filter blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute top-[40%] right-[-5%] w-[600px] h-[600px] bg-emerald-300/30 rounded-full mix-blend-multiply filter blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-20%] left-[30%] w-[800px] h-[800px] bg-teal-200/30 rounded-full mix-blend-multiply filter blur-[150px] -z-10"></div>

      <div className="card w-full max-w-md relative z-10 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(168,85,247,0.3)] border border-white/30">
            <span className="text-white text-xl">🏥</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">CareSync</span>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Create your account</h2>
        <p className="text-sm text-slate-500 mb-6">Join CareSync and manage your health</p>

        {error && (
          <div className="bg-red-50/50 backdrop-blur-md border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="label">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label">Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label">I am a</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input cursor-pointer"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Minimum 6 characters"
              className="input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              required
              placeholder="Re-enter password"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-purple-500/90 to-emerald-400/90 hover:from-purple-500 hover:to-emerald-400 backdrop-blur-md text-white font-semibold rounded-2xl shadow-[0_8px_20px_rgba(168,85,247,0.3)] border border-white/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;