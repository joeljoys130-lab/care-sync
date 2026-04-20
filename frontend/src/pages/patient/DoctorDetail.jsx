import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doctorAPI, reviewAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StarRating from '../../components/ui/StarRating';
import { FiBriefcase, FiMapPin, FiDollarSign, FiCalendar, FiAward, FiHeart } from 'react-icons/fi';
import { format } from 'date-fns';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: docData, isLoading } = useQuery({
    queryKey: ['doctor-detail', id],
    queryFn: () => doctorAPI.getDoctorById(id),
  });

  const { data: reviewData } = useQuery({
    queryKey: ['doctor-reviews', id],
    queryFn: () => reviewAPI.getDoctorReviews(id, { limit: 5 }),
  });

  if (isLoading) return <LoadingSpinner className="h-96" />;

  const doc = docData?.data?.data?.doctor;
  const userInfo = doc?.userId;
  const reviews = reviewData?.data?.data?.reviews || [];

  if (!doc) return <div className="page-wrapper text-center py-20 text-slate-500">Doctor not found.</div>;

  return (
    <div className="page-wrapper">
      {/* Hero card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary-50 flex items-center justify-center flex-shrink-0">
            {userInfo?.avatar ? (
              <img src={userInfo.avatar} alt={userInfo.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-600 font-bold text-4xl">{userInfo?.name?.charAt(0)}</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Dr. {userInfo?.name}</h1>
                <span className="badge-primary inline-block mt-1">{doc.specialization}</span>
              </div>
              <button
                onClick={() => navigate(`/patient/book/${doc._id}`)}
                className="btn-primary btn-lg"
              >
                <FiCalendar /> Book Appointment
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <FiBriefcase className="text-primary-400" />
                {doc.experience} years experience
              </div>
              <div className="flex items-center gap-1.5">
                <FiDollarSign className="text-primary-400" />
                ₹{doc.fees} consultation fee
              </div>
              {doc.city && (
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="text-primary-400" />
                  {doc.city}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <StarRating rating={doc.rating} />
                <span className="text-slate-400">({doc.totalReviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {doc.bio && (
            <div className="card">
              <h2 className="section-title">About</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{doc.bio}</p>
            </div>
          )}

          {/* Qualifications */}
          {doc.qualifications?.length > 0 && (
            <div className="card">
              <h2 className="section-title">Qualifications</h2>
              <div className="space-y-3">
                {doc.qualifications.map((q, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiAward className="text-primary-600 text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{q.degree}</p>
                      <p className="text-xs text-slate-400">{q.institution}{q.year ? ` · ${q.year}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient Reviews */}
          <div className="card">
            <h2 className="section-title">Patient Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-xs">
                          {r.patientId?.userId?.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{r.patientId?.userId?.name}</p>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      <span className="ml-auto text-xs text-slate-400">{format(new Date(r.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    {r.comment && <p className="text-sm text-slate-600 ml-11">{r.comment}</p>}
                    {r.doctorReply && (
                      <div className="ml-11 mt-2 bg-primary-50 rounded-xl p-3 text-xs text-primary-700">
                        <span className="font-semibold">Doctor's reply: </span>{r.doctorReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col — Availability */}
        <div>
          <div className="card sticky top-24">
            <h2 className="section-title">Availability</h2>
            {doc.availability?.length === 0 ? (
              <p className="text-sm text-slate-400">No availability set.</p>
            ) : (
              <div className="space-y-2">
                {doc.availability.filter((a) => a.isAvailable).map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                    <span className="font-medium text-slate-700">{a.day}</span>
                    <span className="text-slate-500">{a.startTime} – {a.endTime}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate(`/patient/book/${doc._id}`)}
              className="btn-primary w-full mt-4"
            >
              <FiCalendar /> Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
