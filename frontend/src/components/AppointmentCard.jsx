import { format } from 'date-fns';
import { FiCalendar, FiClock, FiUser, FiMoreHorizontal } from 'react-icons/fi';

const STATUS_STYLES = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
  'no-show': 'badge-gray',
};

const AppointmentCard = ({ appointment, role, onCancel, onReschedule, onConfirm, onComplete }) => {
  const { doctorId, patientId, appointmentDate, slot, status, reason, fees, type } = appointment;

  const doctor = doctorId?.userId;
  const patient = patientId?.userId;

  const dateStr = appointmentDate
    ? format(new Date(appointmentDate), 'EEE, MMM dd yyyy')
    : 'N/A';

  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            {role === 'patient' ? (
              doctor?.avatar ? (
                <img src={doctor.avatar} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-primary-600 font-bold">{doctor?.name?.charAt(0)}</span>
              )
            ) : patient?.avatar ? (
              <img src={patient.avatar} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-primary-600 font-bold">{patient?.name?.charAt(0)}</span>
            )}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">
              {role === 'patient' ? `Dr. ${doctor?.name}` : patient?.name}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{reason}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><FiCalendar className="text-primary-400" />{dateStr}</span>
              <span className="flex items-center gap-1"><FiClock className="text-primary-400" />{slot?.startTime} - {slot?.endTime}</span>
              <span className="flex items-center gap-1"><FiUser className="text-primary-400" />{type}</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`badge ${STATUS_STYLES[status] || 'badge-gray'}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </span>
          <span className="text-sm font-semibold text-slate-700">₹{fees}</span>
        </div>
      </div>

      {/* Actions */}
      {['pending', 'confirmed'].includes(status) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          {role === 'patient' && status === 'pending' && (
            <button onClick={() => onReschedule?.(appointment)} className="btn-outline btn-sm flex-1">
              Reschedule
            </button>
          )}
          {(role === 'patient' || role === 'doctor' || role === 'admin') && (
            <button onClick={() => onCancel?.(appointment)} className="btn-danger btn-sm flex-1">
              Cancel
            </button>
          )}
          {role === 'doctor' && status === 'pending' && (
            <button onClick={() => onConfirm?.(appointment)} className="btn-primary btn-sm flex-1">
              Confirm
            </button>
          )}
          {role === 'doctor' && status === 'confirmed' && (
            <button onClick={() => onComplete?.(appointment)} className="btn-secondary btn-sm flex-1">
              Mark Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
