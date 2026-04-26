require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Appointment = require('./backend/models/Appointment');
const Patient = require('./backend/models/Patient');
const User = require('./backend/models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const patientUser = await User.findOne({ email: 'jovabsabu2006@gmail.com' });
  if (!patientUser) {
    console.log("User not found");
    return process.exit(0);
  }
  const patient = await Patient.findOne({ userId: patientUser._id });
  console.log("Patient ID:", patient?._id);

  const appointments = await Appointment.find({});
  console.log(`Total appointments in DB: ${appointments.length}`);
  
  const userAppointments = await Appointment.find({ patientId: patient?._id });
  console.log(`Appointments for this patient: ${userAppointments.length}`);

  if (appointments.length > 0) {
    console.log("First appointment details:", JSON.stringify(appointments[0], null, 2));
  }

  mongoose.disconnect();
});
