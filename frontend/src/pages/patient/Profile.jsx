import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { userAPI, patientAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FiUser, FiMail, FiPhone, FiSave, FiCamera, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useRef } from 'react';

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user-full-profile'],
    queryFn: userAPI.getProfile,
  });

  const profile = profileData?.data?.data;

  const { register, handleSubmit } = useForm({
    values: {
      name: user?.name || '',
      phone: user?.phone || profile?.user?.phone || '',
      dateOfBirth: profile?.user?.dateOfBirth ? new Date(profile.user.dateOfBirth).toISOString().split('T')[0] : '',
      bloodGroup: profile?.user?.bloodGroup || '',
      allergies: profile?.user?.allergies?.join(', ') || '',
    },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword } = useForm();

  const updateMutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: ({ data }) => {
      updateUser(data.data.user);
      toast.success('Profile updated!');
      qc.invalidateQueries(['user-full-profile']);
    },
    onError: () => toast.error('Update failed.'),
  });

  const avatarMutation = useMutation({
    mutationFn: (formData) => userAPI.uploadAvatar(formData),
    onSuccess: ({ data }) => {
      updateUser({ avatar: data.data.avatar });
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Avatar upload failed.'),
  });

  const passwordMutation = useMutation({
    mutationFn: userAPI.changePassword,
    onSuccess: () => {
      toast.success('Password updated successfully!');
      resetPassword();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update password.');
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    avatarMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="relative min-h-screen max-w-6xl mx-auto pb-12 animate-fade-in z-0">
      
      {/* ── Abstract Glassmorphism Background Orbs ── */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-primary-400/20 rounded-full mix-blend-multiply filter blur-[80px] -z-10 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-teal-400/20 rounded-full mix-blend-multiply filter blur-[80px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-10 left-1/2 w-[500px] h-[500px] bg-rose-300/10 rounded-full mix-blend-multiply filter blur-[100px] -z-10"></div>

      {/* Sleek Gradient Cover Banner */}
      <div className="h-48 md:h-64 rounded-b-[40px] bg-gradient-to-br from-primary-600/90 via-primary-500/80 to-teal-400/80 backdrop-blur-md shadow-lg relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
      </div>

      {/* Avatar & Basic Info Section */}
      <div className="px-6 sm:px-10 -mt-20 md:-mt-24 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
        <div className="relative group">
          <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-white/30 backdrop-blur-xl border border-white/50 p-2 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-transform duration-500 group-hover:scale-105">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-sm flex items-center justify-center relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-600/80 font-black text-6xl shadow-sm">{user?.name?.charAt(0)}</span>
              )}
              {/* Glassmorphic Hover Overlay */}
              <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-md flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <FiCamera className="text-white text-3xl mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                <span className="text-white text-xs font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">Update Photo</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-2 right-2 w-11 h-11 bg-white/20 backdrop-blur-md text-primary-700 rounded-full flex items-center justify-center shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] border border-white/40 hover:bg-white/40 transition-all hover:scale-110 md:hidden z-20"
          >
            <FiCamera className="text-xl" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        
        <div className="text-center md:text-left mb-2 md:mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">{user?.name}</h1>
          <p className="text-slate-600 font-medium flex items-center justify-center md:justify-start gap-2 mt-1.5 text-sm md:text-base">
            <FiMail className="text-primary-500" /> {user?.email}
          </p>
          <span className="inline-block mt-3 px-4 py-1.5 bg-white/40 backdrop-blur-md border border-white/50 text-teal-700 text-xs font-bold rounded-full shadow-sm uppercase tracking-wider">
            Patient Account
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-8 grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 p-6 sm:p-8 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.12)] transition-shadow duration-300 group relative overflow-hidden">
            
            {/* Inner Glass Highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-[2rem]"></div>

            <div className="relative flex items-center gap-4 mb-8 pb-6 border-b border-white/40">
              <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 flex items-center justify-center text-primary-600 group-hover:bg-primary-500/20 group-hover:text-primary-700 transition-colors duration-300 shadow-sm">
                <FiUser className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
                <p className="text-sm text-slate-500 mt-0.5">Keep your health and contact details up to date</p>
              </div>
            </div>

            <form onSubmit={handleSubmit((data) => {
              const formattedData = {
                ...data,
                allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()).filter(a => a) : []
              };
              updateMutation.mutate(formattedData);
            })} className="relative space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <div className="relative group/input">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-primary-600 transition-colors" />
                    <input {...register('name')} className="w-full bg-white/50 backdrop-blur-sm border border-white/60 text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/50 focus:bg-white/70 transition-all" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                  <div className="relative group/input">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-primary-600 transition-colors" />
                    <input {...register('phone')} className="w-full bg-white/50 backdrop-blur-sm border border-white/60 text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/50 focus:bg-white/70 transition-all" placeholder="+1 234 567 8900" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Date of Birth</label>
                  <input type="date" {...register('dateOfBirth')} className="w-full bg-white/50 backdrop-blur-sm border border-white/60 text-slate-800 rounded-2xl px-4 py-3.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/50 focus:bg-white/70 transition-all" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Blood Group</label>
                  <select {...register('bloodGroup')} className="w-full bg-white/50 backdrop-blur-sm border border-white/60 text-slate-800 rounded-2xl px-4 py-3.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/50 focus:bg-white/70 transition-all appearance-none cursor-pointer">
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Allergies</label>
                <input {...register('allergies')} className="w-full bg-white/50 backdrop-blur-sm border border-white/60 text-slate-800 rounded-2xl px-4 py-3.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/50 focus:bg-white/70 transition-all" placeholder="e.g. Peanuts, Penicillin (comma separated)" />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600/90 to-primary-500/90 hover:from-primary-600 hover:to-primary-500 backdrop-blur-md text-white font-semibold rounded-2xl shadow-[0_8px_20px_rgba(14,165,233,0.3)] border border-white/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  <FiSave className="text-lg" />
                  {updateMutation.isPending ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security */}
        <div className="space-y-8">
          <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 p-6 sm:p-8 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.12)] transition-shadow duration-300 relative overflow-hidden group">
            
            {/* Inner Glass Highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-[2rem]"></div>
            
            {/* Decorative background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-300/20 blur-2xl rounded-bl-full -z-10 group-hover:scale-150 group-hover:bg-rose-300/30 transition-all duration-700"></div>
            
            <div className="relative flex items-center gap-4 mb-8 pb-6 border-b border-white/40">
              <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 flex items-center justify-center text-rose-500 group-hover:bg-rose-500/20 group-hover:text-rose-600 transition-colors duration-300 shadow-sm">
                <FiLock className="text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Security</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage your password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit((data) => {
              if (data.newPassword !== data.confirmPassword) {
                toast.error('Passwords do not match');
                return;
              }
              passwordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });
            })} className="relative space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Current Password</label>
                <div className="relative group/input">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-500 transition-colors" />
                  <input type="password" {...registerPassword('currentPassword')} className="w-full bg-white/50 backdrop-blur-sm border border-white/60 text-slate-800 rounded-2xl pl-11 pr-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400/50 focus:bg-white/70 transition-all" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                <div className="relative group/input">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-500 transition-colors" />
                  <input type="password" {...registerPassword('newPassword')} className="w-full bg-white/50 backdrop-blur-sm border border-white/60 text-slate-800 rounded-2xl pl-11 pr-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400/50 focus:bg-white/70 transition-all" minLength={6} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
                <div className="relative group/input">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-500 transition-colors" />
                  <input type="password" {...registerPassword('confirmPassword')} className="w-full bg-white/50 backdrop-blur-sm border border-white/60 text-slate-800 rounded-2xl pl-11 pr-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400/50 focus:bg-white/70 transition-all" minLength={6} required />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={passwordMutation.isPending} className="w-full px-6 py-3.5 bg-gradient-to-r from-rose-500/90 to-pink-500/90 hover:from-rose-500 hover:to-pink-500 backdrop-blur-md text-white font-semibold rounded-2xl shadow-[0_8px_20px_rgba(244,63,94,0.3)] border border-white/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  <FiLock className="text-lg" />
                  {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientProfile;
