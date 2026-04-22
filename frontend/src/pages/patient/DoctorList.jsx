import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorAPI, patientAPI } from '../../api';
import DoctorCard from '../../components/DoctorCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const SPECIALIZATIONS = ['', 'Cardiology', 'Dermatology', 'General', 'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry'];
const SORT_OPTIONS = [
  { value: 'rating', order: 'desc', label: 'Highest Rated' },
  { value: 'fees', order: 'asc', label: 'Lowest Fees' },
  { value: 'fees', order: 'desc', label: 'Highest Fees' },
  { value: 'experience', order: 'desc', label: 'Most Experienced' },
];

const DoctorList = () => {
  const [filters, setFilters] = useState({
    search: '', specialization: '', city: '', minFees: '', maxFees: '', sortBy: 'rating', order: 'desc',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: favData } = useQuery({ queryKey: ['patient-favorites'], queryFn: patientAPI.getFavorites });
  const favoriteIds = new Set((favData?.data?.data?.favorites || []).map((d) => d._id));

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', filters, page],
    queryFn: () => doctorAPI.getDoctors({ ...filters, page, limit: 9 }),
    keepPreviousData: true,
  });

  const doctors = data?.data?.data?.doctors || [];
  const pagination = data?.data?.data?.pagination || {};

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', specialization: '', city: '', minFees: '', maxFees: '', sortBy: 'rating', order: 'desc' });
    setPage(1);
  };

  const hasFilters = filters.search || filters.specialization || filters.city || filters.minFees || filters.maxFees;

  return (
    <div className="page-wrapper">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Find Doctors</h1>
          <p className="page-subtitle">{pagination.total ?? 0} verified doctors available</p>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`btn-outline btn-sm ${showFilters ? 'bg-primary-50' : ''}`}
        >
          <FiFilter /> Filters
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
        <input
          type="text"
          placeholder="Search doctors by name..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="input pl-12 text-base h-12"
        />
        {filters.search && (
          <button onClick={() => handleFilterChange('search', '')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-400">
            <FiX />
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card mb-6 animate-slide-up">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Specialization</label>
              <select value={filters.specialization} onChange={(e) => handleFilterChange('specialization', e.target.value)} className="select">
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">City</label>
              <input value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}
                className="input" placeholder="e.g. New York" />
            </div>
            <div>
              <label className="label">Min Fees ($)</label>
              <input type="number" value={filters.minFees} onChange={(e) => handleFilterChange('minFees', e.target.value)}
                className="input" min="0" placeholder="0" />
            </div>
            <div>
              <label className="label">Max Fees ($)</label>
              <input type="number" value={filters.maxFees} onChange={(e) => handleFilterChange('maxFees', e.target.value)}
                className="input" min="0" placeholder="500" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <label className="label mb-0">Sort by:</label>
              <div className="flex gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.label} onClick={() => {
                      handleFilterChange('sortBy', opt.value);
                      handleFilterChange('order', opt.order);
                    }}
                    className={`btn-sm ${filters.sortBy === opt.value && filters.order === opt.order ? 'btn-primary' : 'btn-ghost border border-white/5'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:underline flex items-center gap-1">
                <FiX /> Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : doctors.length === 0 ? (
        <div className="card text-center py-16">
          <FiSearch className="mx-auto text-5xl text-slate-200 mb-4" />
          <h3 className="text-slate-400 font-semibold mb-2">No doctors found</h3>
          <p className="text-sm text-slate-400">Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} isFavorite={favoriteIds.has(doc._id)} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={pagination.pages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default DoctorList;
