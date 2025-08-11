const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/durjog-prohori';

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Successfully connected to MongoDB');

    // Get the users collection
    const usersCollection = mongoose.connection.collection('users');
    
    // First, let's check the current state
    const beforeCount = await usersCollection.countDocuments();
    console.log(`Total users before migration: ${beforeCount}`);
    
    // Find one user to check current structure
    const sampleUser = await usersCollection.findOne({});
    console.log('Sample user before migration:', sampleUser);
    
    // Update all users to add blood_type field if it doesn't exist
    const result = await usersCollection.updateMany(
      { blood_type: { $exists: false } },
      { $set: { blood_type: null } }
    );

    console.log('Migration result:', {
      matched: result.matchedCount,
      modified: result.modifiedCount
    });
    
    // Verify the changes
    const afterSampleUser = await usersCollection.findOne({});
    console.log('Sample user after migration:', afterSampleUser);
    
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the migration
migrateUsers(); 