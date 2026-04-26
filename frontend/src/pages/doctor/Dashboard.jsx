import { useQuery } from '@tanstack/react-query';
import { doctorAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AppointmentCard from '../../components/AppointmentCard';
import { FiCalendar, FiUsers, FiStar, FiArrowRight } from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="stat-card hover:shadow-card-hover transition-shadow group">
    <div className={`stat-icon ${color}`}><Icon className="text-xl" /></div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
    <FiArrowRight className="ml-auto text-slate-300 group-hover:text-primary-500 transition" />
  </Link>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayAppts, isLoading } = useQuery({
    queryKey: ['doctor-appointments-today'],
    queryFn: () => doctorAPI.getMyAppointments({ date: today, limit: 5 }),
  });

  const { data: earningData } = useQuery({
    queryKey: ['doctor-earnings-summary'],
    queryFn: () => doctorAPI.getEarnings(),
  });

  const { data: allAppts } = useQuery({
    queryKey: ['doctor-appointments-stats'],
    queryFn: () => doctorAPI.getMyAppointments({ limit: 1 }),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id }) => doctorAPI.updateMyAppointment(id, { status: 'confirmed' }),
    onSuccess: () => { toast.success('Appointment confirmed.'); qc.invalidateQueries(['doctor-appointments-today']); },
    onError: () => toast.error('Failed to confirm.'),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id }) => doctorAPI.updateMyAppointment(id, { status: 'completed' }),
    onSuccess: () => { toast.success('Appointment marked complete.'); qc.invalidateQueries(['doctor-appointments-today']); },
    onError: () => toast.error('Failed to update.'),
  });

  const appointments = todayAppts?.data?.data?.appointments || [];
  const earnings = earningData?.data?.data?.summary;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Welcome, Dr. {user?.name?.replace(/^Dr\.?\s*/i, '').split(' ')[0]}! 👋</h1>
        <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM do yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiCalendar} label="Today's Appointments" value={appointments.length}
          color="bg-blue-50 text-blue-600" to="/doctor/appointments" />
        <StatCard icon={FiUsers} label="Total Appointments" value={allAppts?.data?.data?.pagination?.total ?? 0}
          color="bg-purple-50 text-purple-600" to="/doctor/appointments" />
        <StatCard icon={MdCurrencyRupee} label="Total Earnings" value={`₹${earnings?.total?.toFixed(0) || 0}`}
          color="bg-green-50 text-green-600" to="/doctor/earnings" />
        <StatCard icon={FiStar} label="Appointments Done" value={earnings?.count ?? 0}
          color="bg-amber-50 text-amber-600" to="/doctor/appointments" />
      </div>

      {/* Today's appointments */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">Today's Schedule</h2>
        <Link to="/doctor/appointments" className="text-sm text-primary-600 hover:underline">View all</Link>
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-32" />
      ) : appointments.length === 0 ? (
        <div className="card text-center py-12">
          <FiCalendar className="mx-auto text-4xl text-slate-200 mb-3" />
          <p className="text-slate-500">No appointments scheduled for today</p>
          <Link to="/doctor/availability" className="btn-outline btn-sm mt-4">Set Availability</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              role="doctor"
              onConfirm={(a) => confirmMutation.mutate({ id: a._id })}
              onComplete={(a) => completeMutation.mutate({ id: a._id })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
