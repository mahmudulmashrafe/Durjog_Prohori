const mongoose = require('mongoose');

const SiteReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  disasterType: {
    type: String,
    required: true,
    enum: ['earthquake', 'flood', 'cyclone', 'landslide', 'tsunami', 'fire', 'other'],
    default: 'earthquake'
  },
  description: {
    type: String,
    trim: true
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
  collection: 'sitereport'
});

const SiteReport = mongoose.model('SiteReport', SiteReportSchema);

module.exports = SiteReport; 