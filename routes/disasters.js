const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// Import disaster models
const Earthquake = require('../models/Earthquake');
const DisasterFlood = require('../models/DisasterFlood');
const DisasterCyclone = require('../models/DisasterCyclone');
const DisasterLandslide = require('../models/DisasterLandslide');
const DisasterTsunami = require('../models/DisasterTsunami');
const DisasterFire = require('../models/DisasterFire');
const DisasterOther = require('../models/DisasterOther');
const User = require('../models/User');

// MongoDB connection URL
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'durjog-prohori';
const NOTIFICATIONS_COLLECTION = 'usernotifications';

// Middleware to verify authority token
const authorityRoutes = require('./authority');
const { authorityAuth } = authorityRoutes;

// Helper function to create notifications for all users
const createNotificationsForUsers = async (disaster, type) => {
  let client;
  try {
    // Get all users from the main database
    const users = await User.find();
    
    // Connect to the main database for notifications
    client = await MongoClient.connect(MONGO_URI);
    const db = client.db(DB_NAME);
    
    // Create notifications for each user
    const notifications = users.map(user => ({
      userId: user._id.toString(),
      title: `New ${type} Disaster Alert`,
      message: `A new ${type} disaster has been reported at ${disaster.location}. Danger level: ${disaster.dangerLevel}. Please stay alert and follow safety guidelines.`,
      type: 'disaster',
      read: false,
      data: {
        disasterId: disaster._id.toString(),
        disasterType: type,
        location: disaster.location,
        dangerLevel: disaster.dangerLevel,
        latitude: disaster.latitude,
        longitude: disaster.longitude
      },
      createdAt: new Date()
    }));

    if (notifications.length > 0) {
      // Insert notifications into the correct collection
      await db.collection(NOTIFICATIONS_COLLECTION).insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for disaster: ${type}`);
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// GET all disasters of each type
router.get('/earthquake', async (req, res) => {
  try {
    const earthquakes = await Earthquake.find().sort({ createdAt: -1 });
    res.json({ success: true, data: earthquakes });
  } catch (err) {
    console.error('Error fetching earthquakes:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.get('/flood', async (req, res) => {
  try {
    const floods = await DisasterFlood.find().sort({ createdAt: -1 });
    res.json({ success: true, data: floods });
  } catch (err) {
    console.error('Error fetching floods:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.get('/cyclone', async (req, res) => {
  try {
    const cyclones = await DisasterCyclone.find().sort({ createdAt: -1 });
    res.json({ success: true, data: cyclones });
  } catch (err) {
    console.error('Error fetching cyclones:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.get('/landslide', async (req, res) => {
  try {
    const landslides = await DisasterLandslide.find().sort({ createdAt: -1 });
    res.json({ success: true, data: landslides });
  } catch (err) {
    console.error('Error fetching landslides:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.get('/tsunami', async (req, res) => {
  try {
    const tsunamis = await DisasterTsunami.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tsunamis });
  } catch (err) {
    console.error('Error fetching tsunamis:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.get('/fire', async (req, res) => {
  try {
    const fires = await DisasterFire.find().sort({ createdAt: -1 });
    res.json({ success: true, data: fires });
  } catch (err) {
    console.error('Error fetching fires:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.get('/other', async (req, res) => {
  try {
    const others = await DisasterOther.find().sort({ createdAt: -1 });
    res.json({ success: true, data: others });
  } catch (err) {
    console.error('Error fetching other disasters:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST new disaster (create) - Authority only

// Note: Earthquake data should be read-only per requirements
router.post('/flood', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const newFlood = new DisasterFlood({
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      needsFirefighters: needsFirefighters !== undefined ? needsFirefighters : false,
      needsNGOs: needsNGOs !== undefined ? needsNGOs : false,
      assignedFirefighters: assignedFirefighters || [],
      assignedNGOs: assignedNGOs || [],
      status: status || 'pending'
    });
    
    await newFlood.save();
    
    // Create notifications for all users
    await createNotificationsForUsers(newFlood, 'flood');
    
    res.status(201).json({ success: true, data: newFlood });
  } catch (err) {
    console.error('Error creating flood:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.post('/cyclone', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const newCyclone = new DisasterCyclone({
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      needsFirefighters: needsFirefighters !== undefined ? needsFirefighters : false,
      needsNGOs: needsNGOs !== undefined ? needsNGOs : false,
      assignedFirefighters: assignedFirefighters || [],
      assignedNGOs: assignedNGOs || [],
      status: status || 'pending'
    });
    
    await newCyclone.save();
    
    // Create notifications for all users
    await createNotificationsForUsers(newCyclone, 'cyclone');
    
    res.status(201).json({ success: true, data: newCyclone });
  } catch (err) {
    console.error('Error creating cyclone:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.post('/landslide', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const newLandslide = new DisasterLandslide({
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      needsFirefighters: needsFirefighters !== undefined ? needsFirefighters : false,
      needsNGOs: needsNGOs !== undefined ? needsNGOs : false,
      assignedFirefighters: assignedFirefighters || [],
      assignedNGOs: assignedNGOs || [],
      status: status || 'pending'
    });
    
    await newLandslide.save();
    
    // Create notifications for all users
    await createNotificationsForUsers(newLandslide, 'landslide');
    
    res.status(201).json({ success: true, data: newLandslide });
  } catch (err) {
    console.error('Error creating landslide:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.post('/tsunami', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const newTsunami = new DisasterTsunami({
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      needsFirefighters: needsFirefighters !== undefined ? needsFirefighters : false,
      needsNGOs: needsNGOs !== undefined ? needsNGOs : false,
      assignedFirefighters: assignedFirefighters || [],
      assignedNGOs: assignedNGOs || [],
      status: status || 'pending'
    });
    
    await newTsunami.save();
    
    // Create notifications for all users
    await createNotificationsForUsers(newTsunami, 'tsunami');
    
    res.status(201).json({ success: true, data: newTsunami });
  } catch (err) {
    console.error('Error creating tsunami:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.post('/fire', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const newFire = new DisasterFire({
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      needsFirefighters: needsFirefighters !== undefined ? needsFirefighters : false,
      needsNGOs: needsNGOs !== undefined ? needsNGOs : false,
      assignedFirefighters: assignedFirefighters || [],
      assignedNGOs: assignedNGOs || [],
      status: status || 'pending'
    });
    
    await newFire.save();
    
    // Create notifications for all users
    await createNotificationsForUsers(newFire, 'fire');
    
    res.status(201).json({ success: true, data: newFire });
  } catch (err) {
    console.error('Error creating fire:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.post('/other', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const newOther = new DisasterOther({
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      needsFirefighters: needsFirefighters !== undefined ? needsFirefighters : false,
      needsNGOs: needsNGOs !== undefined ? needsNGOs : false,
      assignedFirefighters: assignedFirefighters || [],
      assignedNGOs: assignedNGOs || [],
      status: status || 'pending'
    });
    
    await newOther.save();
    
    // Create notifications for all users
    await createNotificationsForUsers(newOther, 'other');
    
    res.status(201).json({ success: true, data: newOther });
  } catch (err) {
    console.error('Error creating other disaster:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// UPDATE disaster (except Earthquake) - Authority only
router.put('/flood/:id', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const updateData = {
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      status: status || 'pending',
      updatedAt: Date.now()
    };

    // Add optional fields only if they exist in the request
    if (needsFirefighters !== undefined) updateData.needsFirefighters = needsFirefighters;
    if (needsNGOs !== undefined) updateData.needsNGOs = needsNGOs;
    if (assignedFirefighters !== undefined) updateData.assignedFirefighters = assignedFirefighters;
    if (assignedNGOs !== undefined) updateData.assignedNGOs = assignedNGOs;

    console.log('Updating flood disaster with data:', updateData);
    
    const updatedFlood = await DisasterFlood.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedFlood) {
      return res.status(404).json({ success: false, message: 'Flood not found' });
    }
    
    res.json({ success: true, data: updatedFlood });
  } catch (err) {
    console.error('Error updating flood:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.put('/cyclone/:id', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const updateData = {
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      status: status || 'pending',
      updatedAt: Date.now()
    };

    // Add optional fields only if they exist in the request
    if (needsFirefighters !== undefined) updateData.needsFirefighters = needsFirefighters;
    if (needsNGOs !== undefined) updateData.needsNGOs = needsNGOs;
    if (assignedFirefighters !== undefined) updateData.assignedFirefighters = assignedFirefighters;
    if (assignedNGOs !== undefined) updateData.assignedNGOs = assignedNGOs;

    console.log('Updating cyclone disaster with data:', updateData);
    
    const updatedCyclone = await DisasterCyclone.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedCyclone) {
      return res.status(404).json({ success: false, message: 'Cyclone not found' });
    }
    
    res.json({ success: true, data: updatedCyclone });
  } catch (err) {
    console.error('Error updating cyclone:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.put('/landslide/:id', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const updateData = {
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      status: status || 'pending',
      updatedAt: Date.now()
    };

    // Add optional fields only if they exist in the request
    if (needsFirefighters !== undefined) updateData.needsFirefighters = needsFirefighters;
    if (needsNGOs !== undefined) updateData.needsNGOs = needsNGOs;
    if (assignedFirefighters !== undefined) updateData.assignedFirefighters = assignedFirefighters;
    if (assignedNGOs !== undefined) updateData.assignedNGOs = assignedNGOs;

    console.log('Updating landslide disaster with data:', updateData);
    
    const updatedLandslide = await DisasterLandslide.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedLandslide) {
      return res.status(404).json({ success: false, message: 'Landslide not found' });
    }
    
    res.json({ success: true, data: updatedLandslide });
  } catch (err) {
    console.error('Error updating landslide:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.put('/tsunami/:id', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const updateData = {
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      status: status || 'pending',
      updatedAt: Date.now()
    };

    // Add optional fields only if they exist in the request
    if (needsFirefighters !== undefined) updateData.needsFirefighters = needsFirefighters;
    if (needsNGOs !== undefined) updateData.needsNGOs = needsNGOs;
    if (assignedFirefighters !== undefined) updateData.assignedFirefighters = assignedFirefighters;
    if (assignedNGOs !== undefined) updateData.assignedNGOs = assignedNGOs;

    console.log('Updating tsunami disaster with data:', updateData);
    
    const updatedTsunami = await DisasterTsunami.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedTsunami) {
      return res.status(404).json({ success: false, message: 'Tsunami not found' });
    }
    
    res.json({ success: true, data: updatedTsunami });
  } catch (err) {
    console.error('Error updating tsunami:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.put('/fire/:id', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const updateData = {
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      status: status || 'pending',
      updatedAt: Date.now()
    };

    // Add optional fields only if they exist in the request
    if (needsFirefighters !== undefined) updateData.needsFirefighters = needsFirefighters;
    if (needsNGOs !== undefined) updateData.needsNGOs = needsNGOs;
    if (assignedFirefighters !== undefined) updateData.assignedFirefighters = assignedFirefighters;
    if (assignedNGOs !== undefined) updateData.assignedNGOs = assignedNGOs;

    console.log('Updating fire disaster with data:', updateData);
    
    const updatedFire = await DisasterFire.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedFire) {
      return res.status(404).json({ success: false, message: 'Fire not found' });
    }
    
    res.json({ success: true, data: updatedFire });
  } catch (err) {
    console.error('Error updating fire:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.put('/other/:id', authorityAuth, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      dangerLevel, 
      visible,
      needsFirefighters,
      needsNGOs,
      assignedFirefighters,
      assignedNGOs,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !location || !latitude || !longitude || !dangerLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const updateData = {
      name,
      location,
      latitude,
      longitude,
      dangerLevel,
      visible: visible !== undefined ? visible : 1,
      status: status || 'pending',
      updatedAt: Date.now()
    };

    // Add optional fields only if they exist in the request
    if (needsFirefighters !== undefined) updateData.needsFirefighters = needsFirefighters;
    if (needsNGOs !== undefined) updateData.needsNGOs = needsNGOs;
    if (assignedFirefighters !== undefined) updateData.assignedFirefighters = assignedFirefighters;
    if (assignedNGOs !== undefined) updateData.assignedNGOs = assignedNGOs;

    console.log('Updating other disaster with data:', updateData);
    
    const updatedOther = await DisasterOther.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedOther) {
      return res.status(404).json({ success: false, message: 'Disaster not found' });
    }
    
    res.json({ success: true, data: updatedOther });
  } catch (err) {
    console.error('Error updating other disaster:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// DELETE disaster (except Earthquake) - Authority only
router.delete('/flood/:id', authorityAuth, async (req, res) => {
  try {
    const deletedFlood = await DisasterFlood.findByIdAndDelete(req.params.id);
    
    if (!deletedFlood) {
      return res.status(404).json({ success: false, message: 'Flood not found' });
    }
    
    res.json({ success: true, message: 'Flood deleted' });
  } catch (err) {
    console.error('Error deleting flood:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.delete('/cyclone/:id', authorityAuth, async (req, res) => {
  try {
    const deletedCyclone = await DisasterCyclone.findByIdAndDelete(req.params.id);
    
    if (!deletedCyclone) {
      return res.status(404).json({ success: false, message: 'Cyclone not found' });
    }
    
    res.json({ success: true, message: 'Cyclone deleted' });
  } catch (err) {
    console.error('Error deleting cyclone:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.delete('/landslide/:id', authorityAuth, async (req, res) => {
  try {
    const deletedLandslide = await DisasterLandslide.findByIdAndDelete(req.params.id);
    
    if (!deletedLandslide) {
      return res.status(404).json({ success: false, message: 'Landslide not found' });
    }
    
    res.json({ success: true, message: 'Landslide deleted' });
  } catch (err) {
    console.error('Error deleting landslide:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.delete('/tsunami/:id', authorityAuth, async (req, res) => {
  try {
    const deletedTsunami = await DisasterTsunami.findByIdAndDelete(req.params.id);
    
    if (!deletedTsunami) {
      return res.status(404).json({ success: false, message: 'Tsunami not found' });
    }
    
    res.json({ success: true, message: 'Tsunami deleted' });
  } catch (err) {
    console.error('Error deleting tsunami:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.delete('/fire/:id', authorityAuth, async (req, res) => {
  try {
    const deletedFire = await DisasterFire.findByIdAndDelete(req.params.id);
    
    if (!deletedFire) {
      return res.status(404).json({ success: false, message: 'Fire not found' });
    }
    
    res.json({ success: true, message: 'Fire deleted' });
  } catch (err) {
    console.error('Error deleting fire:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.delete('/other/:id', authorityAuth, async (req, res) => {
  try {
    const deletedOther = await DisasterOther.findByIdAndDelete(req.params.id);
    
    if (!deletedOther) {
      return res.status(404).json({ success: false, message: 'Disaster not found' });
    }
    
    res.json({ success: true, message: 'Disaster deleted' });
  } catch (err) {
    console.error('Error deleting other disaster:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Special route to update only earthquake visibility
router.patch('/earthquake/:id/visibility', authorityAuth, async (req, res) => {
  try {
    const { visible } = req.body;
    
    if (visible === undefined) {
      return res.status(400).json({ success: false, message: 'Visibility status is required' });
    }
    
    const updatedEarthquake = await Earthquake.findByIdAndUpdate(
      req.params.id,
      { 
        visible: visible ? 1 : 0,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedEarthquake) {
      return res.status(404).json({ success: false, message: 'Earthquake not found' });
    }
    
    res.json({ success: true, data: updatedEarthquake });
  } catch (err) {
    console.error('Error updating earthquake visibility:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Direct MongoDB connection to earthquakes collection
router.get('/mongodb/earthquakes', async (req, res) => {
  try {
    // Connect directly to MongoDB
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb://localhost:27017/";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await client.connect();
    const db = client.db("durjog-prohori");
    const collection = db.collection("earthquakes");
    
    // Query the collection and sort by date in descending order
    let earthquakes = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    // Map MongoDB fields to match expected format in application
    earthquakes = earthquakes.map(eq => {
      return {
        ...eq,
        name: eq.title || eq.name, // Use title as name if available
        location: eq.place || eq.location, // Use place as location if available
        // Add any other necessary field mappings
        dateTime: eq.dateTime || eq.time || eq.createdAt,
        dangerLevel: eq.dangerLevel || eq.magnitude || 5,
        visible: eq.visible !== undefined ? eq.visible : 1
      };
    });
    
    await client.close();
    
    res.json({ success: true, data: earthquakes });
  } catch (err) {
    console.error('Error fetching earthquakes directly from MongoDB:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error connecting to MongoDB directly', 
      error: err.message 
    });
  }
});

// Direct MongoDB connection to flood collection
router.get('/mongodb/disasterflood', async (req, res) => {
  try {
    // Connect directly to MongoDB
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb://localhost:27017/";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await client.connect();
    const db = client.db("durjog-prohori");
    const collection = db.collection("disasterflood");
    
    // Query the collection and sort by date in descending order
    let floods = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json({ success: true, data: floods });
  } catch (err) {
    console.error('Error fetching floods directly from MongoDB:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error connecting to MongoDB directly', 
      error: err.message 
    });
  }
});

// Direct MongoDB connection to landslide collection
router.get('/mongodb/disasterlandslide', async (req, res) => {
  try {
    // Connect directly to MongoDB
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb://localhost:27017/";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await client.connect();
    const db = client.db("durjog-prohori");
    const collection = db.collection("disasterlandslide");
    
    // Query the collection and sort by date in descending order
    let landslides = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json({ success: true, data: landslides });
  } catch (err) {
    console.error('Error fetching landslides directly from MongoDB:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error connecting to MongoDB directly', 
      error: err.message 
    });
  }
});

// Direct MongoDB connection to tsunami collection
router.get('/mongodb/disastertsunami', async (req, res) => {
  try {
    // Connect directly to MongoDB
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb://localhost:27017/";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await client.connect();
    const db = client.db("durjog-prohori");
    const collection = db.collection("disastertsunami");
    
    // Query the collection and sort by date in descending order
    let tsunamis = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json({ success: true, data: tsunamis });
  } catch (err) {
    console.error('Error fetching tsunamis directly from MongoDB:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error connecting to MongoDB directly', 
      error: err.message 
    });
  }
});

// Direct MongoDB connection to fire collection
router.get('/mongodb/disasterfire', async (req, res) => {
  try {
    // Connect directly to MongoDB
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb://localhost:27017/";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await client.connect();
    const db = client.db("durjog-prohori");
    const collection = db.collection("disasterfire");
    
    // Query the collection and sort by date in descending order
    let fires = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json({ success: true, data: fires });
  } catch (err) {
    console.error('Error fetching fires directly from MongoDB:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error connecting to MongoDB directly', 
      error: err.message 
    });
  }
});

// Direct MongoDB connection to cyclone collection
router.get('/mongodb/disastercyclone', async (req, res) => {
  try {
    // Connect directly to MongoDB
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb://localhost:27017/";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await client.connect();
    const db = client.db("durjog-prohori");
    const collection = db.collection("disastercyclone");
    
    // Query the collection and sort by date in descending order
    let cyclones = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json({ success: true, data: cyclones });
  } catch (err) {
    console.error('Error fetching cyclones directly from MongoDB:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error connecting to MongoDB directly', 
      error: err.message 
    });
  }
});

// Direct MongoDB connection to other collection
router.get('/mongodb/disasterother', async (req, res) => {
  try {
    // Connect directly to MongoDB
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb://localhost:27017/";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await client.connect();
    const db = client.db("durjog-prohori");
    const collection = db.collection("disasterother");
    
    // Query the collection and sort by date in descending order
    let others = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json({ success: true, data: others });
  } catch (err) {
    console.error('Error fetching other disasters directly from MongoDB:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error connecting to MongoDB directly', 
      error: err.message 
    });
  }
});

module.exports = router; 