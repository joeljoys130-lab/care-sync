require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const patientUser = await User.findOne({ email: 'jovabsabu2006@gmail.com' });
  const patient = await Patient.findOne({ userId: patientUser._id });

  const query = { patientId: patient._id };
  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email avatar' },
      });
      
  console.log("Total:", total);
  if (appointments.length > 0) {
     console.log("First:", appointments[0].doctorId ? "Populated" : "Not populated");
  } else {
     console.log("No appointments found with query:", query);
  }

  mongoose.disconnect();
});
