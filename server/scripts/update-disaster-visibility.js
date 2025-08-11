const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // List all collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\nAvailable collections:');
  collections.forEach(collection => {
    console.log(collection.name);
  });
  
  // Try to find the actual collection names first
  const collectionNames = collections.map(c => c.name);
  console.log('\nSearching for disaster collections...');
  
  const disasterCollections = collectionNames.filter(name => 
    name.startsWith('disaster') || name === 'disasters'
  );
  
  console.log('Found disaster collections:', disasterCollections);
  
  // Update each disaster collection
  for (const collectionName of disasterCollections) {
    console.log(`\nUpdating collection: ${collectionName}`);
    
    const collection = mongoose.connection.db.collection(collectionName);
    
    // Count documents
    const count = await collection.countDocuments();
    console.log(`Found ${count} documents in ${collectionName}`);
    
    if (count > 0) {
      // Get a sample document
      const sample = await collection.findOne();
      console.log('Sample document before update:', JSON.stringify(sample, null, 2));
      
      // Update all documents to add isVisible field with value 1 (instead of true)
      const result = await collection.updateMany(
        { isVisible: { $exists: false } },
        { $set: { isVisible: 1 } }
      );
      
      console.log(`Updated ${result.modifiedCount} documents in ${collectionName}`);
      
      if (result.modifiedCount > 0) {
        // Get the sample document again to confirm update
        const updatedSample = await collection.findOne({ _id: sample._id });
        console.log('Sample document after update:', JSON.stringify(updatedSample, null, 2));
      }
    }
  }
  
  console.log('\nAll disaster collections have been checked and updated!');
  mongoose.disconnect();
}).catch(error => {
  console.error('Error connecting to MongoDB:', error);
  mongoose.disconnect();
}); 