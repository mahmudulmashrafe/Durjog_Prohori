const mongoose = require('mongoose');

// MongoDB connection URL
const mongoURL = 'mongodb://localhost:27017/durjog-prohori';

async function addStatusField() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURL);
        console.log('Successfully connected to MongoDB');

        // List of all disaster collections
        const disasterTypes = ['flood', 'fire', 'landslide', 'tsunami', 'cyclone', 'other'];

        for (const type of disasterTypes) {
            const collectionName = `disaster${type}`;
            console.log(`\nUpdating ${collectionName} collection...`);

            // Get the collection
            const collection = mongoose.connection.db.collection(collectionName);

            // Update all documents that don't have a status field
            const result = await collection.updateMany(
                { status: { $exists: false } },
                { $set: { status: 'pending' } }
            );

            console.log(`Updated ${result.modifiedCount} documents in ${collectionName}`);
        }

        console.log('\nMigration completed successfully!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

// Run the migration
addStatusField(); 