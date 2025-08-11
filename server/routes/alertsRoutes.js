const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/alerts - Get all alerts
router.get('/', async (req, res) => {
  try {
    console.log('Alerts endpoint hit - returning mock data');
    
    // Return mock alerts data since we don't have an actual alerts collection yet
    const mockAlerts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Flood Warning',
        message: 'Heavy rainfall expected in Sylhet division. Prepare for possible flooding.',
        type: 'warning',
        severity: 'high',
        location: 'Sylhet Division',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: false
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Cyclone Update',
        message: 'Cyclone forming in the Bay of Bengal, expected to make landfall in 48 hours.',
        type: 'alert',
        severity: 'critical',
        location: 'Coastal Areas',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        read: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Earthquake Safety Tips',
        message: 'Recent seismic activity detected. Review earthquake safety procedures.',
        type: 'info',
        severity: 'medium',
        location: 'All Regions',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: false
      }
    ];
    
    res.status(200).json({
      success: true,
      count: mockAlerts.length,
      alerts: mockAlerts
    });
  } catch (error) {
    console.error('Error in alerts endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
});

// Mark alert as read
router.put('/:alertId/read', (req, res) => {
  try {
    const { alertId } = req.params;
    
    // In a real implementation, you would update the alert in the database
    console.log(`Marking alert ${alertId} as read`);
    
    res.status(200).json({
      success: true,
      message: 'Alert marked as read'
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking alert as read',
      error: error.message
    });
  }
});

module.exports = router; 