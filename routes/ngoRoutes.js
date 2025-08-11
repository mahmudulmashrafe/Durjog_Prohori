const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URL
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'durjog-prohori';

// Get all NGOs
router.get('/', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoCollection = db.collection('ngo');

    // Get all NGOs
    const ngos = await ngoCollection.find({}).toArray();

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

// Get a specific NGO by ID
router.get('/:id', async (req, res) => {
  try {
    const ngoId = req.params.id;
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoCollection = db.collection('ngo');

    // Get NGO by ID
    const ngo = await ngoCollection.findOne({ _id: new ObjectId(ngoId) });

    await client.close();

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'NGO retrieved successfully',
      ngo
    });
  } catch (error) {
    console.error('Error fetching NGO:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching NGO'
    });
  }
});

// Update an NGO
router.put('/:id', async (req, res) => {
  try {
    const ngoId = req.params.id;
    const updateData = req.body;
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoCollection = db.collection('ngo');

    // Update NGO
    const result = await ngoCollection.updateOne(
      { _id: new ObjectId(ngoId) },
      { $set: updateData }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'NGO updated successfully'
    });
  } catch (error) {
    console.error('Error updating NGO:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating NGO'
    });
  }
});

// Special endpoint to update NGO donation information
router.post('/update-donation', async (req, res) => {
  try {
    const { registrationNumber, amount } = req.body;
    
    console.log('Received update request:', {
      registrationNumber,
      amount,
      timestamp: new Date().toISOString()
    });
    
    // Validate required fields
    if (!registrationNumber || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      console.log('Validation failed:', { registrationNumber, amount });
      return res.status(400).json({
        success: false,
        message: 'Invalid donation update data'
      });
    }

    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const ngoCollection = db.collection('ngo');

    // First, let's check if the NGO exists
    const existingNGO = await ngoCollection.findOne({ registrationNumber: registrationNumber });
    console.log('Existing NGO:', existingNGO);

    if (!existingNGO) {
      console.log('NGO not found with registration number:', registrationNumber);
      await client.close();
      return res.status(404).json({
        success: false,
        message: 'NGO not found with the given registration number'
      });
    }

    // Log current totalreceivedonation
    console.log('Current totalreceivedonation:', existingNGO.totalreceivedonation || 0);

    // Update NGO's totalreceivedonation using registrationNumber
    const result = await ngoCollection.findOneAndUpdate(
      { registrationNumber: registrationNumber },
      { 
        $inc: { totalreceivedonation: Number(amount) },
        $set: { lastdonate: new Date().toISOString() }
      },
      { 
        returnDocument: 'after',
        upsert: false // Don't create if doesn't exist
      }
    );

    await client.close();
    console.log('MongoDB connection closed');

    if (!result.value) {
      console.log('Update failed - no document returned');
      return res.status(404).json({
        success: false,
        message: 'Failed to update NGO donation information'
      });
    }

    // Log the update result
    console.log('Update result:', {
      registrationNumber,
      previousTotal: existingNGO.totalreceivedonation || 0,
      addedAmount: Number(amount),
      newTotal: result.value.totalreceivedonation,
      success: true
    });

    return res.status(200).json({
      success: true,
      message: 'NGO donation information updated successfully',
      ngo: result.value,
      debug: {
        previousTotal: existingNGO.totalreceivedonation || 0,
        addedAmount: Number(amount),
        newTotal: result.value.totalreceivedonation
      }
    });
  } catch (error) {
    console.error('Error updating NGO donation:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating NGO donation information',
      error: error.message
    });
  }
});

module.exports = router; 