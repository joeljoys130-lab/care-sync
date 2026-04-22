import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientAPI, appointmentAPI } from '../../api';
import AppointmentCard from '../../components/AppointmentCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const MyAppointments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [cancelModal, setCancelModal] = useState({ open: false, appointment: null });
  const [cancelReason, setCancelReason] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['patient-appointments', activeTab, page],
    queryFn: () => patientAPI.getAppointments({ status: activeTab === 'all' ? '' : activeTab, page, limit: 8 }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => appointmentAPI.cancel(id, { reason }),
    onSuccess: () => {
      toast.success('Appointment cancelled successfully.');
      qc.invalidateQueries(['patient-appointments']);
      setCancelModal({ open: false, appointment: null });
      setCancelReason('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cancellation failed.'),
  });

  const appointments = data?.data?.data?.appointments || [];
  const pagination = data?.data?.data?.pagination || {};

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">{pagination.total ?? 0} total appointments</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-[#131d30]/60 rounded-2xl p-1 shadow-card mb-6 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`flex-1 min-w-max py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-primary-600 text-white shadow-2xl' : 'text-slate-400 hover:bg-[#1c283d]/50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : appointments.length === 0 ? (
        <div className="card text-center py-20">
          <FiCalendar className="mx-auto text-5xl text-slate-200 mb-4" />
          <h3 className="text-slate-400 font-semibold mb-2">No {activeTab !== 'all' ? activeTab : ''} appointments</h3>
          <p className="text-sm text-slate-400 mb-6">Your appointments will appear here</p>
          <Link to="/patient/doctors" className="btn-primary btn-sm">Book an Appointment</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt._id}
                appointment={appt}
                role="patient"
                onCancel={(a) => { setCancelModal({ open: true, appointment: a }); setCancelReason(''); }}
              />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={pagination.pages ?? 1} onPageChange={setPage} />
        </>
      )}

      {/* Cancel Modal */}
      <Modal isOpen={cancelModal.open} onClose={() => setCancelModal({ open: false, appointment: null })} title="Cancel Appointment">
        <p className="text-slate-400 text-sm mb-4">
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </p>
        <div>
          <label className="label">Reason for cancellation</label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="input min-h-[80px] resize-none"
            placeholder="Optional reason..."
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setCancelModal({ open: false, appointment: null })} className="btn-ghost flex-1">
            Keep Appointment
          </button>
          <button
            onClick={() => cancelMutation.mutate({ id: cancelModal.appointment?._id, reason: cancelReason })}
            disabled={cancelMutation.isPending}
            className="btn-danger flex-1"
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MyAppointments;
