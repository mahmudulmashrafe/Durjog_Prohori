const mongoose = require('mongoose');

const SupportSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional to allow anonymous support
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: 'Unknown'
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    trim: true,
    default: 'Support payment'
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'card'],
    required: true,
    default: 'bkash'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'support' // Store documents in the 'support' collection
});

const Support = mongoose.model('Support', SupportSchema);

module.exports = Support; 