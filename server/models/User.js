const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone_number: {
    type: String,
    required: true,
    unique: true
  },
  is_phone_verified: {
    type: Boolean,
    default: false
  },
  phone_verificationCode: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  is_email_verified: {
    type: Boolean,
    default: false
  },
  email_verificationCode: {
    type: String
  },
  blood_type: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null
  },
  profileImage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create virtual for the id
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', {
  virtuals: true
});

const User = mongoose.model('User', userSchema);

module.exports = User; 