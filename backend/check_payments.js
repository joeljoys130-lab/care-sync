const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const dotenv = require('dotenv');

dotenv.config();

const checkPayments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/caresync');
    console.log('Connected to MongoDB');

    const payments = await Payment.find({});
    console.log('Payments in database:');
    console.log(JSON.stringify(payments, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkPayments();
