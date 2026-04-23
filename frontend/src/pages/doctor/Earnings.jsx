import { useQuery } from '@tanstack/react-query';
import { doctorAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiDollarSign, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DoctorEarnings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['doctor-earnings'],
    queryFn: () => doctorAPI.getEarnings(),
  });

  if (isLoading) return <LoadingSpinner className="h-64" />;

  const summary = data?.data?.data?.summary;
  const monthly = data?.data?.data?.monthly || [];

  const chartData = monthly.map((m) => ({
    month: MONTH_NAMES[m._id.month - 1],
    earnings: m.total,
    appointments: m.count,
  }));

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Earnings</h1>
        <p className="page-subtitle">Your earnings overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-icon bg-green-50 text-green-600"><FiDollarSign /></div>
          <div>
            <p className="text-2xl font-bold text-slate-800">₹{(summary?.total || 0).toFixed(2)}</p>
            <p className="text-sm text-slate-500">Total Earned</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-50 text-blue-600"><FiCalendar /></div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{summary?.count || 0}</p>
            <p className="text-sm text-slate-500">Paid Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-50 text-purple-600"><FiTrendingUp /></div>
          <div>
            <p className="text-2xl font-bold text-slate-800">₹{(summary?.avgPerAppointment || 0).toFixed(0)}</p>
            <p className="text-sm text-slate-500">Avg per Appointment</p>
          </div>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="card">
        <h2 className="section-title">Monthly Earnings (Last 12 Months)</h2>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No earnings data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(v) => [`₹${v}`, 'Earnings']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="earnings" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DoctorEarnings;
