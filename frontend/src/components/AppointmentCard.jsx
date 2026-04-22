import { format, parseISO } from 'date-fns';
import { FiCalendar, FiClock, FiUser, FiX } from 'react-icons/fi';

/**
 * AppointmentCard
 *
 * Props:
 *   appointment — appointment object (populated doctorId / patientId)
 *   role        — 'patient' | 'doctor' — controls whose name to show
 *   onCancel    — callback(appointment) — called when user clicks Cancel
 *
 * Expected shape:
 * {
 *   _id, appointmentDate, timeSlot, status,
 *   doctorId: { name, specialization },
 *   patientId: { name }
 * }
 */

const STATUS_STYLES = {
  confirmed:  'bg-green-50  text-green-700  border-green-200',
  pending:    'bg-amber-50  text-amber-700  border-amber-200',
  completed:  'bg-blue-50   text-blue-700   border-blue-200',
  cancelled:  'bg-red-50    text-red-600    border-red-200',
  rescheduled:'bg-purple-50 text-purple-700 border-purple-200',
};

const formatDate = (raw) => {
  if (!raw) return '—';
  try {
    const d = typeof raw === 'string' ? parseISO(raw) : new Date(raw);
    return format(d, 'EEE, d MMM yyyy');
  } catch {
    return raw;
  }
};

const AppointmentCard = ({ appointment, role = 'patient', onCancel }) => {
  if (!appointment) return null;

  const doctor  = appointment.doctorId;
  const patient = appointment.patientId;

  const displayName = role === 'patient'
    ? `Dr. ${doctor?.name || 'Unknown Doctor'}`
    : (patient?.name || 'Unknown Patient');

  const subLabel = role === 'patient'
    ? (doctor?.specialization || 'General Practice')
    : patient?.email || '';

  const statusClass = STATUS_STYLES[appointment.status] || STATUS_STYLES.pending;
  const canCancel   = onCancel && !['cancelled', 'completed'].includes(appointment.status);

  return (
    <div className="bg-[#131d30]/60 rounded-2xl border border-white/5 shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
        <FiUser className="text-primary-600 text-xl" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{displayName}</p>
        <p className="text-sm text-slate-400 truncate">{subLabel}</p>

        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <FiCalendar className="text-primary-400" />
            {formatDate(appointment.appointmentDate)}
          </span>
          {appointment.timeSlot && (
            <span className="flex items-center gap-1">
              <FiClock className="text-primary-400" />
              {appointment.timeSlot}
            </span>
          )}
        </div>
      </div>

      {/* Status + Cancel */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${statusClass}`}>
          {appointment.status || 'pending'}
        </span>

        {canCancel && (
          <button
            onClick={() => onCancel(appointment)}
            aria-label="Cancel appointment"
            className="p-2 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition"
          >
            <FiX className="text-lg" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
