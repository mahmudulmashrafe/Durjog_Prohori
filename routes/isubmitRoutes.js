const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Isubmit = require('../models/Isubmit');
const jwt = require('jsonwebtoken');

// Middleware to verify user token (optional for this route to allow anonymous submissions)
const userAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      // Still proceed but without setting userId
      req.userId = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
    } catch (tokenError) {
      // Token invalid but still proceed without userId
      req.userId = null;
    }
    next();
  } catch (error) {
    // If any other error, still proceed
    req.userId = null;
    next();
  }
};

// Get all isubmit reports
router.get('/', userAuth, async (req, res) => {
  try {
    // If user is logged in, show their reports
    const query = req.userId ? { userId: req.userId } : {};
    const reports = await Isubmit.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching isubmit reports:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Create a new isubmit report
router.post('/', userAuth, async (req, res) => {
  try {
    const { name, phoneNumber, location, latitude, longitude, disasterType, description } = req.body;
    
    // Basic validation
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Name and location coordinates are required' });
    }
    
    const newReport = new Isubmit({
      userId: req.userId, // May be null for anonymous submissions
      name,
      phoneNumber,
      location,
      latitude,
      longitude,
      disasterType: disasterType || 'SOS',
      description,
      status: 'pending'
    });
    
    await newReport.save();
    res.status(201).json({ success: true, data: newReport });
  } catch (err) {
    console.error('Error creating isubmit report:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get all isubmit reports (admin/authority access)
router.get('/all', async (req, res) => {
  try {
    const reports = await Isubmit.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching all isubmit reports:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Update isubmit report status
router.put('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status value
    if (!['pending', 'processing', 'resolved', 'declined'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value. Must be one of: pending, processing, resolved, declined' 
      });
    }
    
    // Update the report status
    const updatedReport = await Isubmit.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedReport) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    res.json({ success: true, data: updatedReport });
  } catch (err) {
    console.error('Error updating isubmit report status:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Assign firefighters to an isubmit report
router.put('/assign-firefighters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firefighters } = req.body;
    
    if (!Array.isArray(firefighters)) {
      return res.status(400).json({
        success: false,
        message: 'Firefighters must be an array'
      });
    }
    
    // Find the report
    const report = await Isubmit.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Update the report with the assigned firefighters
    const updatedReport = await Isubmit.findByIdAndUpdate(
      id,
      { 
        assignedFirefighters: firefighters,
        status: 'processing', // Automatically set status to processing
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Firefighters assigned successfully',
      data: updatedReport
    });
  } catch (err) {
    console.error('Error assigning firefighters:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router; 