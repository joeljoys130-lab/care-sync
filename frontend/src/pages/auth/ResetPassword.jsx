import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import { toast } from 'react-toastify';
import { MdLocalHospital } from 'react-icons/md';
import { FiLock } from 'react-icons/fi';

const ResetPassword = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ otp: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const email = state?.email || '';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error("Passwords don't match.");
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp: form.otp, newPassword: form.newPassword });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed.');
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
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Reset Password</h2>
          <p className="text-slate-500 text-sm mb-2">Enter the OTP sent to <span className="text-primary-600">{email}</span></p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="label">OTP Code</label>
              <input name="otp" value={form.otp} onChange={handleChange}
                className="input text-center text-xl tracking-widest font-bold" placeholder="_ _ _ _ _ _" maxLength={6} required />
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange}
                  className="input pl-10" placeholder="Min. 6 characters" required />
              </div>
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="confirm" type="password" value={form.confirm} onChange={handleChange}
                  className="input pl-10" placeholder="Repeat password" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
