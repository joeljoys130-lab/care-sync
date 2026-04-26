import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { FiUserCheck, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { MdStar } from 'react-icons/md';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useState } from 'react';

const AdminDoctors = () => {
  const qc = useQueryClient();
  const [rejectModal, setRejectModal] = useState({ open: false, doctorId: null });
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-doctors'],
    queryFn: adminAPI.getPendingDoctors,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved, reason }) => adminAPI.approveDoctor(id, { isApproved, reason }),
    onSuccess: (_, { isApproved }) => {
      toast.success(`Doctor ${isApproved ? 'approved' : 'rejected'} successfully.`);
      qc.invalidateQueries(['admin-pending-doctors']);
      qc.invalidateQueries(['admin-analytics']);
      setRejectModal({ open: false, doctorId: null });
      setRejectReason('');
    },
    onError: () => toast.error('Action failed.'),
  });

  const doctors = data?.data?.data?.doctors || [];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Doctor Approvals</h1>
        <p className="page-subtitle">{doctors.length} pending approval</p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : doctors.length === 0 ? (
        <div className="card text-center py-20">
          <FiUserCheck className="mx-auto text-5xl text-green-200 mb-4" />
          <h3 className="text-slate-600 font-semibold">All doctors are reviewed!</h3>
          <p className="text-sm text-slate-400 mt-1">No pending doctor approvals at this time.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div key={doc._id} className="card animate-fade-in">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  {doc.userId?.avatar ? (
                    <img src={doc.userId.avatar} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <span className="text-primary-600 font-bold text-xl">{doc.userId?.name?.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">Dr. {doc.userId?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{doc.userId?.email}</p>
                </div>
                <span className="badge-warning ml-auto flex-shrink-0 flex items-center gap-1">
                  <FiClock className="text-xs" /> Pending
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialization</span>
                  <span className="font-medium">{doc.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Experience</span>
                  <span className="font-medium">{doc.experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fees</span>
                  <span className="font-medium">₹{doc.fees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered</span>
                  <span className="text-slate-400">{format(new Date(doc.userId?.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setRejectModal({ open: true, doctorId: doc._id })}
                  className="btn-danger btn-sm flex-1"
                >
                  <FiXCircle /> Reject
                </button>
                <button
                  onClick={() => approveMutation.mutate({ id: doc._id, isApproved: true })}
                  disabled={approveMutation.isPending}
                  className="btn-secondary btn-sm flex-1"
                >
                  <FiCheckCircle /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, doctorId: null })} title="Reject Doctor Application">
        <p className="text-slate-500 text-sm mb-4">
          Please provide a reason for rejection. This will be sent to the doctor via notification.
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="input min-h-[80px] resize-none mb-4"
          placeholder="Reason for rejection..."
        />
        <div className="flex gap-3">
          <button onClick={() => setRejectModal({ open: false, doctorId: null })} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => approveMutation.mutate({ id: rejectModal.doctorId, isApproved: false, reason: rejectReason })}
            disabled={approveMutation.isPending}
            className="btn-danger flex-1"
          >
            Confirm Rejection
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDoctors;
