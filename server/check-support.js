const mongoose = require('mongoose');
const Support = require('./models/Support');

console.log('Connecting to MongoDB...');

mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB database: durjog-prohori');
  
  try {
    // Count all support payments
    const count = await Support.countDocuments();
    console.log(`Found ${count} support payments in the Support collection`);
    
    // Get the most recent support payments
    const payments = await Support.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\nMost recent support payments:');
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. ID: ${payment._id}`);
      console.log(`   Name: ${payment.name}`);
      console.log(`   Phone: ${payment.phoneNumber}`);
      console.log(`   Amount: ${payment.amount}`);
      console.log(`   Payment Method: ${payment.paymentMethod}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Date: ${payment.createdAt}`);
      console.log('-----------------------------------');
    });
    
    // Verify collection name
    console.log('\nCollection name:', Support.collection.collectionName);
    
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAll collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nClosed MongoDB connection');
  }
})
.catch(error => {
  console.error('MongoDB connection error:', error.message);
}); 