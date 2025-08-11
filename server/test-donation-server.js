const axios = require('axios');

// Test donation data
const donationData = {
  user_id: '64a7e6d2c0274ae0e7594c17', // Use a valid ObjectId format
  name: 'Test User',
  phone_number: '01712345678',
  amount: 100,
  payment_method: 'bkash',
  donation_type: 'money',
  transaction_id: `TRX${Math.random().toString(36).substring(2, 10).toUpperCase()}`
};

console.log('Starting donation server test...');

// First test the server health
axios.get('http://localhost:5004/health')
  .then(response => {
    console.log('Donation server health check:', response.data);
    
    // Now test creating a donation
    console.log('Creating test donation...');
    return axios.post('http://localhost:5004/api/donations/create', donationData);
  })
  .then(response => {
    console.log('Donation created successfully:', response.data);
    
    // Store the donation ID
    const donationId = response.data.donation._id;
    
    // Verify we can retrieve the donation
    console.log(`Retrieving donation with ID: ${donationId}`);
    return axios.get(`http://localhost:5004/api/donations/${donationId}`);
  })
  .then(response => {
    console.log('Retrieved donation:', response.data);
    
    // Test retrieving donations by user ID
    console.log('Retrieving donations for user:', donationData.user_id);
    return axios.get(`http://localhost:5004/api/donations/user/${donationData.user_id}`);
  })
  .then(response => {
    console.log(`Found ${response.data.donations.length} donations for user:`, response.data.donations);
    
    // Test retrieving blood donors
    console.log('Retrieving blood donors:');
    return axios.get('http://localhost:5004/api/donations/blood-donors');
  })
  .then(response => {
    console.log(`Found ${response.data.donors.length} blood donors`);
  })
  .catch(error => {
    console.error('Error in test script:');
    
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Server error:', {
        status: error.response.status,
        data: error.response.data,
        path: error.response.config.url
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Make sure the donation server is running on port 5004');
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
  }); 