const axios = require('axios');
const chalk = require('chalk');

// Base URL for API
const API_BASE_URL = 'http://localhost:5001/api/admin';

// Test admin credentials
const adminCredentials = {
  username: 'admin',
  password: 'admin'
};

const moderatorCredentials = {
  username: 'moderator',
  password: 'moderator123'
};

// Store tokens
let adminToken = '';
let moderatorToken = '';

// Helper function to log success/error messages
const log = {
  success: (message) => console.log(chalk.green('✓ SUCCESS: ' + message)),
  error: (message) => console.log(chalk.red('✗ ERROR: ' + message)),
  info: (message) => console.log(chalk.blue('ℹ INFO: ' + message)),
  json: (data) => console.log(chalk.yellow(JSON.stringify(data, null, 2)))
};

// Test the admin routes
async function testAdminRoutes() {
  try {
    log.info('Starting admin routes test');
    
    // Test 1: Admin login
    log.info('\n1. Testing admin login');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/signin`, adminCredentials);
      log.success('Admin login successful');
      log.json(loginResponse.data);
      
      // Save admin token
      adminToken = loginResponse.data.token;
    } catch (err) {
      log.error('Admin login failed');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 2: Get admin profile
    log.info('\n2. Testing get admin profile');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      log.success('Got admin profile successfully');
      log.json(profileResponse.data);
    } catch (err) {
      log.error('Failed to get admin profile');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 3: Update admin profile
    log.info('\n3. Testing update admin profile');
    try {
      const updateData = {
        name: 'Updated Admin Name',
        phoneNumber: '+8801700000099'
      };
      
      const updateResponse = await axios.put(`${API_BASE_URL}/profile`, updateData, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      log.success('Updated admin profile successfully');
      log.json(updateResponse.data);
    } catch (err) {
      log.error('Failed to update admin profile');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 4: Get login history
    log.info('\n4. Testing get login history');
    try {
      const historyResponse = await axios.get(`${API_BASE_URL}/login-history`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      log.success('Got login history successfully');
      log.json(historyResponse.data);
    } catch (err) {
      log.error('Failed to get login history');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 5: Get all admins (superadmin only)
    log.info('\n5. Testing get all admins (superadmin only)');
    try {
      const allAdminsResponse = await axios.get(`${API_BASE_URL}/all`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      log.success('Got all admins successfully');
      log.json(allAdminsResponse.data);
    } catch (err) {
      log.error('Failed to get all admins');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 6: Moderator login
    log.info('\n6. Testing moderator login');
    try {
      const moderatorLoginResponse = await axios.post(`${API_BASE_URL}/signin`, moderatorCredentials);
      log.success('Moderator login successful');
      log.json(moderatorLoginResponse.data);
      
      // Save moderator token
      moderatorToken = moderatorLoginResponse.data.token;
    } catch (err) {
      log.error('Moderator login failed');
      log.error(err.response?.data?.message || err.message);
    }
    
    // Test 7: Try to access superadmin-only route as moderator
    log.info('\n7. Testing superadmin-only route as moderator (should fail)');
    try {
      const restrictedResponse = await axios.get(`${API_BASE_URL}/all`, {
        headers: {
          Authorization: `Bearer ${moderatorToken}`
        }
      });
      log.error('Moderator accessed superadmin-only route (this should not happen)');
      log.json(restrictedResponse.data);
    } catch (err) {
      log.success('Correctly denied moderator access to superadmin-only route');
      log.info(err.response?.data?.message || err.message);
    }
    
    // Test 8: Create new admin (superadmin only)
    log.info('\n8. Testing create new admin (superadmin only)');
    try {
      const newAdminData = {
        username: 'testadmin' + Math.floor(Math.random() * 1000),
        password: 'password123',
        name: 'Test Admin',
        email: 'testadmin@durjogprohori.com',
        role: 'admin',
        phoneNumber: '+8801700000003',
        department: 'Testing',
        designation: 'Test Admin',
        permissions: {
          canManageUsers: false,
          canManageDisasters: true,
          canManageAlerts: true,
          canViewReports: true,
          canEditReports: false
        }
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/create`, newAdminData, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      log.success('Created new admin successfully');
      log.json(createResponse.data);
      
      // Save the new admin's ID for the next test
      newAdminId = createResponse.data.admin.id;
    } catch (err) {
      log.error('Failed to create new admin');
      log.error(err.response?.data?.message || err.message);
    }
    
    log.info('\nAdmin routes testing completed');
    
  } catch (err) {
    log.error('Test failed with error:');
    console.error(err);
  }
}

// Run the tests
testAdminRoutes(); 