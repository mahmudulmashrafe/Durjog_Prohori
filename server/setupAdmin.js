const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function setupDefaultAdmin() {
  try {
    console.log('Setting up default admin in durjog-prohori-admin database...');
    
    // Log the current database name to verify we're using the right database
    const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName;
    console.log('Current database:', dbName);
    
    // Get collection names to confirm our collections
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name).join(', '));
    } catch (err) {
      console.error('Error listing collections:', err.message);
    }
    
    // Check if admin exists
    console.log('Checking for existing admin user...');
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Default admin already exists. Username: admin, ID:', adminExists._id);
      return;
    }

    console.log('No admin found. Creating default admin user with username: admin, password: admin');
    
    // Create new admin with enhanced fields
    const admin = new Admin({
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

    const savedAdmin = await admin.save();
    console.log('Default admin created successfully!');
    console.log('Admin details:');
    console.log('- Username:', savedAdmin.username);
    console.log('- ID:', savedAdmin._id);
    console.log('- Role:', savedAdmin.role);
    console.log('- Department:', savedAdmin.department);
    console.log('- Designation:', savedAdmin.designation);
    console.log('- Creation Date:', savedAdmin.createdAt);
  } catch (err) {
    console.error('Error creating default admin:', err);
    console.error('Error details:', err.message);
    
    // Check MongoDB connection
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  }
}

module.exports = setupDefaultAdmin; 