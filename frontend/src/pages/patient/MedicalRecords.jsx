import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../api';
import { recordAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FiFileText, FiDownload, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import { useState } from 'react';
import Pagination from '../../components/ui/Pagination';

const MedicalRecords = () => {
  const [page, setPage] = useState(1);

  const { data: profileData } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: patientAPI.getProfile,
  });

  const patientId = profileData?.data?.data?.patient?._id;

  const { data, isLoading } = useQuery({
    queryKey: ['medical-records', patientId, page],
    queryFn: () => recordAPI.getPatientRecords(patientId, { page, limit: 8 }),
    enabled: !!patientId,
  });

  const records = data?.data?.data?.records || [];
  const pagination = data?.data?.data?.pagination || {};

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Medical Records</h1>
        <p className="page-subtitle">{pagination.total ?? 0} records found</p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : records.length === 0 ? (
        <div className="card text-center py-20">
          <FiFileText className="mx-auto text-5xl text-slate-200 mb-4" />
          <h3 className="text-slate-400 font-semibold">No medical records yet</h3>
          <p className="text-sm text-slate-400 mt-2">Records will appear here after completed appointments</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record._id} className="card animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiFileText className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{record.diagnosis}</p>
                      <p className="text-sm text-primary-600 mt-0.5">
                        Dr. {record.doctorId?.userId?.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <FiCalendar className="flex-shrink-0" />
                        {format(new Date(record.visitDate), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <span className="badge-primary text-xs">
                    {record.prescriptions?.length ?? 0} prescription{record.prescriptions?.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Symptoms */}
                {record.symptoms?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-400 font-medium mb-2">Symptoms</p>
                    <div className="flex flex-wrap gap-1">
                      {record.symptoms.map((s, i) => <span key={i} className="badge-gray text-xs">{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Prescriptions */}
                {record.prescriptions?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-slate-400 font-medium mb-2">Prescriptions</p>
                    <div className="space-y-2">
                      {record.prescriptions.map((p, i) => (
                        <div key={i} className="bg-green-50 rounded-xl p-3 text-xs">
                          <p className="font-semibold text-green-800">{p.medicine} — {p.dosage}</p>
                          <p className="text-green-600">{p.frequency} for {p.duration}</p>
                          {p.notes && <p className="text-green-500 mt-0.5">{p.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files */}
                {record.files?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-slate-400 font-medium mb-2">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {record.files.map((f, i) => (
                        <a key={i} href={f.path} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 bg-[#1c283d]/50 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition">
                          <FiDownload className="text-xs" />{f.originalName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up */}
                {record.followUpDate && (
                  <div className="mt-3 bg-amber-50 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
                    <FiCalendar /> Follow-up on: <strong>{format(new Date(record.followUpDate), 'MMMM d, yyyy')}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={pagination.pages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default MedicalRecords;
