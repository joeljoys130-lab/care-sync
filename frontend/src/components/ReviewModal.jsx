import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewAPI } from '../api';
import Modal from './ui/Modal';
import StarRating from './ui/StarRating';
import { toast } from 'react-toastify';

const ReviewModal = ({ isOpen, onClose, appointment }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const qc = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: (data) => reviewAPI.create(data),
    onSuccess: () => {
      toast.success('Review submitted successfully.');
      qc.invalidateQueries(['doctor-reviews']);
      qc.invalidateQueries(['patient-appointments']);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit review.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!appointment?.doctorId?._id) {
      return toast.error('Doctor information is missing.');
    }
    reviewMutation.mutate({
      appointmentId: appointment._id,
      doctorId: appointment.doctorId._id,
      rating,
      comment,
      isAnonymous
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Review">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Rating</label>
          <div className="flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={star <= rating ? 'text-amber-400' : 'text-slate-300'}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input min-h-[100px] resize-none"
            placeholder="Share your experience..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded text-primary-600"
          />
          <label htmlFor="anonymous" className="text-sm text-slate-600">Post anonymously</label>
        </div>

        <button
          type="submit"
          disabled={reviewMutation.isPending}
          className="btn-primary w-full mt-4"
        >
          {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </Modal>
  );
};

export default ReviewModal;
