const mongoose = require('mongoose');

console.log('Initializing Donation model...');

const donationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: false
  },
  amount: {
    type: Number,
    default: 0
  },
  payment_method: {
    type: String,
    enum: ['card', 'bkash', 'nagad', 'none'],
    required: true
  },
  donation_type: {
    type: String,
    enum: ['money', 'blood'],
    required: true
  },
  transaction_id: {
    type: String,
    required: false
  },
  // Fields specific to blood donation
  blood_type: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() {
      return this.donation_type === 'blood';
    }
  },
  location: {
    type: String,
    required: function() {
      return this.donation_type === 'blood';
    }
  },
  available_date: {
    type: Date,
    required: function() {
      return this.donation_type === 'blood';
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  }
}, { 
  collection: 'donations' // Explicitly set collection name to lowercase 'donations'
});

// Log when the schema is created
console.log('Donation schema created with collection:', donationSchema.options.collection);

// Create the model
const Donation = mongoose.model('Donation', donationSchema);

// Log that the model is being exported
console.log('Exporting Donation model...');

module.exports = Donation; 