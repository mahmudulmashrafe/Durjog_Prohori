const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URL - using the specified path
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'durjog-prohori';
const collectionName = 'donationmoney';

// Create a new donation - alternative endpoint
router.post('/', async (req, res) => {
  try {
    console.log('donationRoute2: Received donation request', req.body);
    
    const {
      amount,
      name,
      email,
      phone,
      purpose,
      isAnonymous,
      userId
    } = req.body;

    // Input validation
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      console.log('donationRoute2: Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Valid donation amount is required'
      });
    }

    // Connect to MongoDB
    console.log('donationRoute2: Connecting to MongoDB...');
    const client = new MongoClient(mongoUrl, { 
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await client.connect();
    console.log('donationRoute2: Connected to MongoDB');
    
    const db = client.db(dbName);
    const donationsCollection = db.collection(collectionName);

    // Create donation object
    const donation = {
      amount: Number(amount),
      name: isAnonymous ? 'Anonymous' : (name || 'Unknown'),
      email: isAnonymous ? '' : (email || ''),
      phone: isAnonymous ? '' : (phone || ''),
      purpose: purpose || 'general',
      isAnonymous: Boolean(isAnonymous),
      userId: userId || null,
      status: 'completed',
      timestamp: new Date(),
      createdAt: new Date(),
      source: 'donationRoute2' // Mark this as coming from the alternate route
    };

    console.log('donationRoute2: Inserting donation:', donation);
    // Insert donation into MongoDB
    const result = await donationsCollection.insertOne(donation);
    console.log('donationRoute2: Insertion result:', result);

    await client.close();
    console.log('donationRoute2: MongoDB connection closed');

    return res.status(201).json({
      success: true,
      message: 'Donation successful via alternate route',
      data: {
        _id: result.insertedId,
        ...donation
      }
    });
  } catch (error) {
    console.error('donationRoute2: Error processing donation:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your donation via alternate route',
      error: error.message
    });
  }
});

// Get recent donations
router.get('/recent', async (req, res) => {
  try {
    console.log('donationRoute2: Fetching recent donations');
    const client = new MongoClient(mongoUrl, { useUnifiedTopology: true });
    await client.connect();
    
    const db = client.db(dbName);
    const donationsCollection = db.collection(collectionName);

    // Get the most recent 10 donations
    const donations = await donationsCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Recent donations retrieved successfully from alternate route',
      donations
    });
  } catch (error) {
    console.error('donationRoute2: Error fetching recent donations:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching recent donations from alternate route',
      error: error.message
    });
  }
});

// Add a test endpoint to verify MongoDB connection
router.get('/test-connection', async (req, res) => {
  try {
    console.log('donationRoute2: Testing MongoDB connection...');
    const client = new MongoClient(mongoUrl, { 
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    await client.connect();
    console.log('donationRoute2: Connection successful');
    
    // Test database access
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check if our collection exists and create it if not
    if (!collectionNames.includes(collectionName)) {
      console.log(`donationRoute2: Collection ${collectionName} not found, creating it`);
      await db.createCollection(collectionName);
      console.log(`donationRoute2: Collection ${collectionName} created`);
    }
    
    await client.close();
    
    return res.status(200).json({
      success: true,
      message: 'MongoDB connection test successful',
      database: dbName,
      collections: collectionNames,
      target_collection: collectionName
    });
  } catch (error) {
    console.error('donationRoute2: MongoDB connection test failed:', error);
    return res.status(500).json({
      success: false,
      message: 'MongoDB connection test failed',
      error: error.message
    });
  }
});

module.exports = router; 