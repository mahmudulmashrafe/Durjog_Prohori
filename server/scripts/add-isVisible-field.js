const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb://localhost:27017/';
const dbName = 'durjog-prohori';

// Collections to update
const collections = [
  'disasterflood',
  'disastercyclone',
  'disasterlandslide',
  'disastertsunami',
  'disasterfire',
  'disasterother'
];

async function addIsVisibleField() {
  let client;
  
  try {
    // Connect to MongoDB
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Update each collection
    for (const collectionName of collections) {
      console.log(`\nProcessing collection: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      
      // Count documents
      const totalCount = await collection.countDocuments();
      console.log(`Total documents: ${totalCount}`);
      
      if (totalCount > 0) {
        // Sample document before update
        const sampleBefore = await collection.findOne();
        console.log('Sample document before update:', sampleBefore);
        
        // 1. Update documents without isVisible field
        const updateResult1 = await collection.updateMany(
          { isVisible: { $exists: false } },
          { $set: { isVisible: 1 } }
        );
        
        console.log(`Added isVisible field to ${updateResult1.modifiedCount} documents`);
        
        // 2. Convert boolean isVisible to number
        const updateResult2 = await collection.updateMany(
          { isVisible: true },
          { $set: { isVisible: 1 } }
        );
        
        const updateResult3 = await collection.updateMany(
          { isVisible: false },
          { $set: { isVisible: 0 } }
        );
        
        console.log(`Converted ${updateResult2.modifiedCount + updateResult3.modifiedCount} boolean isVisible values to numbers`);
        
        // Sample document after update
        if (sampleBefore) {
          const sampleAfter = await collection.findOne({ _id: sampleBefore._id });
          console.log('Sample document after update:', sampleAfter);
        }
      }
    }
    
    console.log('\nAll collections updated successfully!');
  } catch (error) {
    console.error('Error updating collections:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the update function
addIsVisibleField(); 