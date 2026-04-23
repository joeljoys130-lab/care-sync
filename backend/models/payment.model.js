const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    },

    transactionId: {
        type: String
    }
},
{
    timestamps: true
});

const payment = mongoose.model("Payment",paymentSchema);

module.exports = payment;