import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
