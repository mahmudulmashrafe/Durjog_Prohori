const mongoose = require('mongoose');
const Sos = require('./models/Sos');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected successfully to durjog-prohori database');
  
  try {
    // Test SOS data
    const testSos = new Sos({
      user_id: new mongoose.Types.ObjectId(), // Create a dummy ObjectId
      name: 'Test User',
      phone_number: '123-456-7890',
      location: {
        type: 'Point',
        coordinates: [90.4125, 23.8103], // Longitude, Latitude (Dhaka)
        address: 'Test Address'
      }
    });
    
    console.log('Attempting to save test SOS data:', testSos);
    
    // Save the test SOS data
    const savedSos = await testSos.save();
    console.log('Test SOS data saved successfully:', savedSos);
    
    // Find all SOS records
    const allSos = await Sos.find({});
    console.log(`Total SOS records in database: ${allSos.length}`);
    console.log('Collection name used:', Sos.collection.name);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error in test script:', error);
    await mongoose.disconnect();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
}); 