const axios = require('axios');

console.log('Testing donation server connection...');

// Simple health check
axios.get('http://localhost:5004/health')
  .then(response => {
    console.log('Server health check successful:', response.data);
    
    // Test donation creation
    const testDonation = {
      user_id: '64a7e6d2c0274ae0e7594c17',
      name: 'Test User',
      phone_number: '01700000000',
      amount: 500,
      payment_method: 'bkash',
      donation_type: 'money',
      transaction_id: 'TEST123456'
    };
    
    return axios.post('http://localhost:5004/api/donations/create', testDonation);
  })
  .then(response => {
    console.log('Donation creation successful:', response.data);
  })
  .catch(error => {
    console.error('Error testing server:');
    
    if (error.response) {
      console.error('Server error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received. Is the server running on port 5004?');
    } else {
      console.error('Request setup error:', error.message);
    }
  }); 