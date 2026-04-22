const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const path = require('path');

// ─── Create Medical Record (Doctor only) ──────────────────────────────────────
exports.createRecord = async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).json({ success: false, message: 'Only doctors can create records.' });

  const { appointmentId, patientId, diagnosis, symptoms, prescriptions, labTests, followUpDate, doctorNotes } =
    req.body;

  // Validate appointment belongs to this doctor
  const appointment = await Appointment.findOne({ _id: appointmentId, doctorId: req.user.id });
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  // Handle uploaded files
  const files = req.files
    ? req.files.map((f) => ({
        filename: f.filename,
        originalName: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        path: `/uploads/medical/${f.filename}`,
      }))
    : [];

  const record = await MedicalRecord.create({
    patientId,
    doctorId: req.user.id,
    appointmentId,
    diagnosis,
    symptoms: symptoms ? JSON.parse(symptoms) : [],
    prescriptions: prescriptions ? JSON.parse(prescriptions) : [],
    labTests: labTests ? JSON.parse(labTests) : [],
    followUpDate,
    doctorNotes,
    files,
  });

  // Link record to appointment
  await Appointment.findByIdAndUpdate(appointmentId, {
    medicalRecordId: record._id,
    status: 'completed',
  });

  res.status(201).json({
    success: true,
    message: 'Medical record created.',
    data: { record },
  });
};

// ─── Get Medical Records for Patient ─────────────────────────────────────────
exports.getPatientRecords = async (req, res) => {
  const { patientId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Authorization: patient can view own records, doctor can view their patient's records
  if (req.user.role === 'patient') {
    if (req.user.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
  }

  const skip = (Number(page) - 1) * Number(limit);
  const query = { patientId, isSharedWithPatient: true };
  if (req.user.role === 'doctor') delete query.isSharedWithPatient;

  const total = await MedicalRecord.countDocuments(query);
  const records = await MedicalRecord.find(query)
    .populate('doctorId', 'name email')
    .populate('appointmentId', 'appointmentDate timeSlot')
    .sort({ visitDate: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: {
      records,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
  });
};

// ─── Get Single Record ────────────────────────────────────────────────────────
exports.getRecordById = async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate('doctorId', 'name email')
    .populate('patientId', 'name email')
    .populate('appointmentId');

  if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
  res.json({ success: true, data: { record } });
};

// ─── Update Medical Record ────────────────────────────────────────────────────
exports.updateRecord = async (req, res) => {
  const record = await MedicalRecord.findOne({ _id: req.params.id, doctorId: req.user.id });
  if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });

  const updates = req.body;
  if (updates.symptoms) updates.symptoms = JSON.parse(updates.symptoms);
  if (updates.prescriptions) updates.prescriptions = JSON.parse(updates.prescriptions);

  Object.assign(record, updates);
  await record.save();

  res.json({ success: true, message: 'Record updated.', data: { record } });
};
