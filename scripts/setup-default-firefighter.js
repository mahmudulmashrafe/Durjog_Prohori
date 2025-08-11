const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Firefighter = require('../models/Firefighter');

// Load environment variables
dotenv.config();

// Connect to MongoDB - connect to 'durjog-prohori' database
console.log('Connecting to MongoDB database: durjog-prohori');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName;
  console.log(`MongoDB Connected to database: ${dbName}`);
  
  try {
    await setupDefaultFirefighter();
  } catch (err) {
    console.error('Setup failed:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
})
.catch(err => {
  console.log('MongoDB Connection Error:', err);
  process.exit(1);
});

async function setupDefaultFirefighter() {
  console.log('\n===== SETTING UP DEFAULT FIREFIGHTER =====\n');
  
  // Check if default firefighter exists
  const existingFirefighter = await Firefighter.findOne({ username: 'fire' });
  
  if (existingFirefighter) {
    console.log('Default firefighter already exists:');
    console.log('- Username:', existingFirefighter.username);
    console.log('- Name:', existingFirefighter.name);
    console.log('- Role:', existingFirefighter.role);
    console.log('- Station:', existingFirefighter.station);
    console.log('\nSkipping creation of default firefighter.');
    return;
  }
  
  // Create default firefighter
  console.log('Creating default firefighter...');
  
  const defaultFirefighter = new Firefighter({
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
  
  await defaultFirefighter.save();
  
  console.log('\nDefault firefighter created successfully:');
  console.log('- Username:', defaultFirefighter.username);
  console.log('- Password: fire');
  console.log('- Role:', defaultFirefighter.role);
  console.log('- Station:', defaultFirefighter.station);
  console.log('\nYou can now log in with these credentials at the firefighter portal.');
  
  console.log('\n===== DEFAULT FIREFIGHTER SETUP COMPLETED =====');
} 