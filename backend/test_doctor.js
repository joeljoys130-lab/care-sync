const axios = require('axios');
axios.get('http://localhost:5000/api/doctors/69ec592662b411de66411fe3')
  .then(res => console.log('Doctor details:', JSON.stringify(res.data, null, 2).slice(0, 500)))
  .catch(err => console.error('Error fetching doctor:', err.response?.data || err.message));
