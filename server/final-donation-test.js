const axios = require('axios');

// Simulate the client donation process exactly as used in Community.jsx
async function testDonationFlow() {
  try {
    console.log('==== TESTING DONATION FLOW ====');
    
    // Mock user data as it would be in the client
    const user = {
      _id: '64a7e6d2c0274ae0e7594c17',
      name: 'Mahmudul Hasan',
      phone_number: '01798210399'
    };
    
    // Test 1: Money donation with bKash
    console.log('\n1. Testing bKash Money Donation:');
    const bkashAmount = 500;
    const bkashTrxId = 'TRX' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const bkashDonation = {
      user_id: user._id,
      name: user.name,
      phone_number: user.phone_number,
      amount: bkashAmount,
      payment_method: 'bkash',
      donation_type: 'money',
      transaction_id: bkashTrxId
    };
    
    console.log('Sending bKash donation data:', bkashDonation);
    
    const bkashResponse = await axios.post('http://localhost:5004/api/donations/create', bkashDonation);
    
    console.log('bKash donation successful:', {
      success: bkashResponse.data.success,
      message: bkashResponse.data.message,
      id: bkashResponse.data.donation?._id
    });
    
    // Test 2: Blood donation
    console.log('\n2. Testing Blood Donation:');
    
    const bloodDonation = {
      user_id: user._id, 
      name: user.name,
      phone_number: user.phone_number,
      amount: 0,
      payment_method: 'none',
      donation_type: 'blood',
      blood_type: 'A+',
      location: 'Dhaka Medical College Hospital',
      available_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
    };
    
    console.log('Sending blood donation data:', bloodDonation);
    
    const bloodResponse = await axios.post('http://localhost:5004/api/donations/create', bloodDonation);
    
    console.log('Blood donation successful:', {
      success: bloodResponse.data.success,
      message: bloodResponse.data.message,
      id: bloodResponse.data.donation?._id
    });
    
    // Test 3: Verify blood donors
    console.log('\n3. Verifying blood donors API:');
    
    const donorsResponse = await axios.get('http://localhost:5004/api/donations/blood-donors');
    
    console.log(`Found ${donorsResponse.data.donors.length} blood donors, first 2 shown:`);
    donorsResponse.data.donors.slice(0, 2).forEach((donor, i) => {
      console.log(`   ${i+1}. ${donor.name} (${donor.blood_type}) at ${donor.location}`);
    });
    
    // Test 4: Verify user donations
    console.log('\n4. Verifying user donations API:');
    
    const userDonationsResponse = await axios.get(`http://localhost:5004/api/donations/user/${user._id}`);
    
    console.log(`Found ${userDonationsResponse.data.donations.length} donations for user ${user.name}`);
    userDonationsResponse.data.donations.slice(0, 3).forEach((donation, i) => {
      console.log(`   ${i+1}. Type: ${donation.donation_type}, Amount: ${donation.amount}, Method: ${donation.payment_method}`);
    });
    
    return {
      success: true,
      message: 'All tests completed successfully'
    };
    
  } catch (error) {
    console.error('Error in donation flow test:');
    if (error.response) {
      console.error('Server response error:', {
        status: error.response.status,
        message: error.response.data
      });
    } else if (error.request) {
      console.error('No response received from server. Is it running?');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testDonationFlow()
  .then(result => {
    console.log('\nFinal result:', result);
  })
  .catch(err => {
    console.error('Uncaught error:', err);
  }); 