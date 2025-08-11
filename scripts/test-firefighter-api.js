const axios = require('axios');
const chalk = require('chalk');

// Base URL for API
const API_BASE_URL = 'http://localhost:5001/api/firefighter';

// Test firefighter credentials
const firefighterCredentials = {
  username: 'fire',
  password: 'fire'
};

// Store tokens
let firefighterToken = '';

// Helper function to log success/error messages
const log = {
  success: (message) => console.log(chalk.green('✓ SUCCESS: ' + message)),
  error: (message) => console.log(chalk.red('✗ ERROR: ' + message)),
  info: (message) => console.log(chalk.blue('ℹ INFO: ' + message)),
  json: (data) => console.log(chalk.yellow(JSON.stringify(data, null, 2)))
};

// Test the firefighter routes
async function testFirefighterRoutes() {
  try {
    log.info('Starting firefighter routes test');
    
    // Test 1: Firefighter login
    log.info('\n1. Testing firefighter login');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/signin`, firefighterCredentials);
      log.success('Firefighter login successful');
      log.json(loginResponse.data);
      
      // Save firefighter token
      firefighterToken = loginResponse.data.token;
    } catch (err) {
      log.error('Firefighter login failed');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 2: Get firefighter profile
    log.info('\n2. Testing get firefighter profile');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${firefighterToken}`
        }
      });
      log.success('Got firefighter profile successfully');
      log.json(profileResponse.data);
    } catch (err) {
      log.error('Failed to get firefighter profile');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 3: Update firefighter profile
    log.info('\n3. Testing update firefighter profile');
    try {
      const updateData = {
        name: 'Updated Firefighter Name',
        phoneNumber: '+8801700000099'
      };
      
      const updateResponse = await axios.put(`${API_BASE_URL}/profile`, updateData, {
        headers: {
          Authorization: `Bearer ${firefighterToken}`
        }
      });
      log.success('Updated firefighter profile successfully');
      log.json(updateResponse.data);
    } catch (err) {
      log.error('Failed to update firefighter profile');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 4: Get login history
    log.info('\n4. Testing get login history');
    try {
      const historyResponse = await axios.get(`${API_BASE_URL}/login-history`, {
        headers: {
          Authorization: `Bearer ${firefighterToken}`
        }
      });
      log.success('Got login history successfully');
      log.json(historyResponse.data);
    } catch (err) {
      log.error('Failed to get login history');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 5: Create a new firefighter (chief only)
    log.info('\n5. Testing create new firefighter');
    try {
      const newFirefighterData = {
        username: 'newfirefighter' + Math.floor(Math.random() * 1000),
        password: 'password123',
        name: 'New Test Firefighter',
        email: 'newfirefighter@durjogprohori.com',
        role: 'firefighter',
        phoneNumber: '+8801700000005',
        station: 'North Fire Station',
        badgeNumber: 'FD-002',
        yearsOfService: 2,
        specializedTraining: ['First Aid']
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/create`, newFirefighterData, {
        headers: {
          Authorization: `Bearer ${firefighterToken}`
        }
      });
      log.success('Created new firefighter successfully');
      log.json(createResponse.data);
    } catch (err) {
      log.error('Failed to create new firefighter');
      log.error(err.response?.data?.message || err.message);
    }
    
    log.info('\nFirefighter routes testing completed');
    
  } catch (err) {
    log.error('Test failed with error:');
    console.error(err);
  }
}

// Run the tests
testFirefighterRoutes(); 