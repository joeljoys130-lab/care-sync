import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { doctorAPI, paymentAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiCalendar, FiTrendingUp, FiCreditCard, FiCheckCircle, FiClock, FiArrowRight, FiUser } from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { format } from "date-fns";

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const statusStyles = {
  completed: {
    icon: FiCheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "Earned",
  },
  failed: {
    icon: FiClock,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    label: "Failed",
  },
  pending: {
    icon: FiClock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    label: "Pending",
  },
  refunded: {
    icon: FiArrowRight,
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-100",
    label: "Refunded",
  },
};

const DoctorEarnings = () => {
  const [payments, setPayments] = useState([]);
  const [payLoading, setPayLoading] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-earnings'],
    queryFn: doctorAPI.getEarnings,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentAPI.getHistory();
        setPayments(res.data.data.payments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setPayLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (isLoading) return <LoadingSpinner className="h-64" />;

  const summary = data?.data?.data?.summary;
  const monthly = data?.data?.data?.monthly || [];

  const chartData = monthly.map((m) => ({
    month: MONTH_NAMES[m._id.month - 1],
    earnings: m.total,
    appointments: m.count,
  }));

  return (
    <div className="page-wrapper max-w-7xl mx-auto p-4 md:p-8">
      <div className="page-header mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Earnings & Finance</h1>
        <p className="text-slate-500 mt-1">Track your consultation revenue and transactions</p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <MdCurrencyRupee size={28} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">₹{(summary?.total || 0).toFixed(2)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <FiCalendar size={28} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{summary?.count || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consultations</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <FiTrendingUp size={28} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">₹{(summary?.avgPerAppointment || 0).toFixed(0)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg per Session</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
             Analytics Overview
          </h2>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No earnings data available yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(v) => [`₹${v}`, 'Earnings']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="earnings" fill="#0ea5e9" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <FiCreditCard />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {payLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl"></div>)}
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No recent transactions.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {payments.map((p) => {
                  const status = statusStyles[p.status] || statusStyles.pending;
                  const StatusIcon = status.icon;
                  return (
                    <div key={p._id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center font-bold">
                            {p.patientId?.userId?.name?.charAt(0) || <FiUser />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">{p.patientId?.userId?.name || 'Patient'}</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{format(new Date(p.createdAt), "MMM dd, yyyy")}</p>
                          </div>
                        </div>
                        <p className="text-lg font-black text-slate-900">₹{p.amount}</p>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${status.bg} ${status.color} border ${status.border}`}>
                        <StatusIcon size={10} />
                        {status.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorEarnings;
