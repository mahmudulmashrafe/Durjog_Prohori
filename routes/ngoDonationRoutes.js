const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URL
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'durjog-prohori';

// Get all NGO donations
router.get('/', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoDonationCollection = db.collection('ngoDonation');

    // Get all NGO donations sorted by date (newest first)
    const ngoDonations = await ngoDonationCollection.find({}).sort({ date: -1 }).toArray();

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

// Get a specific NGO donation by ID
router.get('/donation/:id', async (req, res) => {
  try {
    const donationId = req.params.id;
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoDonationCollection = db.collection('ngoDonation');

    // Get donation by ID
    let donation;
    try {
      donation = await ngoDonationCollection.findOne({ _id: new ObjectId(donationId) });
    } catch (err) {
      // If ID is not a valid ObjectId, try as a string
      donation = await ngoDonationCollection.findOne({ _id: donationId });
    }

    await client.close();

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'NGO donation not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'NGO donation retrieved successfully',
      donation
    });
  } catch (error) {
    console.error('Error fetching NGO donation:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching NGO donation'
    });
  }
});

// Create a new NGO donation
router.post('/', async (req, res) => {
  try {
    const donationData = req.body;
    
    // Validate required fields
    if (!donationData.ngoId || !donationData.ngoName || !donationData.amount || isNaN(Number(donationData.amount))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation data. Required fields: ngoId, ngoName, amount'
      });
    }

    // Ensure amount is a number
    donationData.amount = Number(donationData.amount);
    
    // Set default values if not provided
    donationData.date = donationData.date || new Date().toISOString();
    donationData.withdrawAmount = donationData.withdrawAmount || 0;
    donationData.status = 'completed';
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoDonationCollection = db.collection('ngoDonation');

    // Check for duplicate donation within a small time window (e.g., 1 minute)
    const recentDonation = await ngoDonationCollection.findOne({
      ngoId: donationData.ngoId,
      amount: donationData.amount,
      date: {
        $gte: new Date(new Date(donationData.date).getTime() - 60000).toISOString() // 1 minute ago
      }
    });

    if (recentDonation) {
      await client.close();
      return res.status(400).json({
        success: false,
        message: 'Duplicate donation detected. Please wait a moment before trying again.'
      });
    }

    // Insert the donation
    const result = await ngoDonationCollection.insertOne(donationData);

    // Log the donation creation
    console.log('Created NGO donation:', {
      ngoId: donationData.ngoId,
      ngoName: donationData.ngoName,
      amount: donationData.amount,
      date: donationData.date,
      donationId: result.insertedId
    });

    await client.close();

    return res.status(201).json({
      success: true,
      message: 'NGO donation created successfully',
      donationId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating NGO donation:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating NGO donation'
    });
  }
});

// Get donations by NGO ID (using registration number)
router.get('/ngo/:ngoId', async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoDonationCollection = db.collection('ngoDonation');
    const ngoCollection = db.collection('ngo');

    console.log('Fetching donations for NGO ID:', ngoId);

    // Get NGO data to get totalwithdraw
    const ngo = await ngoCollection.findOne({ 
      $or: [
        { registrationNumber: ngoId },
        { registrationNumber: ngoId.toUpperCase() },
        { registrationNumber: ngoId.toLowerCase() }
      ]
    });

    if (!ngo) {
      await client.close();
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    // Get donations for a specific NGO using registration number
    const donations = await ngoDonationCollection.find({ 
      $or: [
        { ngoId: ngoId },
        { ngoId: ngoId.toUpperCase() },
        { ngoId: ngoId.toLowerCase() }
      ]
    }).sort({ date: -1 }).toArray();

    console.log('Found donations:', donations.length);

    // Calculate total donations received
    const totalDonations = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);

    // Use totalwithdraw from NGO collection
    const totalWithdrawn = ngo.totalwithdraw || 0;

    const totals = {
      totalreceivedonation: totalDonations,
      totalremaining: totalDonations - totalWithdrawn,
      totalwithdraw: totalWithdrawn
    };

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'NGO donations retrieved successfully',
      donations,
      totals
    });
  } catch (error) {
    console.error('Error fetching NGO donations by NGO ID:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching NGO donations'
    });
  }
});

// Get NGO donation history from donationreceived array
router.get('/history/:ngoId', async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoCollection = db.collection('ngo');

    // Get NGO by ID and project only the donationreceived array
    const ngo = await ngoCollection.findOne(
      { _id: new ObjectId(ngoId) },
      { projection: { donationreceived: 1 } }
    );

    await client.close();

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    return res.status(200).json({
      success: true,
      donationreceived: ngo.donationreceived || []
    });
  } catch (error) {
    console.error('Error fetching NGO donation history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching donation history'
    });
  }
});

// Get donation history for a specific NGO
router.get('/:ngoId', async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoDonationCollection = db.collection('ngoDonation');

    // Get donations for the NGO
    const donations = await ngoDonationCollection.find({ 
      ngoId: new ObjectId(ngoId)  // Convert string ID to ObjectId
    }).sort({ date: -1 }).toArray();

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Donations retrieved successfully',
      donations
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching donations'
    });
  }
});

// Get withdrawal history for an NGO
router.get('/withdrawals/:ngoId', async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const withdrawalCollection = db.collection('ngowithdrawhistory');

    // Get withdrawal history for the NGO
    const withdrawals = await withdrawalCollection.find({ ngoId: ngoId }).sort({ date: -1 }).toArray();

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Withdrawal history retrieved successfully',
      withdrawals
    });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching withdrawal history'
    });
  }
});

// Create a new withdrawal request
router.post('/withdraw', async (req, res) => {
  try {
    const { ngoId, amount, description } = req.body;
    
    // Validate required fields
    if (!ngoId || !amount || isNaN(Number(amount)) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal data. Required fields: ngoId, amount (positive number)'
      });
    }

    const withdrawalAmount = Number(amount);
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngoCollection = db.collection('ngo');
    const ngoDonationCollection = db.collection('ngoDonation');
    const withdrawalCollection = db.collection('ngowithdrawhistory');

    // Get NGO data
    const ngo = await ngoCollection.findOne({ registrationNumber: ngoId });
    if (!ngo) {
      await client.close();
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    // Calculate actual balance from donations and withdrawals
    // Get total donations from ngoDonation collection
    const donations = await ngoDonationCollection.find({ 
      $or: [
        { ngoId: ngoId },
        { ngoId: ngoId.toUpperCase() },
        { ngoId: ngoId.toLowerCase() }
      ]
    }).toArray();
    const totalDonations = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);

    // Get total withdrawals from ngowithdrawhistory collection
    const withdrawals = await withdrawalCollection.find({ 
      ngoId: ngoId 
    }).toArray();
    const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);

    const actualRemaining = totalDonations - totalWithdrawals;

    // Check if enough balance is available
    if (actualRemaining < withdrawalAmount) {
      await client.close();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for withdrawal'
      });
    }

    // Create withdrawal record in ngowithdrawhistory collection only
    const withdrawalData = {
      ngoId,
      ngoName: ngo.name,
      amount: withdrawalAmount,
      date: new Date().toISOString(),
      status: 'completed',
      description: description || 'Withdrawal request'
    };

    const withdrawalResult = await withdrawalCollection.insertOne(withdrawalData);

    // Update NGO totals
    await ngoCollection.updateOne(
      { registrationNumber: ngoId },
      {
        $set: {
          totalremaining: actualRemaining - withdrawalAmount,
          totalwithdraw: totalWithdrawals + withdrawalAmount
        }
      }
    );

    await client.close();

    return res.status(201).json({
      success: true,
      message: 'Withdrawal processed successfully',
      withdrawalId: withdrawalResult.insertedId
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing withdrawal'
    });
  }
});

module.exports = router; 