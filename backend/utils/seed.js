require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([User.deleteMany(), Doctor.deleteMany(), Patient.deleteMany()]);

  // Admin
  const admin = await User.create({
    name: 'Admin User', email: 'admin@caresync.com', password: 'admin123',
    role: 'admin', isVerified: true, isActive: true,
  });

  // Doctors
  const doctorUsers = await User.create([
    { name: 'Sarah Johnson', email: 'sarah@caresync.com', password: 'doctor123', role: 'doctor', isVerified: true, isActive: true },
    { name: 'Michael Chen', email: 'michael@caresync.com', password: 'doctor123', role: 'doctor', isVerified: true, isActive: true },
    { name: 'Emily Rodriguez', email: 'emily@caresync.com', password: 'doctor123', role: 'doctor', isVerified: true, isActive: true },
    { name: 'James Wilson', email: 'james@caresync.com', password: 'doctor123', role: 'doctor', isVerified: true, isActive: true },
    { name: 'Priya Patel', email: 'priya@caresync.com', password: 'doctor123', role: 'doctor', isVerified: true, isActive: true },
  ]);

  const doctorProfiles = [
    { specialization: 'Cardiology', experience: 15, fees: 200, bio: 'Experienced cardiologist with expertise in heart disease prevention and treatment.', city: 'New York', hospital: 'City Heart Center', rating: 4.8, totalReviews: 124, isApproved: true },
    { specialization: 'Neurology', experience: 12, fees: 180, bio: 'Board-certified neurologist specializing in epilepsy and movement disorders.', city: 'San Francisco', hospital: 'Bay Area Medical', rating: 4.6, totalReviews: 98, isApproved: true },
    { specialization: 'Dermatology', experience: 8, fees: 150, bio: 'Expert in skin conditions, cosmetic procedures, and dermatological surgery.', city: 'Los Angeles', hospital: 'Westside Clinic', rating: 4.9, totalReviews: 210, isApproved: true },
    { specialization: 'Orthopedics', experience: 20, fees: 220, bio: 'Orthopedic surgeon with 20 years of experience in joint replacement.', city: 'Chicago', hospital: 'Midwest Orthopedic', rating: 4.7, totalReviews: 156, isApproved: true },
    { specialization: 'Pediatrics', experience: 10, fees: 120, bio: 'Compassionate pediatrician dedicated to children\'s health and wellness.', city: 'Boston', hospital: 'Children\'s Care Center', rating: 4.9, totalReviews: 302, isApproved: false },
  ];

  const availability = [
    { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true },
    { day: 'Friday', startTime: '09:00', endTime: '13:00', slotDuration: 30, isAvailable: true },
  ];

  for (let i = 0; i < doctorUsers.length; i++) {
    await Doctor.create({ userId: doctorUsers[i]._id, ...doctorProfiles[i], availability });
  }

  // Patients
  const patientUsers = await User.create([
    { name: 'Alice Thompson', email: 'alice@example.com', password: 'patient123', role: 'patient', isVerified: true, isActive: true },
    { name: 'Bob Martin', email: 'bob@example.com', password: 'patient123', role: 'patient', isVerified: true, isActive: true },
    { name: 'Carol Davis', email: 'carol@example.com', password: 'patient123', role: 'patient', isVerified: true, isActive: true },
  ]);

  for (const pu of patientUsers) {
    await Patient.create({ userId: pu._id, bloodGroup: 'O+', gender: 'other' });
  }

  console.log('\n✅ Seed complete!\n');
  console.log('📋 Login Credentials:');
  console.log('─────────────────────────────────────────');
  console.log('🔴 Admin:    admin@caresync.com / admin123');
  console.log('🟢 Doctor:   sarah@caresync.com / doctor123');
  console.log('🔵 Patient:  alice@example.com / patient123');
  console.log('─────────────────────────────────────────');

  await mongoose.connection.close();
};

seed().catch((err) => { console.error(err); process.exit(1); });
