const mongoose = require('mongoose');

// Simple MongoDB Schema for personal chat messages
const personalChatSchema = new mongoose.Schema({
  sender_id: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  },
  receiver_id: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  read: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true,
  collection: 'personalchats' // Explicitly set the collection name
});

// Create the model
const PersonalChat = mongoose.model('PersonalChat', personalChatSchema);

module.exports = PersonalChat; 