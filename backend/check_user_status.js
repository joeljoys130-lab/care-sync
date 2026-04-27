require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    const email = 'joeljoymaniyamkeril@gmail.com';
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      console.log(`✅ User found:`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Verified: ${user.isVerified}`);
      console.log(`   - Active: ${user.isActive}`);
    } else {
      console.log(`❌ User NOT found: ${email}`);
      console.log(`🔍 Checking all users...`);
      const allUsers = await User.find({}, 'email name role').limit(5);
      console.log('   Recent users in DB:', allUsers.map(u => u.email));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUser();
