import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { paymentAPI } from "../../api";
import { toast } from "react-toastify";
import { FiCreditCard } from "react-icons/fi";

const Payment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState(null);

  useEffect(() => {
    // We could fetch specific appointment details here if needed
  }, [appointmentId]);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Create Razorpay order from backend
      const orderRes = await paymentAPI.createRazorpayOrder({
        appointmentId,
      });

      const {
        razorpayOrderId,
        amount,
        currency,
        keyId,
        paymentId,
        isDemo
      } = orderRes.data.data;

      setFee(amount / 100);

      if (isDemo) {
        // Automatically confirm in demo mode after a small delay
        toast.info("Demo Mode: Simulating payment...");
        setTimeout(async () => {
          try {
            await paymentAPI.confirm({
              paymentId,
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: "pay_demo_" + Date.now(),
              razorpay_signature: "demo_sig",
            });
            toast.success("Payment successful! Your appointment is confirmed.");
            navigate('/patient/appointments');
          } catch (error) {
            toast.error("Payment confirmation failed.");
            setLoading(false);
          }
        }, 1500);
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "CareSync",
        description: "Appointment Payment",
        order_id: razorpayOrderId,

        handler: async (response) => {
          try {
            await paymentAPI.confirm({
              paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success(
              "Payment successful! Your appointment is confirmed."
            );
            navigate('/patient/appointments');
          } catch (error) {
            toast.error("Payment confirmation failed.");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);

    } catch (error) {
      toast.error("Failed to initiate payment.");
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Payment
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete your appointment payment
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <FiCreditCard className="text-primary-600 text-xl" />
          </div>

          <div>
            <p className="font-semibold text-slate-800">
              Consultation Fee
            </p>
            <p className="text-sm text-slate-400">
              Appointment payment
            </p>
          </div>
        </div>

        {/* Amount note */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-500">
            {fee ? `Total Amount: ₹${fee}` : "Amount will be fetched securely from server"}
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default Payment;