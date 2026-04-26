import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordAPI } from '../api';
import Modal from './ui/Modal';
import { FiPlus, FiTrash2, FiSave, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MedicalRecordModal = ({ isOpen, onClose, appointment }) => {
  const qc = useQueryClient();
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState(['']);
  const [prescriptions, setPrescriptions] = useState([{ medicine: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  const recordId = typeof appointment?.medicalRecordId === 'object' ? appointment.medicalRecordId._id : appointment?.medicalRecordId;

  const { data: recordData, isLoading } = useQuery({
    queryKey: ['medical-record', recordId],
    queryFn: () => recordAPI.getById(recordId),
    enabled: !!recordId && isOpen,
  });

  const record = recordData?.data?.data?.record;

  const createMutation = useMutation({
    mutationFn: (data) => recordAPI.create(data),
    onSuccess: () => {
      toast.success('Medical record created successfully!');
      qc.invalidateQueries(['doctor-appointments']);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create record.');
    },
  });

  const handleAddSymptom = () => setSymptoms([...symptoms, '']);
  const handleRemoveSymptom = (index) => setSymptoms(symptoms.filter((_, i) => i !== index));
  const handleSymptomChange = (index, value) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index] = value;
    setSymptoms(newSymptoms);
  };

  const handleAddPrescription = () => setPrescriptions([...prescriptions, { medicine: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  const handleRemovePrescription = (index) => setPrescriptions(prescriptions.filter((_, i) => i !== index));
  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index][field] = value;
    setPrescriptions(newPrescriptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) return toast.error('Diagnosis is required.');

    const payload = {
      appointmentId: appointment._id,
      patientId: appointment.patientId?._id || appointment.patientId,
      diagnosis,
      symptoms: JSON.stringify(symptoms.filter(s => s.trim())),
      prescriptions: JSON.stringify(prescriptions.filter(p => p.medicine.trim())),
      followUpDate,
      doctorNotes,
    };

    createMutation.mutate(payload);
  };

  if (recordId) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Medical Record Details" maxWidth="max-w-2xl">
        {isLoading ? (
          <div className="flex justify-center p-8"><span className="animate-pulse text-primary-500">Loading record...</span></div>
        ) : !record ? (
          <div className="p-8 text-center text-slate-500">Record not found.</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Diagnosis</h3>
              <p className="text-slate-800 font-medium text-lg">{record.diagnosis}</p>
            </div>
            
            {record.symptoms && record.symptoms.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Symptoms</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {record.symptoms.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {record.prescriptions && record.prescriptions.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Prescriptions</h3>
                <div className="space-y-2">
                  {record.prescriptions.map((p, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div><span className="text-[10px] text-slate-400 block uppercase font-bold">Medicine</span><span className="font-medium text-sm text-slate-800">{p.medicine}</span></div>
                      <div><span className="text-[10px] text-slate-400 block uppercase font-bold">Dosage</span><span className="text-sm text-slate-600">{p.dosage || '-'}</span></div>
                      <div><span className="text-[10px] text-slate-400 block uppercase font-bold">Frequency</span><span className="text-sm text-slate-600">{p.frequency || '-'}</span></div>
                      <div><span className="text-[10px] text-slate-400 block uppercase font-bold">Duration</span><span className="text-sm text-slate-600">{p.duration || '-'}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Follow-up Date</h3>
                <p className="text-slate-700 text-sm">{record.followUpDate ? new Date(record.followUpDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'None scheduled'}</p>
              </div>
              {record.doctorNotes && (
                <div>
                  <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Private Notes</h3>
                  <p className="text-slate-700 text-sm bg-amber-50 p-3 rounded-xl border border-amber-100">{record.doctorNotes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={onClose} className="btn-ghost">Close View</button>
            </div>
          </div>
        )}
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Medical Record" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Diagnosis */}
        <div>
          <label className="label">Diagnosis <span className="text-red-500">*</span></label>
          <input
            type="text"
            className="input"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Common Cold, Hypertension"
            required
          />
        </div>

        {/* Symptoms */}
        <div>
          <label className="label flex justify-between items-center">
            Symptoms
            <button type="button" onClick={handleAddSymptom} className="text-primary-600 text-xs flex items-center gap-1 hover:underline">
              <FiPlus /> Add Symptom
            </button>
          </label>
          <div className="space-y-2">
            {symptoms.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={s}
                  onChange={(e) => handleSymptomChange(i, e.target.value)}
                  placeholder="e.g. Fever, Cough"
                />
                {symptoms.length > 1 && (
                  <button type="button" onClick={() => handleRemoveSymptom(i)} className="text-red-400 hover:text-red-600 p-2">
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Prescriptions */}
        <div>
          <label className="label flex justify-between items-center">
            Prescriptions
            <button type="button" onClick={handleAddPrescription} className="text-primary-600 text-xs flex items-center gap-1 hover:underline">
              <FiPlus /> Add Medicine
            </button>
          </label>
          <div className="space-y-3">
            {prescriptions.map((p, i) => (
              <div key={i} className="card bg-slate-50 border-slate-200 p-4 relative">
                <button type="button" onClick={() => handleRemovePrescription(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1">
                  <FiTrash2 />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Medicine</label>
                    <input type="text" className="input input-sm" value={p.medicine} onChange={(e) => handlePrescriptionChange(i, 'medicine', e.target.value)} placeholder="Name" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Dosage</label>
                    <input type="text" className="input input-sm" value={p.dosage} onChange={(e) => handlePrescriptionChange(i, 'dosage', e.target.value)} placeholder="e.g. 500mg" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Frequency</label>
                    <input type="text" className="input input-sm" value={p.frequency} onChange={(e) => handlePrescriptionChange(i, 'frequency', e.target.value)} placeholder="e.g. 2x Daily" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Duration</label>
                    <input type="text" className="input input-sm" value={p.duration} onChange={(e) => handlePrescriptionChange(i, 'duration', e.target.value)} placeholder="e.g. 5 days" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Follow-up */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Follow-up Date</label>
            <input type="date" className="input" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="label">Private Doctor Notes</label>
            <textarea className="input min-h-[42px]" value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)} placeholder="Only you can see this..." />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
            <FiSave /> {createMutation.isPending ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MedicalRecordModal;
