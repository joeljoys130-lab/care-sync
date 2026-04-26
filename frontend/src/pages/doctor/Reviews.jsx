import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { FiStar, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const DoctorReviews = () => {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-my-reviews', page],
    queryFn: () => reviewAPI.getMyReviews({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => reviewAPI.deleteReview(id),
    onSuccess: () => {
      toast.success('Review deleted.');
      qc.invalidateQueries(['doctor-my-reviews']);
    },
    onError: () => toast.error('Failed to delete review.'),
  });

  const reviews = data?.data?.data?.reviews || [];
  const pagination = data?.data?.data?.pagination || {};

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Patient Reviews</h1>
        <p className="page-subtitle">{pagination.total ?? 0} reviews received</p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : reviews.length === 0 ? (
        <div className="card text-center py-16">
          <FiMessageSquare className="mx-auto text-5xl text-slate-200 mb-4" />
          <p className="text-slate-500">No reviews yet.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {reviews.map((review) => (
              <div key={review._id} className="card relative group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.patientId?.userId?.avatar ? (
                        <img src={review.patientId.userId.avatar} alt="patient" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary-600 font-bold">{review.patientId?.userId?.name?.charAt(0) || 'P'}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{review.patientId?.userId?.name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-400">{format(new Date(review.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex text-amber-400 text-sm mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={i < review.rating ? 'fill-current' : 'text-slate-200'} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-slate-600 mt-2">{review.comment}</p>}
                </div>
              </div>
            ))}
          </div>

          <Pagination currentPage={page} totalPages={pagination.pages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default DoctorReviews;
