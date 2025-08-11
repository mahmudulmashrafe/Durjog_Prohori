const mongoose = require('mongoose');
const sosSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active'
  }
});


// Create a geospatial index on the location field
sosSchema.index({ location: '2dsphere' });

// Use 'userSOS' as the collection name
const Sos = mongoose.model('Sos', sosSchema, 'userSOS');

module.exports = Sos;
