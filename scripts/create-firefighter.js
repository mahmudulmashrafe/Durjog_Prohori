const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('Starting firefighter creation script...');

// Connect to the main durjog-prohori database
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  try {
    console.log('Connected to MongoDB database: durjog-prohori');
    
    // Define the firefighter schema to match the model
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
      name: String,
      email: String,
      role: String,
      phoneNumber: String,
      station: String,
      badgeNumber: String,
      yearsOfService: Number,
      specializedTraining: [String],
      equipment: [String],
      permissions: {
        canRespondToEmergencies: Boolean,
        canCreateReports: Boolean,
        canViewAllReports: Boolean,
        canManageTeam: Boolean
      },
      status: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }, {
      collection: 'firefighter'
    });
    
    // Hash password middleware
    FirefighterSchema.pre('save', async function(next) {
      if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
      }
      next();
    });
    
    // Get or create the model
    const Firefighter = mongoose.models.Firefighter || mongoose.model('Firefighter', FirefighterSchema);
    
    // Check if firefighter exists
    const existingFirefighter = await Firefighter.findOne({ username: 'fire' });
    
    if (existingFirefighter) {
      console.log('Firefighter with username "fire" already exists.');
      console.log('Updating password...');
      
      // Update password
      existingFirefighter.password = 'fire';
      await existingFirefighter.save();
      
      console.log('Password updated for firefighter user.');
    } else {
      console.log('Creating new firefighter user...');
      
      // Create new firefighter
      const firefighter = new Firefighter({
        username: 'fire',
        password: 'fire', // Will be hashed by the pre-save hook
        name: 'Default Firefighter',
        role: 'chief',
        email: 'firefighter@durjogprohori.com',
        phoneNumber: '+8801700000001',
        station: 'Central Fire Station',
        badgeNumber: 'FD-001',
        yearsOfService: 5,
        specializedTraining: ['Hazardous Materials', 'Search and Rescue'],
        equipment: ['Fire Extinguisher', 'Breathing Apparatus'],
        permissions: {
          canRespondToEmergencies: true,
          canCreateReports: true,
          canViewAllReports: true,
          canManageTeam: true
        },
        status: 'active'
      });
      
      await firefighter.save();
      console.log('New firefighter created successfully.');
    }
    
    console.log('Firefighter details:');
    console.log('- Username: fire');
    console.log('- Password: fire');
    console.log('- Database: durjog-prohori');
    console.log('- Collection: firefighter');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
})
.catch(err => {
  console.error('Failed to connect to MongoDB:', err);
}); 