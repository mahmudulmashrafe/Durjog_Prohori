const mongoose = require('mongoose');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/durjog-prohori', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  main();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define Isubmit schema
const isubmitSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  latitude: Number,
  longitude: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'resolved', 'declined'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  assignedFirefighters: [
    {
      firefighterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Firefighter'
      },
      name: String,
      station: String,
      assignedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  statusHistory: [
    {
      status: String,
      changedBy: String,
      changedByType: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

// Create Isubmit model
const Isubmit = mongoose.model('Isubmit', isubmitSchema, 'isubmit');

async function main() {
  try {
    // Get all reports
    const reports = await Isubmit.find({}).sort({ createdAt: -1 });
    
    if (reports.length === 0) {
      console.log('No reports found in the database.');
      closeConnection();
      return;
    }
    
    console.log(`Found ${reports.length} reports. Latest 5 reports:`);
    
    // Show latest 5 reports
    reports.slice(0, 5).forEach((report, index) => {
      console.log(`${index + 1}. ID: ${report._id}, Name: ${report.name}, Status: ${report.status}, Date: ${report.createdAt}`);
    });
    
    rl.question('\nEnter the number of the report to update (1-5): ', (reportNum) => {
      const num = parseInt(reportNum);
      
      if (isNaN(num) || num < 1 || num > 5) {
        console.log('Invalid selection. Please enter a number between 1 and 5.');
        closeConnection();
        return;
      }
      
      const selectedReport = reports[num - 1];
      
      rl.question('\nEnter the new status (pending, processing, resolved, declined): ', async (newStatus) => {
        if (!['pending', 'processing', 'resolved', 'declined'].includes(newStatus)) {
          console.log('Invalid status. Must be one of: pending, processing, resolved, declined');
          closeConnection();
          return;
        }
        
        try {
          // Update the report status
          const oldStatus = selectedReport.status;
          selectedReport.status = newStatus;
          
          // Add status history
          selectedReport.statusHistory = selectedReport.statusHistory || [];
          selectedReport.statusHistory.push({
            status: newStatus,
            changedBy: 'test-script',
            changedByType: 'manual',
            timestamp: new Date()
          });
          
          await selectedReport.save();
          
          console.log(`\nSuccessfully updated report ID: ${selectedReport._id}`);
          console.log(`Status changed from ${oldStatus} to ${newStatus}`);
          
          closeConnection();
        } catch (err) {
          console.error('Error updating report:', err);
          closeConnection();
        }
      });
    });
  } catch (err) {
    console.error('Error:', err);
    closeConnection();
  }
}

function closeConnection() {
  rl.close();
  mongoose.connection.close()
    .then(() => console.log('MongoDB connection closed'))
    .catch(err => console.error('Error closing MongoDB connection:', err))
    .finally(() => process.exit(0));
} 