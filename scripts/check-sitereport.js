const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection string
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'durjog-prohori'; // Make sure this is correct

async function checkSiteReportCollection() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB server');

    // Select database
    const db = client.db(dbName);
    console.log(`Selected database: ${dbName}`);

    // List collections to verify sitereport exists
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Check if sitereport collection exists
    const siteReportExists = collections.some(collection => collection.name === 'sitereport' || collection.name === 'sitereports');
    
    if (siteReportExists) {
      // Try to access the collection (use both potential names)
      let collectionName = collections.find(c => c.name === 'sitereport' || c.name === 'sitereports').name;
      console.log(`Found collection: ${collectionName}`);
      
      // Count documents
      const count = await db.collection(collectionName).countDocuments();
      console.log(`Number of documents in ${collectionName}: ${count}`);
      
      // Get sample documents
      const documents = await db.collection(collectionName).find().limit(5).toArray();
      console.log('Sample documents:');
      console.log(JSON.stringify(documents, null, 2));
    } else {
      console.log('sitereport collection does not exist in this database!');
      console.log('You may need to create it or check the database name');
    }

  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
checkSiteReportCollection().catch(console.error); 