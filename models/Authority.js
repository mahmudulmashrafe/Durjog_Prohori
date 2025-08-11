const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AuthoritySchema = new mongoose.Schema({
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
    default: 'Authority'
  },
  email: {
    type: String,
    default: 'authority@durjogprohori.com'
  },
  role: {
    type: String,
    enum: ['admin', 'officer', 'supervisor', 'manager'],
    default: 'admin'
  },
  phoneNumber: {
    type: String,
    default: null
  },
  department: {
    type: String,
    default: 'Disaster Management'
  },
  badgeNumber: {
    type: String,
    default: null
  },
  yearsOfService: {
    type: Number,
    default: 0
  },
  jurisdiction: [String],
  expertise: {
    type: [String],
    default: []
  },
  permissions: {
    canManageEmergencies: {
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
    enum: ['active', 'inactive', 'on-leave', 'suspended'],
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
  collection: 'authority'
});

// Hash the password before saving
AuthoritySchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password
AuthoritySchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create a helper function to handle the email index that might cause issues
const handleIndexes = async () => {
  try {
    // Access the model and its collection
    const AuthorityModel = mongoose.model('Authority');
    const collection = AuthorityModel.collection;
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Authority collection indexes:', indexes.map(idx => idx.name).join(', '));
    
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
const Authority = mongoose.model('Authority', AuthoritySchema);

// When the connection is open, handle the indexes
mongoose.connection.once('open', () => {
  handleIndexes().catch(err => {
    console.error('Error in handleIndexes:', err);
  });
});

console.log('Authority model initialized with collection: authority');

module.exports = Authority; 