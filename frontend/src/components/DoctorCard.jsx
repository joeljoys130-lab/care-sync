import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientAPI } from '../api';
import { FiHeart, FiStar, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * DoctorCard
 *
 * Props:
 *   doctor     — doctor object from GET /api/doctors
 *   isFavorite — boolean, whether this doctor is in the patient's favorites
 *
 * Handles:
 *   • Book Appointment → navigate to /patient/book/:id
 *   • Toggle Favorite  → calls patientAPI.toggleFavorite
 */
const DoctorCard = ({ doctor, isFavorite = false }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // name lives directly on the User/doctor doc
  const name         = doctor?.name || doctor?.userId?.name || 'Doctor';
  const specialization = doctor?.specialization || 'General Practice';
  const fees         = doctor?.fees ?? doctor?.consultationFee ?? '—';
  const rating       = doctor?.rating ?? null;
  const city         = doctor?.address?.city || doctor?.city || null;
  const experience   = doctor?.experience ?? null;

  const favMutation = useMutation({
    mutationFn: () => patientAPI.toggleFavorite(doctor._id),
    onSuccess: () => {
      qc.invalidateQueries(['patient-favorites']);
      qc.invalidateQueries(['doctors']);
    },
    onError: () => toast.error('Could not update favorites'),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-shadow p-5 flex flex-col gap-4">
      {/* Avatar + Favorite */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            {doctor?.avatar ? (
              <img src={doctor.avatar} alt={name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-primary-700 font-bold text-lg">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">Dr. {name}</p>
            <p className="text-xs text-primary-600 mt-0.5">{specialization}</p>
          </div>
        </div>

        {/* Favorite button */}
        <button
          onClick={() => favMutation.mutate()}
          disabled={favMutation.isPending}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-2 rounded-xl transition ${
            isFavorite
              ? 'bg-red-50 text-red-500'
              : 'hover:bg-slate-100 text-slate-300'
          }`}
        >
          <FiHeart className={isFavorite ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {rating !== null && (
          <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-medium">
            <FiStar className="fill-amber-400 stroke-amber-400" /> {rating.toFixed(1)}
          </span>
        )}
        {city && (
          <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full">
            <FiMapPin /> {city}
          </span>
        )}
        {experience !== null && (
          <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full">
            {experience} yrs exp
          </span>
        )}
      </div>

      {/* Fee + Book */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
        <div>
          <p className="text-xs text-slate-400">Consultation</p>
          <p className="text-lg font-bold text-primary-600 leading-tight">
            <span className="text-sm font-normal">₹</span>{fees}
          </p>
        </div>
        <button
          onClick={() => navigate(`/patient/book/${doctor._id}`)}
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
