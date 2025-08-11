const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Disaster = require('../models/Disaster');

// Helper function to get the right collection based on type
const getDisasterCollection = (type) => {
  const collectionName = `disaster${type}`;
  return mongoose.connection.db.collection(collectionName);
};

// Get all disasters of a specific type
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { showHidden = false } = req.query;

    const collection = getDisasterCollection(type);
    
    // Build query
    const query = {};
    if (!showHidden) {
      query.isVisible = { $ne: 0 }; // Show if isVisible is not 0
    }

    const disasters = await collection.find(query).sort({ createdAt: -1 }).toArray();
    
    res.status(200).json({
      success: true,
      data: disasters
    });
  } catch (error) {
    console.error('Error fetching disasters:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving disaster data',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Create a new disaster
router.post('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { name, location, latitude, longitude, dangerLevel, isVisible } = req.body;

    // Set isVisible to 1 (visible) by default if not provided
    const visibilityValue = isVisible === undefined || isVisible === null 
      ? 1 
      : (typeof isVisible === 'boolean' ? (isVisible ? 1 : 0) : Number(isVisible));

    console.log('Creating new disaster:', {
      type,
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      isVisible: visibilityValue // Log the numeric value
    });

    const collection = getDisasterCollection(type);
    
    const disasterDoc = {
      name,
      location,
      latitude: Number(latitude),
      longitude: Number(longitude),
      dangerLevel: Number(dangerLevel),
      isVisible: visibilityValue, // Explicitly set to numeric value
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(disasterDoc);
    
    // Get the inserted document to verify isVisible was set
    const savedDisaster = await collection.findOne({ _id: result.insertedId });
    
    console.log('Disaster created successfully:', savedDisaster);
    console.log('isVisible value in saved document:', savedDisaster.isVisible);
    
    res.status(201).json({
      success: true,
      data: savedDisaster
    });
  } catch (error) {
    console.error('Error creating disaster:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating disaster',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Update a disaster
router.put('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { name, location, latitude, longitude, dangerLevel, isVisible } = req.body;

    const collection = getDisasterCollection(type);
    
    const result = await collection.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $set: {
          name,
          location,
          latitude: Number(latitude),
          longitude: Number(longitude),
          dangerLevel: Number(dangerLevel),
          isVisible: isVisible === undefined ? 1 : Number(isVisible),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    const disaster = result.value;

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    res.status(200).json({
      success: true,
      data: disaster
    });
  } catch (error) {
    console.error('Error updating disaster:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating disaster',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Delete a disaster
router.delete('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const collection = getDisasterCollection(type);

    const result = await collection.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    const disaster = result.value;

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Disaster deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting disaster:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting disaster',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Toggle disaster visibility
router.patch('/:type/:id/visibility', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { isVisible } = req.body;
    
    console.log('Visibility toggle request:', {
      type,
      id,
      isVisible,
      body: req.body
    });

    // Convert to number (1 or 0) for consistent handling
    let visibilityValue;
    
    if (typeof isVisible === 'boolean') {
      visibilityValue = isVisible ? 1 : 0;
    } else if (isVisible === 1 || isVisible === '1') {
      visibilityValue = 1;
    } else if (isVisible === 0 || isVisible === '0') {
      visibilityValue = 0;
    } else {
      visibilityValue = 1; // Default to visible
    }
    
    console.log('Setting visibility value to:', visibilityValue);
    
    const collection = getDisasterCollection(type);

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      console.error('Invalid ObjectId:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid disaster ID'
      });
    }

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { 
        $set: { 
          visible: visibilityValue,
          isVisible: visibilityValue,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    const disaster = result.value;

    if (!disaster) {
      console.log('Disaster not found:', { type, id });
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    console.log('Visibility updated successfully:', {
      type,
      id,
      newVisibility: disaster.visible
    });

    res.json({
      success: true,
      message: 'Disaster visibility updated successfully',
      data: disaster
    });
  } catch (error) {
    console.error('Error updating disaster visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating disaster visibility',
      error: error.message
    });
  }
});

module.exports = router; 