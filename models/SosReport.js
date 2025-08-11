const mongoose = require('mongoose');

const SosReportSchema = new mongoose.Schema({
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
  disasterType: {
    type: String,
    required: true,
    enum: ['earthquake', 'flood', 'cyclone', 'landslide', 'tsunami', 'fire', 'other'],
    default: 'other'
  },
  visible: {
    type: Number,
    default: 1,
    enum: [0, 1]
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active'
  },
  phoneNumber: {
    type: String,
    required: true
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
  collection: 'sreport'  // Store in sreport collection as requested
});

const SosReport = mongoose.model('SosReport', SosReportSchema);

module.exports = SosReport; 