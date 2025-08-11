const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Load environment variables
dotenv.config();

// Connect to MongoDB
console.log('Connecting to MongoDB database: durjog-prohori-admin');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/durjog-prohori-admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName;
  console.log(`MongoDB Connected to database: ${dbName}`);
  
  try {
    await testEnhancedAdmin();
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
})
.catch(err => {
  console.log('MongoDB Connection Error:', err);
  process.exit(1);
});

async function testEnhancedAdmin() {
  console.log('\n===== TESTING ENHANCED ADMIN FUNCTIONALITY =====\n');
  
  // 1. Check if admin exists
  console.log('1. Checking for existing admin user...');
  let admin = await Admin.findOne({ username: 'admin' });
  
  if (admin) {
    console.log('Found admin user:');
    console.log('- Username:', admin.username);
    console.log('- Name:', admin.name);
    console.log('- Role:', admin.role);
    console.log('- Department:', admin.department || 'Not set');
    console.log('- Designation:', admin.designation || 'Not set');
    console.log('- Phone Number:', admin.phoneNumber || 'Not set');
    console.log('- Status:', admin.status || 'Not set');
    
    // Check if admin has the enhanced fields
    if (!admin.department || !admin.designation || !admin.permissions) {
      console.log('\nUpdating admin with enhanced fields...');
      
      // Update admin with new fields
      admin.department = 'Emergency Management';
      admin.designation = 'System Administrator';
      admin.phoneNumber = '+8801700000000';
      admin.permissions = {
        canManageUsers: true,
        canManageDisasters: true,
        canManageAlerts: true,
        canViewReports: true,
        canEditReports: true
      };
      admin.notificationPreferences = {
        email: true,
        sms: true,
        appNotifications: true
      };
      admin.status = 'active';
      
      await admin.save();
      console.log('Admin updated successfully with enhanced fields!');
    } else {
      console.log('\nAdmin already has enhanced fields.');
    }
  } else {
    console.log('Admin user not found. Creating new enhanced admin...');
    
    // Create new admin with enhanced fields
    admin = new Admin({
      username: 'admin',
      password: 'admin', // Will be hashed by the pre-save hook
      name: 'System Admin',
      email: 'admin@durjogprohori.com',
      role: 'superadmin',
      phoneNumber: '+8801700000000',
      department: 'Emergency Management',
      designation: 'System Administrator',
      permissions: {
        canManageUsers: true,
        canManageDisasters: true,
        canManageAlerts: true,
        canViewReports: true,
        canEditReports: true
      },
      notificationPreferences: {
        email: true,
        sms: true,
        appNotifications: true
      },
      status: 'active'
    });
    
    await admin.save();
    console.log('Admin created successfully with enhanced fields!');
  }
  
  // 2. Create a test moderator admin
  console.log('\n2. Creating a test moderator admin...');
  
  // Check if moderator already exists
  let moderator = await Admin.findOne({ username: 'moderator' });
  
  if (!moderator) {
    moderator = new Admin({
      username: 'moderator',
      password: 'moderator123',
      name: 'Content Moderator',
      email: 'moderator@durjogprohori.com',
      role: 'moderator',
      phoneNumber: '+8801700000001',
      department: 'Content Management',
      designation: 'Content Specialist',
      permissions: {
        canManageUsers: false,
        canManageDisasters: true,
        canManageAlerts: true,
        canViewReports: true,
        canEditReports: false
      },
      notificationPreferences: {
        email: true,
        sms: false,
        appNotifications: true
      },
      status: 'active'
    });
    
    await moderator.save();
    console.log('Moderator created successfully!');
  } else {
    console.log('Moderator already exists.');
  }
  
  // 3. Create a test data analyst admin
  console.log('\n3. Creating a test data analyst admin...');
  
  // Check if data analyst already exists
  let analyst = await Admin.findOne({ username: 'analyst' });
  
  if (!analyst) {
    analyst = new Admin({
      username: 'analyst',
      password: 'analyst123',
      name: 'Data Analyst',
      email: 'analyst@durjogprohori.com',
      role: 'data-analyst',
      phoneNumber: '+8801700000002',
      department: 'Data Analysis',
      designation: 'Senior Analyst',
      permissions: {
        canManageUsers: false,
        canManageDisasters: false,
        canManageAlerts: false,
        canViewReports: true,
        canEditReports: true
      },
      notificationPreferences: {
        email: true,
        sms: false,
        appNotifications: true
      },
      status: 'active'
    });
    
    await analyst.save();
    console.log('Data analyst created successfully!');
  } else {
    console.log('Data analyst already exists.');
  }
  
  // 4. Test password validation
  console.log('\n4. Testing password validation...');
  
  // Get the admin user
  admin = await Admin.findOne({ username: 'admin' });
  
  // Test correct password
  const correctResult = await admin.comparePassword('admin');
  console.log('Correct password test result:', correctResult);
  
  // Test incorrect password
  const incorrectResult = await admin.comparePassword('wrong-password');
  console.log('Incorrect password test result:', incorrectResult);
  
  // 5. Simulate login and update login history
  console.log('\n5. Simulating login and updating login history...');
  
  // Update last login and add to login history
  admin.lastLogin = new Date();
  admin.loginHistory.push({
    timestamp: new Date(),
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 Test Script'
  });
  
  await admin.save();
  console.log('Login history updated successfully!');
  console.log('Latest login entry:', admin.loginHistory[admin.loginHistory.length - 1]);
  
  // 6. Display all admins
  console.log('\n6. Displaying all admins in the database:');
  
  const admins = await Admin.find({}).select('-password');
  console.log(`Found ${admins.length} admin users:`);
  
  admins.forEach((adminUser, index) => {
    console.log(`\nAdmin ${index + 1}:`);
    console.log('- Username:', adminUser.username);
    console.log('- Name:', adminUser.name);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- Department:', adminUser.department);
    console.log('- Designation:', adminUser.designation);
    console.log('- Status:', adminUser.status);
  });
  
  console.log('\n===== ENHANCED ADMIN TESTING COMPLETED SUCCESSFULLY =====');
} 