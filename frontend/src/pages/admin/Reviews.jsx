import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { FiStar, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const AdminReviews = () => {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page],
    queryFn: () => adminAPI.getReviews({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteReview(id),
    onSuccess: () => {
      toast.success('Review deleted successfully.');
      qc.invalidateQueries(['admin-reviews']);
    },
    onError: () => toast.error('Failed to delete review.'),
  });

  const reviews = data?.data?.data?.reviews || [];
  const pagination = data?.data?.data?.pagination || {};

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Manage Reviews</h1>
        <p className="page-subtitle">{pagination.total ?? 0} total platform reviews</p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : reviews.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-500">No reviews found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4 max-w-[300px]">Comment</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        {review.isAnonymous ? 'Anonymous' : (review.patientId?.userId?.name || 'Unknown')}
                      </td>
                      <td className="px-6 py-4">
                        Dr. {review.doctorId?.userId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={i < review.rating ? 'fill-current' : 'text-slate-200'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[300px]" title={review.comment}>
                        {review.comment || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this review? This affects doctor rating.')) {
                              deleteMutation.mutate(review._id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete Review"
                        >
                          <FiTrash2 />
                        </button>
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

export default AdminReviews;
