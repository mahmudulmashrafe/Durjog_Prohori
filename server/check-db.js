const mongoose = require('mongoose');
const Donation = require('./models/Donation');

console.log('Connecting to MongoDB...');

mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB database: durjog-prohori');
  
  try {
    // Count all donations
    const count = await Donation.countDocuments();
    console.log(`Found ${count} donations in the Donation collection`);
    
    // Get the most recent donations
    const donations = await Donation.find()
      .sort({ timestamp: -1 })
      .limit(5);
    
    console.log('Most recent donations:');
    donations.forEach((donation, index) => {
      console.log(`${index + 1}. ID: ${donation._id}`);
      console.log(`   User: ${donation.name} (${donation.user_id})`);
      console.log(`   Type: ${donation.donation_type}, Amount: ${donation.amount}`);
      console.log(`   Payment Method: ${donation.payment_method}`);
      console.log(`   Date: ${donation.timestamp}`);
      console.log('-----------------------------------');
    });
    
    // Verify collection name
    console.log('Collection name:', Donation.collection.collectionName);
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Closed MongoDB connection');
  }
})
.catch(error => {
  console.error('MongoDB connection error:', error.message);
}); 