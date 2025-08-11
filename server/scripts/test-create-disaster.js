const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb://localhost:27017/';
const dbName = 'durjog-prohori';

async function testCreateDisaster() {
  let client;
  
  try {
    // Connect to MongoDB
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Test creating a disaster in the flood collection
    const collectionName = 'disasterflood';
    const collection = db.collection(collectionName);
    
    // Create test disaster data with isVisible field
    const testDisaster = {
      name: 'Test Flood with isVisible',
      location: 'Test Location',
      latitude: 23.8103,
      longitude: 90.4125,
      dangerLevel: 5,
      isVisible: 1, // Explicitly set
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the disaster
    const result = await collection.insertOne(testDisaster);
    
    console.log('Disaster created with ID:', result.insertedId);
    
    // Fetch the created disaster to verify isVisible field
    const createdDisaster = await collection.findOne({ _id: result.insertedId });
    
    console.log('Created disaster document:', createdDisaster);
    console.log('isVisible field set properly:', createdDisaster.isVisible === 1);
    
    // Cleanup - delete the test disaster
    await collection.deleteOne({ _id: result.insertedId });
    console.log('Test disaster deleted');
    
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
testCreateDisaster(); 