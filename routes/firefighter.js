const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Firefighter = require('../models/Firefighter');
const mongoose = require('mongoose');

// Middleware to verify firefighter token
const firefighterAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded.isFirefighter) {
      return res.status(403).json({ message: 'Firefighter access required' });
    }
    
    const firefighter = await Firefighter.findById(decoded.userId);
    if (!firefighter) {
      return res.status(404).json({ message: 'Firefighter not found' });
    }
    
    if (firefighter.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    req.firefighter = firefighter;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if firefighter is chief or captain
const chiefOrCaptainAuth = (req, res, next) => {
  if (req.firefighter && (req.firefighter.role === 'chief' || req.firefighter.role === 'captain')) {
    next();
  } else {
    res.status(403).json({ message: 'Chief or Captain access required' });
  }
};

// Create default firefighter if doesn't exist
router.get('/setup-default-firefighter', async (req, res) => {
  try {
    // Check if firefighter exists
    const firefighterExists = await Firefighter.findOne({ username: 'fire' });
    if (firefighterExists) {
      return res.status(400).json({ message: 'Default firefighter already exists' });
    }

    // Create new firefighter
    const firefighter = new Firefighter({
      username: 'fire',
      password: 'fire', // Will be hashed by the pre-save hook
      name: 'Default Firefighter',
      role: 'chief',
      email: 'firefighter@durjogprohori.com',
      phoneNumber: '+8801700000001',
      station: 'Central Fire Station',
      badgeNumber: 'FD-001',
      yearsOfService: 5,
      specializedTraining: ['Hazardous Materials', 'Search and Rescue'],
      equipment: ['Fire Extinguisher', 'Breathing Apparatus'],
      permissions: {
        canRespondToEmergencies: true,
        canCreateReports: true,
        canViewAllReports: true,
        canManageTeam: true
      },
      status: 'active'
    });

    await firefighter.save();
    
    res.json({ message: 'Default firefighter created successfully', username: firefighter.username });
  } catch (err) {
    console.error('Error creating default firefighter:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Firefighter login
router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Firefighter login attempt for username:', username);
    
    // Log the current database connection info
    console.log('Current database:', mongoose.connection.name || mongoose.connection.db?.databaseName);
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    // Check if firefighter exists
    const firefighter = await Firefighter.findOne({ username });
    if (!firefighter) {
      console.log('Firefighter login failed: Firefighter not found with username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Firefighter found in database:', firefighter._id);

    // Check if firefighter account is active
    if (firefighter.status !== 'active') {
      console.log('Firefighter login failed: Account not active for username:', username);
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Validate password
    const isMatch = await firefighter.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Firefighter login failed: Invalid password for username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login and login history
    firefighter.lastLogin = new Date();
    
    // Get IP and user agent from request
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Add to login history
    firefighter.loginHistory.push({
      timestamp: new Date(),
      ipAddress,
      userAgent
    });
    
    await firefighter.save();
    console.log('Updated last login time for firefighter:', firefighter.username);

    // Generate JWT token
    const payload = {
      userId: firefighter._id,
      username: firefighter.username,
      role: firefighter.role,
      isFirefighter: true
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
    console.log('Generated JWT token for firefighter:', firefighter.username);

    res.json({
      success: true,
      token: token,
      firefighter: {
        id: firefighter._id,
        username: firefighter.username,
        name: firefighter.name,
        role: firefighter.role,
        station: firefighter.station,
        badgeNumber: firefighter.badgeNumber,
        permissions: firefighter.permissions
      }
    });
  } catch (err) {
    console.error('Firefighter login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get firefighter profile
router.get('/profile', firefighterAuth, async (req, res) => {
  try {
    const firefighter = req.firefighter;
    
    // Debug logging to see what's in the firefighter object
    console.log('Firefighter profile requested:');
    console.log('Username:', firefighter.username);
    console.log('Name:', firefighter.name);
    console.log('Email:', firefighter.email);
    console.log('Phone Number:', firefighter.phoneNumber);
    console.log('Role:', firefighter.role);
    console.log('Station:', firefighter.station);
    console.log('Location:', firefighter.location);
    console.log('Latitude:', firefighter.latitude);
    console.log('Longitude:', firefighter.longitude);
    
    res.json({
      success: true,
      firefighter: {
        id: firefighter._id,
        username: firefighter.username,
        name: firefighter.name,
        email: firefighter.email,
        phoneNumber: firefighter.phoneNumber,
        role: firefighter.role,
        station: firefighter.station,
        location: firefighter.location,
        latitude: firefighter.latitude,
        longitude: firefighter.longitude,
        badgeNumber: firefighter.badgeNumber,
        yearsOfService: firefighter.yearsOfService,
        specializedTraining: firefighter.specializedTraining,
        equipment: firefighter.equipment,
        permissions: firefighter.permissions,
        notificationPreferences: firefighter.notificationPreferences,
        lastLogin: firefighter.lastLogin,
        status: firefighter.status,
        createdAt: firefighter.createdAt
      }
    });
  } catch (err) {
    console.error('Get firefighter profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update firefighter profile
router.put('/profile', firefighterAuth, async (req, res) => {
  try {
    const firefighter = req.firefighter;
    const { name, email, phoneNumber, notificationPreferences, location, latitude, longitude } = req.body;
    
    // Update fields that firefighter can modify themselves
    if (name) firefighter.name = name;
    if (email) firefighter.email = email;
    if (phoneNumber) firefighter.phoneNumber = phoneNumber;
    if (location) firefighter.location = location;
    if (latitude) firefighter.latitude = latitude;
    if (longitude) firefighter.longitude = longitude;
    if (notificationPreferences) firefighter.notificationPreferences = {
      ...firefighter.notificationPreferences,
      ...notificationPreferences
    };
    
    firefighter.updatedAt = new Date();
    await firefighter.save();
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      firefighter: {
        id: firefighter._id,
        username: firefighter.username,
        name: firefighter.name,
        email: firefighter.email,
        phoneNumber: firefighter.phoneNumber,
        location: firefighter.location,
        latitude: firefighter.latitude,
        longitude: firefighter.longitude,
        notificationPreferences: firefighter.notificationPreferences
      }
    });
  } catch (err) {
    console.error('Update firefighter profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get login history
router.get('/login-history', firefighterAuth, async (req, res) => {
  try {
    const firefighter = req.firefighter;
    res.json({
      success: true,
      loginHistory: firefighter.loginHistory.sort((a, b) => b.timestamp - a.timestamp)
    });
  } catch (err) {
    console.error('Get login history error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change password
router.put('/change-password', firefighterAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const firefighter = req.firefighter;
    
    // Verify current password
    const isMatch = await firefighter.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    firefighter.password = newPassword;
    firefighter.updatedAt = new Date();
    await firefighter.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all firefighters (chief/captain only)
router.get('/all', firefighterAuth, chiefOrCaptainAuth, async (req, res) => {
  try {
    const firefighters = await Firefighter.find({})
      .select('-password -loginHistory')
      .sort({ role: 1, name: 1 });
    
    res.json({
      success: true,
      firefighters
    });
  } catch (err) {
    console.error('Get all firefighters error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new firefighter (chief/captain only)
router.post('/create', firefighterAuth, chiefOrCaptainAuth, async (req, res) => {
  try {
    const { 
      username, 
      password, 
      name, 
      email, 
      role, 
      phoneNumber,
      station,
      location,
      latitude,
      longitude,
      badgeNumber,
      yearsOfService,
      specializedTraining,
      permissions
    } = req.body;
    
    // Check if username already exists
    const existingFirefighter = await Firefighter.findOne({ username });
    if (existingFirefighter) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new firefighter
    const newFirefighter = new Firefighter({
      username,
      password,
      name,
      email,
      role: role || 'firefighter',
      phoneNumber,
      station,
      location: location || 'Fire Department Headquarters',
      latitude: latitude !== undefined ? latitude : 23.777176,
      longitude: longitude !== undefined ? longitude : 90.399452,
      badgeNumber,
      yearsOfService: yearsOfService || 0,
      specializedTraining: specializedTraining || [],
      permissions: permissions || {
        canRespondToEmergencies: true,
        canCreateReports: true,
        canViewAllReports: false,
        canManageTeam: false
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newFirefighter.save();
    
    res.status(201).json({
      success: true,
      message: 'Firefighter created successfully',
      firefighter: {
        id: newFirefighter._id,
        username: newFirefighter.username,
        name: newFirefighter.name,
        role: newFirefighter.role
      }
    });
  } catch (err) {
    console.error('Create firefighter error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update firefighter status (chief/captain only)
router.put('/status/:id', firefighterAuth, chiefOrCaptainAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!['active', 'inactive', 'on-leave', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const firefighter = await Firefighter.findById(id);
    if (!firefighter) {
      return res.status(404).json({ message: 'Firefighter not found' });
    }
    
    // Cannot change status of a chief if you're not a chief
    if (firefighter.role === 'chief' && req.firefighter.role !== 'chief') {
      return res.status(403).json({ message: 'Only a chief can change the status of another chief' });
    }
    
    firefighter.status = status;
    firefighter.updatedAt = new Date();
    await firefighter.save();
    
    res.json({
      success: true,
      message: 'Firefighter status updated successfully',
      firefighter: {
        id: firefighter._id,
        username: firefighter.username,
        status: firefighter.status
      }
    });
  } catch (err) {
    console.error('Update firefighter status error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Find nearby firefighters based on location coordinates
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

    // Find firefighters ordered by distance from the provided coordinates
    const firefighters = await Firefighter.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
      status: 'active'
    }).exec();

    // Calculate distances and sort
    const firefightersWithDistance = firefighters.map(firefighter => {
      // Calculate distance using the Haversine formula
      const dLat = (firefighter.latitude - lat) * Math.PI / 180;
      const dLng = (firefighter.longitude - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(firefighter.latitude * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = 6371 * 1000 * c; // Distance in meters (Earth radius is 6371 km)

      return {
        id: firefighter._id,
        name: firefighter.name,
        phoneNumber: firefighter.phoneNumber,
        email: firefighter.email,
        station: firefighter.station,
        location: firefighter.location,
        latitude: firefighter.latitude,
        longitude: firefighter.longitude,
        distance
      };
    });

    // Filter by max distance and sort by distance
    const nearbyFirefighters = firefightersWithDistance
      .filter(ff => ff.distance <= max)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, lmt);

    return res.json({
      success: true,
      firefighters: nearbyFirefighters
    });
  } catch (error) {
    console.error('Error finding nearby firefighters:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get reports for firefighters (processing/resolved OR specifically assigned to them)
router.get('/assigned-reports', firefighterAuth, async (req, res) => {
  try {
    const { status, firefighterId } = req.query;
    const authFirefighterId = req.firefighter._id;
    const authFirefighterIdStr = authFirefighterId.toString();
    
    // Use the provided firefighterId or the authenticated user's ID
    const targetFirefighterId = firefighterId || authFirefighterIdStr;
    
    console.log('Fetching reports with filters:', {
      status,
      targetFirefighterId,
      authFirefighterId: authFirefighterIdStr
    });
    
    const Isubmit = require('../models/Isubmit');
    
    // Build status query based on filter
    let statusQuery = {};
    if (status) {
      if (status === 'active') {
        // Special case for 'active' to include both processing and resolved
        statusQuery.status = { $in: ['processing', 'resolved'] };
      } else if (status !== 'all') {
        statusQuery.status = status;
      }
    } else {
      // Default to showing processing and resolved reports
      statusQuery.status = { $in: ['processing', 'resolved'] };
    }
    
    // Build query for reports assigned to this firefighter
    const assignedQuery = {
      assignedFirefighters: {
        $elemMatch: {
          firefighterId: targetFirefighterId
        }
      }
    };
    
    // Only use assignedQuery without $or to ensure only reports assigned to this firefighter are returned
    let query = assignedQuery;
    
    // If status filter is specified, add it to the query
    if (status && status !== 'all') {
      query = {
        ...assignedQuery,
        ...(status === 'active' 
          ? { status: { $in: ['processing', 'resolved'] } }
          : { status }
        )
      };
    }
    
    console.log('Using query filter:', JSON.stringify(query));
    
    // Get reports with filter
    const reports = await Isubmit.find(query).sort({ createdAt: -1 });
    
    console.log(`Found ${reports.length} total reports with filters applied`);
    
    // Log status counts for debugging
    const statusCounts = {};
    reports.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    console.log('Status breakdown:', statusCounts);
    
    res.json({
      success: true,
      message: 'Reports retrieved successfully',
      data: reports
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Update report status by firefighter (accept, decline, resolve)
router.put('/report-status/:reportId', firefighterAuth, async (req, res) => {
  // Log that we've hit this endpoint
  console.log('====== REPORT STATUS UPDATE REQUESTED ======');
  console.log('Endpoint: PUT /api/firefighter/report-status/:reportId');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('===========================================');
  
  try {
    const { reportId } = req.params;
    const { status, firefighterId } = req.body;
    
    // Use the provided firefighterId or the authenticated user's ID
    const targetFirefighterId = (firefighterId || req.firefighter._id.toString());
    
    console.log('Updating report status:', {
      reportId,
      status,
      targetFirefighterId,
      authId: req.firefighter._id.toString(),
      providedId: firefighterId || 'none',
      reqBody: JSON.stringify(req.body)
    });
    
    // Validate status
    if (!['accepted', 'declined', 'resolved'].includes(status)) {
      console.error(`Invalid status: ${status}. Valid options are: accepted, declined, resolved`);
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be accepted, declined, or resolved'
      });
    }
    
    // Find the report
    const Isubmit = require('../models/Isubmit');
    const report = await Isubmit.findById(reportId);
    
    if (!report) {
      console.error(`Report not found with ID: ${reportId}`);
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Log the report's assignedFirefighters
    console.log('Report assignedFirefighters:', 
      JSON.stringify(report.assignedFirefighters?.map(ff => ({
        id: ff.firefighterId ? ff.firefighterId.toString() : 'undefined'
      })) || [], null, 2));
    
    // Verify that the firefighter is assigned to this report
    const isAssigned = report.assignedFirefighters && 
      Array.isArray(report.assignedFirefighters) &&
      report.assignedFirefighters.some(ff => {
        if (!ff.firefighterId) return false;
        const ffId = ff.firefighterId.toString();
        const matches = ffId === targetFirefighterId;
        console.log(`Comparing: ${ffId} === ${targetFirefighterId}: ${matches}`);
        return matches;
      });
    
    if (!isAssigned) {
      console.error(`Firefighter ${targetFirefighterId} is not assigned to report ${reportId}`);
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this report'
      });
    }
    
    console.log(`Firefighter ${targetFirefighterId} is assigned to report ${reportId}. Updating status to ${status}`);
    
    // If declining, remove the firefighter from the assignment
    if (status === 'declined') {
      report.assignedFirefighters = report.assignedFirefighters.filter(
        ff => ff.firefighterId.toString() !== targetFirefighterId
      );
      
      // If no firefighters left, set report back to pending
      if (report.assignedFirefighters.length === 0) {
        report.status = 'pending';
      } else {
        // Always set the report status to declined when decline button clicked
        report.status = 'declined';
      }
    } else if (status === 'resolved') {
      // For resolve, always set status to resolved
      report.status = 'resolved';
    } else {
      // For accept, update the status
      report.status = status;
    }
    
    // Add status history
    report.statusHistory = report.statusHistory || [];
    report.statusHistory.push({
      status,
      changedBy: targetFirefighterId,
      changedByType: 'firefighter',
      timestamp: new Date()
    });
    
    // Save the changes
    try {
      await report.save();
      
      console.log(`Successfully updated report ${reportId} to status ${report.status}`);
      
      res.json({
        success: true,
        message: status === 'declined' ? 'Report declined' : 
                 status === 'resolved' ? 'Report resolved' : 
                 'Report status updated',
        data: {
          _id: report._id,
          status: report.status,
          assignedFirefighters: report.assignedFirefighters
        }
      });
    } catch (saveErr) {
      console.error('Error saving report:', saveErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to save report status',
        error: saveErr.message
      });
    }
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Direct endpoint to update report status (for debugging)
router.post('/direct-update-status/:reportId', async (req, res) => {
  try {
    console.log('==== DIRECT UPDATE STATUS ENDPOINT CALLED ====');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    const { reportId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      console.error('Missing status in request body');
      return res.status(400).json({
        success: false,
        message: 'Status is required in the request body'
      });
    }
    
    if (!['resolved', 'declined', 'processing', 'pending'].includes(status)) {
      console.error(`Invalid status value: "${status}"`);
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be resolved, declined, processing, or pending'
      });
    }
    
    console.log(`Looking for report with ID: ${reportId}`);
    const Isubmit = require('../models/Isubmit');
    const report = await Isubmit.findById(reportId);
    
    if (!report) {
      console.error(`Report not found with ID: ${reportId}`);
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    console.log(`Found report with status: ${report.status}`);
    
    // Update the status directly
    const oldStatus = report.status;
    report.status = status;
    
    // Add status history
    report.statusHistory = report.statusHistory || [];
    report.statusHistory.push({
      status,
      changedBy: 'direct-update',
      changedByType: 'firefighter',
      timestamp: new Date()
    });
    
    console.log(`Saving report with updated status: ${oldStatus} → ${status}`);
    await report.save();
    
    console.log(`Successfully updated report ${reportId} to status ${status} directly`);
    
    return res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: {
        _id: report._id,
        status: report.status
      }
    });
  } catch (err) {
    console.error('Error in direct status update:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Direct endpoint to decline a report (no authentication)
router.post('/decline-report/:reportId', async (req, res) => {
  try {
    console.log('==== DECLINE REPORT ENDPOINT CALLED ====');
    console.log('Report ID:', req.params.reportId);
    
    const { reportId } = req.params;
    
    // Find the report
    const Isubmit = require('../models/Isubmit');
    const report = await Isubmit.findById(reportId);
    
    if (!report) {
      console.error(`Report not found with ID: ${reportId}`);
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    console.log(`Found report with status: ${report.status}`);
    
    // Update status to declined
    const oldStatus = report.status;
    report.status = 'declined';
    
    // Add status history
    report.statusHistory = report.statusHistory || [];
    report.statusHistory.push({
      status: 'declined',
      changedBy: 'direct-decline',
      changedByType: 'firefighter',
      timestamp: new Date()
    });
    
    console.log(`Changing status from ${oldStatus} to declined`);
    await report.save();
    
    console.log(`Successfully declined report ${reportId}`);
    
    return res.json({
      success: true,
      message: 'Report declined successfully',
      data: {
        _id: report._id,
        status: 'declined'
      }
    });
  } catch (err) {
    console.error('Error declining report:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Super simple direct update for any status
router.post('/set-status/:reportId/:status', async (req, res) => {
  try {
    console.log('==== DIRECT SET STATUS ENDPOINT CALLED ====');
    console.log('Report ID:', req.params.reportId);
    console.log('Status:', req.params.status);
    
    const { reportId, status } = req.params;
    
    // Use direct MongoDB operations to bypass schema validation
    const db = mongoose.connection.db;
    const result = await db.collection('isubmit').updateOne(
      { _id: new mongoose.Types.ObjectId(reportId) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: status,
            changedBy: 'direct-update',
            changedByType: 'firefighter',
            timestamp: new Date()
          }
        }
      }
    );
    
    console.log('Direct update result:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    console.log(`Successfully updated report ${reportId} to status ${status}`);
    
    return res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: {
        _id: reportId,
        status: status
      }
    });
  } catch (err) {
    console.error('Error in direct status update:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Get assigned disasters with equipment requirements
router.get('/assigned-disasters', firefighterAuth, async (req, res) => {
  try {
    const firefighterId = req.firefighter._id;
    
    // Get all disaster types
    const disasterTypes = ['flood', 'fire', 'landslide', 'tsunami', 'cyclone', 'other'];
    let allAssignedDisasters = [];
    
    // Query each disaster collection
    for (const type of disasterTypes) {
      const DisasterModel = require(`../models/Disaster${type.charAt(0).toUpperCase() + type.slice(1)}`);
      
      const disasters = await DisasterModel.find({
        'assignedFirefighters.firefighterId': firefighterId
      });
      
      // Add disaster type to each disaster object
      const disastersWithType = disasters.map(d => ({
        ...d.toObject(),
        disasterType: type
      }));
      
      allAssignedDisasters = [...allAssignedDisasters, ...disastersWithType];
    }
    
    res.json({
      success: true,
      message: 'Assigned disasters retrieved successfully',
      data: allAssignedDisasters
    });
  } catch (err) {
    console.error('Error fetching assigned disasters:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Update firefighter equipment for a disaster
router.put('/update-equipment/:disasterType/:disasterId', firefighterAuth, async (req, res) => {
  try {
    const { disasterType, disasterId } = req.params;
    const { equipment } = req.body;
    const firefighterId = req.firefighter._id;
    
    // Get the appropriate disaster model
    const DisasterModel = require(`../models/Disaster${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)}`);
    
    // Find the disaster
    const disaster = await DisasterModel.findById(disasterId);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    
    // Find the firefighter's assignment
    const assignmentIndex = disaster.assignedFirefighters.findIndex(
      ff => ff.firefighterId.toString() === firefighterId.toString()
    );
    
    if (assignmentIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this disaster'
      });
    }
    
    // Update the equipment
    disaster.assignedFirefighters[assignmentIndex].equipment = equipment;
    
    await disaster.save();
    
    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: disaster
    });
  } catch (err) {
    console.error('Error updating equipment:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Update disaster status by firefighter
router.put('/update-status/:disasterType/:disasterId', firefighterAuth, async (req, res) => {
  try {
    const { disasterType, disasterId } = req.params;
    const { status } = req.body;
    const firefighterId = req.firefighter._id;
    
    // Get the appropriate disaster model
    const DisasterModel = require(`../models/Disaster${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)}`);
    
    // Find the disaster
    const disaster = await DisasterModel.findById(disasterId);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    
    // Find the firefighter's assignment
    const assignmentIndex = disaster.assignedFirefighters.findIndex(
      ff => ff.firefighterId.toString() === firefighterId.toString()
    );
    
    if (assignmentIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this disaster'
      });
    }
    
    // Update the status
    disaster.status = status;
    
    // Add status history if it doesn't exist
    if (!disaster.statusHistory) {
      disaster.statusHistory = [];
    }
    
    // Add new status to history
    disaster.statusHistory.push({
      status,
      changedBy: firefighterId,
      changedByType: 'firefighter',
      timestamp: new Date()
    });
    
    await disaster.save();
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: disaster
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router; 