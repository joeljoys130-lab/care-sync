require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Appointment = require('./backend/models/Appointment');
const Payment = require('./backend/models/Payment');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Find the last cancelled appointment
    const lastCancelled = await Appointment.findOne({ status: 'cancelled' }).sort({ updatedAt: -1 });
    if (!lastCancelled) {
        console.log('No cancelled appointments found.');
    } else {
        console.log('Last Cancelled Appointment:', {
            id: lastCancelled._id,
            status: lastCancelled.status,
            isPaid: lastCancelled.isPaid,
            fees: lastCancelled.fees
        });

        const payment = await Payment.findOne({ appointmentId: lastCancelled._id });
        console.log('Associated Payment:', payment ? {
            id: payment._id,
            status: payment.status,
            amount: payment.amount
        } : 'None found');
    }
    process.exit();
}
check();
