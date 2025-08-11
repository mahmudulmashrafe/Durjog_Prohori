const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
let User;

// Try to import User model from different possible locations
try {
  User = require('../models/User');
} catch (error) {
  try {
    User = require('../server/models/User');
  } catch (innerError) {
    console.log('Warning: User model not found in expected locations. Token verification will proceed without user lookup.');
  }
}

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    
    // Only try to find the user if we have the User model
    if (User) {
      try {
        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        req.user = user;
      } catch (userError) {
        console.error('Error finding user:', userError);
        return res.status(401).json({ message: 'User lookup failed' });
      }
    } else {
      // If no User model, just set basic user info from token
      req.user = {
        _id: decoded.userId,
        role: decoded.role || 'user'
      };
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { verifyToken }; 