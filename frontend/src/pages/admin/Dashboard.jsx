import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { FiUsers, FiCalendar, FiUserCheck, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#0ea5e9', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}><Icon className="text-xl" /></div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminAPI.getAnalytics,
  });

  if (isLoading) return <LoadingSpinner className="h-96" />;

  const analytics = data?.data?.data;
  const overview = analytics?.overview;
  const charts = analytics?.charts;
  const recent = analytics?.recentAppointments || [];
  const topDoctors = analytics?.topDoctors || [];

  const monthlyApptData = charts?.appointmentsByMonth?.map((m) => ({
    month: MONTH_NAMES[m._id.month - 1],
    appointments: m.count,
  })) || [];

  const monthlyRevData = charts?.revenueByMonth?.map((m) => ({
    month: MONTH_NAMES[m._id.month - 1],
    revenue: m.total,
  })) || [];

  const pieData = [
    { name: 'Completed', value: overview?.completedAppointments },
    { name: 'Pending', value: overview?.totalAppointments - overview?.completedAppointments - overview?.cancelledAppointments },
    { name: 'Cancelled', value: overview?.cancelledAppointments },
  ].filter((d) => d.value > 0);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview and analytics</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiUsers} label="Total Users" value={overview?.totalUsers} color="bg-blue-50 text-blue-600" />
        <StatCard icon={FiUserCheck} label="Active Doctors" value={overview?.totalDoctors}
          sub={`${overview?.pendingApprovals} pending`} color="bg-purple-50 text-purple-600" />
        <StatCard icon={FiCalendar} label="Total Appointments" value={overview?.totalAppointments}
          color="bg-green-50 text-green-600" />
        <StatCard icon={MdCurrencyRupee} label="Total Revenue" value={`₹${(overview?.totalRevenue || 0).toFixed(0)}`}
          color="bg-amber-50 text-amber-600" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Appointments chart */}
        <div className="card lg:col-span-2">
          <h2 className="section-title">Appointments per Month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyApptData}>
              <defs>
                <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="appointments" stroke="#0ea5e9" fill="url(#apptGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h2 className="section-title">Appointment Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={4}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="card mb-8">
        <h2 className="section-title">Monthly Revenue (₹)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyRevData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
            <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Recent Appointments</h2>
            <Link to="/admin/appointments" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recent.map((a) => (
              <div key={a._id} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiCalendar className="text-primary-600 text-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 truncate">
                    {a.patientId?.userId?.name} → Dr. {a.doctorId?.userId?.name}
                  </p>
                  <p className="text-xs text-slate-400">{format(new Date(a.createdAt), 'MMM d, yyyy')}</p>
                </div>
                <span className={`badge text-xs ${
                  a.status === 'completed' ? 'badge-success' :
                  a.status === 'confirmed' ? 'badge-primary' :
                  a.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Doctors */}
        <div className="card">
          <h2 className="section-title">Top Doctors</h2>
          <div className="space-y-3">
            {topDoctors.map((doc, i) => (
              <div key={doc._id} className="flex items-center gap-3 text-sm">
                <span className="w-6 text-slate-400 font-semibold text-center">{i + 1}</span>
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {doc.userId?.avatar ? (
                    <img src={doc.userId.avatar} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-primary-600 font-bold text-sm">{doc.userId?.name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 truncate">Dr. {doc.userId?.name}</p>
                  <p className="text-xs text-slate-400">{doc.specialization}</p>
                </div>
                <span className="text-amber-500 font-semibold">⭐ {doc.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
