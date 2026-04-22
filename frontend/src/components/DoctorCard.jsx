import { useNavigate } from 'react-router-dom';
import { FiHeart, FiStar, FiMapPin, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import StarRating from './ui/StarRating';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SPECIALIZATION_COLORS = {
  Cardiology: 'bg-red-50 text-red-600',
  Dermatology: 'bg-pink-50 text-pink-600',
  Neurology: 'bg-purple-50 text-purple-600',
  Orthopedics: 'bg-orange-50 text-orange-600',
  Pediatrics: 'bg-green-50 text-green-600',
  General: 'bg-blue-50 text-blue-600',
  default: 'bg-primary-50 text-primary-600',
};

const DoctorCard = ({ doctor, isFavorite = false, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { userId: userInfo, _id, specialization, experience, fees, city, rating, totalReviews } = doctor;

  const favMutation = useMutation({
    mutationFn: () => patientAPI.toggleFavorite(_id),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient-favorites']);
      queryClient.invalidateQueries(['doctors']);
      onFavoriteToggle?.();
    },
    onError: () => toast.error('Failed to update favorites.'),
  });

  const colorClass = SPECIALIZATION_COLORS[specialization] || SPECIALIZATION_COLORS.default;

  return (
    <div className="card-hover flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-50 flex items-center justify-center flex-shrink-0">
          {userInfo?.avatar ? (
            <img src={userInfo.avatar} alt={userInfo.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary-600 font-bold text-xl">
              {userInfo?.name?.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-800 truncate">Dr. {userInfo?.name}</h3>
              <span className={`badge text-xs mt-1 ${colorClass}`}>{specialization}</span>
            </div>
            {user?.role === 'patient' && (
              <button
                onClick={(e) => { e.stopPropagation(); favMutation.mutate(); }}
                className={`p-1.5 rounded-lg transition ${isFavorite ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-red-400'}`}
              >
                <FiHeart className={isFavorite ? 'fill-red-500' : ''} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <FiBriefcase className="text-primary-400 flex-shrink-0" />
          <span>{experience} yr{experience !== 1 ? 's' : ''} exp.</span>
        </div>
        {city && (
          <div className="flex items-center gap-1.5">
            <FiMapPin className="text-primary-400 flex-shrink-0" />
            <span className="truncate">{city}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <FiDollarSign className="text-primary-400 flex-shrink-0" />
          <span>₹{fees} / visit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StarRating rating={rating} size="sm" />
          <span className="text-xs text-slate-400">({totalReviews})</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => navigate(`/patient/doctors/${_id}`)}
          className="btn-outline flex-1 btn-sm"
        >
          View Profile
        </button>
        {user?.role === 'patient' && (
          <button
            onClick={() => navigate(`/patient/book/${_id}`)}
            className="btn-primary flex-1 btn-sm"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;
