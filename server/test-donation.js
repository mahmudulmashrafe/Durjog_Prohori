/**
 * Test script for the donation API
 * Run with: node test-donation.js
 */

const axios = require('axios');

// Server configuration
const SERVER_URL = 'http://localhost:5000';
const API_BASE = `${SERVER_URL}/api/donations`;

// Generate a unique transaction ID
const generateTransactionId = () => {
  return `TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// Test function for health endpoint
const testHealth = async () => {
  try {
    console.log('Testing server health endpoint...');
    const response = await axios.get(`${SERVER_URL}/health`);
    console.log('✅ Server health response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
};

// Test function for donation route test endpoint
const testDonationRoutes = async () => {
  try {
    console.log('\nTesting donation routes...');
    const response = await axios.get(`${API_BASE}/test`);
    console.log('✅ Donation routes test response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Donation routes test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
};

// Test function for database connection
const testDatabaseConnection = async () => {
  try {
    console.log('\nTesting database connection...');
    const response = await axios.get(`${API_BASE}/test-database`);
    console.log('✅ Database test response:');
    console.log(`  Database: ${response.data.databaseInfo.name}`);
    console.log(`  Collection: ${response.data.databaseInfo.collection}`);
    console.log(`  Connected: ${response.data.databaseInfo.connected}`);
    console.log(`  Donation count: ${response.data.databaseInfo.donationCount}`);
    if (response.data.recentDonations && response.data.recentDonations.length > 0) {
      console.log(`  Recent donations: ${response.data.recentDonations.length}`);
      console.log(`  Latest donation ID: ${response.data.recentDonations[0]._id}`);
    } else {
      console.log('  No recent donations found');
    }
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
};

// Test function to create a money donation
const testCreateDonation = async () => {
  try {
    console.log('\nTesting donation creation...');
    
    // Create donation data
    const donationData = {
      user_id: '64a7e6d2c0274ae0e7594c17', // Use the provided user ID or a valid ObjectId
      name: 'Test User',
      phone_number: '01798210399',
      amount: 100.50,
      payment_method: 'card',
      donation_type: 'money',
      transaction_id: generateTransactionId()
    };
    
    console.log('Donation data:', donationData);
    
    // Send the request
    const response = await axios.post(`${API_BASE}/create`, donationData);
    
    console.log('✅ Donation created successfully!');
    console.log(`  Donation ID: ${response.data.donation._id}`);
    console.log(`  Timestamp: ${response.data.donation.timestamp}`);
    console.log(`  Status: ${response.data.donation.status}`);
    return response.data.donation;
  } catch (error) {
    console.error('❌ Failed to create donation:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return null;
  }
};

// Main function to run all tests
const runTests = async () => {
  console.log('=== DONATION API TEST SCRIPT ===');
  console.log(`Server URL: ${SERVER_URL}`);
  console.log('===============================\n');
  
  // Run tests in sequence
  const serverRunning = await testHealth();
  if (!serverRunning) {
    console.error('❌ Server is not running. Aborting tests.');
    return;
  }
  
  const routesWorking = await testDonationRoutes();
  if (!routesWorking) {
    console.warn('⚠️ Donation routes test failed, but continuing...');
  }
  
  const databaseWorking = await testDatabaseConnection();
  if (!databaseWorking) {
    console.error('❌ Database connection failed. Aborting tests.');
    return;
  }
  
  const donation = await testCreateDonation();
  if (!donation) {
    console.error('❌ Donation creation failed. Check server logs for details.');
    return;
  }
  
  console.log('\n=== TEST SUMMARY ===');
  console.log('✅ Server is running');
  console.log(routesWorking ? '✅ Donation routes are working' : '⚠️ Donation routes test failed');
  console.log('✅ Database connection is working');
  console.log('✅ Donation created successfully');
  console.log('===================');
  console.log('\nAll tests completed successfully! The donation system is working properly.');
};

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error in test script:', error);
}); 