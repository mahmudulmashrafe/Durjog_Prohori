const mongoose = require('mongoose');

const bloodDonorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blood_type: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  location: {
    type: String,
    required: true
  },
  available_date: {
    type: Date,
    required: true
  },
  is_available: {
    type: Boolean,
    default: true
  },
  phone_number: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
bloodDonorSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

const BloodDonor = mongoose.model('BloodDonor', bloodDonorSchema);

module.exports = BloodDonor; 