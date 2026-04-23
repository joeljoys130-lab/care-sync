import { useEffect, useState } from "react";
import { api } from "../../api";
import { FiList, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const statusStyles = {
  success: { icon: FiCheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10", label: "Success" },
  failed: { icon: FiXCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", label: "Failed" },
  pending: { icon: FiClock, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10", label: "Pending" },
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/payments/history");
        setPayments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="page-wrapper p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Payment History</h1>
        <p className="page-subtitle">Track and manage all your past transactions</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty */}
      {!loading && (!Array.isArray(payments) || payments.length === 0) && (
        <div className="card text-center py-16 border-dashed border-2">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiList className="text-slate-400 text-2xl" />
          </div>
          <p className="text-lg font-bold text-slate-800 dark:text-white">No payments found</p>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Your payment history will appear here once you book an appointment.</p>
        </div>
      )}

      {/* Payment List */}
      {!loading && Array.isArray(payments) && payments.length > 0 && (
        <div className="grid gap-4">
          {payments.map((p, i) => {
            const status = statusStyles[p.status] || statusStyles.pending;
            const StatusIcon = status.icon;
            return (
              <div key={i} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow group border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.bg} transition-transform group-hover:scale-110`}>
                    <StatusIcon className={`text-2xl ${status.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">₹{p.amount}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${status.bg} ${status.color} border border-current/10`}>
                    {status.label}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">#{p._id?.slice(-8).toUpperCase()}</p>
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