import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { patientAPI, appointmentAPI, notificationAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AppointmentCard from '../../components/AppointmentCard';
import { FiCalendar, FiUser, FiHeart, FiFileText, FiArrowRight, FiBell } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="stat-card hover:shadow-card-hover transition-shadow group">
    <div className={`stat-icon ${color}`}>
      <Icon className="text-xl" />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
    <FiArrowRight className="ml-auto text-slate-400 group-hover:text-primary-400 transition" />
  </Link>
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profileData } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: () => patientAPI.getProfile(),
  });

  const { data: apptData, isLoading: apptLoading } = useQuery({
    queryKey: ['patient-appointments-upcoming'],
    queryFn: () => patientAPI.getAppointments({ status: 'confirmed', limit: 3 }),
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => notificationAPI.getAll({ limit: 5 }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => appointmentAPI.cancel(id, { reason }),
    onSuccess: () => {
      toast.success('Appointment cancelled.');
      qc.invalidateQueries(['patient-appointments-upcoming']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel.'),
  });

  const profile = profileData?.data?.data?.patient;
  const appointments = apptData?.data?.data?.appointments || [];
  const notifications = notifData?.data?.data?.notifications || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM do yyyy')}</p>
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <Link to="/patient/doctors" className="btn-primary btn-lg inline-flex items-center gap-2">
          <FiCalendar /> Book an Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiCalendar} label="Upcoming" value={apptData?.data?.data?.pagination?.total ?? 0}
          color="bg-blue-500/20 text-blue-400 border border-blue-500/20" to="/patient/appointments" />
        <StatCard icon={FiHeart} label="Favorites" value={profile?.favorites?.length ?? 0}
          color="bg-red-500/20 text-red-400 border border-red-500/20" to="/patient/favorites" />
        <StatCard icon={FiFileText} label="Records" value={profile?.totalAppointments ?? 0}
          color="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" to="/patient/records" />
        <StatCard icon={FiBell} label="Notifications" value={notifData?.data?.data?.unreadCount ?? 0}
          color="bg-amber-500/20 text-amber-400 border border-amber-500/20" to="/patient/notifications" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>

          {apptLoading ? (
            <LoadingSpinner className="h-32 text-primary-400" />
          ) : appointments.length === 0 ? (
            <div className="card text-center py-12">
              <FiCalendar className="mx-auto text-4xl text-slate-400 mb-3" />
              <p className="text-slate-400 mb-4">No upcoming appointments</p>
              <Link to="/patient/doctors" className="btn-primary btn-sm">Find a Doctor</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <AppointmentCard
                  key={appt._id}
                  appointment={appt}
                  role="patient"
                  onCancel={(a) => cancelMutation.mutate({ id: a._id, reason: 'Patient requested cancellation' })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Recent Notifications</h2>
            <Link to="/patient/notifications" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {!Array.isArray(notifications) || notifications.length === 0 ? (
              <div className="card text-center py-8 text-slate-400 text-sm">No notifications</div>
            ) : notifications.map((n) => (
              <div key={n._id} className={`card py-3 px-4 ${!n.isRead ? 'border-l-4 border-primary-500' : ''}`}>
                <p className="text-sm font-medium text-slate-200">{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
