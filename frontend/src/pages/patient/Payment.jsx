import { useState } from "react";
import axios from "axios";
import { FiCreditCard } from "react-icons/fi";

const Payment = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/payments/create", {
        amount: 500,
        appointmentId: "ID"
      });
      alert("Payment successful!");
      console.log(res.data);
    } catch (err) {
      alert("Payment failed!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Payment</h1>
        <p className="text-sm text-slate-500 mt-1">Complete your appointment payment</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <FiCreditCard className="text-primary-600 text-xl" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Consultation Fee</p>
            <p className="text-sm text-slate-400">Appointment payment</p>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-500">Amount to pay</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">₹500</p>
        </div>

        {/* Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 
                     text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default Payment;