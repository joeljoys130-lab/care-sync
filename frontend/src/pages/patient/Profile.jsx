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
      
      {/* Sleek Gradient Cover Banner */}
      <div className="h-48 md:h-64 rounded-b-[40px] bg-gradient-to-br from-cyan-500/80 via-blue-500/60 to-indigo-500/80 backdrop-blur-md shadow-lg relative overflow-hidden border border-slate-200 dark:border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="absolute inset-0 bg-sky-50 dark:bg-[#0a0f1a]/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Avatar & Basic Info Section */}
      <div className="px-6 sm:px-10 -mt-20 md:-mt-24 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
        <div className="relative group">
          <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-white dark:bg-[#131d30]/60 backdrop-blur-xl border border-slate-300 dark:border-white/10 p-2 shadow-lg dark:shadow-2xl transition-transform duration-500 group-hover:scale-105">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm flex items-center justify-center relative border border-slate-200 dark:border-white/5">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-cyan-400/80 font-black text-6xl shadow-lg dark:shadow-2xl">{user?.name?.charAt(0)}</span>
              )}
              {/* Glassmorphic Hover Overlay */}
              <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-md flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <FiCamera className="text-slate-800 dark:text-white text-3xl mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                <span className="text-slate-800 dark:text-white text-xs font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">Update Photo</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-2 right-2 w-11 h-11 bg-white dark:bg-[#131d30]/60 backdrop-blur-md text-cyan-400 rounded-full flex items-center justify-center shadow-lg border border-slate-300 dark:border-white/10 hover:bg-sky-100 dark:bg-[#1c283d] transition-all hover:scale-110 md:hidden z-20"
          >
            <FiCamera className="text-xl" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        
        <div className="text-center md:text-left mb-2 md:mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight drop-shadow-lg dark:shadow-2xl">{user?.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2 mt-1.5 text-sm md:text-base">
            <FiMail className="text-cyan-400" /> {user?.email}
          </p>
          <span className="inline-block mt-3 px-4 py-1.5 bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full shadow-lg dark:shadow-2xl uppercase tracking-wider">
            Patient Account
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-8 grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card group relative overflow-hidden">
            
            {/* Inner Glass Highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-[2rem]"></div>

            <div className="relative flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-[#1c283d] border border-slate-200 dark:border-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 transition-colors duration-300 shadow-lg dark:shadow-2xl">
                <FiUser className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Personal Information</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Keep your health and contact details up to date</p>
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
                  <label className="label ml-1">Full Name</label>
                  <div className="relative group/input">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within/input:text-cyan-400 transition-colors" />
                    <input {...register('name')} className="input pl-11" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label ml-1">Phone Number</label>
                  <div className="relative group/input">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within/input:text-cyan-400 transition-colors" />
                    <input {...register('phone')} className="input pl-11" placeholder="+1 234 567 8900" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label ml-1">Date of Birth</label>
                  <input type="date" {...register('dateOfBirth')} className="input" style={{colorScheme: 'dark'}} />
                </div>
                
                <div className="space-y-2">
                  <label className="label ml-1">Blood Group</label>
                  <select {...register('bloodGroup')} className="select cursor-pointer">
                    <option value="" className="bg-sky-100 dark:bg-[#1c283d]">Select Blood Group</option>
                    <option value="A+" className="bg-sky-100 dark:bg-[#1c283d]">A+</option>
                    <option value="A-" className="bg-sky-100 dark:bg-[#1c283d]">A-</option>
                    <option value="B+" className="bg-sky-100 dark:bg-[#1c283d]">B+</option>
                    <option value="B-" className="bg-sky-100 dark:bg-[#1c283d]">B-</option>
                    <option value="AB+" className="bg-sky-100 dark:bg-[#1c283d]">AB+</option>
                    <option value="AB-" className="bg-sky-100 dark:bg-[#1c283d]">AB-</option>
                    <option value="O+" className="bg-sky-100 dark:bg-[#1c283d]">O+</option>
                    <option value="O-" className="bg-sky-100 dark:bg-[#1c283d]">O-</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label ml-1">Allergies</label>
                <input {...register('allergies')} className="input" placeholder="e.g. Peanuts, Penicillin (comma separated)" />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={updateMutation.isPending} className="btn-primary w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-slate-300 dark:border-white/10">
                  <FiSave className="text-lg" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security */}
        <div className="space-y-8">
          <div className="card group relative overflow-hidden">
            
            {/* Inner Glass Highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-[2rem]"></div>
            
            {/* Decorative background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-2xl rounded-bl-full -z-10 group-hover:scale-150 group-hover:bg-cyan-500/20 transition-all duration-700"></div>
            
            <div className="relative flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-[#1c283d] border border-slate-200 dark:border-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 transition-colors duration-300 shadow-lg dark:shadow-2xl">
                <FiLock className="text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Security</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your password</p>
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
                <label className="label ml-1">Current Password</label>
                <div className="relative group/input">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within/input:text-cyan-400 transition-colors" />
                  <input type="password" {...registerPassword('currentPassword')} className="input pl-11" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label ml-1">New Password</label>
                <div className="relative group/input">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within/input:text-cyan-400 transition-colors" />
                  <input type="password" {...registerPassword('newPassword')} className="input pl-11" minLength={6} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label ml-1">Confirm Password</label>
                <div className="relative group/input">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within/input:text-cyan-400 transition-colors" />
                  <input type="password" {...registerPassword('confirmPassword')} className="input pl-11" minLength={6} required />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={passwordMutation.isPending} className="btn-primary w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-slate-300 dark:border-white/10">
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
