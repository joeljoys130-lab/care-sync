import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdLocalHospital } from 'react-icons/md';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';
import { toast } from 'react-toastify';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['patient', 'doctor']),
  phone: z.string().optional(),
  specialization: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const SPECIALIZATIONS = ['Cardiology', 'Dermatology', 'General', 'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology'];

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: searchParams.get('role') === 'doctor' ? 'doctor' : 'patient' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success('Account created! Please check your email for the OTP.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-2/5 hero-gradient text-white p-12">
        <MdLocalHospital className="text-6xl mb-6" />
        <h1 className="text-4xl font-bold mb-4">Join CareSync</h1>
        <p className="text-blue-100 text-center max-w-xs">
          Register as a patient to find doctors, or as a doctor to grow your practice.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-blue-100">
          {['Free to join', 'Verified doctors', 'Secure health records', '24/7 support'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />{item}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <MdLocalHospital className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-slate-800">CareSync</span>
          </div>

          <div className="card shadow-2xl shadow-primary-500/10 dark:shadow-cyan-500/10 border-slate-200/50 dark:border-white/5">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Join thousands of users on CareSync</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Role Toggle */}
              <div>
                <label className="label">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {['patient', 'doctor'].map((r) => (
                    <label key={r} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedRole === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}>
                      <input {...register('role')} type="radio" value={r} className="sr-only" />
                      <span className="font-medium capitalize">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input {...register('name')} className={`input pl-10 ${errors.name ? 'input-error' : ''}`} placeholder="John Doe" />
                </div>
                {errors.name && <p className="error-msg">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input {...register('email')} type="email" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} placeholder="you@email.com" />
                </div>
                {errors.email && <p className="error-msg">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Phone (Optional)</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input {...register('phone')} className="input pl-10" placeholder="+1 234 567 8900" />
                </div>
              </div>

              {selectedRole === 'doctor' && (
                <div>
                  <label className="label">Specialization</label>
                  <select {...register('specialization')} className={`select ${errors.specialization ? 'input-error' : ''}`}>
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input {...register('password')} type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <p className="error-msg">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input {...register('confirmPassword')} type="password"
                    className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`} placeholder="Repeat password" />
                </div>
                {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
