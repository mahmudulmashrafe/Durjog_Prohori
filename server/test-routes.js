const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const sosRoutes = require('./routes/sosRoutes');
const Sos = require('./models/Sos');

// Create express app
const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully to durjog-prohori database');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Add request body debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({ success: true, message: 'API test endpoint working' });
});

// Add a direct SOS creation route for testing
app.post('/api/direct-sos', async (req, res) => {
  try {
    console.log('Received direct SOS request:', req.body);

    // Create a dummy ObjectId if not provided
    if (!req.body.user_id) {
      req.body.user_id = new mongoose.Types.ObjectId();
      console.log('Created dummy user_id:', req.body.user_id);
    }

    // Create the SOS document directly
    const sosData = {
      user_id: req.body.user_id,
      name: req.body.name || 'Test User',
      phone_number: req.body.phone_number || '123-456-7890',
      location: {
        type: 'Point',
        coordinates: req.body.location?.coordinates || [90.4125, 23.8103],
        address: req.body.location?.address || 'Test Address'
      }
    };

    const sos = new Sos(sosData);
    const savedSos = await sos.save();
    
    console.log('SOS saved directly to database:', savedSos);
    
    res.status(201).json({
      success: true,
      message: 'SOS request recorded successfully via direct route',
      sos: savedSos
    });
  } catch (error) {
    console.error('Error in direct SOS route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record SOS request via direct route',
      error: error.message
    });
  }
});

// Mount the normal SOS routes
app.use('/api/sos', sosRoutes);

// List all registered routes
console.log('Registered Routes:');
function printRoutes(stack, basePath = '') {
  for (const layer of stack) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .map(method => method.toUpperCase())
        .join(', ');
      console.log(`${methods} ${basePath}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      const newBase = basePath + (layer.regexp.toString().indexOf('^\\/(?=\\/|$)') !== -1 ? '' : layer.regexp.toString().replace(/[^\/]*$/g, '').replace(/^\^|\/\?\(\?:|\)\$/g, ''));
      printRoutes(layer.handle.stack, newBase);
    }
  }
}
printRoutes(app._router.stack);

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Try the following endpoints:
  - GET http://localhost:${PORT}/api/test
  - POST http://localhost:${PORT}/api/direct-sos
  - POST http://localhost:${PORT}/api/sos/create
  `);
}); 