const Payment = require('../models/payment.model');

exports.createPayment = async (req, res, next) => {
    try{
        const { amount } = req.body;

        const payment = await Payment.create({
            userId: req.user.id,
            amount,
            status: "success",
            transactionId: "TXN" + Date.now()
        });

        res.status(201).json({
            success: true,
            payment
        });
    }
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
};

exports.getPayments = async (req, res, next) =>{
    try{
        const payments = await Payment.find({ userId: req.user.id });

        res.status(200).json({
            success: true,
            payments
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
};