const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  try {
    console.log('Connected to MongoDB');
    
    // List of disaster types
    const disasterTypes = ['flood', 'fire', 'landslide', 'tsunami', 'cyclone', 'other'];
    
    for (const type of disasterTypes) {
      console.log(`\nProcessing ${type} disasters...`);
      
      // Get the model
      const DisasterModel = require(`../../models/Disaster${type.charAt(0).toUpperCase() + type.slice(1)}`);
      
      // Find all documents that have assignedFirefighters
      const disasters = await DisasterModel.find({
        assignedFirefighters: { $exists: true, $ne: [] }
      });
      
      console.log(`Found ${disasters.length} ${type} disasters with assigned firefighters`);
      
      // Update each document
      for (const disaster of disasters) {
        // Add equipment array to each assigned firefighter if it doesn't exist
        disaster.assignedFirefighters = disaster.assignedFirefighters.map(ff => ({
          ...ff,
          equipment: ff.equipment || []
        }));
        
        await disaster.save();
      }
      
      console.log(`Updated ${disasters.length} ${type} disasters`);
    }
    
    console.log('\nMigration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 