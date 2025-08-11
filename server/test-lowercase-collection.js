const axios = require('axios');
const mongoose = require('mongoose');

// Test the donation server
async function testDonation() {
  try {
    // 1. Check server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5004/health');
    console.log('Health check response:', healthResponse.data);
    
    // 2. Make a test donation
    console.log('\n2. Making a test donation...');
    const testDonation = {
      user_id: '64a7e6d2c0274ae0e7594c17',
      name: 'Test Lowercase Collection',
      phone_number: '01798210399',
      amount: 750,
      payment_method: 'bkash',
      donation_type: 'money',
      transaction_id: 'LOWERCASE-TEST-' + Date.now()
    };
    
    const donationResponse = await axios.post('http://localhost:5004/api/donations/create', testDonation);
    console.log('Donation response:', donationResponse.data);
    
    // 3. Verify in the database directly
    console.log('\n3. Checking database directly...');
    await mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Check 'donation' collection (lowercase)
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    
    // Count documents in 'donation' collection
    const donationCount = await db.collection('donation').countDocuments();
    console.log(`Found ${donationCount} documents in 'donation' collection`);
    
    // Get the latest donation
    const latestDonation = await db.collection('donation')
      .find()
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    
    console.log('Latest donation:', latestDonation[0]);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    return {
      success: true,
      message: 'Test completed successfully'
    };
  } catch (error) {
    console.error('Test error:', error.message);
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testDonation()
  .then(result => {
    console.log('\nTest result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
  }); 