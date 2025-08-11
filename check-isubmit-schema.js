const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  checkSchema();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function checkSchema() {
  try {
    // Get collection info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name).join(', '));
    
    // Check if isubmit collection exists
    if (collections.some(c => c.name === 'isubmit')) {
      console.log('✅ isubmit collection exists');
      
      // Get a sample document to examine structure
      const sampleDoc = await db.collection('isubmit').findOne({});
      if (sampleDoc) {
        console.log('Sample document:');
        console.log('ID:', sampleDoc._id);
        console.log('Status:', sampleDoc.status);
        console.log('Status type:', typeof sampleDoc.status);
        console.log('All fields:', Object.keys(sampleDoc));
        
        // Get all unique status values from the collection
        const statusValues = await db.collection('isubmit').distinct('status');
        console.log('Unique status values in collection:', statusValues);
        
        // Try to update a document with declined status directly
        if (sampleDoc._id) {
          console.log('\nTrying to update a document with status="declined"...');
          const result = await db.collection('isubmit').updateOne(
            { _id: sampleDoc._id },
            { $set: { status: 'declined' } }
          );
          console.log('Update result:', result);
          
          // Verify the update
          const updatedDoc = await db.collection('isubmit').findOne({ _id: sampleDoc._id });
          console.log('Updated status:', updatedDoc.status);
        }
      } else {
        console.log('⚠️ No documents found in isubmit collection');
      }
    } else {
      console.log('❌ isubmit collection does not exist');
    }
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 