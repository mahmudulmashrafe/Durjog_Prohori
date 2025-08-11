const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const NGOSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'NGO'
  },
  email: {
    type: String,
    default: 'ngo@durjogprohori.com'
  },
  role: {
    type: String,
    enum: ['admin', 'coordinator', 'volunteer', 'member'],
    default: 'admin'
  },
  phoneNumber: {
    type: String,
    default: null
  },
  organization: {
    type: String,
    default: 'Relief Organization'
  },
  registrationNumber: {
    type: String,
    default: null
  },
  yearsActive: {
    type: Number,
    default: 0
  },
  donationreceived: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'completed'
    },
    description: {
      type: String,
      default: ''
    }
  }],
  location: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  specializedAreas: [String],
  resources: {
    type: [String],
    default: []
  },
  permissions: {
    canManageResources: {
      type: Boolean,
      default: true
    },
    canCreateReports: {
      type: Boolean,
      default: true
    },
    canViewAllReports: {
      type: Boolean,
      default: false
    },
    canManageTeam: {
      type: Boolean,
      default: false
    }
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    appNotifications: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
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
  collection: 'ngo'
});

// Hash the password before saving
NGOSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password
NGOSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create a helper function to handle the email index that might cause issues
const handleIndexes = async () => {
  try {
    // Access the model and its collection
    const NGOModel = mongoose.model('NGO');
    const collection = NGOModel.collection;
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('NGO collection indexes:', indexes.map(idx => idx.name).join(', '));
    
    // Look for problematic email index
    const emailIndex = indexes.find(idx => 
      idx.key && idx.key.email && idx.unique
    );
    
    if (emailIndex) {
      console.log('Found potentially problematic unique email index:', emailIndex.name);
    }
  } catch (err) {
    console.error('Error handling indexes:', err);
  }
};

// Create the model
const NGO = mongoose.model('NGO', NGOSchema);

// When the connection is open, handle the indexes
mongoose.connection.once('open', () => {
  handleIndexes().catch(err => {
    console.error('Error in handleIndexes:', err);
  });
});

console.log('NGO model initialized with collection: ngo');

module.exports = NGO; 