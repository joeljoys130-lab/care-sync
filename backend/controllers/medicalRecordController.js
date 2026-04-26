const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const path = require('path');

// ─── Create Medical Record (Doctor only) ──────────────────────────────────────
exports.createRecord = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can create records.' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const {
      appointmentId,
      patientId,
      diagnosis,
      symptoms,
      prescriptions,
      labTests,
      followUpDate,
      doctorNotes,
    } = req.body;

    // Validate appointment belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

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
      doctorId: doctor._id,
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
  } catch (err) {
    next(err);
  }
};

// ─── Get Medical Records for Patient ─────────────────────────────────────────
exports.getPatientRecords = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Authorization
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
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Record ────────────────────────────────────────────────────────
exports.getRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email')
      .populate('appointmentId');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    res.json({ success: true, data: { record } });
  } catch (err) {
    next(err);
  }
};

// ─── Update Medical Record (SAFE) ─────────────────────────────────────────────
exports.updateRecord = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      doctorId: doctor?._id,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    const updates = req.body;

    // Safe JSON parsing
    if (updates.symptoms) {
      try {
        updates.symptoms = JSON.parse(updates.symptoms);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid symptoms format' });
      }
    }

    if (updates.prescriptions) {
      try {
        updates.prescriptions = JSON.parse(updates.prescriptions);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid prescriptions format' });
      }
    }

    // ✅ Whitelist fields (prevents mass assignment)
    const allowedFields = [
      'diagnosis',
      'symptoms',
      'prescriptions',
      'labTests',
      'followUpDate',
      'doctorNotes',
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        record[field] = updates[field];
      }
    });

    await record.save();

    res.json({
      success: true,
      message: 'Record updated.',
      data: { record },
    });
  } catch (err) {
    next(err);
  }
};