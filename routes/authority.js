const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Authority = require('../models/Authority');
const mongoose = require('mongoose');

// Middleware to verify authority token
const authorityAuth = (req, res, next) => {
  // Check for token in header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if token belongs to an authority (isAuthority or userId)
    if (!decoded.isAuthority && !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }
    
    // Set authority ID in request
    req.authority = { id: decoded.userId || decoded.id };
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Middleware to check if authority is admin or manager
const adminOrManagerAuth = (req, res, next) => {
  if (req.authority && (req.authority.role === 'admin' || req.authority.role === 'manager')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin or Manager access required' });
  }
};

// Create default authority if doesn't exist
router.get('/setup-default-authority', async (req, res) => {
  try {
    // Check if authority exists
    const authorityExists = await Authority.findOne({ username: 'authority' });
    if (authorityExists) {
      return res.status(400).json({ message: 'Default authority already exists' });
    }

    // Create new authority
    const authority = new Authority({
      username: 'authority',
      password: 'authority', // Will be hashed by the pre-save hook
      name: 'Default Authority',
      role: 'admin',
      email: 'authority@durjogprohori.com',
      phoneNumber: '+8801700000003',
      department: 'Disaster Management',
      badgeNumber: 'AUTH-001',
      yearsOfService: 5,
      jurisdiction: ['Dhaka', 'Chittagong', 'Khulna'],
      expertise: ['Flood Management', 'Emergency Response'],
      permissions: {
        canManageEmergencies: true,
        canCreateReports: true,
        canViewAllReports: true,
        canManageTeam: true
      },
      status: 'active'
    });

    await authority.save();
    
    res.json({ message: 'Default authority created successfully', username: authority.username });
  } catch (err) {
    console.error('Error creating default authority:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Authority login
router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Authority login attempt for username:', username);
    
    // Log the current database connection info
    console.log('Current database:', mongoose.connection.name || mongoose.connection.db?.databaseName);
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    // Check if authority exists
    const authority = await Authority.findOne({ username });
    if (!authority) {
      console.log('Authority login failed: Authority not found with username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Authority found in database:', authority._id);

    // Check if authority account is active
    if (authority.status !== 'active') {
      console.log('Authority login failed: Account not active for username:', username);
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Validate password
    const isMatch = await authority.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Authority login failed: Invalid password for username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login and login history
    authority.lastLogin = new Date();
    
    // Get IP and user agent from request
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Add to login history
    authority.loginHistory.push({
      timestamp: new Date(),
      ipAddress,
      userAgent
    });
    
    await authority.save();
    console.log('Updated last login time for authority:', authority.username);

    // Generate JWT token
    const payload = {
      userId: authority._id,
      username: authority.username,
      role: authority.role,
      isAuthority: true
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
    console.log('Generated JWT token for authority:', authority.username);

    res.json({
      success: true,
      token: token,
      authority: {
        id: authority._id,
        username: authority.username,
        name: authority.name,
        role: authority.role,
        department: authority.department,
        badgeNumber: authority.badgeNumber,
        permissions: authority.permissions
      }
    });
  } catch (err) {
    console.error('Authority login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get authority profile
router.get('/profile', authorityAuth, async (req, res) => {
  try {
    // Find authority by ID
    const authority = await Authority.findById(req.authority.id);
    
    if (!authority) {
      return res.status(404).json({ success: false, message: 'Authority not found' });
    }
    
    res.json({
      success: true,
      authority: {
        id: authority._id,
        username: authority.username,
        name: authority.name,
        email: authority.email,
        phoneNumber: authority.phoneNumber,
        role: authority.role,
        department: authority.department,
        badgeNumber: authority.badgeNumber,
        yearsOfService: authority.yearsOfService,
        jurisdiction: authority.jurisdiction,
        expertise: authority.expertise,
        permissions: authority.permissions,
        notificationPreferences: authority.notificationPreferences,
        lastLogin: authority.lastLogin,
        status: authority.status,
        createdAt: authority.createdAt
      }
    });
  } catch (err) {
    console.error('Get authority profile error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Update authority profile
router.put('/profile', authorityAuth, async (req, res) => {
  try {
    // Find the authority by ID
    const authority = await Authority.findById(req.authority.id);
    
    if (!authority) {
      return res.status(404).json({ success: false, message: 'Authority not found' });
    }
    
    const { name, email, phoneNumber, department, notificationPreferences } = req.body;
    
    // Update fields that authority can modify themselves
    if (name) authority.name = name;
    if (email) authority.email = email;
    if (phoneNumber) authority.phoneNumber = phoneNumber;
    if (department) authority.department = department;
    if (notificationPreferences) authority.notificationPreferences = {
      ...authority.notificationPreferences,
      ...notificationPreferences
    };
    
    authority.updatedAt = new Date();
    await authority.save();
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      authority: {
        id: authority._id,
        username: authority.username,
        name: authority.name,
        email: authority.email,
        phoneNumber: authority.phoneNumber,
        department: authority.department,
        role: authority.role,
        notificationPreferences: authority.notificationPreferences
      }
    });
  } catch (err) {
    console.error('Update authority profile error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get login history
router.get('/login-history', authorityAuth, async (req, res) => {
  try {
    const authority = req.authority;
    res.json({
      success: true,
      loginHistory: authority.loginHistory.sort((a, b) => b.timestamp - a.timestamp)
    });
  } catch (err) {
    console.error('Get login history error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change password
router.put('/change-password', authorityAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authority = req.authority;
    
    // Verify current password
    const isMatch = await authority.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    authority.password = newPassword;
    authority.updatedAt = new Date();
    await authority.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all authorities (admin/manager only)
router.get('/all', authorityAuth, adminOrManagerAuth, async (req, res) => {
  try {
    const authorities = await Authority.find({})
      .select('-password -loginHistory')
      .sort({ role: 1, name: 1 });
    
    res.json({
      success: true,
      authorities
    });
  } catch (err) {
    console.error('Get all authorities error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new authority (admin/manager only)
router.post('/create', authorityAuth, adminOrManagerAuth, async (req, res) => {
  try {
    const { 
      username, 
      password, 
      name, 
      email, 
      role, 
      phoneNumber,
      department,
      badgeNumber,
      yearsOfService,
      jurisdiction,
      expertise,
      permissions
    } = req.body;
    
    // Check if username already exists
    const existingAuthority = await Authority.findOne({ username });
    if (existingAuthority) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new authority
    const newAuthority = new Authority({
      username,
      password,
      name,
      email,
      role: role || 'officer',
      phoneNumber,
      department,
      badgeNumber,
      yearsOfService: yearsOfService || 0,
      jurisdiction: jurisdiction || [],
      expertise: expertise || [],
      permissions: permissions || {
        canManageEmergencies: true,
        canCreateReports: true,
        canViewAllReports: false,
        canManageTeam: false
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newAuthority.save();
    
    res.status(201).json({
      success: true,
      message: 'Authority created successfully',
      authority: {
        id: newAuthority._id,
        username: newAuthority.username,
        name: newAuthority.name,
        role: newAuthority.role
      }
    });
  } catch (err) {
    console.error('Create authority error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update authority status (admin/manager only)
router.put('/status/:id', authorityAuth, adminOrManagerAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!['active', 'inactive', 'on-leave', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const authority = await Authority.findById(id);
    if (!authority) {
      return res.status(404).json({ message: 'Authority not found' });
    }
    
    // Cannot change status of an admin if you're not an admin
    if (authority.role === 'admin' && req.authority.role !== 'admin') {
      return res.status(403).json({ message: 'Only an admin can change the status of another admin' });
    }
    
    authority.status = status;
    authority.updatedAt = new Date();
    await authority.save();
    
    res.json({
      success: true,
      message: 'Authority status updated successfully',
      authority: {
        id: authority._id,
        username: authority.username,
        status: authority.status
      }
    });
  } catch (err) {
    console.error('Update authority status error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Test route to check if the authority user exists and credentials are valid
router.post('/test-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Log the username and database connection
    console.log('Testing authority login for username:', username);
    console.log('Current database:', mongoose.connection.name || mongoose.connection.db?.databaseName);
    
    // Check if authority exists
    const authority = await Authority.findOne({ username });
    
    if (!authority) {
      console.log('Authority not found with username:', username);
      return res.status(401).json({ success: false, message: 'Authority not found' });
    }
    
    // Test direct password comparison (not for production use)
    console.log('Found authority:', authority.username);
    console.log('Stored password (hashed):', authority.password);
    
    // Test password match
    const isMatch = await authority.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    res.json({ 
      success: true, 
      message: `Authority ${username} exists, password match: ${isMatch}`,
      authority: {
        id: authority._id,
        username: authority.username,
        role: authority.role
      }
    });
  } catch (err) {
    console.error('Test login error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Add this at the end of the file, replacing the existing module.exports
module.exports = { 
  router,
  authorityAuth 
}; 