const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PersonalChat = require('../models/Chat');

// Helper function to safely convert string to ObjectId
const toObjectId = (idString) => {
  try {
    return mongoose.Types.ObjectId(idString);
  } catch (error) {
    console.error(`Invalid ObjectId: ${idString}`, error);
    return null;
  }
};

// Get all messages between two users
router.get('/getMessages', async (req, res) => {
  console.log('GET /api/chat/getMessages request received', req.query);
  try {
    const { sender_id, receiver_id } = req.query;
    
    if (!sender_id || !receiver_id) {
      return res.status(400).json({ message: 'Both sender_id and receiver_id are required' });
    }
    
    // Convert IDs if they're strings
    const senderId = typeof sender_id === 'string' ? toObjectId(sender_id) : sender_id;
    const receiverId = typeof receiver_id === 'string' ? toObjectId(receiver_id) : receiver_id;
    
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    // Get messages in both directions (user1 to user2 and user2 to user1)
    const messages = await PersonalChat.find({
      $or: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId }
      ]
    }).sort({ timestamp: 1 });
    
    console.log(`Found ${messages.length} messages between users`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a new message
router.post('/sendMessage', async (req, res) => {
  console.log('POST /api/chat/sendMessage request received', req.body);
  try {
    // Extract message data
    const { sender_id, receiver_id, message } = req.body;
    
    if (!sender_id || !receiver_id || !message) {
      return res.status(400).json({ 
        message: 'sender_id, receiver_id, and message are required fields' 
      });
    }
    
    // Convert IDs if they're strings
    const senderId = typeof sender_id === 'string' ? toObjectId(sender_id) : sender_id;
    const receiverId = typeof receiver_id === 'string' ? toObjectId(receiver_id) : receiver_id;
    
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    // Create new message
    const newMessage = new PersonalChat({
      sender_id: senderId,
      receiver_id: receiverId,
      message,
      timestamp: new Date(),
      read: false
    });
    
    // Save to database
    const savedMessage = await newMessage.save();
    console.log(`Message saved with ID: ${savedMessage._id} to personalchats collection`);
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Mark messages as read
router.post('/markAsRead', async (req, res) => {
  console.log('POST /api/chat/markAsRead request received', req.body);
  try {
    const { sender_id, receiver_id } = req.body;
    
    if (!sender_id || !receiver_id) {
      return res.status(400).json({ message: 'Both sender_id and receiver_id are required' });
    }
    
    // Convert IDs if they're strings
    const senderId = typeof sender_id === 'string' ? toObjectId(sender_id) : sender_id;
    const receiverId = typeof receiver_id === 'string' ? toObjectId(receiver_id) : receiver_id;
    
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    // Mark messages from sender to receiver as read
    const result = await PersonalChat.updateMany(
      { sender_id: senderId, receiver_id: receiverId, read: false },
      { read: true }
    );
    
    console.log(`Marked ${result.modifiedCount} messages as read`);
    res.json({ success: true, message: 'Messages marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
});

// Get recent conversations for a user
router.get('/conversations', async (req, res) => {
  console.log('GET /api/chat/conversations request received', req.query);
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }
    
    // Convert ID if it's a string
    const userId = typeof user_id === 'string' ? toObjectId(user_id) : user_id;
    
    if (!userId) {
      return res.status(400).json({ message: 'Invalid user_id format' });
    }
    
    // Find all conversations where the user is a participant
    const sentMessages = await PersonalChat.aggregate([
      {
        $match: { sender_id: userId }
      },
      {
        $group: {
          _id: '$receiver_id',
          lastMessage: { $last: '$message' },
          timestamp: { $last: '$timestamp' }
        }
      }
    ]);
    
    const receivedMessages = await PersonalChat.aggregate([
      {
        $match: { receiver_id: userId }
      },
      {
        $group: {
          _id: '$sender_id',
          lastMessage: { $last: '$message' },
          timestamp: { $last: '$timestamp' },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Merge the conversations from sent and received messages
    const conversationsMap = new Map();
    
    [...sentMessages, ...receivedMessages].forEach(convo => {
      const otherUserId = convo._id.toString();
      
      if (conversationsMap.has(otherUserId)) {
        const existing = conversationsMap.get(otherUserId);
        if (convo.timestamp > existing.timestamp) {
          existing.lastMessage = convo.lastMessage;
          existing.timestamp = convo.timestamp;
        }
        // Add unread count if it exists
        if (convo.unreadCount) {
          existing.unreadCount = (existing.unreadCount || 0) + convo.unreadCount;
        }
      } else {
        conversationsMap.set(otherUserId, {
          user_id: otherUserId,
          lastMessage: convo.lastMessage,
          timestamp: convo.timestamp,
          unreadCount: convo.unreadCount || 0
        });
      }
    });
    
    // Convert map to array and sort by most recent
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`Found ${conversations.length} conversations for user`);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
});

module.exports = router; 