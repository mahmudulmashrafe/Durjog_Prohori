const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

// Middleware to verify admin token
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const admin = await Admin.findById(decoded.userId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    if (admin.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if admin is superadmin
const superAdminAuth = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Superadmin access required' });
  }
};

// Create default admin if doesn't exist
router.get('/setup-default-admin', async (req, res) => {
  try {
    // Check if admin exists
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Default admin already exists' });
    }

    // Create new admin
    const admin = new Admin({
      username: 'admin',
      password: 'admin', // Will be hashed by the pre-save hook
      name: 'System Admin',
      role: 'superadmin',
      email: 'admin@durjogprohori.com',
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
      status: 'active'
    });

    await admin.save();
    
    res.json({ message: 'Default admin created successfully', username: admin.username });
  } catch (err) {
    console.error('Error creating default admin:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin login
router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Admin login attempt for username:', username);
    
    // Log the current database connection info
    console.log('Current database:', mongoose.connection.name || mongoose.connection.db?.databaseName);
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    // Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('Admin login failed: Admin not found with username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Admin found in database:', admin._id);

    // Check if admin account is active
    if (admin.status !== 'active') {
      console.log('Admin login failed: Account not active for username:', username);
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Validate password
    const isMatch = await admin.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Admin login failed: Invalid password for username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login and login history
    admin.lastLogin = new Date();
    
    // Get IP and user agent from request
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Add to login history
    admin.loginHistory.push({
      timestamp: new Date(),
      ipAddress,
      userAgent
    });
    
    await admin.save();
    console.log('Updated last login time for admin:', admin.username);

    // Generate JWT token
    const payload = {
      userId: admin._id,
      username: admin.username,
      role: admin.role,
      isAdmin: true
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
    console.log('Generated JWT token for admin:', admin.username);

    res.json({
      success: true,
      token: token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        department: admin.department,
        designation: admin.designation,
        permissions: admin.permissions
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get admin profile
router.get('/profile', adminAuth, async (req, res) => {
  try {
    const admin = req.admin;
    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
        department: admin.department,
        designation: admin.designation,
        permissions: admin.permissions,
        notificationPreferences: admin.notificationPreferences,
        lastLogin: admin.lastLogin,
        status: admin.status,
        createdAt: admin.createdAt
      }
    });
  } catch (err) {
    console.error('Get admin profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update admin profile
router.put('/profile', adminAuth, async (req, res) => {
  try {
    const admin = req.admin;
    const { name, email, phoneNumber, notificationPreferences } = req.body;
    
    // Update fields that admin can modify themselves
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phoneNumber) admin.phoneNumber = phoneNumber;
    if (notificationPreferences) admin.notificationPreferences = notificationPreferences;
    
    admin.updatedAt = new Date();
    await admin.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        notificationPreferences: admin.notificationPreferences
      }
    });
  } catch (err) {
    console.error('Update admin profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change password
router.put('/change-password', adminAuth, async (req, res) => {
  try {
    const admin = req.admin;
    const { currentPassword, newPassword } = req.body;
    
    // Validate current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    admin.password = newPassword;
    admin.updatedAt = new Date();
    await admin.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new admin (only for superadmin)
router.post('/create', adminAuth, superAdminAuth, async (req, res) => {
  try {
    const { 
      username, 
      password, 
      name, 
      email, 
      role, 
      phoneNumber, 
      department, 
      designation, 
      permissions, 
      notificationPreferences,
      status
    } = req.body;
    
    // Check if admin already exists
    const adminExists = await Admin.findOne({ username });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    // Create new admin
    const admin = new Admin({
      username,
      password,
      name,
      email,
      role: role || 'admin',
      phoneNumber,
      department,
      designation,
      permissions,
      notificationPreferences,
      status: status || 'active'
    });
    
    await admin.save();
    
    res.json({ 
      success: true, 
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        department: admin.department,
        designation: admin.designation
      }
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all admins (superadmin only)
router.get('/all', adminAuth, superAdminAuth, async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password');
    
    res.json({
      success: true,
      admins
    });
  } catch (err) {
    console.error('Get all admins error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update admin (superadmin only)
router.put('/:id', adminAuth, superAdminAuth, async (req, res) => {
  try {
    const adminId = req.params.id;
    const { 
      name, 
      email, 
      role, 
      phoneNumber, 
      department, 
      designation, 
      permissions, 
      notificationPreferences,
      status
    } = req.body;
    
    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Don't allow modification of the default superadmin
    if (admin.username === 'admin' && req.admin.username !== 'admin') {
      return res.status(403).json({ message: 'Cannot modify default superadmin' });
    }
    
    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role) admin.role = role;
    if (phoneNumber) admin.phoneNumber = phoneNumber;
    if (department) admin.department = department;
    if (designation) admin.designation = designation;
    if (permissions) admin.permissions = permissions;
    if (notificationPreferences) admin.notificationPreferences = notificationPreferences;
    if (status) admin.status = status;
    
    admin.updatedAt = new Date();
    await admin.save();
    
    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        status: admin.status
      }
    });
  } catch (err) {
    console.error('Update admin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reset password (superadmin only)
router.put('/:id/reset-password', adminAuth, superAdminAuth, async (req, res) => {
  try {
    const adminId = req.params.id;
    const { newPassword } = req.body;
    
    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Update password
    admin.password = newPassword;
    admin.updatedAt = new Date();
    await admin.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// View login history
router.get('/login-history', adminAuth, async (req, res) => {
  try {
    const admin = req.admin;
    
    res.json({
      success: true,
      loginHistory: admin.loginHistory
    });
  } catch (err) {
    console.error('Get login history error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 