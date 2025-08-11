const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const schedule = require('node-schedule');
const axios = require('axios');
const weatherRoutes = require('./routes/weatherRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/auth');
const earthquakeRoutes = require('./routes/earthquakeRoutes');
const donationRoutes = require('../routes/donationRoutes');
const donationRoute2 = require('../routes/donationRoute2');
const alertsRoutes = require('./routes/alertsRoutes');
const bloodDonorRoutes = require('./routes/bloodDonorRoutes');
const sosRoutes = require('./routes/sosRoutes');
const disasterRoutes = require('./routes/disasterRoutes');
const supportRoutes = require('./routes/supportRoutes');
const Earthquake = require('./models/Earthquake');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow any origin in development
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected successfully to durjog-prohori database');
  console.log('Collections will be stored in the durjog-prohori database');
  
  // List all collections in the database
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('Error listing collections:', err);
    } else {
      console.log('Available collections:', collections.map(c => c.name).join(', '));
    }
  });

  // Ensure blood_type field exists in users collection
  try {
    const usersCollection = mongoose.connection.collection('users');
    const result = await usersCollection.updateMany(
      { blood_type: { $exists: false } },
      { $set: { blood_type: null } }
    );
    console.log(`Added blood_type field to ${result.modifiedCount} users`);
  } catch (error) {
    console.error('Error updating users collection:', error);
  }
  
  // Schedule earthquake data fetching after successful DB connection
  setupEarthquakeDataFetching();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  // Don't exit the process, try to continue with limited functionality
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected, attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Simple database connection health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    // Check if we can ping the database
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ 
      status: 'ok',
      message: 'Database connection is healthy',
      database: 'durjog-prohori',
      connected: mongoose.connection.readyState === 1
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection is not healthy',
      error: error.message,
      readyState: mongoose.connection.readyState
    });
  }
});

// Function to fetch and store earthquake data
const fetchEarthquakeData = async () => {
  try {
    // Bangladesh area coordinates (approximate)
    const minLatitude = 20;
    const maxLatitude = 27;
    const minLongitude = 88;
    const maxLongitude = 93;
    const limit = 100;
    
    // Calculate a time range from the last 24 hours
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Build USGS Earthquake API URL
    const apiUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=${minLatitude}&maxlatitude=${maxLatitude}&minlongitude=${minLongitude}&maxlongitude=${maxLongitude}&orderby=time&limit=${limit}&starttime=${startTime}&endtime=${endTime}`;
    
    console.log(`[${new Date().toISOString()}] Scheduled task: Fetching earthquake data...`);
    
    // Fetch data from USGS API
    const response = await axios.get(apiUrl);
    const earthquakes = response.data.features;
    
    if (!earthquakes || earthquakes.length === 0) {
      console.log('No new earthquake data found');
      return;
    }
    
    // Get existing earthquake IDs to avoid duplicates
    const existingEarthquakes = await Earthquake.find({}, 'url');
    const existingUrls = new Set(existingEarthquakes.map(eq => eq.url));
    
    // Filter out earthquakes that are already in the database
    const newEarthquakes = earthquakes.filter(quake => !existingUrls.has(quake.properties.url));
    
    if (newEarthquakes.length === 0) {
      console.log('No new earthquakes to add to the database');
      return;
    }
    
    // Transform data to match our schema
    const earthquakeDocs = newEarthquakes.map(quake => ({
      magnitude: quake.properties.mag,
      place: quake.properties.place,
      time: quake.properties.time,
      latitude: quake.geometry.coordinates[1],
      longitude: quake.geometry.coordinates[0],
      depth: quake.geometry.coordinates[2],
      url: quake.properties.url,
      felt: quake.properties.felt,
      cdi: quake.properties.cdi,
      mmi: quake.properties.mmi,
      alert: quake.properties.alert,
      status: quake.properties.status,
      tsunami: quake.properties.tsunami,
      sig: quake.properties.sig,
      title: quake.properties.title
    }));
    
    // Insert data into MongoDB
    const savedData = await Earthquake.insertMany(earthquakeDocs);
    console.log(`[${new Date().toISOString()}] Added ${savedData.length} new earthquake records to the database`);
    
    // Emit socket event with new earthquake data
    if (savedData.length > 0) {
      io.emit('new_earthquakes', {
        count: savedData.length,
        data: savedData
      });
      console.log(`Socket event 'new_earthquakes' emitted with ${savedData.length} records`);
    }
  } catch (error) {
    console.error('Error in scheduled earthquake data fetching:', error);
  }
};

// Setup scheduled earthquake data fetching
const setupEarthquakeDataFetching = () => {
  // Run immediately on startup
  fetchEarthquakeData();
  
  // Schedule to run every hour
  const job = schedule.scheduleJob('0 * * * *', fetchEarthquakeData);
  console.log('Earthquake data fetching scheduled to run every hour');
  
  // Also schedule a more frequent check for testing purposes (every 5 minutes)
  const testJob = schedule.scheduleJob('*/5 * * * *', fetchEarthquakeData);
  console.log('Additional test schedule: Earthquake data fetching every 5 minutes');
};

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow any origin in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Parse JSON request bodies
app.use(express.json());

// Increase JSON size limit for donation data with potential large fields
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Add request body debugging for donation routes
app.use('/api/donations', (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [Donation Route] ${req.method} ${req.url} called`);
  
  if (req.method === 'POST') {
    console.log(`[${timestamp}] [Donation Route] Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[${timestamp}] [Donation Route] Database connection state:`, mongoose.connection.readyState);
    console.log(`[${timestamp}] [Donation Route] Database name:`, mongoose.connection.db.databaseName);
  }
  
  // Capture the response to log the outcome
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[${timestamp}] [Donation Route] Response status:`, res.statusCode);
    if (res.statusCode >= 400) {
      console.error(`[${timestamp}] [Donation Route] Error response:`, data.toString().substring(0, 200) + '...');
    } else {
      console.log(`[${timestamp}] [Donation Route] Success response length:`, data.toString().length);
    }
    originalSend.call(this, data);
  };
  
  next();
});

// Add request body debugging for SOS routes
app.use('/api/sos', (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [SOS Route] ${req.method} ${req.url} called`);
  
  if (req.method === 'POST') {
    console.log(`[${timestamp}] [SOS Route] Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[${timestamp}] [SOS Route] Database connection state:`, mongoose.connection.readyState);
    console.log(`[${timestamp}] [SOS Route] Database name:`, mongoose.connection.db.databaseName);
  }
  
  // Capture the response to log the outcome
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[${timestamp}] [SOS Route] Response status:`, res.statusCode);
    if (res.statusCode >= 400) {
      console.error(`[${timestamp}] [SOS Route] Error response:`, data.toString().substring(0, 200) + '...');
    } else {
      console.log(`[${timestamp}] [SOS Route] Success response length:`, data.toString().length);
    }
    originalSend.call(this, data);
  };
  
  next();
});

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// API Routes with debugging
console.log('Registering API routes:');
console.log('- /api/weather');
app.use('/api/weather', weatherRoutes);

console.log('- /api/user');
app.use('/api/user', userRoutes);

console.log('- /api/auth');
app.use('/api/auth', authRoutes);

console.log('- /api/chat');
app.use('/api/chat', chatRoutes);

console.log('- /api/earthquakes');
app.use('/api/earthquakes', earthquakeRoutes);

console.log('- /api/donations');
app.use('/api/donations', donationRoutes);

console.log('- /api/donations2');
app.use('/api/donations2', donationRoute2);

console.log('- /api/sos');
app.use('/api/sos', sosRoutes);

console.log('- /api/blood-donors');
app.use('/api/blood-donors', bloodDonorRoutes);

console.log('- /api/alerts');
app.use('/api/alerts', alertsRoutes);

console.log('- /api/disasters');
app.use('/api/disasters', disasterRoutes);

console.log('- /api/support');
app.use('/api/support', supportRoutes);

// Route tester for all main routes
app.get('/api/routes-test', (req, res) => {
  const routes = [
    { path: '/api/weather', name: 'Weather' },
    { path: '/api/user', name: 'User' },
    { path: '/api/auth', name: 'Auth' },
    { path: '/api/chat', name: 'Chat' },
    { path: '/api/earthquakes', name: 'Earthquakes' },
    { path: '/api/donations', name: 'Donations' },
    { path: '/api/alerts', name: 'Alerts' }
  ];
  
  res.status(200).json({
    status: 'ok',
    message: 'Available routes',
    routes
  });
});

// Default error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Handle 404s for undefined routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  
  // Join user to their personal room for direct messages
  socket.on('join', (data) => {
    if (data && data.userId) {
      socket.join(data.userId);
      console.log(`User ${data.userId} joined their room`);
    }
  });
  
  // Handle sending messages
  socket.on('send_message', (messageData) => {
    console.log('Message received for delivery:', messageData);
    
    if (!messageData) {
      console.error('Invalid message data received');
      return;
    }
    
    // Ensure messageData has the expected format
    if (!messageData.sender_id || !messageData.receiver_id || !messageData.message) {
      console.error('Message data missing required fields:', messageData);
      return;
    }
    
    // Send to recipient's user room
    console.log(`Sending message to user ${messageData.receiver_id}`);
    socket.to(messageData.receiver_id).emit('receive_message', messageData);
    
    // Log successful delivery attempt
    console.log(`Message delivery attempt completed to ${messageData.receiver_id}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const PORT = 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 