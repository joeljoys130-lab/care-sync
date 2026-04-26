const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const resetPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/caresync');
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const result = await User.updateMany({}, { 
      $set: { 
        password: hashedPassword,
        isVerified: true,
        isActive: true,
        isApproved: true
      } 
    });

    console.log(`Updated ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetPasswords();
