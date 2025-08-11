const mongoose = require('mongoose');
const User = require('../models/User');

async function updateBloodType() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB for blood type update');

    // Count users before update
    const totalUsers = await User.countDocuments();
    console.log(`Total users before update: ${totalUsers}`);

    // Count users without blood_type field
    const usersWithoutBloodType = await User.countDocuments({ blood_type: { $exists: false } });
    console.log(`Users without blood_type field: ${usersWithoutBloodType}`);

    // Update users without blood_type field
    if (usersWithoutBloodType > 0) {
      const updateResult = await User.updateMany(
        { blood_type: { $exists: false } },
        { $set: { blood_type: null } }
      );
      console.log(`Updated ${updateResult.modifiedCount} users with default blood_type value`);
    }

    // Verify the update
    const finalUsersWithoutBloodType = await User.countDocuments({ blood_type: { $exists: false } });
    console.log(`Users without blood_type field after update: ${finalUsersWithoutBloodType}`);

    console.log('Blood type update completed successfully');
  } catch (error) {
    console.error('Error updating blood type:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the update
updateBloodType(); 