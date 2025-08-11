const axios = require('axios');

// Test both money and blood donations like the client would send them
async function testDonationSystem() {
  try {
    console.log('Testing donation server from client perspective...');
    
    // Test 1: Money donation through bKash
    console.log('\nTest 1: Money donation via bKash');
    const moneyDonation = {
      user_id: '64a7e6d2c0274ae0e7594c17',
      name: 'Mahmudul Mashrafe',
      phone_number: '01798210399',
      amount: 500,
      payment_method: 'bkash',
      donation_type: 'money',
      transaction_id: `TRX${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`
    };
    
    console.log('Sending money donation data:', moneyDonation);
    
    const moneyResponse = await axios.post('http://localhost:5004/api/donations/create', moneyDonation);
    console.log('Money donation result:', {
      success: moneyResponse.data.success,
      message: moneyResponse.data.message,
      donation_id: moneyResponse.data.donation?._id
    });
    
    // Test 2: Blood donation
    console.log('\nTest 2: Blood donation');
    const bloodDonation = {
      user_id: '64a7e6d2c0274ae0e7594c17',
      name: 'Mahmudul Mashrafe',
      phone_number: '01798210399',
      amount: 0,
      payment_method: 'none',
      donation_type: 'blood',
      blood_type: 'O+',
      location: 'Dhaka Medical College',
      available_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
    };
    
    console.log('Sending blood donation data:', bloodDonation);
    
    const bloodResponse = await axios.post('http://localhost:5004/api/donations/create', bloodDonation);
    console.log('Blood donation result:', {
      success: bloodResponse.data.success,
      message: bloodResponse.data.message,
      donation_id: bloodResponse.data.donation?._id
    });
    
    // Test 3: Retrieve blood donors
    console.log('\nTest 3: Retrieving blood donors');
    const donorsResponse = await axios.get('http://localhost:5004/api/donations/blood-donors');
    console.log(`Found ${donorsResponse.data.donors.length} blood donors`);
    
    return {
      moneyDonationId: moneyResponse.data.donation?._id,
      bloodDonationId: bloodResponse.data.donation?._id
    };
    
  } catch (error) {
    console.error('Error in client test:');
    
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
  }
}

// Run the test
testDonationSystem()
  .then(results => {
    console.log('\nTest completed successfully!');
    console.log('Donation IDs created:', results);
  })
  .catch(error => {
    console.error('Test failed:', error.message);
  }); 