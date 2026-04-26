const axios = require('axios');

const testAdminAppts = async () => {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@caresync.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login successful');

    const apptsRes = await axios.get('http://localhost:5000/api/admin/appointments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('API Response:', JSON.stringify(apptsRes.data, null, 2));

  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
};

testAdminAppts();
