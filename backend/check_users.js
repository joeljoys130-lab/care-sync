const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/caresync');
    console.log('Connected to MongoDB');

    const users = await User.find({}, { password: 0 });
    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsers();
