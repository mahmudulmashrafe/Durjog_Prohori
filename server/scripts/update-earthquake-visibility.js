const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/durjog-prohori')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get the Earthquake model
    const Earthquake = require('../models/Earthquake');
    
    // Count earthquakes without isVisible field
    const countWithoutVisibility = await Earthquake.countDocuments({
      isVisible: { $exists: false }
    });
    
    console.log(`Found ${countWithoutVisibility} earthquakes without isVisible field`);
    
    if (countWithoutVisibility > 0) {
      // Update earthquakes to add isVisible field with default value 1 (visible)
      const result = await Earthquake.updateMany(
        { isVisible: { $exists: false } },
        { $set: { isVisible: 1 } }
      );
      
      console.log(`Updated ${result.modifiedCount} earthquakes to add isVisible field`);
    }
    
    // Verify the update
    const sample = await Earthquake.findOne();
    console.log('Sample earthquake after update:', {
      id: sample._id,
      magnitude: sample.magnitude,
      place: sample.place,
      isVisible: sample.isVisible
    });
    
    console.log('All earthquakes have been updated successfully!');
    mongoose.disconnect();
  })
  .catch(error => {
    console.error('Error updating earthquakes:', error);
    mongoose.disconnect();
  }); 