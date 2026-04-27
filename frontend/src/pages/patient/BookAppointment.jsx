import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doctorAPI, appointmentAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DatePicker from 'react-datepicker';
import { addDays, format } from 'date-fns';
import { FiCalendar, FiClock, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import Avatar from '../../components/ui/Avatar';


const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [type, setType] = useState('in-person');
  
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { data: docData, isLoading: docLoading } = useQuery({
    queryKey: ['doctor-detail', doctorId],
    queryFn: () => doctorAPI.getDoctorById(doctorId),
  });

  const { data: slotData, isLoading: slotLoading } = useQuery({
    queryKey: ['doctor-slots', doctorId, selectedDate],
    queryFn: () => doctorAPI.getAvailableSlots(doctorId, format(selectedDate, 'yyyy-MM-dd')),
    enabled: !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: (data) => appointmentAPI.book(data),
    onError: (err) => toast.error(err.response?.data?.message || 'Booking failed.'),
  });

  const doc = docData?.data?.data?.doctor;
  const userInfo = doc?.userId;
  const slots = slotData?.data?.data?.slots || [];

  const isAvailableDay = (date) => {
    if (!doc?.availability || doc.availability.length === 0) return false;
    const dayName = format(date, 'EEEE');
    return doc.availability.some(slot => slot.day === dayName && slot.isAvailable !== false);
  };

  const handleStartBooking = async () => {
    if (!selectedDate || !selectedSlot || !reason.trim()) {
      return toast.warning('Please fill all required fields.');
    }
    
    setPaymentLoading(true);

    try {
      const res = await bookMutation.mutateAsync({
        doctorId,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        slot: selectedSlot,
        reason,
        type,
      });

      const appointmentId = res.data.data.appointment._id;
      toast.success('Appointment Booked! Redirecting to payment...');
      navigate(`/patient/payment/${appointmentId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (docLoading) return <LoadingSpinner className="h-96" />;
  if (!doc) return <div className="page-wrapper text-center py-20 text-slate-500">Doctor not found.</div>;

  return (
    <div className="page-wrapper max-w-3xl relative">
      <div className="page-header">
        <h1 className="page-title">Book Appointment</h1>
        <p className="page-subtitle">with Dr. {userInfo?.name}</p>
      </div>

      {/* Doctor summary */}
      <div className="card mb-6 flex items-center gap-4">
        <Avatar src={userInfo?.avatar} name={userInfo?.name} size="w-14 h-14" />
        <div className="flex-1">
          <p className="font-semibold text-slate-800">Dr. {userInfo?.name}</p>
          <p className="text-sm text-slate-500">{doc.specialization}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-600">₹{doc.fees}</p>
          <p className="text-xs text-slate-400">per consultation</p>
        </div>
      </div>

      {/* Step 1: Date & Slot */}
      <div className="card mb-6">
        <h2 className="section-title">1. Select Date & Time</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="label">Appointment Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
                minDate={new Date()}
                maxDate={addDays(new Date(), 30)}
                filterDate={isAvailableDay}
                placeholderText="Select a date"
                dateFormat="MMMM d, yyyy"
                inline
                className="w-full"
              />
              {(!doc?.availability || doc.availability.length === 0) && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  ⚠️ This doctor hasn't set their weekly schedule yet.
                </p>
              )}
          </div>

          <div>
            <label className="label">Available Time Slots</label>
            {!selectedDate ? (
              <div className="text-slate-400 text-sm text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                Select a date to see available slots
              </div>
            ) : slotLoading ? (
              <LoadingSpinner />
            ) : slots.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                No slots available on this day
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {slots.map((slot, i) => (
                  <button key={i} onClick={() => !slot.isBooked && setSelectedSlot(slot)}
                    disabled={slot.isBooked}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition ${
                      slot.isBooked ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                      : selectedSlot?.startTime === slot.startTime ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50 text-slate-600'
                    }`}
                  >
                    <FiClock className="inline mr-1 text-xs" />
                    {slot.startTime}
                    {slot.isBooked && <span className="block text-xs">Booked</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Details */}
      <div className="card mb-6">
        <h2 className="section-title">2. Appointment Details</h2>

        <div className="space-y-4">
          <div>
            <label className="label">Reason for Visit <span className="text-red-400">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="Briefly describe your symptoms or reason for the visit..."
              maxLength={500}
            />
            <p className="text-xs text-slate-400 text-right">{reason.length}/500</p>
          </div>

          <div>
            <label className="label">Appointment Type</label>
            <div className="flex gap-3">
              {['in-person', 'video', 'phone'].map((t) => (
                <label key={t} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition text-sm ${
                  type === t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500'
                }`}>
                  <input type="radio" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
                  <span className="capitalize">{t === 'in-person' ? '🏥 In-Person' : t === 'video' ? '📹 Video' : '📞 Phone'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Summary & Trigger Official Razorpay Payment */}
      <div className="card border-2 border-primary-100 animate-slide-up mb-6">
        <h2 className="section-title">Booking Summary</h2>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between"><span className="text-slate-500">Doctor</span><span className="font-medium">Dr. {userInfo?.name}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Please select a date'}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-medium">{selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : 'Please select a time slot'}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium capitalize">{type}</span></div>
          <div className="flex justify-between pt-2 border-t border-slate-100"><span className="font-semibold">Total</span><span className="text-primary-600 font-bold">₹{doc.fees}</span></div>
        </div>

        <button onClick={handleStartBooking} disabled={paymentLoading || !selectedDate || !selectedSlot || !reason.trim()} className="btn-primary w-full btn-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed">
          <div className="flex items-center justify-center gap-2 relative z-10">
             {paymentLoading ? (
               <span className="animate-pulse">Confirming...</span>
             ) : (
               <>
                 <FiCalendar /> Confirm Booking
               </>
             )}
          </div>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
        </button>
      </div>
    </div>
  );
};

export default BookAppointment;
