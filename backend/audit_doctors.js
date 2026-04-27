require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const auditDoctors = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    
    const doctors = await Doctor.find({}).populate('userId');
    console.log('📋 Database Audit:');
    
    if (doctors.length === 0) {
      console.log('❌ No doctors found in Doctor collection!');
    } else {
      doctors.forEach(d => {
        console.log(`- ID: ${d._id}`);
        console.log(`  Name: ${d.userId ? d.userId.name : 'MISSING'}`);
        console.log(`  Role: ${d.userId ? d.userId.role : 'N/A'}`);
        console.log(`  Approved: ${d.isApproved}`);
        console.log(`  Verified: ${d.userId ? d.userId.isVerified : 'N/A'}`);
        console.log(`  Specialization: ${d.specialization}`);
        console.log('-------------------');
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

auditDoctors();
