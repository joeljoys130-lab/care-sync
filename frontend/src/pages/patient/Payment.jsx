import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { paymentAPI } from '../../api';
import { toast } from 'react-toastify';
import { FiCreditCard } from "react-icons/fi";

const Payment = () => {
  const { appointmentId } = useParams();
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch appointment details to get amount
    // Assuming you have an API to get appointment by ID
    // For now, set a default or fetch from props/route
    setAmount(500); // Replace with actual fetch
  }, [appointmentId]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1: Create Razorpay order
      const orderRes = await paymentAPI.createRazorpayOrder({ amount, appointmentId });
      const { order } = orderRes.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Care Sync',
        description: 'Appointment Payment',
        order_id: order.id,
        handler: async (response) => {
          // Step 3: Confirm payment on success
          try {
            await paymentAPI.confirm({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
              amount,
            });
            toast.success('Payment successful!');
          } catch (error) {
            toast.error('Payment confirmation failed');
          }
        },
        prefill: {
          name: 'Patient Name',
          email: 'patient@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
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
          <p className="text-3xl font-bold text-slate-800 mt-1">₹{amount}</p>
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