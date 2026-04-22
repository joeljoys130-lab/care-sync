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
    <div className="page-wrapper max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information</p>
      </div>

      {/* Avatar */}
      <div className="card mb-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-50 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-600 font-bold text-3xl">{user?.name?.charAt(0)}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-primary-700 transition"
          >
            <FiCamera className="text-xs" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-semibold text-slate-800">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <span className="badge-success text-xs mt-1">Patient</span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card mb-6">
        <h2 className="section-title">Personal Information</h2>
        <form onSubmit={handleSubmit((data) => {
          const formattedData = {
            ...data,
            allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()).filter(a => a) : []
          };
          updateMutation.mutate(formattedData);
        })} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input {...register('name')} className="input pl-10" required />
            </div>
          </div>
          <div>
            <label className="label">Email (cannot be changed)</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={user?.email} disabled className="input pl-10 bg-slate-50 cursor-not-allowed text-slate-400" />
            </div>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input {...register('phone')} className="input pl-10" placeholder="+1 234 567 8900" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" {...register('dateOfBirth')} className="input" />
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select {...register('bloodGroup')} className="input">
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
          <div>
            <label className="label">Allergies (comma separated)</label>
            <input {...register('allergies')} className="input" placeholder="e.g. Peanuts, Penicillin" />
          </div>
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
            <FiSave /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Security Settings */}
      <div className="card mt-6">
        <h2 className="section-title">Security Settings</h2>
        <form onSubmit={handlePasswordSubmit((data) => {
          if (data.newPassword !== data.confirmPassword) {
            toast.error('Passwords do not match');
            return;
          }
          passwordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });
        })} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" {...registerPassword('currentPassword')} className="input pl-10" required />
            </div>
          </div>
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" {...registerPassword('newPassword')} className="input pl-10" minLength={6} required />
            </div>
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" {...registerPassword('confirmPassword')} className="input pl-10" minLength={6} required />
            </div>
          </div>
          <button type="submit" disabled={passwordMutation.isPending} className="btn-primary">
            <FiSave /> {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
