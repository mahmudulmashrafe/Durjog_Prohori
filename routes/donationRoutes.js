const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const { verifyToken } = require('../middlewares/authMiddleware');

// MongoDB connection URL
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'durjog-prohori';
const donationCollectionName = 'donations';

// Create a new donation
router.post('/', async (req, res) => {
  try {
    const {
      amount,
      name,
      phone_number,
      payment_method,
      donation_type,
      userId
    } = req.body;

    // Validate required fields
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid donation amount is required'
      });
    }

    // Validate name is provided
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Donor name is required'
      });
    }

    // Connect to MongoDB
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const donationsCollection = db.collection(donationCollectionName);

    // Create donation object
    const donation = {
      amount: Number(amount),
      name,
      phone_number: phone_number || '',
      payment_method: payment_method || 'card',
      donation_type: donation_type || 'money',
      user_id: userId || null,
      status: 'completed',
      timestamp: new Date()
    };

    // Insert donation into MongoDB
    const result = await donationsCollection.insertOne(donation);

    await client.close();

    return res.status(201).json({
      success: true,
      message: 'Donation successful',
      data: {
        _id: result.insertedId,
        ...donation
      }
    });
  } catch (error) {
    console.error('Error processing donation:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your donation'
    });
  }
});

// Get recent donations
router.get('/recent', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const donationsCollection = db.collection(donationCollectionName);

    // Get the most recent 10 donations
    const donations = await donationsCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Recent donations retrieved successfully',
      donations
    });
  } catch (error) {
    console.error('Error fetching recent donations:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching recent donations'
    });
  }
});

// Get total donation amount
router.get('/total', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const donationsCollection = db.collection(donationCollectionName);

    // Aggregate total donation amount
    const result = await donationsCollection.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();

    const totalAmount = result.length > 0 ? result[0].total : 0;

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Total donation amount retrieved successfully',
      totalAmount
    });
  } catch (error) {
    console.error('Error fetching total donation amount:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching total donation amount'
    });
  }
});

// Get all donations (protected admin route)
router.get('/all', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const donationsCollection = db.collection(donationCollectionName);

    // Get paginated donations
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const donations = await donationsCollection
      .find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalDonations = await donationsCollection.countDocuments();

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Donations retrieved successfully',
      donations,
      pagination: {
        total: totalDonations,
        page,
        limit,
        pages: Math.ceil(totalDonations / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching donations'
    });
  }
});

// Get all donations for authority users
router.get('/', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const donationsCollection = db.collection(donationCollectionName);

    // Get all donations
    const donations = await donationsCollection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    // Calculate distributed amount
    const ngoDonationsCollection = db.collection('ngoDonation');
    const distributedResult = await ngoDonationsCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const distributedAmount = distributedResult.length > 0 ? distributedResult[0].total : 0;

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Donations retrieved successfully',
      donations,
      distributedAmount
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching donations'
    });
  }
});

// Get all NGOs
router.get('/ngos', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngosCollection = db.collection('ngo');  // Using 'ngo' collection instead of 'ngos'

    // Get all NGOs
    const ngos = await ngosCollection
      .find({})
      .toArray();

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'NGOs retrieved successfully',
      ngos
    });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching NGOs'
    });
  }
});

// Get all NGO donations
router.get('/ngo-donations', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoDonationsCollection = db.collection('ngoDonation');

    // Get all NGO donations
    const ngoDonations = await ngoDonationsCollection
      .find({})
      .sort({ date: -1 })
      .toArray();

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'NGO donations retrieved successfully',
      ngoDonations
    });
  } catch (error) {
    console.error('Error fetching NGO donations:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching NGO donations'
    });
  }
});

// Distribute donation to NGO
router.post('/distribute-donation', async (req, res) => {
  try {
    const {
      ngoId,
      ngoName,
      amount,
      email,
      location
    } = req.body;

    // Validate required fields
    if (!ngoId || !ngoName || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid distribution data'
      });
    }

    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    
    // Check available balance
    const donationsCollection = db.collection(donationCollectionName);
    const totalResult = await donationsCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const totalDonations = totalResult.length > 0 ? totalResult[0].total : 0;
    
    const ngoDonationsCollection = db.collection('ngoDonation');
    const distributedResult = await ngoDonationsCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const totalDistributed = distributedResult.length > 0 ? distributedResult[0].total : 0;
    
    const availableBalance = totalDonations - totalDistributed;
    
    if (Number(amount) > availableBalance) {
      await client.close();
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds for distribution'
      });
    }

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Balance check successful'
    });
  } catch (error) {
    console.error('Error distributing donation:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while distributing donation'
    });
  }
});

module.exports = router; 