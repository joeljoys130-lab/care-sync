import { useEffect, useState } from "react";
import axios from "axios";
import { FiList, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

const statusStyles = {
  success: { icon: FiCheckCircle, color: "text-green-500", bg: "bg-green-50", label: "Success" },
  failed: { icon: FiXCircle, color: "text-red-500", bg: "bg-red-50", label: "Failed" },
  pending: { icon: FiClock, color: "text-yellow-500", bg: "bg-yellow-50", label: "Pending" },
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/payments/history");
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Payment History</h1>
        <p className="text-sm text-slate-500 mt-1">All your past transactions</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      )}

      {/* Empty */}
      {!loading && payments.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FiList className="text-slate-400 text-xl" />
          </div>
          <p className="font-semibold text-slate-700">No payments found</p>
          <p className="text-sm text-slate-400 mt-1">Your payment history will appear here</p>
        </div>
      )}

      {/* Payment List */}
      {!loading && payments.length > 0 && (
        <div className="space-y-3">
          {payments.map((p, i) => {
            const status = statusStyles[p.status] || statusStyles.pending;
            const StatusIcon = status.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.bg}`}>
                    <StatusIcon className={`text-xl ${status.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">₹{p.amount}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;