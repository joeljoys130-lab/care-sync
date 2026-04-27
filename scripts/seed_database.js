require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../backend/models/User');
const Doctor = require('../backend/models/Doctor');
const Patient = require('../backend/models/Patient');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in backend/.env');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // 1. CLEAR COLLECTIONS
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      console.log(`🧹 Clearing collection: ${collection.collectionName}`);
      await collection.deleteMany({});
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    // 2. CREATE ADMIN
    console.log('👑 Creating Admin...');
    await User.create({
      name: 'CareSync Admin',
      email: 'caresynckalv@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isApproved: true
    });

    // 3. CREATE DOCTORS
    console.log('🩺 Creating Doctors...');
    const doctorsData = [
      { name: 'Dr. Sarah Smith', spec: 'Cardiology', fee: 800, city: 'New York', bio: 'Board-certified cardiologist with 15 years experience.' },
      { name: 'Dr. John Doe', spec: 'Pediatrics', fee: 500, city: 'London', bio: 'Expert in pediatric care and child development.' },
      { name: 'Dr. Emily Brown', spec: 'Neurology', fee: 1200, city: 'San Francisco', bio: 'Specialist in neurological disorders and brain health.' },
      { name: 'Dr. Michael Johnson', spec: 'Orthopedics', fee: 700, city: 'Chicago', bio: 'Sports medicine and joint replacement specialist.' },
      { name: 'Dr. Lisa Wong', spec: 'Dermatology', fee: 600, city: 'Singapore', bio: 'Clinical and cosmetic dermatology expert.' }
    ];

    for (let doc of doctorsData) {
      const user = await User.create({
        name: doc.name,
        email: `${doc.name.toLowerCase().replace(/^dr\. /i, '').replace(/ /g, '.')}@caresync.com`,
        password: hashedPassword,
        role: 'doctor',
        isVerified: true,
        isApproved: true
      });

      await Doctor.create({
        userId: user._id,
        specialization: doc.spec,
        fees: doc.fee,
        city: doc.city,
        bio: doc.bio,
        experience: 10,
        isApproved: true,
        rating: 4.8,
        totalReviews: 25,
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '14:00' }
        ]
      });
    }

    // 4. CREATE PATIENTS
    console.log('👤 Creating Patients...');
    const patientsData = ['Alice Miller', 'Bob Wilson', 'Charlie Davis'];
    for (let patName of patientsData) {
      const user = await User.create({
        name: patName,
        email: `${patName.toLowerCase().replace(/ /g, '.')}@gmail.com`,
        password: hashedPassword,
        role: 'patient',
        isVerified: true,
        isApproved: true
      });

      await Patient.create({
        userId: user._id,
        gender: 'other',
        phone: '+1 234 567 8900',
        bloodGroup: 'O+'
      });
    }

    console.log('\n✨ Database Seeded Successfully! Your app is ready for demo.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
