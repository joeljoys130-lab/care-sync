import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { userAPI, doctorAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FiSave, FiUser, FiDollarSign, FiAward, FiCamera } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useRef } from 'react';

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'General', 'Neurology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology', 'Gynecology', 'ENT',
];

const DoctorProfile = () => {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['doctor-full-profile'],
    queryFn: userAPI.getProfile,
  });

  // userController returns: { data: { user, profile } }
  const doctorProfile = profileData?.data?.data?.profile;

  const { register, reset } = useForm();

  // Reset form once profile data loads
  useEffect(() => {
    if (doctorProfile) {
      reset({
        name: user?.name || '',
        phone: user?.phone || '',
        specialization: doctorProfile?.specialization || '',
        experience: doctorProfile?.experience || 0,
        fees: doctorProfile?.fees || 0,
        bio: doctorProfile?.bio || '',
        hospital: doctorProfile?.hospital || '',
        city: doctorProfile?.city || '',
      });
    }
  }, [doctorProfile, user, reset]);

  const avatarMutation = useMutation({
    mutationFn: (formData) => userAPI.uploadAvatar(formData),
    onSuccess: ({ data }) => {
      updateUser({ avatar: data.data.avatar });
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Avatar upload failed.'),
  });

  const userMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile({ name: data.name, phone: data.phone }),
    onSuccess: ({ data }) => updateUser(data.data.user),
  });

  const doctorMutation = useMutation({
    mutationFn: (data) =>
      doctorAPI.updateProfile({
        specialization: data.specialization,
        experience: Number(data.experience),
        fees: Number(data.fees),
        bio: data.bio,
        hospital: data.hospital,
        city: data.city,
      }),
    onSuccess: () => {
      toast.success('Profile updated!');
      qc.invalidateQueries(['doctor-full-profile']);
    },
    onError: () => toast.error('Update failed.'),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    avatarMutation.mutate(formData);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    await userMutation.mutateAsync(data);
    await doctorMutation.mutateAsync(data);
  };

  if (isLoading) return <LoadingSpinner className="h-64" />;

  const isPending = userMutation.isPending || doctorMutation.isPending;

  return (
    <div className="page-wrapper max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Doctor Profile</h1>
        <p className="page-subtitle">Manage your practice and personal information</p>
      </div>

      {/* Avatar card */}
      <div className="card mb-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
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
          <p className="font-semibold text-slate-800 text-lg">Dr. {user?.name}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <div className="flex gap-2 mt-1">
            <span className="badge-primary text-xs">Doctor</span>
            {doctorProfile?.isApproved ? (
              <span className="badge-success text-xs">✓ Approved</span>
            ) : (
              <span className="badge-warning text-xs">Pending Approval</span>
            )}
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Personal */}
        <div className="card">
          <h2 className="section-title flex items-center gap-2">
            <FiUser className="text-primary-500" /> Personal Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" defaultValue={user?.name} className="input" required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" defaultValue={user?.phone} className="input" placeholder="+1 234 567 8900" />
            </div>
          </div>
        </div>

        {/* Professional */}
        <div className="card">
          <h2 className="section-title flex items-center gap-2">
            <FiAward className="text-primary-500" /> Professional Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Specialization</label>
              <select name="specialization" defaultValue={doctorProfile?.specialization} className="select">
                {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Experience (years)</label>
              <input name="experience" type="number" min="0" defaultValue={doctorProfile?.experience || 0} className="input" />
            </div>
            <div>
              <label className="label">Hospital / Clinic</label>
              <input name="hospital" defaultValue={doctorProfile?.hospital} className="input" placeholder="e.g. City Medical Center" />
            </div>
            <div>
              <label className="label">City</label>
              <input name="city" defaultValue={doctorProfile?.city} className="input" placeholder="e.g. New York" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">About / Bio</label>
            <textarea
              name="bio"
              defaultValue={doctorProfile?.bio}
              className="input min-h-[100px] resize-none"
              placeholder="Write a brief bio about your experience and expertise..."
            />
          </div>
        </div>

        {/* Fees */}
        <div className="card">
          <h2 className="section-title flex items-center gap-2">
            <FiDollarSign className="text-primary-500" /> Consultation Fee
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-light text-slate-400">₹</span>
            <input
              name="fees"
              type="number"
              min="0"
              step="5"
              defaultValue={doctorProfile?.fees || 0}
              className="input w-40 text-lg font-semibold"
            />
            <span className="text-slate-400 text-sm">per consultation</span>
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-primary btn-lg w-full sm:w-auto">
          <FiSave /> {isPending ? 'Saving...' : 'Save All Changes'}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfile;
