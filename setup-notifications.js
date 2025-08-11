const { MongoClient, ObjectId } = require('mongodb');

async function setupNotifications() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('durjog-prohori');
    
    // Create the usernotifications collection
    try {
      await db.createCollection('usernotifications');
      console.log('Created usernotifications collection');
    } catch (error) {
      if (error.code === 48) {
        console.log('Collection already exists');
      } else {
        throw error;
      }
    }

    // Get a user ID from the users collection
    const user = await db.collection('users').findOne({});
    if (!user) {
      throw new Error('No users found in the database');
    }
    
    const userId = user._id.toString();
    console.log('Found user ID:', userId);

    // Create sample notifications
    const sampleNotifications = [
      {
        userId: userId,
        title: 'Test Flood Alert',
        message: 'A flood has been reported in Dhaka region',
        type: 'disaster',
        read: false,
        data: {
          disasterType: 'flood',
          location: 'Dhaka',
          dangerLevel: 'high'
        },
        createdAt: new Date()
      },
      {
        userId: userId,
        title: 'Test Fire Alert',
        message: 'A fire has been reported in Chittagong area',
        type: 'disaster',
        read: false,
        data: {
          disasterType: 'fire',
          location: 'Chittagong',
          dangerLevel: 'high'
        },
        createdAt: new Date()
      },
      {
        userId: userId,
        title: 'System Update',
        message: 'The disaster alert system has been updated',
        type: 'info',
        read: false,
        data: {},
        createdAt: new Date()
      }
    ];

    // Insert the sample notifications
    const result = await db.collection('usernotifications').insertMany(sampleNotifications);
    console.log(`Inserted ${result.insertedCount} notifications`);

    // Verify the notifications
    const notifications = await db.collection('usernotifications').find({ userId: userId }).toArray();
    console.log('\nVerifying notifications:');
    console.log(`Found ${notifications.length} notifications for user ${userId}`);
    console.log('Sample notification:', notifications[0]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

setupNotifications(); 