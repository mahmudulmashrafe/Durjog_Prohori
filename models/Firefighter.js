const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const FirefighterSchema = new mongoose.Schema({
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
    default: 'Firefighter'
  },
  email: {
    type: String,
    default: 'firefighter@durjogprohori.com'
  },
  role: {
    type: String,
    enum: ['firefighter', 'chief', 'captain', 'lieutenant'],
    default: 'firefighter'
  },
  phoneNumber: {
    type: String,
    default: null
  },
  station: {
    type: String,
    default: 'Central Fire Station'
  },
  location: {
    type: String,
    default: 'Fire Department Headquarters'
  },
  latitude: {
    type: Number,
    default: 23.777176
  },
  longitude: {
    type: Number,
    default: 90.399452
  },
  badgeNumber: {
    type: String,
    default: null
  },
  yearsOfService: {
    type: Number,
    default: 0
  },
  specializedTraining: [String],
  equipment: {
    type: [String],
    default: []
  },
  permissions: {
    canRespondToEmergencies: {
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
  collection: 'firefighter'
});

// Hash the password before saving
FirefighterSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password
FirefighterSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create a helper function to handle the email index that might cause issues
const handleIndexes = async () => {
  try {
    // Access the model and its collection
    const FirefighterModel = mongoose.model('Firefighter');
    const collection = FirefighterModel.collection;
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Firefighter collection indexes:', indexes.map(idx => idx.name).join(', '));
    
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
const Firefighter = mongoose.model('Firefighter', FirefighterSchema);

// When the connection is open, handle the indexes
mongoose.connection.once('open', () => {
  handleIndexes().catch(err => {
    console.error('Error in handleIndexes:', err);
  });
});

console.log('Firefighter model initialized with collection: firefighter');

module.exports = Firefighter; 