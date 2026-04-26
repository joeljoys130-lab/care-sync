require('dotenv').config();
const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/doctors/69ec592662b411de66411fe3/slots?date=2026-04-27');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
}

test();
