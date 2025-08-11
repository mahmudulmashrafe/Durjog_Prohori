const axios = require('axios');

// Create a test donation
const testDonation = async () => {
  try {
    console.log('Testing donation creation...');
    
    const donationData = {
      user_id: '64a7e6d2c0274ae0e7594c17',
      name: 'Test User',
      phone_number: '01798210399',
      amount: 500,
      payment_method: 'card',
      donation_type: 'money',
      transaction_id: `TEST-${Date.now()}`
    };
    
    console.log('Sending donation data:', donationData);
    console.log('Sending to URL: http://localhost:5000/api/donations/create');
    
    const response = await axios.post(
      'http://localhost:5000/api/donations/create', 
      donationData, 
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log('Response status:', response.status);
    console.log('Success! Server responded with:', response.data);
    
    if (response.data.donation && response.data.donation._id) {
      console.log(`\nVerifying donation with ID: ${response.data.donation._id}`);
      
      try {
        const verifyResponse = await axios.get(`http://localhost:5000/api/donations/test-database`);
        console.log('Database verification result:', 
          verifyResponse.data.databaseInfo ? JSON.stringify(verifyResponse.data.databaseInfo) : 'Not available');
      } catch (verifyError) {
        console.log('Could not verify donation in database (test-database endpoint may not be available)');
      }
    }
    
    return response.data.donation;
  } catch (error) {
    console.error('Error creating donation:', error.message);
    
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Server response status:', error.response.status);
      console.error('Server response data:', error.response.data);
      console.error('Server response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Request details:', error.request._currentUrl);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return null;
  }
};

// Test the server health
const testHealth = async () => {
  try {
    console.log('Testing server health...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('Health check result:', response.data);
    return true;
  } catch (error) {
    console.error('Health check failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Server is not running or not accepting connections on port 5000');
    }
    
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log('=== DONATION API TEST ===');
  console.log('Current time:', new Date().toISOString());
  console.log('========================\n');
  
  const serverRunning = await testHealth();
  
  if (serverRunning) {
    const donation = await testDonation();
    
    if (donation) {
      console.log('\n✅ Test completed successfully!');
      console.log('Donation ID:', donation._id);
    } else {
      console.error('\n❌ Test failed - could not create donation');
    }
  } else {
    console.error('Server is not running. Skipping donation test.');
  }
};

runTests(); 