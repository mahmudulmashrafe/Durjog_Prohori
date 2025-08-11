const mongoose = require('mongoose');
const Firefighter = require('./models/Firefighter');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find the firefighter with username 'fire'
    const firefighter = await Firefighter.findOne({ username: 'fire' });
    
    if (firefighter) {
      console.log('Firefighter found:');
      console.log('ID:', firefighter._id);
      console.log('Username:', firefighter.username);
      console.log('Name:', firefighter.name);
      console.log('Email:', firefighter.email);
      console.log('Phone Number:', firefighter.phoneNumber);
      console.log('Role:', firefighter.role);
      console.log('Station:', firefighter.station);
      console.log('Location:', firefighter.location);
      console.log('Latitude:', firefighter.latitude);
      console.log('Longitude:', firefighter.longitude);
      
      // Update firefighter with location info regardless of current values
      console.log('\nUpdating firefighter with location info...');
      
      firefighter.location = 'Dhaka Fire Station';
      firefighter.latitude = 23.810331;
      firefighter.longitude = 90.412521;
      
      await firefighter.save();
      console.log('Firefighter updated with location info');
      
      // Verify the update
      const updatedFirefighter = await Firefighter.findOne({ username: 'fire' });
      console.log('\nUpdated Firefighter:');
      console.log('Location:', updatedFirefighter.location);
      console.log('Latitude:', updatedFirefighter.latitude);
      console.log('Longitude:', updatedFirefighter.longitude);
    } else {
      console.log('Firefighter with username "fire" not found');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
}); 