const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NGO = require('../models/NGO');
const mongoose = require('mongoose');

// Middleware to verify NGO token
const ngoAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded.isNGO) {
      return res.status(403).json({ message: 'NGO access required' });
    }
    
    const ngo = await NGO.findById(decoded.userId);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }
    
    if (ngo.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    req.ngo = ngo;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if NGO is admin
const ngoAdminAuth = (req, res, next) => {
  if (req.ngo && req.ngo.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'NGO Admin access required' });
  }
};

// Create default NGO if doesn't exist
router.get('/setup-default-ngo', async (req, res) => {
  try {
    // Check if NGO exists
    const ngoExists = await NGO.findOne({ username: 'ngo' });
    if (ngoExists) {
      return res.status(400).json({ message: 'Default NGO already exists' });
    }

    // Create new NGO
    const ngo = new NGO({
      username: 'ngo',
      password: 'ngo', // Will be hashed by the pre-save hook
      name: 'Default NGO',
      role: 'admin',
      email: 'ngo@durjogprohori.com',
      phoneNumber: '+8801700000002',
      organization: 'Relief Organization',
      registrationNumber: 'NGO-001',
      yearsActive: 5,
      specializedAreas: ['Disaster Relief', 'Medical Aid'],
      resources: ['Food', 'Medicine', 'Shelter'],
      permissions: {
        canManageResources: true,
        canCreateReports: true,
        canViewAllReports: true,
        canManageTeam: true
      },
      status: 'active'
    });

    await ngo.save();
    
    res.json({ message: 'Default NGO created successfully', username: ngo.username });
  } catch (err) {
    console.error('Error creating default NGO:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// NGO login
router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('NGO login attempt for username:', username);
    
    // Log the current database connection info
    console.log('Current database:', mongoose.connection.name || mongoose.connection.db?.databaseName);
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    // Check if NGO exists
    const ngo = await NGO.findOne({ username });
    if (!ngo) {
      console.log('NGO login failed: NGO not found with username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('NGO found in database:', ngo._id);

    // Check if NGO account is active
    if (ngo.status !== 'active') {
      console.log('NGO login failed: Account not active for username:', username);
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Validate password
    const isMatch = await ngo.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('NGO login failed: Invalid password for username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login and login history
    ngo.lastLogin = new Date();
    
    // Get IP and user agent from request
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Add to login history
    ngo.loginHistory.push({
      timestamp: new Date(),
      ipAddress,
      userAgent
    });
    
    await ngo.save();
    console.log('Updated last login time for NGO:', ngo.username);

    // Generate JWT token
    const payload = {
      userId: ngo._id,
      username: ngo.username,
      role: ngo.role,
      isNGO: true
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
    console.log('Generated JWT token for NGO:', ngo.username);

    res.json({
      success: true,
      token: token,
      ngo: {
        id: ngo._id,
        username: ngo.username,
        name: ngo.name,
        role: ngo.role,
        organization: ngo.organization,
        registrationNumber: ngo.registrationNumber,
        permissions: ngo.permissions
      }
    });
  } catch (err) {
    console.error('NGO login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get NGO profile
router.get('/profile', ngoAuth, async (req, res) => {
  try {
    const ngo = req.ngo;
    res.json({
      success: true,
      ngo: {
        id: ngo._id,
        username: ngo.username,
        name: ngo.name,
        email: ngo.email,
        phoneNumber: ngo.phoneNumber,
        role: ngo.role,
        organization: ngo.organization,
        registrationNumber: ngo.registrationNumber,
        yearsActive: ngo.yearsActive,
        specializedAreas: ngo.specializedAreas,
        resources: ngo.resources,
        permissions: ngo.permissions,
        notificationPreferences: ngo.notificationPreferences,
        lastLogin: ngo.lastLogin,
        status: ngo.status,
        createdAt: ngo.createdAt,
        location: ngo.location,
        latitude: ngo.latitude,
        longitude: ngo.longitude,
        donationreceived: ngo.donationreceived || []
      }
    });
  } catch (err) {
    console.error('Get NGO profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update NGO profile
router.put('/profile', ngoAuth, async (req, res) => {
  try {
    const ngo = req.ngo;
    const { 
      name, 
      email, 
      phoneNumber, 
      organization, 
      notificationPreferences,
      registrationNumber,
      yearsActive,
      specializedAreas,
      resources,
      location,
      latitude,
      longitude
    } = req.body;
    
    // Update fields that NGO can modify themselves
    if (name) ngo.name = name;
    if (email) ngo.email = email;
    if (phoneNumber) ngo.phoneNumber = phoneNumber;
    if (organization) ngo.organization = organization;
    if (registrationNumber) ngo.registrationNumber = registrationNumber;
    if (yearsActive) ngo.yearsActive = yearsActive;
    if (specializedAreas) ngo.specializedAreas = specializedAreas;
    if (resources) ngo.resources = resources;

    // Update location fields
    if (location !== undefined) ngo.location = location;
    if (latitude !== undefined) ngo.latitude = latitude;
    if (longitude !== undefined) ngo.longitude = longitude;
    
    if (notificationPreferences) ngo.notificationPreferences = {
      ...ngo.notificationPreferences,
      ...notificationPreferences
    };
    
    ngo.updatedAt = new Date();
    await ngo.save();
    
    console.log('Updated NGO profile:', {
      name: ngo.name,
      organization: ngo.organization,
      location: ngo.location,
      latitude: ngo.latitude,
      longitude: ngo.longitude
    });
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      ngo: {
        id: ngo._id,
        username: ngo.username,
        name: ngo.name,
        email: ngo.email,
        phoneNumber: ngo.phoneNumber,
        organization: ngo.organization,
        registrationNumber: ngo.registrationNumber,
        yearsActive: ngo.yearsActive,
        specializedAreas: ngo.specializedAreas,
        resources: ngo.resources,
        notificationPreferences: ngo.notificationPreferences,
        location: ngo.location,
        latitude: ngo.latitude,
        longitude: ngo.longitude
      }
    });
  } catch (err) {
    console.error('Update NGO profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change password
router.put('/change-password', ngoAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const ngo = req.ngo;
    
    // Verify current password
    const isMatch = await ngo.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    ngo.password = newPassword;
    ngo.updatedAt = new Date();
    await ngo.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all NGOs (admin only)
router.get('/all', ngoAuth, ngoAdminAuth, async (req, res) => {
  try {
    const ngos = await NGO.find({})
      .select('-password -loginHistory')
      .sort({ role: 1, name: 1 });
    
    res.json({
      success: true,
      ngos
    });
  } catch (err) {
    console.error('Get all NGOs error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new NGO member (admin only)
router.post('/create', ngoAuth, ngoAdminAuth, async (req, res) => {
  try {
    const { 
      username, 
      password, 
      name, 
      email, 
      role, 
      phoneNumber,
      organization,
      specializedAreas,
      permissions
    } = req.body;
    
    // Check if username already exists
    const existingNGO = await NGO.findOne({ username });
    if (existingNGO) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new NGO member
    const newNGO = new NGO({
      username,
      password,
      name,
      email,
      role: role || 'member',
      phoneNumber,
      organization: organization || req.ngo.organization,
      specializedAreas: specializedAreas || [],
      permissions: permissions || {
        canManageResources: false,
        canCreateReports: true,
        canViewAllReports: false,
        canManageTeam: false
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newNGO.save();
    
    res.status(201).json({
      success: true,
      message: 'NGO member created successfully',
      ngo: {
        id: newNGO._id,
        username: newNGO.username,
        name: newNGO.name,
        role: newNGO.role
      }
    });
  } catch (err) {
    console.error('Create NGO member error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update NGO status (admin only)
router.put('/status/:id', ngoAuth, ngoAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const ngo = await NGO.findById(id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }
    
    // Cannot change status of an admin if you're not the original admin
    if (ngo.role === 'admin' && ngo.username === 'ngo' && req.ngo.username !== 'ngo') {
      return res.status(403).json({ message: 'Only the default admin can change the status of the main admin account' });
    }
    
    ngo.status = status;
    ngo.updatedAt = new Date();
    await ngo.save();
    
    res.json({
      success: true,
      message: 'NGO status updated successfully',
      ngo: {
        id: ngo._id,
        username: ngo.username,
        status: ngo.status
      }
    });
  } catch (err) {
    console.error('Update NGO status error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Find nearby NGOs based on location coordinates
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, limit = 5, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Convert to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const max = parseInt(maxDistance);
    const lmt = parseInt(limit);

    // Find NGOs ordered by distance from the provided coordinates
    const ngos = await NGO.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
      status: 'active'
    }).exec();

    // Calculate distances and sort
    const ngosWithDistance = ngos.map(ngo => {
      // Calculate distance using the Haversine formula
      const dLat = (ngo.latitude - lat) * Math.PI / 180;
      const dLng = (ngo.longitude - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(ngo.latitude * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = 6371 * 1000 * c; // Distance in meters (Earth radius is 6371 km)

      return {
        id: ngo._id,
        name: ngo.name,
        organization: ngo.organizationName,
        phoneNumber: ngo.phoneNumber,
        email: ngo.email,
        location: ngo.location,
        latitude: ngo.latitude,
        longitude: ngo.longitude,
        distance
      };
    });

    // Filter by max distance and sort by distance
    const nearbyNGOs = ngosWithDistance
      .filter(ngo => ngo.distance <= max)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, lmt);

    return res.json({
      success: true,
      ngos: nearbyNGOs
    });
  } catch (error) {
    console.error('Error finding nearby NGOs:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Import disaster models
const DisasterFire = require('../models/DisasterFire');
const DisasterFlood = require('../models/DisasterFlood');
const DisasterCyclone = require('../models/DisasterCyclone');
const DisasterLandslide = require('../models/DisasterLandslide');
const DisasterTsunami = require('../models/DisasterTsunami');
const DisasterOther = require('../models/DisasterOther');

// Get assigned disasters for NGO
router.get('/assigned-disasters', ngoAuth, async (req, res) => {
    try {
        const ngoId = req.ngo._id;
        
        // Query each disaster type collection for disasters assigned to this NGO
        const [fires, floods, cyclones, landslides, tsunamis, others] = await Promise.all([
            DisasterFire.find({ 'assignedNGOs.ngoId': ngoId }),
            DisasterFlood.find({ 'assignedNGOs.ngoId': ngoId }),
            DisasterCyclone.find({ 'assignedNGOs.ngoId': ngoId }),
            DisasterLandslide.find({ 'assignedNGOs.ngoId': ngoId }),
            DisasterTsunami.find({ 'assignedNGOs.ngoId': ngoId }),
            DisasterOther.find({ 'assignedNGOs.ngoId': ngoId })
        ]);

        // Add disasterType to each disaster and combine all results
        const allDisasters = [
            ...fires.map(d => ({ ...d.toObject(), disasterType: 'fire' })),
            ...floods.map(d => ({ ...d.toObject(), disasterType: 'flood' })),
            ...cyclones.map(d => ({ ...d.toObject(), disasterType: 'cyclone' })),
            ...landslides.map(d => ({ ...d.toObject(), disasterType: 'landslide' })),
            ...tsunamis.map(d => ({ ...d.toObject(), disasterType: 'tsunami' })),
            ...others.map(d => ({ ...d.toObject(), disasterType: 'other' }))
        ];

        // Sort by createdAt date, most recent first
        allDisasters.sort((a, b) => b.createdAt - a.createdAt);

        res.json({
            success: true,
            data: allDisasters
        });
    } catch (err) {
        console.error('Error fetching assigned disasters:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch assigned disasters',
            error: err.message 
        });
    }
});

// Update disaster status
router.put('/update-status/:disasterType/:disasterId', ngoAuth, async (req, res) => {
    try {
        const { disasterType, disasterId } = req.params;
        const { status } = req.body;
        const ngoId = req.ngo._id;

        // Get the appropriate disaster model based on type
        let DisasterModel;
        switch (disasterType.toLowerCase()) {
            case 'fire':
                DisasterModel = DisasterFire;
                break;
            case 'flood':
                DisasterModel = DisasterFlood;
                break;
            case 'cyclone':
                DisasterModel = DisasterCyclone;
                break;
            case 'landslide':
                DisasterModel = DisasterLandslide;
                break;
            case 'tsunami':
                DisasterModel = DisasterTsunami;
                break;
            case 'other':
                DisasterModel = DisasterOther;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid disaster type'
                });
        }

        // Find and update the disaster
        const disaster = await DisasterModel.findOneAndUpdate(
            {
                _id: disasterId,
                'assignedNGOs.ngoId': ngoId
            },
            {
                $set: {
                    'assignedNGOs.$.status': status,
                    'assignedNGOs.$.updatedAt': new Date()
                }
            },
            { new: true }
        );

        if (!disaster) {
            return res.status(404).json({
                success: false,
                message: 'Disaster not found or NGO not assigned'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: disaster
        });
    } catch (err) {
        console.error('Error updating disaster status:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: err.message
        });
    }
});

module.exports = router; 