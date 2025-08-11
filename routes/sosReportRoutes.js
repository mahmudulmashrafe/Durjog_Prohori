const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SosReport = require('../models/SosReport');
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

// Get all SOS reports for the logged-in user
router.get('/', userAuth, async (req, res) => {
  try {
    const reports = await SosReport.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching SOS reports:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get a specific SOS report by ID (only if it belongs to the user)
router.get('/:id', userAuth, async (req, res) => {
  try {
    const report = await SosReport.findOne({ 
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'SOS report not found or not authorized' });
    }
    
    res.json({ success: true, data: report });
  } catch (err) {
    console.error('Error fetching SOS report:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Create a new SOS report
router.post('/', userAuth, async (req, res) => {
  try {
    const { name, location, latitude, longitude, disasterType, phoneNumber } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }
    
    const newReport = new SosReport({
      userId: req.userId,
      name,
      location,
      latitude,
      longitude,
      disasterType: disasterType || 'other',
      phoneNumber,
      status: 'active'
    });
    
    await newReport.save();
    res.status(201).json({ success: true, data: newReport });
  } catch (err) {
    console.error('Error creating SOS report:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Update SOS report status (only if it belongs to the user)
router.put('/status/:id', userAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['active', 'resolved', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status required (active, resolved, or cancelled)' 
      });
    }
    
    // Find and update the report, ensuring it belongs to the user
    const updatedReport = await SosReport.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedReport) {
      return res.status(404).json({ success: false, message: 'Report not found or not authorized' });
    }
    
    res.json({ success: true, data: updatedReport });
  } catch (err) {
    console.error('Error updating SOS report status:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get all active SOS reports (admin/authority access)
router.get('/all/active', async (req, res) => {
  try {
    const reports = await SosReport.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching active SOS reports:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router; 