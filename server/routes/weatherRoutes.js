const express = require('express');
const router = express.Router();
const axios = require('axios'); // Make sure axios is installed on the server side

// Store alerts in memory (in a real app, this would be in a database)
let alerts = [];

// Weather API key
const WEATHER_API_KEY = 'fe81969cb6cd4c43a49134319252806';

// Proxy endpoint for weather forecast to avoid CORS issues
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Missing latitude or longitude parameters' });
    }
    
    console.log(`Fetching weather data for coordinates: ${lat},${lon}`);
    
    // Make the request to the weather API from the server
    const response = await axios.get(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=10&aqi=yes`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    // Add CORS headers explicitly
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Forward the response to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error in weather forecast proxy:', error);
    
    // Return a more detailed error response
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.log('Error data:', error.response.data);
      console.log('Error status:', error.response.status);
      res.status(error.response.status).json({
        error: 'Weather API error',
        message: error.response.data.error?.message || 'Unknown error from weather service'
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received:', error.request);
      res.status(503).json({ error: 'No response from weather service' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error message:', error.message);
      res.status(500).json({ error: 'Failed to fetch weather forecast', message: error.message });
    }
  }
});

// Get current weather data
router.get('/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Missing latitude or longitude parameters' });
    }
    
    // Make the request to the weather API from the server
    const response = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=yes`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Weather API error',
        message: error.response.data.error?.message || 'Unknown error from weather service'
      });
    } else if (error.request) {
      res.status(503).json({ error: 'No response from weather service' });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data', message: error.message });
    }
  }
});

// Get active alerts
router.get('/alerts', async (req, res) => {
  try {
    // Clean up old alerts (older than 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    alerts = alerts.filter(alert => new Date(alert.time) > twentyFourHoursAgo);
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Add new alert
router.post('/alerts', async (req, res) => {
  try {
    const { title, description, severity, time, type } = req.body;
    
    // Validate required fields
    if (!title || !description || !severity || !time || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newAlert = {
      id: Date.now(), // Simple ID generation
      title,
      description,
      severity,
      time,
      type
    };

    // Add to beginning of array to show newest first
    alerts.unshift(newAlert);
    
    res.status(201).json(newAlert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

module.exports = router; 