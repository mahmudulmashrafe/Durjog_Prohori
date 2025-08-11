const express = require('express');
const axios = require('axios');
const Earthquake = require('../models/Earthquake');
const mongoose = require('mongoose');

const router = express.Router();

// Fetch latest earthquakes and store them in the database
router.get('/fetch', async (req, res) => {
  try {
    // Set default parameters or use query parameters
    const minLatitude = req.query.minLatitude || 20;
    const maxLatitude = req.query.maxLatitude || 27;
    const minLongitude = req.query.minLongitude || 88;
    const maxLongitude = req.query.maxLongitude || 93;
    const limit = req.query.limit || 100; // Increased default limit to 100
    const startTime = req.query.startTime || ''; // Allow filtering by start time
    const endTime = req.query.endTime || '';   // Allow filtering by end time
    
    // Build USGS Earthquake API URL with optional time parameters
    let apiUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=${minLatitude}&maxlatitude=${maxLatitude}&minlongitude=${minLongitude}&maxlongitude=${maxLongitude}&orderby=time&limit=${limit}`;
    
    if (startTime) {
      apiUrl += `&starttime=${startTime}`;
    }
    
    if (endTime) {
      apiUrl += `&endtime=${endTime}`;
    }
    
    console.log(`Fetching earthquake data from: ${apiUrl}`);
    
    // Fetch data from USGS API
    const response = await axios.get(apiUrl);
    const earthquakes = response.data.features;
    
    if (!earthquakes || earthquakes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No earthquake data found for the specified parameters' 
      });
    }
    
    // Transform data to match our schema
    const earthquakeDocs = earthquakes.map(quake => ({
      magnitude: quake.properties.mag,
      place: quake.properties.place,
      time: quake.properties.time,
      latitude: quake.geometry.coordinates[1],
      longitude: quake.geometry.coordinates[0],
      depth: quake.geometry.coordinates[2],
      url: quake.properties.url,
      // Additional properties from USGS
      felt: quake.properties.felt,
      cdi: quake.properties.cdi,
      mmi: quake.properties.mmi,
      alert: quake.properties.alert,
      status: quake.properties.status,
      tsunami: quake.properties.tsunami,
      sig: quake.properties.sig,
      title: quake.properties.title
    }));
    
    // Insert data into MongoDB
    const savedData = await Earthquake.insertMany(earthquakeDocs);
    
    res.status(200).json({
      success: true,
      message: `Successfully fetched and stored ${savedData.length} earthquake records`,
      data: savedData
    });
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching or storing earthquake data',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Get all earthquakes from the database
router.get('/', async (req, res) => {
  try {
    const { limit = 50, showHidden = false } = req.query;
    const limitNum = parseInt(limit);
    
    // Build query - only show visible earthquakes unless showHidden is true
    const query = {};
    if (showHidden !== 'true') {
      query.isVisible = { $ne: 0 }; // Show earthquakes that are not hidden
    }
    
    const earthquakes = await Earthquake.find(query)
      .sort({ time: -1, createdAt: -1 })
      .limit(limitNum);
    
    res.status(200).json({
      success: true,
      count: earthquakes.length,
      data: earthquakes
    });
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching earthquakes', 
      error: error.message 
    });
  }
});

// Get earthquake by ID
router.get('/:id', async (req, res) => {
  try {
    const earthquake = await Earthquake.findById(req.params.id);
    
    if (!earthquake) {
      return res.status(404).json({
        success: false,
        message: 'Earthquake not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: earthquake
    });
  } catch (error) {
    console.error('Error fetching earthquake by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving earthquake data',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Get earthquakes by magnitude range
router.get('/magnitude/:min/:max', async (req, res) => {
  try {
    const minMagnitude = parseFloat(req.params.min);
    const maxMagnitude = parseFloat(req.params.max);
    
    if (isNaN(minMagnitude) || isNaN(maxMagnitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid magnitude values. Please provide numeric values.'
      });
    }
    
    const earthquakes = await Earthquake.find({
      magnitude: { $gte: minMagnitude, $lte: maxMagnitude }
    }).sort({ time: -1 });
    
    res.status(200).json({
      success: true,
      count: earthquakes.length,
      data: earthquakes
    });
  } catch (error) {
    console.error('Error fetching earthquakes by magnitude:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving earthquake data',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Get earthquakes by time range
router.get('/time-range', async (req, res) => {
  try {
    const startTime = req.query.start ? parseInt(req.query.start) : null;
    const endTime = req.query.end ? parseInt(req.query.end) : null;
    
    if (!startTime && !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one time boundary (start or end)'
      });
    }
    
    let timeQuery = {};
    
    if (startTime) {
      timeQuery.$gte = startTime;
    }
    
    if (endTime) {
      timeQuery.$lte = endTime;
    }
    
    const earthquakes = await Earthquake.find({
      time: timeQuery
    }).sort({ time: -1 });
    
    res.status(200).json({
      success: true,
      count: earthquakes.length,
      data: earthquakes
    });
  } catch (error) {
    console.error('Error fetching earthquakes by time range:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving earthquake data',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Get earthquakes by location (radius search)
router.get('/location', async (req, res) => {
  try {
    const latitude = parseFloat(req.query.lat);
    const longitude = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 100; // Default 100km radius
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location. Please provide valid latitude and longitude values.'
      });
    }
    
    // Use MongoDB's geospatial query for more efficient search
    const earthquakes = await Earthquake.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON uses [lng, lat] order
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).sort({ time: -1 });
    
    res.status(200).json({
      success: true,
      count: earthquakes.length,
      data: earthquakes
    });
  } catch (error) {
    console.error('Error fetching earthquakes by location:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving earthquake data',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Toggle earthquake visibility
router.patch('/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;
    
    console.log('Earthquake visibility toggle request:', {
      id,
      isVisible,
      body: req.body
    });

    // Convert to number (1 or 0)
    let visibilityValue;
    
    if (typeof isVisible === 'boolean') {
      visibilityValue = isVisible ? 1 : 0;
    } else if (isVisible === 1 || isVisible === 0) {
      visibilityValue = isVisible === 1 ? 0 : 1; // Toggle
    } else if (isVisible === '1' || isVisible === '0') {
      visibilityValue = isVisible === '1' ? 0 : 1; // Toggle string values
    } else {
      visibilityValue = 1; // Default to visible
    }
    
    console.log('Setting earthquake visibility value to:', visibilityValue);

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = mongoose.Types.ObjectId(id);
    } catch (error) {
      console.error('Invalid ObjectId:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid earthquake ID'
      });
    }

    const earthquake = await Earthquake.findByIdAndUpdate(
      objectId,
      { isVisible: visibilityValue },
      { new: true }
    );

    if (!earthquake) {
      console.log('Earthquake not found:', { id });
      return res.status(404).json({
        success: false,
        message: 'Earthquake not found'
      });
    }

    console.log('Earthquake visibility updated successfully:', {
      id,
      newVisibility: earthquake.isVisible
    });

    res.status(200).json({
      success: true,
      data: earthquake
    });
  } catch (error) {
    console.error('Error toggling earthquake visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling earthquake visibility',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

module.exports = router; 