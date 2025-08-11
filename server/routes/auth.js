const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        phone_number: user.phone_number,
        is_phone_verified: user.is_phone_verified,
        email: user.email,
        is_email_verified: user.is_email_verified,
        address: user.address,
        blood_type: user.blood_type,
        profileImage: user.profileImage,
        online: user.online,
        lastActive: user.lastActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { name, email, username, address, blood_type } = req.body;
    console.log('Update profile request received:', { name, email, username, address, blood_type });
    
    const user = req.user;
    console.log('Current user blood type:', user.blood_type);
    
    // Check if username already exists (only if username is being updated)
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ 
        username,
        _id: { $ne: req.userId } // exclude current user
      });
      
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      user.username = username;
    }
    
    // Update basic fields if provided
    if (name) user.name = name;
    if (address !== undefined) user.address = address;
    
    // Validate and update blood type
    if (blood_type !== undefined) {
      const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''];
      if (blood_type === '' || validBloodTypes.includes(blood_type)) {
        console.log('Setting blood type to:', blood_type || null);
        user.blood_type = blood_type || null;
      } else {
        return res.status(400).json({ message: 'Invalid blood type value' });
      }
    }
    
    // For email updates, only update if email changed and is verified
    if (email && email !== user.email) {
      // Just update the email but mark as unverified
      user.email = email;
      user.is_email_verified = false; // Require verification for new email
    }
    
    await user.save();
    console.log('User saved successfully. Updated blood type:', user.blood_type);
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        phone_number: user.phone_number,
        is_phone_verified: user.is_phone_verified,
        email: user.email,
        is_email_verified: user.is_email_verified,
        address: user.address,
        blood_type: user.blood_type,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      details: error.message
    });
  }
});

module.exports = router; 