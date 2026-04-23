import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorAPI } from '../../api';
import AppointmentCard from '../../components/AppointmentCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { toast } from 'react-toastify';
import { FiCalendar } from 'react-icons/fi';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const DoctorAppointments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-appointments', activeTab, page],
    queryFn: () => doctorAPI.getMyAppointments({ status: activeTab === 'all' ? '' : activeTab, page, limit: 8 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }) => doctorAPI.updateMyAppointment(id, { status, notes }),
    onSuccess: () => { toast.success('Appointment updated.'); qc.invalidateQueries(['doctor-appointments']); },
    onError: () => toast.error('Update failed.'),
  });

  const appointments = data?.data?.data?.appointments || [];
  const pagination = data?.data?.data?.pagination || {};

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Manage Appointments</h1>
        <p className="page-subtitle">{pagination.total ?? 0} total</p>
      </div>

      <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-card mb-6 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`flex-1 min-w-max py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner className="h-64" /> : appointments.length === 0 ? (
        <div className="card text-center py-16">
          <FiCalendar className="mx-auto text-5xl text-slate-200 mb-4" />
          <p className="text-slate-500">No {activeTab !== 'all' ? activeTab : ''} appointments</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {appointments.map((appt) => (
              <AppointmentCard key={appt._id} appointment={appt} role="doctor"
                onConfirm={(a) => updateMutation.mutate({ id: a._id, status: 'confirmed' })}
                onComplete={(a) => updateMutation.mutate({ id: a._id, status: 'completed' })}
                onCancel={(a) => updateMutation.mutate({ id: a._id, status: 'cancelled' })}
              />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={pagination.pages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default DoctorAppointments;
