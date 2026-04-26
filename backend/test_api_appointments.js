require('dotenv').config({ path: './.env' });
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: 'jovabsabu2006@gmail.com' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  try {
    const res = await axios.get('http://localhost:5000/api/patients/appointments?status=&page=1&limit=8', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }

  mongoose.disconnect();
});
