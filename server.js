const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const setupDefaultAdmin = require('./server/setupAdmin');
const { MongoClient } = require('mongodb');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001'],
  credentials: true
}));

// Define an additional connection for sitereport database
let sitereportDb;
const connectToSitereportDB = async () => {
  try {
    // Connect to the sitereport database
    const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
    await client.connect();
    
    // Set the durjog-prohori database (where sitereport collection is)
    sitereportDb = client.db('durjog-prohori');
    console.log('Connected to durjog-prohori database for site reports');
  } catch (err) {
    console.error('Error connecting to durjog-prohori database:', err);
  }
};

// Connect to the sitereport database
connectToSitereportDB();

// Server diagnostic route
app.get('/api/server-status', (req, res) => {
  res.json({
    status: 'ok',
    server: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    databaseName: mongoose.connection.name || mongoose.connection.db?.databaseName,
    sitereportDb: sitereportDb ? 'connected' : 'disconnected'
  });
});

// Create a direct route to access sitereport data without auth
app.get('/api/site-reports/direct', async (req, res) => {
  try {
    if (!sitereportDb) {
      return res.status(500).json({ 
        success: false, 
        message: 'Sitereport database connection not available' 
      });
    }
    
    // Get site reports directly from MongoDB
    const reports = await sitereportDb.collection('sitereport').find({}).sort({ createdAt: -1 }).toArray();
    
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching direct site reports:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Serve static files from the public directory
app.use('/static', express.static(path.join(__dirname, 'public/static')));

// Connect to MongoDB - explicitly set to durjog-prohori database
console.log('Connecting to MongoDB database: durjog-prohori');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName;
  console.log(`MongoDB Connected to database: ${dbName}`);
  
  // Setup default admin after MongoDB connection is established
  setupDefaultAdmin();
  
  // Setup default firefighter
  setupDefaultFirefighter();
  
  // Setup default NGO
  setupDefaultNGO();

  // Setup default Authority
  setupDefaultAuthority();
  
  // Removed default Disaster Responder setup
})
.catch(err => console.log('MongoDB Connection Error:', err));

// Setup default firefighter function
async function setupDefaultFirefighter() {
  try {
    const Firefighter = require('./models/Firefighter');
    
    // Check if default firefighter exists
    const existingFirefighter = await Firefighter.findOne({ username: 'fire' });
    
    if (existingFirefighter) {
      console.log('Default firefighter already exists');
      return;
    }
    
    // Create default firefighter
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
    console.log('Default firefighter created successfully');
  } catch (err) {
    console.error('Error setting up default firefighter:', err);
  }
}

// Setup default NGO function
async function setupDefaultNGO() {
  try {
    const NGO = require('./models/NGO');
    
    // Check if default NGO exists
    const existingNGO = await NGO.findOne({ username: 'ngo' });
    
    if (existingNGO) {
      console.log('Default NGO already exists');
      return;
    }
    
    // Create default NGO
    const defaultNGO = new NGO({
      username: 'ngo',
      password: 'ngo', // Will be hashed by the pre-save hook
      name: 'Default NGO',
      role: 'admin',
      email: 'ngo@durjogprohori.com',
      phoneNumber: '+8801700000002',
      organization: 'Relief Organization',
      registrationNumber: 'NGO-001',
      yearsActive: 5,
      specializedAreas: ['Disaster Relief', 'Medical Aid'],
      resources: ['Food', 'Medicine', 'Shelter'],
      permissions: {
        canManageResources: true,
        canCreateReports: true,
        canViewAllReports: true,
        canManageTeam: true
      },
      status: 'active'
    });
    
    await defaultNGO.save();
    console.log('Default NGO created successfully');
  } catch (err) {
    console.error('Error setting up default NGO:', err);
  }
}

// Setup default Authority function
async function setupDefaultAuthority() {
  try {
    const Authority = require('./models/Authority');
    
    // Check if default authority exists
    const existingAuthority = await Authority.findOne({ username: 'authority' });
    
    if (existingAuthority) {
      console.log('Default authority already exists');
      return;
    }
    
    // Create default authority
    const defaultAuthority = new Authority({
      username: 'authority',
      password: 'authority', // Will be hashed by the pre-save hook
      name: 'Default Authority',
      role: 'admin',
      email: 'authority@durjogprohori.com',
      phoneNumber: '+8801700000003',
      department: 'Disaster Management',
      badgeNumber: 'AUTH-001',
      yearsOfService: 5,
      jurisdiction: ['Dhaka', 'Chittagong', 'Khulna'],
      expertise: ['Flood Management', 'Emergency Response'],
      permissions: {
        canManageEmergencies: true,
        canCreateReports: true,
        canViewAllReports: true,
        canManageTeam: true
      },
      status: 'active'
    });
    
    await defaultAuthority.save();
    console.log('Default authority created successfully');
  } catch (err) {
    console.error('Error setting up default authority:', err);
  }
}

// Disaster Responder functionality has been removed

// Add a mongoose connection error handler
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

// Add a mongoose connection success handler
mongoose.connection.once('open', () => {
  console.log('Mongoose connection opened to database:', mongoose.connection.name);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/firefighter', require('./routes/firefighter'));
app.use('/api/ngo', require('./routes/ngo')); // Use ngo.js for authentication endpoints
app.use('/api/ngo-data', require('./routes/ngoRoutes')); // Use ngoRoutes.js for data operations
app.use('/api/ngo-donations', require('./routes/ngoDonationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/userNotificationRoutes'));
// Removed disasterresponse routes

// Update the authority route registration
const authorityRoutes = require('./routes/authority');
const disasterRoutes = require('./routes/disasters');
const siteReportRoutes = require('./routes/siteReportRoutes');
const sosReportRoutes = require('./routes/sosReportRoutes');
const isubmitRoutes = require('./routes/isubmitRoutes');
const supportRoutes = require('./routes/supportRoutes');
const donationRoutes = require('./routes/donationRoutes');

app.use('/api/authority', authorityRoutes.router);
app.use('/api/disasters', disasterRoutes);
app.use('/api/site-reports', siteReportRoutes);
app.use('/api/sos-reports', sosReportRoutes);
app.use('/api/isubmit', isubmitRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/donations', donationRoutes);

// Create default admin on server start
app.get('/setup-admin', async (req, res) => {
  try {
    // Use local setup function instead of fetch
    await setupDefaultAdmin();
    res.json({ message: 'Admin setup completed' });
  } catch (err) {
    res.status(500).json({ message: 'Error setting up admin', error: err.message });
  }
});

// Create default firefighter on server start
app.get('/setup-firefighter', async (req, res) => {
  try {
    await setupDefaultFirefighter();
    res.json({ message: 'Firefighter setup completed' });
  } catch (err) {
    res.status(500).json({ message: 'Error setting up firefighter', error: err.message });
  }
});

// Create default NGO on server start
app.get('/setup-ngo', async (req, res) => {
  try {
    await setupDefaultNGO();
    res.json({ message: 'NGO setup completed' });
  } catch (err) {
    res.status(500).json({ message: 'Error setting up NGO', error: err.message });
  }
});

// Create default authority on server start
app.get('/setup-authority', async (req, res) => {
  try {
    await setupDefaultAuthority();
    res.json({ message: 'Authority setup completed' });
  } catch (err) {
    res.status(500).json({ message: 'Error setting up authority', error: err.message });
  }
});

// Add a test route to check admin login
app.post('/test-admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Log database info
    console.log('Current database for test login:', mongoose.connection.name);
    
    // Import Admin model
    const Admin = require('./models/Admin');
    
    // Find admin
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }
    
    // Verify password
    const isPasswordCorrect = await admin.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    return res.json({ 
      success: true, 
      message: 'Login successful',
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Test login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = 5002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test MongoDB direct connection
  const uri = "mongodb://localhost:27017/";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  async function testConnection() {
    try {
      await client.connect();
      console.log("Successfully connected to MongoDB directly");
      const db = client.db("durjog-prohori");
      const collections = await db.listCollections().toArray();
      console.log("Available collections:", collections.map(c => c.name));
      await client.close();
    } catch (err) {
      console.error("Error testing MongoDB connection:", err);
    }
  }
  
  testConnection();
}); 