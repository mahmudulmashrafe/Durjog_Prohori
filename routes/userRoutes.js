const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URL
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'durjog-prohori';

// Get counts of all entity types
router.get('/counts', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    
    // Count documents in each collection
    const userCount = await db.collection('users').countDocuments();
    const firefighterCount = await db.collection('firefighter').countDocuments();
    const ngoCount = await db.collection('ngo').countDocuments();
    const authorityCount = await db.collection('authority').countDocuments();
    
    await client.close();
    
    return res.status(200).json({
      success: true,
      counts: {
        users: userCount,
        firefighters: firefighterCount,
        ngos: ngoCount,
        authorities: authorityCount
      }
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching counts'
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const users = await db.collection('users').find({}).toArray();
    
    // Log for debugging
    console.log('Fetched users from MongoDB:', users);
    
    await client.close();
    
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users'
    });
  }
});

// Get all firefighters
router.get('/firefighters', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const firefighters = await db.collection('firefighter').find({}).toArray();
    
    await client.close();
    
    return res.status(200).json({
      success: true,
      firefighters
    });
  } catch (error) {
    console.error('Error fetching firefighters:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching firefighters'
    });
  }
});

// Get all NGOs
router.get('/ngos', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const ngos = await db.collection('ngo').find({}).toArray();
    
    await client.close();
    
    return res.status(200).json({
      success: true,
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

// Get all authorities
router.get('/authorities', async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    const authorities = await db.collection('authority').find({}).toArray();
    
    await client.close();
    
    return res.status(200).json({
      success: true,
      authorities
    });
  } catch (error) {
    console.error('Error fetching authorities:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching authorities'
    });
  }
});

// Delete user by ID and type
router.delete('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // Map type to collection name
    let collectionName;
    switch (type) {
      case 'users':
        collectionName = 'users';
        break;
      case 'firefighters':
        collectionName = 'firefighter';
        break;
      case 'ngos':
        collectionName = 'ngo';
        break;
      case 'authorities':
        collectionName = 'authority';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
    }
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    
    // Delete the document
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
    
    await client.close();
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting user'
    });
  }
});

// Update user by ID and type
router.put('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const updateData = req.body;
    
    // Log for debugging
    console.log(`Updating ${type} with ID ${id}:`, updateData);
    
    // Map type to collection name
    let collectionName;
    switch (type) {
      case 'users':
        collectionName = 'users';
        break;
      case 'firefighters':
        collectionName = 'firefighter';
        break;
      case 'ngos':
        collectionName = 'ngo';
        break;
      case 'authorities':
        collectionName = 'authority';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
    }
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    
    // Update the document
    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    await client.close();
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating user'
    });
  }
});

// Add new user
router.post('/users', async (req, res) => {
  try {
    const userData = req.body;
    
    // Log for debugging
    console.log('Creating new user with data:', userData);
    
    // Basic validation
    if (!userData.username || !userData.password || !userData.name || !userData.email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, password, name, and email are required'
      });
    }
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    
    // Check if username or email already exists
    const existingUser = await db.collection('users').findOne({
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    });
    
    if (existingUser) {
      await client.close();
      return res.status(409).json({
        success: false,
        message: existingUser.username === userData.username 
          ? 'Username already exists' 
          : 'Email already registered'
      });
    }
    
    // Set default values if not provided
    const newUser = {
      ...userData,
      status: userData.status || 'active',
      createdAt: new Date().toISOString()
    };
    
    // Insert the new user
    const result = await db.collection('users').insertOne(newUser);
    
    await client.close();
    
    if (result.insertedId) {
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        id: result.insertedId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating user'
    });
  }
});

// Add endpoints for other entity types
router.post('/firefighters', async (req, res) => {
  try {
    const firefighterData = req.body;
    
    // Log for debugging
    console.log('Creating new firefighter with data:', firefighterData);
    
    // Basic validation
    if (!firefighterData.username || !firefighterData.password || !firefighterData.name || 
        !firefighterData.email || !firefighterData.phoneNumber || !firefighterData.station || 
        !firefighterData.badgeNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, password, name, email, phoneNumber, station, and badgeNumber are required'
      });
    }
    
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(dbName);
    
    // Check if username, email, or badge number already exists
    const existingFirefighter = await db.collection('firefighter').findOne({
      $or: [
        { username: firefighterData.username },
        { email: firefighterData.email },
        { badgeNumber: firefighterData.badgeNumber }
      ]
    });
    
    if (existingFirefighter) {
      await client.close();
      let message = 'Record already exists';
      
      if (existingFirefighter.username === firefighterData.username) {
        message = 'Username already exists';
      } else if (existingFirefighter.email === firefighterData.email) {
        message = 'Email already registered';
      } else if (existingFirefighter.badgeNumber === firefighterData.badgeNumber) {
        message = 'Badge number already assigned';
      }
      
      return res.status(409).json({
        success: false,
        message
      });
    }
    
    // Convert years of service to number if provided
    if (firefighterData.yearsOfService) {
      firefighterData.yearsOfService = parseInt(firefighterData.yearsOfService, 10);
    }
    
    // Set default values if not provided
    const newFirefighter = {
      ...firefighterData,
      role: firefighterData.role || 'firefighter',
      status: firefighterData.status || 'active',
      createdAt: new Date().toISOString()
    };
    
    // Insert the new firefighter
    const result = await db.collection('firefighter').insertOne(newFirefighter);
    
    await client.close();
    
    if (result.insertedId) {
      return res.status(201).json({
        success: true,
        message: 'Firefighter created successfully',
        id: result.insertedId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to create firefighter'
      });
    }
  } catch (error) {
    console.error('Error creating firefighter:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating firefighter'
    });
  }
});

router.post('/ngos', async (req, res) => {
  try {
    // Similar implementation as users but for NGOs
    return res.status(501).json({
      success: false,
      message: 'NGO creation not implemented yet'
    });
  } catch (error) {
    console.error('Error creating NGO:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating NGO'
    });
  }
});

router.post('/authorities', async (req, res) => {
  try {
    // Similar implementation as users but for authorities
    return res.status(501).json({
      success: false,
      message: 'Authority creation not implemented yet'
    });
  } catch (error) {
    console.error('Error creating authority:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating authority'
    });
  }
});

module.exports = router; 