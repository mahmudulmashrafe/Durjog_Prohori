const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Donation = require('../models/Donation');

// Debug route to verify the router is mounted correctly
router.get('/test', (req, res) => {
  console.log('Donation routes test endpoint reached');
  res.status(200).json({
    success: true,
    message: 'Donation routes are working correctly',
    collection: 'donations'
  });
});

// Create a new donation
router.post('/create', async (req, res) => {
  try {
    const {
      user_id,
      name,
      phone_number,
      amount,
      payment_method,
      transaction_id
    } = req.body;

    // Validate required fields
    if (!user_id || !name || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, name, and payment_method are required'
      });
    }

    // Validate user_id format
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate amount
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be a positive number'
      });
    }

    // Validate payment method
    const validPaymentMethods = ['card', 'bkash', 'nagad'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be one of: ' + validPaymentMethods.join(', ')
      });
    }

    // Prepare donation data
    const donationData = {
      user_id,
      name,
      phone_number,
      amount: donationAmount,
      payment_method,
      transaction_id,
      donation_type: 'money',
      status: 'completed',
      timestamp: new Date()
    };

    // Create and save the donation
    const donation = new Donation(donationData);
    const savedDonation = await donation.save();
    
    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      donation: savedDonation
    });
    
  } catch (error) {
    console.error('Error creating donation:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate transaction ID',
        field: Object.keys(error.keyPattern)[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to record donation',
      error: error.message
    });
  }
});

// Get all donations
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find({})
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      donations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message
    });
  }
});

// Get donations by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const donations = await Donation.find({ user_id: userId })
      .sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      donations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user donations',
      error: error.message
    });
  }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation ID format'
      });
    }

    const donation = await Donation.findById(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      donation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation',
      error: error.message
    });
  }
});

module.exports = router; 