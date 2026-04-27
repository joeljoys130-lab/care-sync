import { useEffect, useState } from "react";
import { paymentAPI } from "../../api";
import { FiCheckCircle, FiXCircle, FiClock, FiArrowRight, FiFileText, FiSearch, FiDollarSign, FiUser } from "react-icons/fi";
import { format } from "date-fns";

const statusStyles = {
  completed: {
    icon: FiCheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "Success",
  },
  failed: {
    icon: FiXCircle,
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

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentAPI.getHistory();
        setPayments(res.data.data.payments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.doctorId?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVolume = payments.reduce((acc, p) => p.status === 'completed' ? acc + p.amount : acc, 0);

  return (
    <div className="page-wrapper max-w-7xl mx-auto">
      <div className="page-header mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 mt-1">Global transaction tracking and management</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <FiDollarSign size={28} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">₹{totalVolume.toLocaleString('en-IN')}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
            <FiFileText size={28} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{payments.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transactions</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <FiClock size={28} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{payments.filter(p => p.status === 'pending').length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search by doctor, patient, or ID..."
            className="pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl w-full focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Transaction ID</th>
                <th className="px-6 py-5">Patient</th>
                <th className="px-6 py-5">Doctor</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-6 h-16 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400 font-medium">No transactions found</td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const status = statusStyles[p.status] || statusStyles.pending;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <p className="text-sm font-bold text-slate-700">{format(new Date(p.createdAt), "MMM dd, yyyy")}</p>
                        <p className="text-[10px] text-slate-400">{format(new Date(p.createdAt), "hh:mm a")}</p>
                      </td>
                      <td className="px-6 py-6 font-mono text-[10px] text-slate-400 uppercase">
                        {p.transactionId?.substring(0, 16)}...
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                            <FiUser size={14} />
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{p.patientId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-medium text-slate-600">Dr. {p.doctorId?.userId?.name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-base font-black text-slate-800">₹{p.amount}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${status.bg} ${status.color} border ${status.border}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
