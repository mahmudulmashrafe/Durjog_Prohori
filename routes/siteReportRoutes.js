const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SiteReport = require('../models/SiteReport');
const jwt = require('jsonwebtoken');

// Middleware to verify user token
const userAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Middleware to verify authority token
const authorityAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    req.role = decoded.role;
    
    // Ensure user is an authority
    if (decoded.role !== 'authority') {
      return res.status(403).json({ success: false, message: 'Access denied. Authority role required.' });
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get all site reports for the logged-in user
router.get('/', userAuth, async (req, res) => {
  try {
    const reports = await SiteReport.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching site reports:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get all site reports - Authority access only
router.get('/all', async (req, res) => {
  try {
    // Check for token in development mode
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // If not in development and no token, require authentication
    if (!isDevelopment && !token) {
      try {
        // Use the authorityAuth middleware
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Ensure user is an authority
        if (decoded.role !== 'authority') {
          return res.status(403).json({ success: false, message: 'Access denied. Authority role required.' });
        }
      } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    }
    
    const reports = await SiteReport.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching all site reports:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get a specific site report by ID (only if it belongs to the user)
router.get('/:id', userAuth, async (req, res) => {
  try {
    const report = await SiteReport.findOne({ 
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found or not authorized' });
    }
    
    res.json({ success: true, data: report });
  } catch (err) {
    console.error('Error fetching site report:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Create a new site report
router.post('/', userAuth, async (req, res) => {
  try {
    const { name, location, latitude, longitude, dangerLevel, disasterType, description, visible } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }
    
    const newReport = new SiteReport({
      userId: req.userId,
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      disasterType: disasterType || 'earthquake',
      description,
      visible: visible !== undefined ? visible : 1
    });
    
    await newReport.save();
    res.status(201).json({ success: true, data: newReport });
  } catch (err) {
    console.error('Error creating site report:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Update a site report (only if it belongs to the user)
router.put('/:id', userAuth, async (req, res) => {
  try {
    const { name, location, latitude, longitude, dangerLevel, disasterType, description, visible } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }
    
    // Find and update the report, ensuring it belongs to the user
    const updatedReport = await SiteReport.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        name,
        location,
        latitude,
        longitude,
        dangerLevel,
        disasterType: disasterType || 'earthquake',
        description,
        visible: visible !== undefined ? visible : 1,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedReport) {
      return res.status(404).json({ success: false, message: 'Report not found or not authorized' });
    }
    
    res.json({ success: true, data: updatedReport });
  } catch (err) {
    console.error('Error updating site report:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Delete a site report (only if it belongs to the user)
router.delete('/:id', userAuth, async (req, res) => {
  try {
    const report = await SiteReport.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found or not authorized' });
    }
    
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting site report:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router; 