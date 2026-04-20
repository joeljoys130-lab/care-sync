import { useQuery } from '@tanstack/react-query';
import { patientAPI } from '../../api';
import DoctorCard from '../../components/DoctorCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patient-favorites'],
    queryFn: patientAPI.getFavorites,
  });

  const favorites = data?.data?.data?.favorites || [];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Favorite Doctors</h1>
        <p className="page-subtitle">{favorites.length} saved doctors</p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : favorites.length === 0 ? (
        <div className="card text-center py-20">
          <FiHeart className="mx-auto text-5xl text-slate-200 mb-4" />
          <h3 className="text-slate-600 font-semibold">No favorites yet</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">Save doctors you love for quick access</p>
          <Link to="/patient/doctors" className="btn-primary btn-sm">Browse Doctors</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} isFavorite onFavoriteToggle={refetch} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
