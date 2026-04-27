require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const cleanDoctorNames = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in backend/.env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const doctors = await User.find({ role: 'doctor' });
    console.log(`🔍 Checking ${doctors.length} doctors...`);

    for (let doc of doctors) {
      // Remove "Dr. " or "Dr. Dr. " prefix from the name
      const oldName = doc.name;
      let newName = oldName.replace(/^(Dr\.\s*)+/i, '');
      
      if (oldName !== newName) {
        doc.name = newName;
        await doc.save();
        console.log(`✅ Cleaned name: "${oldName}" -> "${newName}"`);
      }
    }

    console.log('\n✨ All doctor names have been cleaned in the database.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanDoctorNames();
