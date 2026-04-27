import { useEffect, useState } from "react";
import { paymentAPI } from "../../api";
import { FiList, FiCheckCircle, FiXCircle, FiClock, FiUser, FiArrowRight, FiFileText, FiDownload, FiSearch } from "react-icons/fi";
import { format } from "date-fns";

const statusStyles = {
  completed: {
    icon: FiCheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "Paid Successfully",
  },
  failed: {
    icon: FiXCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    label: "Payment Failed",
  },
  pending: {
    icon: FiClock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    label: "Awaiting Payment",
  },
  refunded: {
    icon: FiArrowRight,
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-100",
    label: "Refunded",
  },
};

const PaymentHistory = () => {
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
    p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Transaction History
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and track all your medical consultation payments
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search by doctor or ID..."
            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-72 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiFileText className="text-slate-300 text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No transactions found</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            {searchTerm ? "Try adjusting your search terms to find what you're looking for." : "Your payment history is currently empty. Book an appointment to get started."}
          </p>
        </div>
      ) : (
        /* Payment Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPayments.map((p, i) => {
            const status = statusStyles[p.status] || statusStyles.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={p._id || i}
                className="group bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-slate-200/60 transition-all p-6 relative overflow-hidden"
              >
                {/* Status Strip */}
                <div className={`absolute top-0 left-0 w-full h-1 ${status.bg}`}></div>

                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${status.bg} ${status.color} transition-transform group-hover:scale-110 duration-300`}>
                      <FiUser size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg leading-tight">
                        Dr. {p.doctorId?.userId?.name || 'Medical Specialist'}
                      </h4>
                      <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                        {p.doctorId?.specialization || 'Consultation'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 leading-none">
                      ₹{p.amount}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                      {p.currency}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {format(new Date(p.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Time</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {format(new Date(p.createdAt), "hh:mm a")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.color} border ${status.border}`}>
                    <StatusIcon size={14} />
                    {status.label}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="View Details">
                      <FiFileText size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Download Receipt">
                      <FiDownload size={18} />
                    </button>
                  </div>
                </div>

                {/* Transaction ID Footer */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Transaction ID</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                    {p.transactionId?.substring(0, 18).toUpperCase()}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;