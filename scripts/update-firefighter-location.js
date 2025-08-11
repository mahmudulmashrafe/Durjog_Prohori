const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/durjog-prohori', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import the Firefighter model
const Firefighter = require('../models/Firefighter');

// Function to update firefighters without location data
const updateFirefighterLocations = async () => {
  try {
    console.log('Starting update of firefighter location data...');
    
    // Find all firefighters that are missing location data
    const firefightersToUpdate = await Firefighter.find({
      $or: [
        { location: { $exists: false } },
        { location: null },
        { latitude: { $exists: false } },
        { latitude: null },
        { longitude: { $exists: false } },
        { longitude: null }
      ]
    });
    
    console.log(`Found ${firefightersToUpdate.length} firefighters with missing location data`);
    
    // Default location data (Dhaka Fire Service HQ)
    const defaultLocation = 'Fire Department Headquarters';
    const defaultLatitude = 23.777176;
    const defaultLongitude = 90.399452;
    
    // Update each firefighter
    for (const firefighter of firefightersToUpdate) {
      console.log(`Updating firefighter: ${firefighter.username}`);
      
      // Set default location data if missing
      if (!firefighter.location) firefighter.location = defaultLocation;
      if (firefighter.latitude === undefined || firefighter.latitude === null) {
        firefighter.latitude = defaultLatitude;
      }
      if (firefighter.longitude === undefined || firefighter.longitude === null) {
        firefighter.longitude = defaultLongitude;
      }
      
      await firefighter.save();
      console.log(`Updated firefighter: ${firefighter.username}`);
    }
    
    console.log('Firefighter location update completed successfully');
  } catch (error) {
    console.error('Error updating firefighter locations:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the update function
updateFirefighterLocations(); 