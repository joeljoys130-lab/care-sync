import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { paymentAPI, appointmentAPI } from "../../api";
import { toast } from "react-toastify";
import { FiCreditCard, FiCalendar, FiClock, FiUser, FiShield, FiLock, FiCheckCircle } from "react-icons/fi";
import { format } from "date-fns";

const Payment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await appointmentAPI.getById(appointmentId);
        setAppointment(res.data.data.appointment);
      } catch (error) {
        console.error("Error fetching appointment:", error);
        toast.error("Failed to load appointment details.");
      } finally {
        setPageLoading(false);
      }
    };
    fetchAppointment();
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

      if (isDemo) {
        // Automatically confirm in demo mode after a small delay
        toast.info("Demo Mode: Processing secure payment...");
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
        }, 2000);
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "CareSync",
        description: "Medical Consultation Payment",
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentAPI.confirm({
              paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful! Your appointment is confirmed.");
            navigate('/patient/appointments');
          } catch (error) {
            toast.error("Payment confirmation failed.");
          }
        },
        prefill: {
          name: appointment?.patientId?.name || "",
          email: appointment?.patientId?.email || "",
        },
        theme: {
          color: "#0ea5e9",
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

  if (pageLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Breadcrumb / Step Indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm text-slate-400">
        <span className="flex items-center gap-1"><FiCheckCircle className="text-emerald-500" /> Book</span>
        <div className="w-8 h-[1px] bg-slate-200"></div>
        <span className="font-bold text-primary-600 px-3 py-1 bg-primary-50 rounded-full">Secure Payment</span>
        <div className="w-8 h-[1px] bg-slate-200"></div>
        <span>Confirm</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiShield className="text-primary-600" /> Order Summary
            </h2>

            {/* Doctor Info */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600">
                <FiUser size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Doctor</p>
                <h3 className="font-bold text-slate-800 text-lg">Dr. {appointment?.doctorId?.name}</h3>
                <p className="text-sm text-slate-500">{appointment?.doctorId?.specialization || 'Specialist'}</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><FiCalendar /> Date</span>
                <span className="font-semibold text-slate-800">
                  {appointment?.date ? format(new Date(appointment.date), 'EEEE, MMM do, yyyy') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><FiClock /> Time Slot</span>
                <span className="font-semibold text-slate-800">
                  {appointment?.slot?.startTime} - {appointment?.slot?.endTime}
                </span>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100 w-full mb-6"></div>

            {/* Fees */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Consultation Fee</span>
                <span className="text-slate-800 font-medium">₹{appointment?.fees || 500}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Service Fee</span>
                <span className="text-emerald-500 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-dashed border-slate-200 mt-2">
                <span>Total Payable</span>
                <span>₹{appointment?.fees || 500}</span>
              </div>
            </div>
          </div>

          {/* Secure Badges */}
          <div className="flex items-center justify-center gap-6 py-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex flex-col items-center gap-1">
              <FiLock size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest">SSL Encrypted</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FiCreditCard size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest">PCI Compliant</span>
            </div>
          </div>
        </div>

        {/* Right Column: Action Card */}
        <div className="bg-primary-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary-200 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <FiCreditCard size={32} />
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight">Secure Checkout</h2>
            <p className="text-primary-100 mb-8 text-lg opacity-80">
              Ready to confirm your appointment? Click the button below to proceed to our secure payment gateway.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-white text-primary-600 hover:bg-primary-50 disabled:bg-primary-200 disabled:text-primary-400 font-bold py-5 px-8 rounded-2xl text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{appointment?.fees || 500}</span>
                </>
              )}
            </button>
            <p className="text-center text-primary-200 text-xs flex items-center justify-center gap-2">
              <FiShield /> Guaranteed safe & secure checkout
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;