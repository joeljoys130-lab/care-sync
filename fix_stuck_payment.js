require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Payment = require('./backend/models/Payment');
const Doctor = require('./backend/models/Doctor');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the Dr. John payment that is completed but the appt is cancelled
    const payment = await Payment.findOne({ 
      status: 'completed', 
      amount: 350 
    }).sort({ createdAt: -1 });

    if (payment) {
      console.log('Found payment for Dr. John. Refunding now...');
      payment.status = 'refunded';
      payment.refundAmount = payment.amount;
      payment.refundedAt = new Date();
      payment.refundReason = 'Automated refund after system update';
      await payment.save();

      // Deduct from doctor
      await Doctor.findByIdAndUpdate(payment.doctorId, {
        $inc: { totalEarnings: -payment.amount }
      });
      
      console.log('✅ Success! The payment has been refunded.');
    } else {
      console.log('No eligible payment found to fix.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
fix();
