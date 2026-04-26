const mongoose = require('mongoose');
const Doctor = require('./backend/models/Doctor');
require('dotenv').config({ path: './backend/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const doc = await Doctor.findOne({ _id: '69ec592662b411de66411fe3' }); // ID from URL
  if (doc) {
    console.log(JSON.stringify(doc.availability, null, 2));
  } else {
    console.log("Doctor not found!");
  }
  mongoose.disconnect();
}).catch(console.error);
