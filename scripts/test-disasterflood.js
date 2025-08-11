const mongoose = require('mongoose');
const DisasterFlood = require('../models/DisasterFlood');

// MongoDB connection URL
const mongoURL = 'mongodb://localhost:27017/durjog-prohori';

async function testDisasterFloodFetch() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURL);
        console.log('Successfully connected to MongoDB');

        // Fetch all documents from disasterflood collection
        console.log('\nFetching all flood disasters:');
        const allDisasters = await DisasterFlood.find({});
        console.log(`Found ${allDisasters.length} flood disasters`);
        
        // Print each disaster's basic info and assigned firefighters
        allDisasters.forEach((disaster, index) => {
            console.log(`\nDisaster ${index + 1}:`);
            console.log('- Name:', disaster.name);
            console.log('- Location:', disaster.location);
            console.log('- Assigned Firefighters:', disaster.assignedFirefighters.length);
            
            // Print details of each assigned firefighter
            if (disaster.assignedFirefighters.length > 0) {
                console.log('\nAssigned Firefighters Details:');
                disaster.assignedFirefighters.forEach((ff, ffIndex) => {
                    console.log(`  Firefighter ${ffIndex + 1}:`);
                    console.log('  - ID:', ff.firefighterId);
                    console.log('  - Name:', ff.name);
                    console.log('  - Station:', ff.station);
                });
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

// Run the test
testDisasterFloodFetch(); 