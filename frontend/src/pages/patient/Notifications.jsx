import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const TYPE_COLORS = {
  appointment_booked: 'bg-blue-50 text-blue-600',
  appointment_confirmed: 'bg-green-50 text-green-600',
  appointment_cancelled: 'bg-red-50 text-red-600',
  payment_success: 'bg-emerald-50 text-emerald-600',
  doctor_approved: 'bg-purple-50 text-purple-600',
  system: 'bg-slate-50 text-slate-600',
};

const Notifications = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-all'],
    queryFn: () => notificationAPI.getAll({ limit: 50 }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationAPI.markAllRead,
    onSuccess: () => { qc.invalidateQueries(['notifications-all']); qc.invalidateQueries(['notifications-unread']); },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationAPI.delete,
    onSuccess: () => qc.invalidateQueries(['notifications-all']),
  });

  const markReadMutation = useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => { qc.invalidateQueries(['notifications-all']); qc.invalidateQueries(['notifications-unread']); },
  });

  const notifications = data?.data?.data?.notifications || [];
  const unreadCount = data?.data?.data?.unreadCount || 0;

  return (
    <div className="page-wrapper max-w-3xl">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="btn-ghost btn-sm text-primary-600">
            <FiCheck /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : notifications.length === 0 ? (
        <div className="card text-center py-20">
          <FiBell className="mx-auto text-5xl text-slate-200 mb-4" />
          <h3 className="text-slate-600 font-semibold">No notifications</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card py-4 px-5 flex items-start gap-4 transition ${!n.isRead ? 'border-l-4 border-primary-400 bg-primary-50/30' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${TYPE_COLORS[n.type] || 'bg-slate-50 text-slate-500'}`}>
                <FiBell />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${!n.isRead ? 'text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-300 mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.isRead && (
                  <button onClick={() => markReadMutation.mutate(n._id)}
                    className="p-1.5 rounded-lg hover:bg-green-50 text-slate-300 hover:text-green-500 transition" title="Mark as read">
                    <FiCheck className="text-xs" />
                  </button>
                )}
                <button onClick={() => deleteMutation.mutate(n._id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition" title="Delete">
                  <FiTrash2 className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
