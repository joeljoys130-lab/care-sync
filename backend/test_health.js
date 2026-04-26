const axios = require('axios');
axios.get('http://localhost:5000/api/health')
  .then(res => console.log('Server is running:', res.data))
  .catch(err => console.error('Server is down!', err.message));
