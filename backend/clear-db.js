require('dotenv').config();
const mongoose = require('mongoose');

const Appointment = require('./models/Appointment');
const User = require('./models/User');
const MedicalRecord = require('./models/MedicalRecord');
const Payment = require('./models/payment.model');

const clearDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing database...');

    await Appointment.deleteMany({});
    await User.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Payment.deleteMany({});

    console.log('✅ Database cleared successfully');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearDatabase();