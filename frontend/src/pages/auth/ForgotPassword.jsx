import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import { toast } from 'react-toastify';
import { MdLocalHospital } from 'react-icons/md';
import { FiMail } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.warning('Please enter your email.');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      toast.success('OTP sent! Check your email.');
      navigate('/reset-password', { state: { email } });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <MdLocalHospital className="text-white text-xl" />
          </div>
          <span className="text-xl font-bold text-slate-800">CareSync</span>
        </div>

        <div className="card">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Forgot Password</h2>
          <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you an OTP to reset your password.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
