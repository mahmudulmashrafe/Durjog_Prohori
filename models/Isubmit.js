const mongoose = require('mongoose');

const IsubmitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make it optional to allow anonymous submissions
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true
  },
  location: {
    type: String,
    required: false,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  disasterType: {
    type: String,
    required: true,
    enum: ['earthquake', 'flood', 'cyclone', 'landslide', 'tsunami', 'fire', 'other', 'SOS'],
    default: 'SOS'
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'processing', 'resolved', 'declined']
  },
  assignedFirefighters: [{
    firefighterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firefighter'
    },
    name: String,
    phoneNumber: String,
    station: String,
    distance: Number,
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  collection: 'isubmit'
});

const Isubmit = mongoose.model('Isubmit', IsubmitSchema);

module.exports = Isubmit; 