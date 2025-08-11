const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const BloodDonor = require('../models/BloodDonor');

// Create a new blood donor registration
router.post('/register', async (req, res) => {
  try {
    const {
      user_id,
      blood_type,
      location,
      available_date,
      is_available,
      phone_number
    } = req.body;

    // Validate required fields
    if (!user_id || !blood_type || !location || !available_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, blood_type, location, and available_date are required'
      });
    }

    // Validate user_id format
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Prepare donor data
    const donorData = {
      user_id,
      blood_type,
      location,
      available_date: new Date(available_date),
      is_available: is_available || true,
      phone_number: phone_number || null
    };

    // Create and save the donor registration
    const donor = new BloodDonor(donorData);
    const savedDonor = await donor.save();
    
    res.status(201).json({
      success: true,
      message: 'Blood donor registration successful',
      donor: savedDonor
    });
    
  } catch (error) {
    console.error('Error creating blood donor registration:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to register blood donor',
      error: error.message
    });
  }
});

// Get all available blood donors
router.get('/available', async (req, res) => {
  try {
    const currentDate = new Date();
    
    const availableDonors = await BloodDonor.find({
      is_available: true,
      available_date: { $gte: currentDate }
    }).sort({ blood_type: 1, available_date: 1 });
    
    res.status(200).json({
      success: true,
      donors: availableDonors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available donors',
      error: error.message
    });
  }
});

// Get donor by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const donor = await BloodDonor.findOne({ user_id: userId });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Blood donor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor information',
      error: error.message
    });
  }
});

// Update donor information
router.put('/update/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const updatedDonor = await BloodDonor.findOneAndUpdate(
      { user_id: userId },
      updateData,
      { new: true }
    );
    
    if (!updatedDonor) {
      return res.status(404).json({
        success: false,
        message: 'Blood donor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor information updated successfully',
      donor: updatedDonor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update donor information',
      error: error.message
    });
  }
});

// Delete donor registration
router.delete('/delete/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const deletedDonor = await BloodDonor.findOneAndDelete({ user_id: userId });
    
    if (!deletedDonor) {
      return res.status(404).json({
        success: false,
        message: 'Blood donor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor registration deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete donor registration',
      error: error.message
    });
  }
});

module.exports = router; 