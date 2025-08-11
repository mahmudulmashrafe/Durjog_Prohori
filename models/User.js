const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  name: {
    type: String,
    default: ''
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  is_phone_verified: {
    type: Boolean,
    default: false
  },
  phone_verificationCode: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: null
  },
  is_email_verified: {
    type: Boolean,
    default: false
  },
  email_verificationCode: {
    type: String,
    default: ''
  },
  blood_type: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
    default: null
  },
  address: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verificationCodeTimestamp: {
    type: Date
  },
  profileImage: {
    type: String,
    default: ''
  },
  online: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Enable automatic timestamps (updatedAt)
  versionKey: '__v', // Set the version key name
  strict: true, // Ensure fields are saved in the order defined
  toObject: { getters: true },
  toJSON: { getters: true }
});

// Create indexes
UserSchema.index({ phone_number: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });

// Handle the email index properly for null values
const Users = mongoose.model('Users', UserSchema);

// This code will run when the application starts
// It will drop the existing email index and create a new one that properly handles null values
const handleEmailIndex = async () => {
  try {
    // Check if the collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
    if (collections.length > 0) {
      // Drop the existing email index if it exists
      await mongoose.connection.db.collection('users').dropIndex('email_1').catch(err => {
        // Ignore error if index doesn't exist
        console.log('No email index to drop or already dropped');
      });
      console.log('Successfully dropped email index');
    }
  } catch (error) {
    console.error('Error handling email index:', error);
  }
};

// Execute when the connection is open
mongoose.connection.once('open', handleEmailIndex);

module.exports = Users; 