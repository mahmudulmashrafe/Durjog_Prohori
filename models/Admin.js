const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
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
    default: 'Admin'
  },
  email: {
    type: String,
    default: 'admin@durjogprohori.com'
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin', 'moderator', 'data-analyst'],
    default: 'admin'
  },
  phoneNumber: {
    type: String,
    default: null
  },
  department: {
    type: String,
    default: 'Administration'
  },
  designation: {
    type: String,
    default: 'System Administrator'
  },
  permissions: {
    canManageUsers: {
      type: Boolean,
      default: true
    },
    canManageDisasters: {
      type: Boolean,
      default: true
    },
    canManageAlerts: {
      type: Boolean,
      default: true
    },
    canViewReports: {
      type: Boolean,
      default: true
    },
    canEditReports: {
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
      default: false
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
  collection: 'admins'
});

// Hash the password before saving
AdminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create a helper function to handle the email index that might cause issues
const handleIndexes = async () => {
  try {
    // Access the model and its collection
    const AdminModel = mongoose.model('Admin');
    const collection = AdminModel.collection;
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Admin collection indexes:', indexes.map(idx => idx.name).join(', '));
    
    // Look for problematic email index
    const emailIndex = indexes.find(idx => 
      idx.key && idx.key.email && idx.unique
    );
    
    if (emailIndex) {
      console.log('Found potentially problematic unique email index:', emailIndex.name);
      // Uncomment the following line if you want to automatically drop this index
      // await collection.dropIndex(emailIndex.name);
      // console.log('Dropped unique email index to prevent duplicate key errors');
    }
  } catch (err) {
    console.error('Error handling indexes:', err);
  }
};

// Create the model
const Admin = mongoose.model('Admin', AdminSchema);

// When the connection is open, handle the indexes
mongoose.connection.once('open', () => {
  handleIndexes().catch(err => {
    console.error('Error in handleIndexes:', err);
  });
});

console.log('Admin model initialized with collection: admins');

module.exports = Admin; 