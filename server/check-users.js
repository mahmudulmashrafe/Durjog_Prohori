const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/durjog-prohori';

const checkUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected successfully');

    const usersCollection = mongoose.connection.collection('users');
    
    // Get total count
    const count = await usersCollection.countDocuments();
    console.log(`Total users in database: ${count}`);
    
    // Get a sample user
    const user = await usersCollection.findOne({});
    console.log('\nSample user document:');
    console.log(JSON.stringify(user, null, 2));
    
    // Check how many users have blood_type field
    const bloodTypeCount = await usersCollection.countDocuments({ blood_type: { $exists: true } });
    console.log(`\nUsers with blood_type field: ${bloodTypeCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

checkUsers(); 