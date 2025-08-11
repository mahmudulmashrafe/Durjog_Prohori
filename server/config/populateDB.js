const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  // Run the population script once connection is established
  populateDatabase();
})
.catch(err => console.error('MongoDB connection error:', err));

// Sample users data
const users = [
  {
    username: 'admin',
    name: 'Admin User',
    email: 'admin@durjogprohori.com',
    password: 'admin123',
    role: 'admin',
    location: 'Dhaka',
    online: true,
    specialty: 'System Administration',
    phone_number: '01700000000'
  },
  {
    username: 'john_doe',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    location: 'Chittagong',
    specialty: 'First Aid',
    phone_number: '01700000001'
  },
  {
    username: 'sara_rahman',
    name: 'Sara Rahman',
    email: 'sara@example.com',
    password: 'password123',
    role: 'volunteer',
    location: 'Dhaka',
    specialty: 'Medical Support',
    phone_number: '01700000002'
  },
  {
    username: 'dr_karim',
    name: 'Dr. Abdul Karim',
    email: 'karim@example.com',
    password: 'password123',
    role: 'volunteer',
    location: 'Sylhet',
    specialty: 'Medicine',
    phone_number: '01700000003'
  },
  {
    username: 'red_crescent',
    name: 'Bangladesh Red Crescent',
    email: 'redcrescent@example.com',
    password: 'password123',
    role: 'organization',
    location: 'Bangladesh',
    specialty: 'Disaster Relief',
    phone_number: '01700000004'
  }
];

// Function to populate database
const populateDatabase = async () => {
  try {
    // Simply delete all users instead of dropping the collection
    await User.deleteMany({});
    console.log('Previous user data cleared');
    
    // Hash passwords and create new users
    const userData = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        return {
          ...user,
          password: hashedPassword
        };
      })
    );
    
    // Insert new users
    const createdUsers = await User.insertMany(userData);
    console.log(`${createdUsers.length} users have been created successfully`);
    
    // Display created users (without passwords)
    console.log('Created users:');
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.role}): ${user._id}`);
    });
    
    console.log('Database population completed successfully');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
  }
}; 