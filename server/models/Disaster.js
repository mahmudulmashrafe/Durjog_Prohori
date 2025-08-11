const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
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
  type: {
    type: String,
    enum: ['flood', 'cyclone', 'landslide', 'tsunami', 'fire', 'other'],
    required: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
disasterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Disaster = mongoose.model('Disaster', disasterSchema);

module.exports = Disaster; 