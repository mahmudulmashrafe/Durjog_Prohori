const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Donation = require('./models/Donation');

// Initialize Express
const app = express();
const PORT = 5004;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB (durjog-prohori database)');
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Donation Service',
    database: { 
      connected: mongoose.connection.readyState === 1,
      name: 'durjog-prohori',
      collection: 'donation'
    }
  });
});

// Create a new donation
app.post('/api/donations/create', async (req, res) => {
  try {
    console.log('Received donation data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const requiredFields = ['user_id', 'name', 'donation_type', 'payment_method'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        console.error(`Validation error: ${field} is required`);
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    // Additional validation for blood donations
    if (req.body.donation_type === 'blood' && 
        (!req.body.blood_type || !req.body.location || !req.body.available_date)) {
      console.error('Validation error: Missing required fields for blood donation');
      return res.status(400).json({
        success: false,
        message: 'Blood type, location, and available date are required for blood donations'
      });
    }
    
    // Create the donation
    const donation = new Donation(req.body);
    const savedDonation = await donation.save();
    
    console.log('Donation saved successfully:', {
      id: savedDonation._id,
      type: savedDonation.donation_type,
      amount: savedDonation.amount,
      payment_method: savedDonation.payment_method,
      name: savedDonation.name
    });
    
    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      donation: savedDonation
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    
    // Check for MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    // Check for MongoDB duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create donation',
      error: error.message
    });
  }
});

// Get all blood donors - specific route with clear path
app.get('/api/donations/blood-donors', async (req, res) => {
  try {
    console.log('Fetching blood donors');
    const bloodDonors = await Donation.find({ 
      donation_type: 'blood',
      available_date: { $gte: new Date() }
    }).sort({ timestamp: -1 });
    
    console.log(`Found ${bloodDonors.length} blood donors`);
    
    res.status(200).json({
      success: true,
      donors: bloodDonors
    });
  } catch (error) {
    console.error('Error fetching blood donors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood donors',
      error: error.message
    });
  }
});

// Get donations by user ID - specific route with clear path
app.get('/api/donations/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching donations for user:', userId);
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const donations = await Donation.find({ user_id: userId })
      .sort({ timestamp: -1 });
    
    console.log(`Found ${donations.length} donations for user ${userId}`);
    
    res.status(200).json({
      success: true,
      donations
    });
  } catch (error) {
    console.error('Error fetching user donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user donations',
      error: error.message
    });
  }
});

// Get a donation by ID - must be below more specific routes
app.get('/api/donations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching donation by ID:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation ID format'
      });
    }
    
    const donation = await Donation.findById(id);
    
    if (!donation) {
      console.log(`Donation with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    console.log(`Found donation with ID ${id}`);
    
    res.status(200).json({
      success: true,
      donation
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation',
      error: error.message
    });
  }
});

// 404 handler for all undefined routes
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Donation server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/donations`);
}); 