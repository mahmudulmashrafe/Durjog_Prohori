const mongoose = require('mongoose');

const DisasterFloodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
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
  dangerLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  visible: {
    type: Number,
    default: 1,
    enum: [0, 1]
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'resolved', 'declined'],
    default: 'pending'
  },
  needsFirefighters: {
    type: Boolean,
    default: false
  },
  needsNGOs: {
    type: Boolean,
    default: false
  },
  assignedFirefighters: [{
    firefighterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firefighter'
    },
    name: String,
    station: String,
    phoneNumber: String,
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedNGOs: [{
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO'
    },
    name: String,
    organization: String,
    phoneNumber: String,
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
  collection: 'disasterflood'
});

const DisasterFlood = mongoose.model('DisasterFlood', DisasterFloodSchema);

module.exports = DisasterFlood; 