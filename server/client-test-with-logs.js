const axios = require('axios');

// Create a custom instance of axios with logging
const httpClient = axios.create();

// Add request interceptor for logging
httpClient.interceptors.request.use(request => {
  console.log('--------------------------------------------------');
  console.log('Request:', {
    method: request.method.toUpperCase(),
    url: request.url,
    data: request.data
  });
  return request;
});

// Add response interceptor for logging
httpClient.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    console.log('--------------------------------------------------');
    return response;
  },
  error => {
    if (error.response) {
      console.error('Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.log('--------------------------------------------------');
    return Promise.reject(error);
  }
);

// Simulate client donation submission with the same structure as Community.jsx
async function simulateClientDonationSubmission() {
  try {
    console.log('\n===== Simulating client donation submission =====\n');
    
    // Mock user info from Community.jsx
    const currentUserInfo = {
      _id: "64a7e6d2c0274ae0e7594c17",
      name: 'Mahmudul Mashrafe',
      phone_number: '01798210399',
      email: 'mm4pro@gmail.com',
      profileImage: '1742210420322-257970452.png'
    };
    
    // 1. Simulate money donation using card method
    console.log('\n----- Money Donation (Card) -----');
    const cardDonationData = {
      user_id: currentUserInfo._id,
      name: currentUserInfo.name,
      phone_number: currentUserInfo.phone_number,
      amount: 250,
      payment_method: 'card',
      donation_type: 'money'
    };
    
    console.log('Preparing donation data:', cardDonationData);
    
    // This is exactly how Community.jsx makes the request
    await httpClient.post('http://localhost:5004/api/donations/create', cardDonationData);
    
    // 2. Simulate bKash payment
    console.log('\n----- Money Donation (bKash) -----');
    const bkashNumber = '01798210399';
    const amount = '1000';
    const transactionId = `TRX${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Prepare bKash donation data - exactly as in Community.jsx
    const bkashDonationData = {
      user_id: currentUserInfo._id,
      name: currentUserInfo.name,
      phone_number: bkashNumber,
      amount: parseFloat(amount),
      payment_method: 'bkash',
      donation_type: 'money',
      transaction_id: transactionId
    };
    
    console.log('Preparing bKash payment data:', bkashDonationData);
    
    await httpClient.post('http://localhost:5004/api/donations/create', bkashDonationData);
    
    // 3. Simulate blood donation
    console.log('\n----- Blood Donation -----');
    const bloodDonationData = {
      user_id: currentUserInfo._id,
      name: currentUserInfo.name,
      phone_number: currentUserInfo.phone_number,
      amount: 0,
      payment_method: 'none',
      donation_type: 'blood',
      blood_type: 'B+',
      location: 'Chittagong Medical College',
      available_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    console.log('Preparing blood donation data:', bloodDonationData);
    
    await httpClient.post('http://localhost:5004/api/donations/create', bloodDonationData);
    
  } catch (error) {
    console.error('Error in client simulation:', error.message);
  }
}

// Run the simulation
simulateClientDonationSubmission()
  .then(() => {
    console.log('\n===== Client simulation completed =====');
    
    // Verify the data was stored by querying blood donors
    return httpClient.get('http://localhost:5004/api/donations/blood-donors');
  })
  .then(response => {
    console.log(`\nVerification: Found ${response.data.donors.length} blood donors`);
  })
  .catch(error => {
    console.error('Error during simulation:', error.message);
  }); 