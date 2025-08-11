const axios = require('axios');

// Test exactly what the client sends for a donation
async function testClientDonation() {
  try {
    console.log('Testing a client-like donation submission...');
    
    // This data structure matches exactly what the client sends
    const donationData = {
      user_id: "64a7e6d2c0274ae0e7594c17",
      name: "Mahmudul Mashrafe",
      phone_number: "01798210399",
      amount: 1000,
      payment_method: "bkash",
      donation_type: "money",
      transaction_id: "TRX" + Date.now()
    };
    
    console.log('Sending donation data:', donationData);
    
    const response = await axios.post('http://localhost:5004/api/donations/create', donationData);
    
    console.log('Server response:', response.data);
    
    // Check that the ID was returned and log it
    if (response.data.donation && response.data.donation._id) {
      console.log('Donation ID:', response.data.donation._id);
      
      // Now verify we can find this donation in the database
      const verifyResponse = await axios.get(`http://localhost:5004/api/donations/${response.data.donation._id}`);
      console.log('Verification response:', verifyResponse.data);
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error in test:');
    if (error.response) {
      console.error('Server error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    } else {
      console.error('Request error:', error.message);
    }
  }
}

// Run the test
testClientDonation(); 