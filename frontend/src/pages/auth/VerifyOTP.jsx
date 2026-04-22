import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { toast } from 'react-toastify';
import { MdLocalHospital } from 'react-icons/md';

const ROLE_HOME = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };

const VerifyOTP = () => {
  const { state } = useLocation();
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const email = state?.email || '';

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) return toast.warning('Please enter the full 6-digit OTP.');

    setLoading(true);
    try {
      const user = await verifyOTP({ email, otp: otpStr });
      navigate(ROLE_HOME[user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ email, purpose: 'verification' });
      toast.success('New OTP sent to your email!');
    } catch {
      toast.error('Failed to resend OTP.');
    } finally {
      setResending(false);
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

        <div className="card text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify Your Email</h2>
          <p className="text-slate-500 text-sm mb-1">We sent a 6-digit code to</p>
          <p className="text-primary-600 font-semibold mb-8">{email}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                    digit ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-slate-200'
                  }`}
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-500">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary-600 font-medium hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
