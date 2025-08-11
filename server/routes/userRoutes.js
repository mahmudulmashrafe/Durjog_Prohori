const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');

// Get all users for community chat
router.get('/getAllUsers', async (req, res) => {
  console.log('GET /api/user/getAllUsers request received');
  try {
    const users = await User.find({}, '-password');
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Mock current user for testing
router.get('/currentUser', (req, res) => {
  console.log('GET /api/user/currentUser request received');
  // In a real app, this would come from session data or JWT
  const currentUser = {
    _id: "64a7e6d2c0274ae0e7594c17", // Valid MongoDB ID format
    name: 'Mahmudul Mashrafe',
    phone_number: '01798210399',
    email: 'mm4pro@gmail.com',
    profileImage: '1742210420322-257970452.png'
  };
  
  console.log('Returning mock current user');
  res.json(currentUser);
});

// Get user by ID
router.get('/:id', async (req, res) => {
  console.log(`GET /api/user/${req.params.id} request received`);
  try {
    const user = await User.findById(req.params.id, '-password');
    
    if (!user) {
      console.log(`User with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`Found user: ${user.name}`);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Create test user (for development purposes)
router.post('/createTestUser', async (req, res) => {
  console.log('POST /api/user/createTestUser request received');
  try {
    const testUser = new User({
      name: 'Test User',
      phone_number: '01712345678',
      is_phone_verified: true,
      email: 'testuser@example.com',
      is_email_verified: true,
      profileImage: ''
    });
    
    const savedUser = await testUser.save();
    console.log(`Test user created with ID: ${savedUser._id}`);
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({ message: 'Error creating test user', error: error.message });
  }
});

module.exports = router; 