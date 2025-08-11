const { MongoClient } = require('mongodb');

async function checkNgoDonations() {
  const mongoUrl = 'mongodb://localhost:27017';
  const dbName = 'durjog-prohori';
  
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const ngoDonationCollection = db.collection('ngoDonation');
    
    // Get all documents in the collection
    const donations = await ngoDonationCollection.find({}).toArray();
    console.log('Total donations found:', donations.length);
    console.log('\nDonation records:');
    console.log(JSON.stringify(donations, null, 2));
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkNgoDonations(); 