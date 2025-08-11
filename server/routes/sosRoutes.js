const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Sos = require('../models/Sos');

// Create a new SOS request
router.post('/create', async (req, res) => {
  try {
    const {
      user_id,
      name,
      phone_number,
      location
    } = req.body;

    // Validate required fields
    if (!user_id || !name || !phone_number || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, name, phone_number, and location are required'
      });
    }

    // Validate user_id format
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate location format
    if (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location format. Coordinates must be an array of [longitude, latitude]'
      });
    }

    // Validate location address
    if (!location.address || typeof location.address !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Location address is required and must be a string'
      });
    }

    // Prepare SOS data
    const sosData = {
      user_id,
      name,
      phone_number,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      },
      timestamp: new Date(),
      status: 'active'
    };

    console.log('Creating SOS with data:', sosData);

    // Create and save the SOS request
    const sos = new Sos(sosData);
    const savedSos = await sos.save();
    
    console.log('SOS saved successfully:', savedSos);
    
    res.status(201).json({
      success: true,
      message: 'SOS request recorded successfully',
      sos: savedSos
    });
    
  } catch (error) {
    console.error('Error creating SOS request:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to record SOS request',
      error: error.message
    });
  }
});

// Get all active SOS requests
router.get('/active', async (req, res) => {
  try {
    const sosRequests = await Sos.find({ status: 'active' })
      .sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      sosRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active SOS requests',
      error: error.message
    });
  }
});

// Get SOS requests by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const sosRequests = await Sos.find({ user_id: userId })
      .sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      sosRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user SOS requests',
      error: error.message
    });
  }
});

// Update SOS request status
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SOS request ID format'
      });
    }

    if (!['active', 'resolved', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: active, resolved, cancelled'
      });
    }

    const updatedSos = await Sos.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!updatedSos) {
      return res.status(404).json({
        success: false,
        message: 'SOS request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'SOS request status updated successfully',
      sos: updatedSos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update SOS request status',
      error: error.message
    });
  }
});

// Find nearby SOS requests
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query; // maxDistance in meters, default 5km

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const nearbyRequests = await Sos.find({
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      sosRequests: nearbyRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby SOS requests',
      error: error.message
    });
  }
});

module.exports = router; 