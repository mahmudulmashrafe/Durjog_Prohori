const express = require('express');
const router = express.Router();
const Support = require('../models/Support');
const mongoose = require('mongoose');

// Create a new support payment entry
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      amount,
      description,
      paymentMethod,
      user_id
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    // Create the support payment entry with user_id
    const newSupport = new Support({
      name,
      phoneNumber: phoneNumber || 'Unknown',
      amount,
      description: description || 'Support payment',
      paymentMethod,
      user_id: user_id || null
    });

    // Save the payment
    const savedSupport = await newSupport.save();
    console.log('Support payment saved with user_id:', savedSupport.user_id);

    // Return success
    return res.status(201).json({
      success: true,
      message: 'Support payment submitted successfully',
      data: savedSupport
    });
  } catch (error) {
    console.error('Error in support payment submission:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your payment',
      error: error.message
    });
  }
});

// Get all support payments
router.get('/', async (req, res) => {
  try {
    const supports = await Support.find().sort({ createdAt: -1 });
    
    // Calculate distributed amount from ngoDonation collection
    const db = mongoose.connection.db;
    const ngoDonationsCollection = db.collection('ngoDonation');
    const distributedResult = await ngoDonationsCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const distributedAmount = distributedResult.length > 0 ? distributedResult[0].total : 0;

    return res.status(200).json({
      success: true,
      supports,
      distributedAmount
    });
  } catch (error) {
    console.error('Error fetching support payments:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching payments',
      error: error.message
    });
  }
});

// Add endpoint to get support payments by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Support.find({ user_id: userId }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching user support payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user support payments',
      error: error.message
    });
  }
});

module.exports = router; 