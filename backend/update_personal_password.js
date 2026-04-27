require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const updateUserPassword = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    const email = 'joeljoymaniyamkeril@gmail.com';
    const hashedPassword = await bcrypt.hash('123456', 10);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { new: true }
    );

    if (user) {
      console.log(`✅ Password updated for: ${user.email}`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateUserPassword();
