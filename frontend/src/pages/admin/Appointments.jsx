import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
const STATUS_STYLES = {
  pending: 'badge-warning', confirmed: 'badge-primary',
  completed: 'badge-success', cancelled: 'badge-danger',
};

const AdminAppointments = () => {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appointments', status, page],
    queryFn: () => adminAPI.getAllAppointments({ status: status === 'all' ? '' : status, page, limit: 12 }),
  });

  const appointments = data?.data?.data?.appointments || [];
  const pagination = data?.data?.data?.pagination || {};

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">All Appointments</h1>
        <p className="page-subtitle">{pagination.total ?? 0} total</p>
      </div>

      <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-card mb-6 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((t) => (
          <button key={t} onClick={() => { setStatus(t); setPage(1); }}
            className={`flex-1 min-w-max py-2.5 px-4 rounded-xl text-sm font-medium transition ${
              status === t ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Patient', 'Doctor', 'Date & Time', 'Type', 'Fees', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16 text-slate-400">No appointments found</td></tr>
                  ) : appointments.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-medium text-slate-700">{a.patientId?.userId?.name || '—'}</td>
                      <td className="px-5 py-4 text-slate-500">Dr. {a.doctorId?.userId?.name || '—'}</td>
                      <td className="px-5 py-4 text-slate-500">
                        <p>{format(new Date(a.appointmentDate), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-slate-400">{a.slot?.startTime} – {a.slot?.endTime}</p>
                      </td>
                      <td className="px-5 py-4 capitalize text-slate-500">{a.type}</td>
                      <td className="px-5 py-4 font-medium text-slate-700">${a.fees}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${STATUS_STYLES[a.status] || 'badge-gray'}`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={page} totalPages={pagination.pages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminAppointments;
