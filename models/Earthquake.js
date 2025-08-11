const mongoose = require('mongoose');

const EarthquakeSchema = new mongoose.Schema({
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
  collection: 'earthquake'
});

const Earthquake = mongoose.model('Earthquake', EarthquakeSchema);

module.exports = Earthquake; 