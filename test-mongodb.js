const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('durjog-prohori');
    console.log('Connected to database: durjog-prohori');

    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    const notifications = await db.collection('usernotifications').find({}).toArray();
    console.log('\nNotifications in collection:', notifications.length);
    console.log('Sample notifications:', notifications.slice(0, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

testMongoConnection(); 