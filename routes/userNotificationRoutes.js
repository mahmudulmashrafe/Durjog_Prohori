const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const { verifyToken } = require('../middlewares/authMiddleware');

// MongoDB connection URL
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'durjog-prohori';
const COLLECTION_NAME = 'usernotifications';

// Helper function to get MongoDB connection
async function getMongoClient() {
  const client = await MongoClient.connect(MONGO_URI);
  return client;
}

// Get all notifications for a user
router.get('/', verifyToken, async (req, res) => {
  let client;
  try {
    client = await getMongoClient();
    const db = client.db(DB_NAME);
    
    const notifications = await db.collection(COLLECTION_NAME)
      .find({ 
        userId: req.user._id.toString()
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// Get today's notifications for a user
router.get('/today', verifyToken, async (req, res) => {
  let client;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    client = await getMongoClient();
    const db = client.db(DB_NAME);
    
    const notifications = await db.collection(COLLECTION_NAME)
      .find({
        userId: req.user._id.toString(),
        createdAt: { $gte: today }
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching today\'s notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s notifications',
      error: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// Mark a notification as read
router.patch('/:notificationId/read', verifyToken, async (req, res) => {
  let client;
  try {
    const notificationId = new ObjectId(req.params.notificationId);
    
    client = await getMongoClient();
    const db = client.db(DB_NAME);
    
    const result = await db.collection(COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: notificationId,
          userId: req.user._id.toString()
        },
        { $set: { read: true } },
        { returnDocument: 'after' }
      );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: result.value
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', verifyToken, async (req, res) => {
  let client;
  try {
    client = await getMongoClient();
    const db = client.db(DB_NAME);
    
    const result = await db.collection(COLLECTION_NAME)
      .updateMany(
        { 
          userId: req.user._id.toString(),
          read: false
        },
        { $set: { read: true } }
      );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

module.exports = router; 