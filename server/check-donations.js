/**
 * Script to check donations saved in the MongoDB database
 */
const mongoose = require('mongoose');
const Donation = require('./models/Donation');

// Define database connection parameters
const DB_HOST = 'localhost';
const DB_PORT = '27017';
const DB_NAME = 'durjog-prohori';
const COLLECTION_NAME = 'donations';

// Log parameters
console.log('Database parameters:');
console.log(`- Host: ${DB_HOST}`);
console.log(`- Port: ${DB_PORT}`);
console.log(`- Database: ${DB_NAME}`);
console.log(`- Collection: ${COLLECTION_NAME}`);

// Connect to MongoDB
console.log(`\nConnecting to MongoDB (mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME})...`);

mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB database successfully');
  
  try {
    // Get database info
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Active database: ${dbName}`);
    
    // Get collection info
    const modelCollection = Donation.collection.name;
    console.log(`Model collection name: ${modelCollection}`);
    
    // List all collections in the database
    console.log('\nListing all collections in the database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('No collections found in the database');
    } else {
      collections.forEach((collection, index) => {
        console.log(`- [${index + 1}] ${collection.name}`);
      });
    }
    
    // Count total donations using direct collection access
    console.log('\nCounting documents in collections:');
    let count = 0;
    
    // Try both potential collection names
    try {
      count = await mongoose.connection.db.collection('donations').countDocuments();
      console.log(`'donations' collection count: ${count}`);
    } catch (err) {
      console.log(`'donations' collection not found or error: ${err.message}`);
    }
    
    try {
      count = await mongoose.connection.db.collection('Donation').countDocuments();
      console.log(`'Donation' collection count: ${count}`);
    } catch (err) {
      console.log(`'Donation' collection not found or error: ${err.message}`);
    }
    
    // Get the most recent donations using the model
    console.log('\nAttempting to get recent donations using Mongoose model:');
    try {
      const recentDonations = await Donation.find().sort({ timestamp: -1 }).limit(5);
      
      if (recentDonations.length === 0) {
        console.log('No donations found using Mongoose model');
      } else {
        recentDonations.forEach((donation, index) => {
          console.log(`\n[${index + 1}] Donation ID: ${donation._id}`);
          console.log(`  User: ${donation.name} (ID: ${donation.user_id})`);
          console.log(`  Type: ${donation.donation_type}`);
          console.log(`  Amount: ${donation.amount}`);
          console.log(`  Payment Method: ${donation.payment_method}`);
          console.log(`  Transaction ID: ${donation.transaction_id || 'N/A'}`);
          console.log(`  Timestamp: ${donation.timestamp}`);
          console.log(`  Status: ${donation.status}`);
        });
      }
    } catch (err) {
      console.error('Error retrieving donations with Mongoose model:', err.message);
    }
    
    // Get recent donations using direct collection access
    console.log('\nAttempting to get recent donations using direct collection access:');
    try {
      const donationsCollection = mongoose.connection.db.collection('donations');
      const directDonations = await donationsCollection.find().sort({ timestamp: -1 }).limit(5).toArray();
      
      if (directDonations.length === 0) {
        console.log('No donations found using direct collection access (donations)');
      } else {
        directDonations.forEach((donation, index) => {
          console.log(`\n[${index + 1}] Direct Donation:`, JSON.stringify(donation, null, 2));
        });
      }
    } catch (err) {
      console.error('Error retrieving direct donations:', err.message);
    }
  } catch (err) {
    console.error('Error retrieving donations:', err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
}); 