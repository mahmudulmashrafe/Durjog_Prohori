import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useFirefighterAuth } from '../context/FirefighterAuthContext';
import FirefighterLayout from '../components/firefighter/FirefighterLayout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationArrow, FaSearch, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';

// User location marker (green dot)
const userLocationIcon = L.divIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgb(38, 220, 78);
        border: 4px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  className: 'custom-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Selected location marker (red pin)
const locationMarkerIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 30px;
      height: 45px;
      transform: translate(-50%, -100%);
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #DC2626;
        border-radius: 50% 50% 50% 50%;
        clip-path: path('M 15 0 A 15 15 0 1 1 0 15 C 0 30 15 45 15 45 C 15 45 30 30 30 15 A 15 15 0 1 1 15 0 Z');
      "></div>
      <div style="
        position: absolute;
        top: 7px;
        left: 7px;
        width: 16px;
        height: 16px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  className: 'location-marker',
  iconSize: [30, 45],
  iconAnchor: [15, 45]
});

// Disaster type markers
const createDisasterIcon = (color) => {
  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      "></div>
    `,
    className: 'disaster-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Custom flood icon
const floodIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: 2px solid #3B82F6;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- House roof -->
          <path d="M4 10L12 4L20 10" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- House body -->
          <path d="M6 10V19H18V10" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Water lines -->
          <path d="M3 13H21" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 16H22" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 19H21" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Window -->
          <rect x="9" y="13" width="2" height="2" fill="#3B82F6"/>
          <!-- Door -->
          <path d="M13 19V15H15V19" stroke="#3B82F6" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `,
  className: 'flood-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom earthquake icon
const earthquakeIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: 2px solid #EF4444;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 18L4 15L7 18L11 13L15 18L18 14L22 18" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 8L7 12L12 5L15 9L20 2" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 22H11L12 17L13 22Z" fill="#EF4444" stroke="#EF4444" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `,
  className: 'earthquake-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom cyclone icon
const cycloneIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: 2px solid #8B5CF6;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12Z" fill="#8B5CF6" stroke="#8B5CF6" stroke-width="0.5"/>
        </svg>
      </div>
    </div>
  `,
  className: 'cyclone-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom landslide icon
const landslideIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: 2px solid #F59E0B;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L20 6" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M6 11L18 11" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M5 16L7 16L12 16L16 16L19 16" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 21L20 21" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M19 6L17 21" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M10 6L12 21" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M5 6L7 21" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    </div>
  `,
  className: 'landslide-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom tsunami icon
const tsunamiIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: 2px solid #10B981;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 12C2 12 5 8 8 8C11 8 13 12 16 12C19 12 22 8 22 8" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 18C2 18 5 14 8 14C11 14 13 18 16 18C19 18 22 14 22 14" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 6C2 6 5 2 8 2C11 2 13 6 16 6C19 6 22 2 22 2" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `,
  className: 'tsunami-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom fire icon
const fireIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: 2px solid #DC2626;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C16.4183 21 20 17.4183 20 13C20 10 18 7.5 16 6C16 8 15.5 9 14 10C14 7 13 5 11 3C9 5 7 8 7 13C7 17.4183 8.5 21 12 21Z" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `,
  className: 'fire-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom other/unspecified icon
const otherIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: 2px solid #6B7280;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `,
  className: 'other-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// SOS emergency icon
const sosIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: 3px solid #DC2626;
        animation: pulse 1.5s infinite;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>
  `,
  className: 'sos-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const FirefighterMap = () => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const { firefighter } = useFirefighterAuth();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const userCircle = useRef(null);
  const locationMarker = useRef(null);
  const disasterMarkers = useRef([]);
  
  // State
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [locationName, setLocationName] = useState('');
  const [sosReports, setSosReports] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [legendVisible, setLegendVisible] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [suggestions, setSuggestions] = useState([]);
  
  // Common locations in Bangladesh for suggestions
  const commonLocations = [
    "Dhaka, Bangladesh",
    "Chittagong, Bangladesh",
    "Khulna, Bangladesh",
    "Rajshahi, Bangladesh",
    "Sylhet, Bangladesh",
    "Cox's Bazar, Bangladesh",
    "Rangpur, Bangladesh",
    "Mymensingh, Bangladesh",
    "Barisal, Bangladesh",
    "Comilla, Bangladesh",
    "Narayanganj, Bangladesh",
    "Gazipur, Bangladesh"
  ];
  
  // Disaster-related search terms
  const disasterTerms = [
    "Flood",
    "Earthquake",
    "Cyclone",
    "Landslide",
    "Fire",
    "Tsunami",
    "Emergency",
    "Evacuation",
    "Relief Center",
    "Medical Help",
    "Rescue",
    "বন্যা", // Flood in Bengali
    "ভূমিকম্প", // Earthquake in Bengali
    "ঘূর্ণিঝড়", // Cyclone in Bengali
    "ভূমিধস", // Landslide in Bengali
    "আগুন", // Fire in Bengali
    "সুনামি", // Tsunami in Bengali
    "জরুরি", // Emergency in Bengali
    "উদ্ধার" // Rescue in Bengali
  ];

  // Disaster types definition
  const disasterTypes = [
    { id: 'all', label: language === 'en' ? 'All Disasters' : 'সব দুর্যোগ', color: '#3B82F6' },
    { id: 'earthquake', label: language === 'en' ? 'Earthquake' : 'ভূমিকম্প', color: '#EF4444' },
    { id: 'flood', label: language === 'en' ? 'Flood' : 'বন্যা', color: '#3B82F6' },
    { id: 'cyclone', label: language === 'en' ? 'Cyclone' : 'ঘূর্ণিঝড়', color: '#8B5CF6' },
    { id: 'landslide', label: language === 'en' ? 'Landslide' : 'ভূমিধস', color: '#F59E0B' },
    { id: 'tsunami', label: language === 'en' ? 'Tsunami' : 'সুনামি', color: '#10B981' },
    { id: 'fire', label: language === 'en' ? 'Fire' : 'আগুন', color: '#DC2626' },
    { id: 'other', label: language === 'en' ? 'Other' : 'অন্যান্য', color: '#6B7280' }
  ];

  // Initialize map on component mount
  useEffect(() => {
    console.log("Initializing map component...");
    
    // Let's not add explicit styling that might cause issues
    if (mapRef.current) {
      console.log("Map container exists, initializing...");
      // Add explicit styling to ensure full height
      mapRef.current.style.height = '100vh';
      mapRef.current.style.width = '100%';
      mapRef.current.style.position = 'absolute';
      mapRef.current.style.bottom = '0';
      mapRef.current.style.left = '0';
      mapRef.current.style.right = '0';
      mapRef.current.style.margin = '0';
      mapRef.current.style.padding = '0';
    }
    
    const initMap = () => {
      if (!mapRef.current) {
        console.log("Map container doesn't exist yet, delaying initialization");
        return false;
      }
      
      if (mapInstance.current) {
        console.log("Map instance already exists, skipping initialization");
        return true;
      }
      
      try {
        console.log("Creating map instance...");
        // Initialize the map
        mapInstance.current = L.map(mapRef.current, {
          center: [23.8103, 90.4125], // Dhaka, Bangladesh
          zoom: 12,
          zoomControl: false,
          attributionControl: true,
          attributionPosition: 'bottomright'
        });
        
        console.log("Map instance created successfully");
        
        // Add map tiles with custom styling
        // eslint-disable-next-line no-unused-vars
        const mapTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstance.current);
        
        // Apply custom styling to mimic Google Maps
        if (mapRef.current) {
          mapRef.current.style.filter = darkMode ? 'grayscale(20%) brightness(90%)' : 'saturate(95%) hue-rotate(-5deg)';
        }
        
        // Add click handler
        if (mapInstance.current) {
          mapInstance.current.on('click', handleMapClick);
        }
        
        // Add global functions for responding to emergencies and SOS calls
        window.respond = (disasterId) => {
          handleDisasterResponse(disasterId);
        };

        window.respondToSOS = (sosId) => {
          handleSOSResponse(sosId);
        };
        
        return true;
      } catch (err) {
        console.error('Error initializing map:', err);
        return false;
      }
    };
    
    // Try to initialize map with retry
    const initWithRetry = () => {
      const success = initMap();
      
      if (success) {
        // Fix Leaflet's viewport calculation issues
        setTimeout(() => {
          if (mapInstance.current) {
            try {
              console.log("Invalidating map size...");
              mapInstance.current.invalidateSize(true);
              
              // Display markers after initialization is complete
              if (disasters.length > 0) {
                showDisastersOnMap(selectedFilter);
              }
            } catch (err) {
              console.error("Error in post-initialization:", err);
            }
          }
        }, 500);
      } else {
        // Retry after a delay
        console.log("Retrying map initialization after delay...");
        setTimeout(initWithRetry, 300);
      }
    };
    
    // Start initialization process
    initWithRetry();
    
    // Cleanup on unmount
    return () => {
      console.log("Cleaning up map component...");
      if (mapInstance.current) {
        try {
          mapInstance.current.off('click', handleMapClick);
          mapInstance.current.remove();
        } catch (err) {
          console.error("Error during map cleanup:", err);
        }
        mapInstance.current = null;
      }
      
      // Remove global window functions
      delete window.respond;
      delete window.respondToSOS;
    };
  }, [darkMode]);
  
  // Recalculate map size when container dimensions might change
  useEffect(() => {
    const handleResize = () => {
      console.log("Window resize detected, invalidating map size...");
      if (mapInstance.current && mapInstance.current._loaded) {
        try {
          // Force the map to recalculate its size and center
          mapInstance.current.invalidateSize(true);
          
          // Also check container dimensions and update if needed
          if (mapRef.current) {
            // Make sure the map container fills the available height
            const height = window.innerHeight - 56; // Account for header
            mapRef.current.parentElement.style.height = `${height}px`;
          }
        } catch (err) {
          console.error("Error handling resize:", err);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial invalidateSize after component mounts
    const timer = setTimeout(() => {
      handleResize();
    }, 500);
    
    // Repeatedly check size for a short period after mounting
    // Some frameworks have animation delays that can affect map sizing
    const checkSizeInterval = setInterval(() => {
      if (mapInstance.current && mapInstance.current._loaded) {
        try {
          mapInstance.current.invalidateSize(true);
        } catch (err) {
          console.error("Error during size check:", err);
        }
      }
    }, 500);
    
    // Clear the interval after a few seconds
    setTimeout(() => {
      clearInterval(checkSizeInterval);
    }, 3000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      clearInterval(checkSizeInterval);
    };
  }, []);
  
  // Apply dark mode to map
  useEffect(() => {
    if (mapRef.current) {
      if (darkMode) {
        mapRef.current.classList.add('dark-map');
        mapRef.current.style.filter = 'grayscale(20%) brightness(90%)';
      } else {
        mapRef.current.classList.remove('dark-map');
        mapRef.current.style.filter = 'saturate(95%) hue-rotate(-5deg)';
      }
    }
  }, [darkMode]);
  
  // Fetch disasters data
  useEffect(() => {
    fetchDisastersData();
  }, []);
  
  // Extract fetch disasters logic to a separate function for reuse
  const fetchDisastersData = async () => {
    setLoading(true);
    try {
      const allDisasters = [];
      
      // Fetch earthquakes directly from MongoDB
      try {
        const earthquakeResponse = await axios.get('/api/disasters/mongodb/earthquakes');
        const earthquakeData = earthquakeResponse.data.data.map(item => ({
          _id: item._id,
          type: 'earthquake',
          name: item.name || item.title || "Unnamed Earthquake",
          location: item.location || item.place || "Unknown Location",
          latitude: item.latitude || (item.coordinates ? item.coordinates[1] : 0),
          longitude: item.longitude || (item.coordinates ? item.coordinates[0] : 0),
          dangerLevel: item.dangerLevel || item.magnitude || 5,
          dateTime: item.dateTime || item.time || item.createdAt,
          visible: item.visible
        }));
        allDisasters.push(...earthquakeData);
      } catch (err) {
        console.error('Error fetching earthquakes:', err);
      }
      
      // Fetch floods directly from MongoDB
      try {
        const floodResponse = await axios.get('/api/disasters/mongodb/disasterflood');
        const floodData = floodResponse.data.data.map(item => ({
          _id: item._id,
          type: 'flood',
          name: item.name,
          location: item.location,
          latitude: item.latitude,
          longitude: item.longitude,
          dangerLevel: item.dangerLevel,
          dateTime: item.dateTime || item.createdAt,
          visible: item.visible
        }));
        allDisasters.push(...floodData);
      } catch (err) {
        console.error('Error fetching floods:', err);
      }
      
      // Fetch cyclones directly from MongoDB
      try {
        const cycloneResponse = await axios.get('/api/disasters/mongodb/disastercyclone');
        const cycloneData = cycloneResponse.data.data.map(item => ({
          _id: item._id,
          type: 'cyclone',
          name: item.name,
          location: item.location,
          latitude: item.latitude,
          longitude: item.longitude,
          dangerLevel: item.dangerLevel,
          dateTime: item.dateTime || item.createdAt,
          visible: item.visible
        }));
        allDisasters.push(...cycloneData);
      } catch (err) {
        console.error('Error fetching cyclones:', err);
      }
      
      // Fetch landslides directly from MongoDB
      try {
        const landslideResponse = await axios.get('/api/disasters/mongodb/disasterlandslide');
        const landslideData = landslideResponse.data.data.map(item => ({
          _id: item._id,
          type: 'landslide',
          name: item.name,
          location: item.location,
          latitude: item.latitude,
          longitude: item.longitude,
          dangerLevel: item.dangerLevel,
          dateTime: item.dateTime || item.createdAt,
          visible: item.visible
        }));
        allDisasters.push(...landslideData);
      } catch (err) {
        console.error('Error fetching landslides:', err);
      }
      
      // Fetch tsunamis directly from MongoDB
      try {
        const tsunamiResponse = await axios.get('/api/disasters/mongodb/disastertsunami');
        const tsunamiData = tsunamiResponse.data.data.map(item => ({
          _id: item._id,
          type: 'tsunami',
          name: item.name,
          location: item.location,
          latitude: item.latitude,
          longitude: item.longitude,
          dangerLevel: item.dangerLevel,
          dateTime: item.dateTime || item.createdAt,
          visible: item.visible
        }));
        allDisasters.push(...tsunamiData);
      } catch (err) {
        console.error('Error fetching tsunamis:', err);
      }
      
      // Fetch fires directly from MongoDB
      try {
        const fireResponse = await axios.get('/api/disasters/mongodb/disasterfire');
        const fireData = fireResponse.data.data.map(item => ({
          _id: item._id,
          type: 'fire',
          name: item.name,
          location: item.location,
          latitude: item.latitude,
          longitude: item.longitude,
          dangerLevel: item.dangerLevel,
          dateTime: item.dateTime || item.createdAt,
          visible: item.visible
        }));
        allDisasters.push(...fireData);
      } catch (err) {
        console.error('Error fetching fires:', err);
      }
      
      // Fetch other disaster types from MongoDB
      try {
        const otherResponse = await axios.get('/api/disasters/mongodb/disasterother');
        const otherData = otherResponse.data.data.map(item => ({
          _id: item._id,
          type: 'other',
          name: item.name,
          location: item.location,
          latitude: item.latitude,
          longitude: item.longitude,
          dangerLevel: item.dangerLevel,
          dateTime: item.dateTime || item.createdAt,
          visible: item.visible
        }));
        allDisasters.push(...otherData);
      } catch (err) {
        console.error('Error fetching other disasters:', err);
      }
      
      // Also fetch SOS reports to display on map
      try {
        const sosResponse = await axios.get('/api/sos/reports');
        setSosReports(sosResponse.data.data || []);
      } catch (err) {
        console.error('Error fetching SOS reports:', err);
      }
      
      // Filter only visible disasters
      const visibleDisasters = allDisasters.filter(d => d.visible === true || d.visible === 1);
      
      console.log(`Fetched ${visibleDisasters.length} disasters of ${allDisasters.length} total`);
      
      // Update state with fetched disasters
      setDisasters(visibleDisasters);
      
      // Show disasters on map after data is loaded
      if (mapInstance.current) {
        showDisastersOnMap(selectedFilter);
      }
    } catch (err) {
      console.error('Error fetching disaster data:', err);
      setError(err.message || 'Error fetching disaster data');
    } finally {
      setLoading(false);
    }
  };

  // Handle map click event
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    
    // Remove existing marker if it exists
    if (locationMarker.current) {
      locationMarker.current.remove();
    }
    
    // Add new marker at clicked location
    locationMarker.current = L.marker([lat, lng], {
      icon: locationMarkerIcon,
      draggable: true
    }).addTo(mapInstance.current);
    
    // Try to get location name from coordinates using reverse geocoding
    try {
      // Fetch detailed reverse geocoding data
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`);
      const data = await response.json();
      
      // Generate risk assessment data based on location
      // Simulate some risk factors based on geographical regions of Bangladesh
      
      // Coastal areas (southern Bangladesh) - higher cyclone risk
      const isCoastal = lat < 23.0 && lng > 89.0;
      
      // Major river basins (Central and North) - higher flood risk
      const isRiverBasin = (
        (lat > 23.5 && lat < 25.5 && lng > 89.0 && lng < 90.5) || // Brahmaputra basin
        (lat > 23.0 && lat < 24.5 && lng > 90.5 && lng < 92.0) || // Meghna basin
        (lat > 22.5 && lat < 24.5 && lng > 88.0 && lng < 89.5)    // Ganges basin
      );
      
      // Hilly areas (Southeast) - higher landslide risk
      const isHilly = lat < 24.0 && lng > 91.5;
      
      // Urban areas - higher fire risk
      const isUrban = (
        (lat > 23.7 && lat < 23.9 && lng > 90.3 && lng < 90.5) || // Dhaka
        (lat > 22.3 && lat < 22.4 && lng > 91.7 && lng < 91.9) || // Chittagong
        (lat > 22.8 && lat < 22.9 && lng > 89.5 && lng < 89.6)    // Khulna
      );
      
      // Simulate risk levels (1-10)
      const floodRisk = isRiverBasin ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
      const cycloneRisk = isCoastal ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
      const landslideRisk = isHilly ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 1;
      const fireRisk = isUrban ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 4) + 1;
      
      // Get elevation data for the location (simulated)
      const elevation = isHilly ? Math.floor(Math.random() * 300) + 100 : Math.floor(Math.random() * 100);
      
      // Overall risk score (1-10)
      const overallRisk = Math.round((floodRisk + cycloneRisk + landslideRisk + fireRisk) / 4);
      
      // Save risk data to local variable for popup
      const localRiskData = {
        floodRisk,
        cycloneRisk,
        landslideRisk,
        fireRisk,
        elevation,
        overallRisk,
        riskLevel: overallRisk >= 7 ? 'High' : overallRisk >= 4 ? 'Medium' : 'Low'
      };
      
      if (data.display_name) {
        setLocationName(data.display_name);
        
        // Create popup content with location and risk information
        let popupContent = `
          <div class="location-info-popup p-3 max-w-sm">
            <h3 class="font-bold text-lg mb-2">${language === 'en' ? 'Location Information' : 'অবস্থান তথ্য'}</h3>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        `;
        
        // Add address details if available
        if (data.address) {
          popupContent += `<div class="text-sm mb-2"><strong>${language === 'en' ? 'Address Details' : 'ঠিকানা বিবরণ'}:</strong><br>`;
          
          // Add address components in a structured way
          const addressParts = [];
          
          if (data.address.building) addressParts.push(`${language === 'en' ? 'Building' : 'ভবন'}: ${data.address.building}`);
          if (data.address.house_number) addressParts.push(`${language === 'en' ? 'House' : 'বাড়ি'}: ${data.address.house_number}`);
          if (data.address.road) addressParts.push(`${language === 'en' ? 'Road' : 'রাস্তা'}: ${data.address.road}`);
          if (data.address.neighbourhood) addressParts.push(`${language === 'en' ? 'Neighbourhood' : 'মহল্লা'}: ${data.address.neighbourhood}`);
          if (data.address.suburb) addressParts.push(`${language === 'en' ? 'Area' : 'এলাকা'}: ${data.address.suburb}`);
          if (data.address.village) addressParts.push(`${language === 'en' ? 'Village' : 'গ্রাম'}: ${data.address.village}`);
          if (data.address.town) addressParts.push(`${language === 'en' ? 'Town' : 'শহর'}: ${data.address.town}`);
          if (data.address.city) addressParts.push(`${language === 'en' ? 'City' : 'শহর'}: ${data.address.city}`);
          if (data.address.county) addressParts.push(`${language === 'en' ? 'County' : 'জেলা'}: ${data.address.county}`);
          if (data.address.state_district) addressParts.push(`${language === 'en' ? 'District' : 'জেলা'}: ${data.address.state_district}`);
          if (data.address.state) addressParts.push(`${language === 'en' ? 'Division' : 'বিভাগ'}: ${data.address.state}`);
          if (data.address.postcode) addressParts.push(`${language === 'en' ? 'Postal Code' : 'পোস্টাল কোড'}: ${data.address.postcode}`);
          
          popupContent += addressParts.join('<br>');
          popupContent += `</div>`;
        }
        
        // Add risk assessment data
        popupContent += `
          <div class="text-sm mb-2 mt-3 border-t pt-2">
            <strong class="text-red-600">${language === 'en' ? 'Risk Assessment' : 'ঝুঁকি মূল্যায়ন'}:</strong><br>
            <div class="grid grid-cols-2 gap-1 mt-1">
              <div>${language === 'en' ? 'Fire Risk' : 'আগুনের ঝুঁকি'}:</div>
              <div class="text-right font-medium ${localRiskData.fireRisk >= 7 ? 'text-red-500' : localRiskData.fireRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${localRiskData.fireRisk}/10</div>
              
              <div>${language === 'en' ? 'Flood Risk' : 'বন্যার ঝুঁকি'}:</div>
              <div class="text-right font-medium ${localRiskData.floodRisk >= 7 ? 'text-red-500' : localRiskData.floodRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${localRiskData.floodRisk}/10</div>
              
              <div>${language === 'en' ? 'Cyclone Risk' : 'ঘূর্ণিঝড়ের ঝুঁকি'}:</div>
              <div class="text-right font-medium ${localRiskData.cycloneRisk >= 7 ? 'text-red-500' : localRiskData.cycloneRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${localRiskData.cycloneRisk}/10</div>
              
              <div>${language === 'en' ? 'Overall Risk' : 'সামগ্রিক ঝুঁকি'}:</div>
              <div class="text-right font-medium ${localRiskData.overallRisk >= 7 ? 'text-red-500' : localRiskData.overallRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${localRiskData.overallRisk}/10 (${language === 'en' ? localRiskData.riskLevel : localRiskData.riskLevel === 'High' ? 'উচ্চ' : localRiskData.riskLevel === 'Medium' ? 'মাঝারি' : 'নিম্ন'})</div>
              
              <div>${language === 'en' ? 'Elevation' : 'উচ্চতা'}:</div>
              <div class="text-right">${localRiskData.elevation} ${language === 'en' ? 'm' : 'মিটার'}</div>
          </div>
          </div>
        `;
        
              // Access Information section removed
        
        // Add any available extra tags
        if (data.extratags) {
          const extraInfo = [];
          if (data.extratags.population) extraInfo.push(`${language === 'en' ? 'Population' : 'জনসংখ্যা'}: ${data.extratags.population}`);
          if (data.extratags.building) extraInfo.push(`${language === 'en' ? 'Building Type' : 'ভবনের ধরন'}: ${data.extratags.building}`);
          if (data.extratags.amenity) extraInfo.push(`${language === 'en' ? 'Amenity' : 'সুবিধা'}: ${data.extratags.amenity}`);
          
          if (extraInfo.length > 0) {
            popupContent += `<div class="text-sm mb-2"><strong>${language === 'en' ? 'Additional Information' : 'অতিরিক্ত তথ্য'}:</strong><br>`;
            popupContent += extraInfo.join('<br>');
            popupContent += `</div>`;
          }
        }
        
        // Add firefighter-specific action buttons
        popupContent += `
          <div class="flex gap-2 mt-3">
            <button class="nearby-disasters-btn bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
              ${language === 'en' ? 'Nearby Incidents' : 'কাছাকাছি ঘটনা'}
            </button>
            <button class="respond-btn bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
              ${language === 'en' ? 'Deploy Team' : 'দল পাঠান'}
            </button>
          </div>
        `;
        
        popupContent += `</div>`;
        
        // Bind the popup to the marker
        locationMarker.current.bindPopup(popupContent, {
          maxWidth: 350,
          className: 'location-details-popup'
        }).openPopup();
        
        // Add event listeners for the popup buttons (after the popup is opened)
        locationMarker.current.on('popupopen', () => {
          // Find the nearby incidents button and add click handler
          const nearbyBtn = document.querySelector('.location-details-popup .nearby-disasters-btn');
          if (nearbyBtn) {
            nearbyBtn.addEventListener('click', () => {
              // Redirect to disasters page with coordinates
              window.location.href = `/firefighter/incidents?lat=${lat}&lng=${lng}`;
            });
          }
          
          // Find the deploy team button and add click handler
          const respondBtn = document.querySelector('.location-details-popup .respond-btn');
          if (respondBtn) {
            respondBtn.addEventListener('click', () => {
              // Redirect to response page with coordinates
              window.location.href = `/firefighter/deploy?lat=${lat}&lng=${lng}`;
            });
          }
        });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocationName(`Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      
      // Add basic popup if geocoding fails
      locationMarker.current.bindPopup(`
        <div class="p-3">
          <h3 class="font-bold mb-2">${language === 'en' ? 'Selected Location' : 'নির্বাচিত অবস্থান'}</h3>
          <p class="text-sm">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        </div>
      `).openPopup();
    }
    
    // Add drag end event to update location when marker is dragged
    locationMarker.current.on('dragend', async function() {
      const newPos = locationMarker.current.getLatLng();
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        
        if (data.display_name) {
          // Update location name but don't update search query
          setLocationName(data.display_name);
          
          // Update popup with simplified content after dragging
          locationMarker.current.setPopupContent(`
            <div class="p-3">
              <h3 class="font-bold mb-2">${language === 'en' ? 'Updated Location' : 'আপডেট করা অবস্থান'}</h3>
              <p class="text-sm mb-2">${data.display_name}</p>
              <p class="text-sm mb-3">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}</p>
              <button class="analyze-btn bg-red-500 text-white px-3 py-1 rounded text-sm">
                ${language === 'en' ? 'Analyze Location' : 'অবস্থান বিশ্লেষণ করুন'}
              </button>
            </div>
          `);
          
          // Add click handler for the analyze button
          setTimeout(() => {
            const analyzeBtn = document.querySelector('.analyze-btn');
            if (analyzeBtn) {
              analyzeBtn.addEventListener('click', () => {
                // Re-trigger the map click at the new position
                handleMapClick({
                  latlng: newPos
                });
              });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        setLocationName('Location data unavailable');
      }
    });
  };

  // Show disasters on map based on filter
  const showDisastersOnMap = (filterType) => {
    // Verify map instance exists and is ready
    if (!mapInstance.current || !mapInstance.current._loaded) {
      console.log('Map not ready yet, skipping disaster markers');
      return;
    }
    
    try {
      // Clear existing markers safely
      if (disasterMarkers.current && disasterMarkers.current.length > 0) {
        disasterMarkers.current.forEach(marker => {
          if (marker && marker.remove) {
            try {
              marker.remove();
            } catch (err) {
              console.error('Error removing marker:', err);
            }
          }
        });
        disasterMarkers.current = [];
      }
      
      // If no disasters, return
      if (disasters.length === 0) {
        console.log('No disasters to show');
        return;
      }
      
      // Filter disasters by type and ensure only visible ones are shown
      const filteredDisasters = !filterType || filterType === 'all' 
        ? disasters 
        : disasters.filter(d => d.type === filterType);
      
      // Log the count of displayed disasters
      console.log(`Displaying ${filteredDisasters.length} disasters on map for filter: ${filterType || 'none'}`);
      
      // Add disaster markers with error handling
      filteredDisasters.forEach(disaster => {
        try {
          // Skip if somehow an invisible disaster made it through the initial filter
          if (!(disaster.visible === true || disaster.visible === 1)) {
            return;
          }
          
          if (!disaster.latitude || !disaster.longitude) {
            console.log('Disaster missing coordinates:', disaster);
            return;
          }
          
          const disasterType = disasterTypes.find(t => t.id === disaster.type) || disasterTypes[0];
          
          // Choose appropriate icon based on disaster type
          let icon;
          switch (disaster.type) {
            case 'earthquake':
              icon = earthquakeIcon;
              break;
            case 'flood':
              icon = floodIcon;
              break;
            case 'cyclone':
              icon = cycloneIcon;
              break;
            case 'landslide':
              icon = landslideIcon;
              break;
            case 'tsunami':
              icon = tsunamiIcon;
              break;
            case 'fire':
              icon = fireIcon;
              break;
            case 'other':
              icon = otherIcon;
              break;
            default:
              icon = createDisasterIcon(disasterType.color);
          }
          
          const marker = L.marker([disaster.latitude, disaster.longitude], {
            icon: icon
          }).addTo(mapInstance.current);
          
          // Add popup with Google Maps styling
          marker.bindPopup(`
            <div class="disaster-popup p-3 max-w-xs">
              <h3 class="font-bold text-lg mb-2">${disaster.name}</h3>
              <p class="text-sm mb-1">
                <strong>${language === 'en' ? 'Type' : 'ধরন'}:</strong> 
                <span class="ml-1">${disasterType.label}</span>
              </p>
              <p class="text-sm mb-1">
                <strong>${language === 'en' ? 'Location' : 'অবস্থান'}:</strong> 
                <span class="ml-1">${disaster.location}</span>
              </p>
              <p class="text-sm mb-1">
                <strong>${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}:</strong> 
                <span class="ml-1">${disaster.latitude.toFixed(6)}, ${disaster.longitude.toFixed(6)}</span>
              </p>
              <p class="text-sm mb-1">
                <strong>${language === 'en' ? 'Danger Level' : 'বিপদ স্তর'}:</strong> 
                <span class="ml-1 ${
                  disaster.dangerLevel === 'High' || disaster.dangerLevel === 'হাই' 
                    ? 'text-red-600' 
                    : disaster.dangerLevel === 'Medium' || disaster.dangerLevel === 'মিডিয়াম' 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                }">${disaster.dangerLevel}</span>
              </p>
              <p class="text-sm mb-1">
                <strong>${language === 'en' ? 'Date' : 'তারিখ'}:</strong> 
                <span class="ml-1">${new Date(disaster.dateTime).toLocaleString()}</span>
              </p>
              <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onclick="window.respond('${disaster._id}')" 
                  class="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                >
                  ${language === 'en' ? 'Respond to Emergency' : 'জরুরি অবস্থায় সাড়া দিন'}
                </button>
              </div>
            </div>
          `.trim(), {
            maxWidth: 300,
            className: darkMode ? 'dark-mode' : ''
          });
          
          // Store reference to marker for later removal
          disasterMarkers.current.push(marker);
        } catch (error) {
          console.error('Error adding disaster marker:', error);
        }
      });
      
      // Also add SOS reports as markers if we have them
      if (sosReports && sosReports.length > 0) {
        sosReports.forEach(report => {
          try {
            // Create a special SOS marker
            const sosMarker = L.marker([report.latitude, report.longitude], {
              icon: sosIcon
            }).addTo(mapInstance.current);
            
            // Add popup with SOS details and Google Maps styling
            sosMarker.bindPopup(`
              <div class="disaster-popup p-3 max-w-xs">
                <h3 class="font-bold text-lg mb-2">
                  <span class="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs mr-2">SOS</span>
                  ${language === 'en' ? 'Emergency' : 'জরুরি'}
                </h3>
                <p class="text-sm mb-1">
                  <strong>${language === 'en' ? 'Reporter' : 'রিপোর্টার'}:</strong> 
                  <span class="ml-1">${report.name || 'Anonymous'}</span>
                </p>
                <p class="text-sm mb-1">
                  <strong>${language === 'en' ? 'Phone' : 'ফোন'}:</strong> 
                  <span class="ml-1">${report.phoneNumber || 'N/A'}</span>
                </p>
                <p class="text-sm mb-1">
                  <strong>${language === 'en' ? 'Message' : 'বার্তা'}:</strong> 
                  <span class="ml-1">${report.message || 'No message provided'}</span>
                </p>
                <p class="text-sm mb-1">
                  <strong>${language === 'en' ? 'Location' : 'অবস্থান'}:</strong> 
                  <span class="ml-1">${report.location || 'Unknown'}</span>
                </p>
                <p class="text-sm mb-1">
                  <strong>${language === 'en' ? 'Date' : 'তারিখ'}:</strong> 
                  <span class="ml-1">${new Date(report.createdAt).toLocaleString()}</span>
                </p>
                <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onclick="window.respondToSOS('${report._id}')" 
                    class="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    ${language === 'en' ? 'Respond to SOS' : 'এসওএসে সাড়া দিন'}
                  </button>
                </div>
              </div>
            `.trim(), {
              maxWidth: 300,
              className: darkMode ? 'dark-mode' : ''
            });
            
            // Store reference to marker for later removal
            disasterMarkers.current.push(sosMarker);
          } catch (error) {
            console.error('Error adding SOS marker:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error adding disaster markers:', error);
    }
  };

  // Find my location button
  const findMyLocation = () => {
    // Check if the browser supports geolocation
    if (!navigator.geolocation) {
      alert(language === 'en' 
        ? 'Geolocation is not supported by your browser' 
        : 'আপনার ব্রাউজার দ্বারা জিওলোকেশন সমর্থিত নয়');
      return;
    }
    
    // Check if map is initialized properly
    if (!mapInstance.current || !mapInstance.current._loaded) {
      alert(language === 'en'
        ? 'Map is not fully loaded. Please try again in a moment.'
        : 'মানচিত্র সম্পূর্ণরূপে লোড হয়নি। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।');
      return;
    }
    
    // Show loading state
    setLoading(true);
    
    // Get current position
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Add a flying animation to the user's location
          if (mapInstance.current && mapInstance.current._loaded) {
            try {
              // Center on user location with smooth animation
              mapInstance.current.flyTo([latitude, longitude], 15, {
                duration: 1.5
              });
            } catch (error) {
              console.error('Error during map flyTo animation:', error);
              // Fallback to simple setView if animation fails
              mapInstance.current.setView([latitude, longitude], 15);
            }
          }
          
          // Remove existing user marker if it exists
          if (userMarker.current) {
            userMarker.current.remove();
          }
          
          // Remove existing user accuracy circle if it exists
          if (userCircle.current) {
            userCircle.current.remove();
          }
          
          // Add user location marker after a small delay to ensure map is ready
          setTimeout(() => {
            try {
              if (mapInstance.current && mapInstance.current._loaded) {
                // Add the user location marker
                userMarker.current = L.marker([latitude, longitude], {
                  icon: userLocationIcon
                }).addTo(mapInstance.current);
                
                // Add accuracy circle if position has accuracy data
                if (position.coords.accuracy) {
                  userCircle.current = L.circle([latitude, longitude], {
                    radius: position.coords.accuracy,
                    fillColor: 'rgba(38, 220, 78, 0.2)',
                    fillOpacity: 0.2,
                    stroke: false
                  }).addTo(mapInstance.current);
                }
              }
            } catch (error) {
              console.error('Error adding user marker:', error);
            }
          }, 500);
          
          // If user is a firefighter, check if the user's location is accurate compared to profile
          if (firefighter && firefighter.latitude && firefighter.longitude) {
            // Calculate distance between profile location and current location
            const profileLocation = L.latLng(firefighter.latitude, firefighter.longitude);
            const currentLocation = L.latLng(latitude, longitude);
            const distance = profileLocation.distanceTo(currentLocation);
            
            // If more than 500 meters different, show notification
            if (distance > 500) {
              alert(language === 'en'
                ? `Your current location is ${distance.toFixed(0)} meters away from your registered location. You might want to update your profile location.`
                : `আপনার বর্তমান অবস্থান আপনার নিবন্ধিত অবস্থান থেকে ${distance.toFixed(0)} মিটার দূরে। আপনি আপনার প্রোফাইল অবস্থান আপডেট করতে পারেন।`);
            }
          }
        } catch (error) {
          console.error('Error in geolocation success handler:', error);
        } finally {
          setLoading(false);
        }
      },
      // Error callback
      (error) => {
        setLoading(false);
        
        console.error('Error getting location:', error);
        
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = language === 'en'
              ? 'Location permission denied. Please enable location services.'
              : 'অবস্থান অনুমতি অস্বীকার করা হয়েছে। অনুগ্রহ করে অবস্থান পরিষেবা সক্ষম করুন।';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = language === 'en'
              ? 'Location information is unavailable.'
              : 'অবস্থান তথ্য অনুপলব্ধ।';
            break;
          case error.TIMEOUT:
            errorMessage = language === 'en'
              ? 'Location request timed out.'
              : 'অবস্থান অনুরোধ সময় শেষ হয়েছে।';
            break;
          case error.UNKNOWN_ERROR:
            errorMessage = language === 'en'
              ? 'An unknown error occurred.'
              : 'একটি অজানা ত্রুটি ঘটেছে।';
            break;
          default:
            errorMessage = language === 'en'
              ? 'Error getting location.'
              : 'অবস্থান পেতে ত্রুটি।';
        }
        
        alert(errorMessage);
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Generate suggestions based on input
    if (value.trim().length > 1) {
      setIsSearching(true);
      
      // Look for matches in common locations and disaster terms
      const locationMatches = commonLocations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase()));
      
      const termMatches = disasterTerms.filter(term => 
        term.toLowerCase().includes(value.toLowerCase()));
      
      // Check for location + disaster term combinations
      const combinedSuggestions = [];
      if (value.includes(' ')) {
        const parts = value.split(' ');
        // Try to match disaster type with location
        if (parts.length >= 2) {
          disasterTerms.forEach(disaster => {
            if (disaster.toLowerCase().includes(parts[0].toLowerCase())) {
              commonLocations.forEach(location => {
                if (location.toLowerCase().includes(parts[1].toLowerCase())) {
                  combinedSuggestions.push(`${disaster} in ${location}`);
                }
              });
            }
          });
        }
      }
      
      // Combine all suggestions and remove duplicates
      const allSuggestions = [
        ...locationMatches,
        ...termMatches,
        ...combinedSuggestions
      ].filter((item, index, self) => 
        self.indexOf(item) === index
      ).slice(0, 5); // Limit to 5 suggestions
      
      setSuggestions(allSuggestions);
      setIsSearching(false);
      
      // If the user has typed enough, also start a real location search
      if (value.trim().length > 2) {
        fetchLocationSuggestions(value);
      }
    } else {
      setSuggestions([]);
    }
  };
  
  // Fetch location suggestions from Nominatim
  const fetchLocationSuggestions = async (query) => {
    try {
      setIsSearching(true);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      // Extract just the display names from results
      if (data && data.length > 0) {
        setSearchResults(data);
      }
      
      setIsSearching(false);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setIsSearching(false);
    }
  };
  
  // Handle suggestion click
  // eslint-disable-next-line no-unused-vars
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    
    // Check if the suggestion is a location+disaster combination
    if (suggestion.includes(' in ')) {
      const [disasterType, location] = suggestion.split(' in ');
      // Set the filter based on disaster type
      const matchedDisaster = disasterTypes.find(type => 
        type.label.toLowerCase().includes(disasterType.toLowerCase()) ||
        disasterType.toLowerCase().includes(type.label.toLowerCase())
      );
      
      if (matchedDisaster) {
        handleFilterSelect(matchedDisaster.id);
      }
      
      // Search for the location
      handleSearch({ preventDefault: () => {} }, location);
    } else {
      // Regular search
      handleSearch({ preventDefault: () => {} });
    }
  };
  
  // Handle search submission
  const handleSearch = async (e, customQuery) => {
    e.preventDefault();
    
    const searchTerm = customQuery || searchQuery;
    
    if (!searchTerm.trim()) return;
    
    try {
      // Show loading state for search
      setIsSearching(true);
      
      // Search for location using OpenStreetMap Nominatim API
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5`);
      const data = await response.json();
      
      // Update search results
      setSearchResults(data);
      setSuggestions([]); // Clear suggestions when we have actual results
    } catch (error) {
      console.error('Error searching for location:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle search result click
  const handleSearchResultClick = async (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // Center map on result
    mapInstance.current.setView([lat, lon], 15);
    
    // Remove existing marker if it exists
    if (locationMarker.current) {
      locationMarker.current.remove();
    }
    
    // Add new marker
    locationMarker.current = L.marker([lat, lon], {
      icon: locationMarkerIcon,
      draggable: true
    }).addTo(mapInstance.current);
    
    // Use the display_name directly from the search result
    if (result.display_name) {
      setLocationName(result.display_name);
      setSearchQuery(result.display_name);
      
      // Get detailed information about the location
      try {
        const detailsResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&extratags=1`);
        // eslint-disable-next-line no-unused-vars
        const locationData = await detailsResponse.json();
        
        // Generate risk assessment data based on location
        // Coastal areas (southern Bangladesh) - higher cyclone risk
        const isCoastal = lat < 23.0 && lon > 89.0;
        
        // Major river basins - higher flood risk
        const isRiverBasin = (
          (lat > 23.5 && lat < 25.5 && lon > 89.0 && lon < 90.5) || // Brahmaputra basin
          (lat > 23.0 && lat < 24.5 && lon > 90.5 && lon < 92.0) || // Meghna basin
          (lat > 22.5 && lat < 24.5 && lon > 88.0 && lon < 89.5)    // Ganges basin
        );
        
        // Hilly areas - higher landslide risk
        const isHilly = lat < 24.0 && lon > 91.5;
        
        // Simulate risk levels (1-10)
        const floodRisk = isRiverBasin ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
        const cycloneRisk = isCoastal ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
        const landslideRisk = isHilly ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 1;
        
        // Get elevation data (simulated)
        const elevation = isHilly ? Math.floor(Math.random() * 300) + 100 : Math.floor(Math.random() * 100);
        
        // Create popup content with location and risk information
        const popupContent = `
          <div class="location-info-popup p-3 max-w-sm">
            <h3 class="font-bold text-lg mb-2">${language === 'en' ? 'Location Information' : 'অবস্থান তথ্য'}</h3>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}:</strong> ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>
            <p class="text-sm mb-2"><strong>${language === 'en' ? 'Address' : 'ঠিকানা'}:</strong> ${result.display_name}</p>
            
            <div class="text-sm mb-2 mt-2 border-t pt-2">
              <strong class="text-blue-600">${language === 'en' ? 'Safety Assessment' : 'নিরাপত্তা মূল্যায়ন'}:</strong><br>
              <div class="grid grid-cols-2 gap-1 mt-1">
                <div>${language === 'en' ? 'Flood Risk' : 'বন্যার ঝুঁকি'}:</div>
                <div class="text-right font-medium ${floodRisk >= 7 ? 'text-red-500' : floodRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${floodRisk}/10</div>
                
                <div>${language === 'en' ? 'Cyclone Risk' : 'ঘূর্ণিঝড়ের ঝুঁকি'}:</div>
                <div class="text-right font-medium ${cycloneRisk >= 7 ? 'text-red-500' : cycloneRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${cycloneRisk}/10</div>
                
                <div>${language === 'en' ? 'Landslide Risk' : 'ভূমিধ্বসের ঝুঁকি'}:</div>
                <div class="text-right font-medium ${landslideRisk >= 7 ? 'text-red-500' : landslideRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${landslideRisk}/10</div>
                
                <div>${language === 'en' ? 'Elevation' : 'উচ্চতা'}:</div>
                <div class="text-right">${elevation} ${language === 'en' ? 'm' : 'মিটার'}</div>
              </div>
            </div>
          </div>
        `;
        
        // Add popup with detailed location information
        locationMarker.current.bindPopup(popupContent, { maxWidth: 300 }).openPopup();
      } catch (error) {
        console.error('Error getting detailed location information:', error);
        // Fallback to basic popup if detailed information fails
      locationMarker.current.bindPopup(`
        <div class="p-2">
          <p class="text-sm font-semibold">${result.display_name}</p>
          <p class="text-xs mt-1">Lat: ${lat.toFixed(6)}, Lng: ${lon.toFixed(6)}</p>
        </div>
      `).openPopup();
      }
    }
    
    // Add drag end event
    locationMarker.current.on('dragend', async function() {
      const newPos = locationMarker.current.getLatLng();
      
      // Get address for new position
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18&addressdetails=1&extratags=1`);
        const data = await response.json();
        if (data.display_name) {
          // Use the full display name directly
          setLocationName(data.display_name);
          
          // Generate risk assessment data based on location
          const isCoastal = newPos.lat < 23.0 && newPos.lng > 89.0;
          const isRiverBasin = (
            (newPos.lat > 23.5 && newPos.lat < 25.5 && newPos.lng > 89.0 && newPos.lng < 90.5) || 
            (newPos.lat > 23.0 && newPos.lat < 24.5 && newPos.lng > 90.5 && newPos.lng < 92.0) || 
            (newPos.lat > 22.5 && newPos.lat < 24.5 && newPos.lng > 88.0 && newPos.lng < 89.5)
          );
          const isHilly = newPos.lat < 24.0 && newPos.lng > 91.5;
          
          const floodRisk = isRiverBasin ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
          const cycloneRisk = isCoastal ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
          // eslint-disable-next-line no-unused-vars
          const landslideRisk = isHilly ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 1;
          const elevation = isHilly ? Math.floor(Math.random() * 300) + 100 : Math.floor(Math.random() * 100);
          
          // Update popup with new location details and risk assessment
          const updatedPopupContent = `
            <div class="location-info-popup p-3 max-w-sm">
              <h3 class="font-bold text-lg mb-2">${language === 'en' ? 'Updated Location' : 'আপডেট করা অবস্থান'}</h3>
              <p class="text-sm mb-1"><strong>${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}:</strong> ${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}</p>
              <p class="text-sm mb-2"><strong>${language === 'en' ? 'Address' : 'ঠিকানা'}:</strong> ${data.display_name}</p>
              
              <div class="text-sm mb-2 mt-2 border-t pt-2">
                <strong class="text-blue-600">${language === 'en' ? 'Safety Assessment' : 'নিরাপত্তা মূল্যায়ন'}:</strong><br>
                <div class="grid grid-cols-2 gap-1 mt-1">
                  <div>${language === 'en' ? 'Flood Risk' : 'বন্যার ঝুঁকি'}:</div>
                  <div class="text-right font-medium ${floodRisk >= 7 ? 'text-red-500' : floodRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${floodRisk}/10</div>
                  
                  <div>${language === 'en' ? 'Cyclone Risk' : 'ঘূর্ণিঝড়ের ঝুঁকি'}:</div>
                  <div class="text-right font-medium ${cycloneRisk >= 7 ? 'text-red-500' : cycloneRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${cycloneRisk}/10</div>
                  
                  <div>${language === 'en' ? 'Elevation' : 'উচ্চতা'}:</div>
                  <div class="text-right">${elevation} ${language === 'en' ? 'm' : 'মিটার'}</div>
            </div>
              </div>
            </div>
          `;
          
          locationMarker.current.setPopupContent(updatedPopupContent);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        setLocationName('Location data unavailable');
      }
    });
    
    // Clear search results
    setSearchResults([]);
  };
  
  // Handle disaster response - called when responding to a disaster alert
  const handleDisasterResponse = (disasterId) => {
    // Navigate to the response page with disaster ID
    window.location.href = `/firefighter/respond?disasterId=${disasterId}`;
  };
    
  // Handle SOS response - called when responding to an SOS alert
  const handleSOSResponse = (sosId) => {
    // Navigate to the SOS response page with SOS ID
    window.location.href = `/firefighter/sos?sosId=${sosId}`;
  };

  // Handle filter selection
  const handleFilterSelect = (typeId) => {
    // Special handling for 'all' type - if already selected, clear all markers
    if (typeId === 'all' && selectedFilter === 'all') {
      setSelectedFilter(null);
      // Just clear markers without showing any disasters
      if (disasterMarkers.current && disasterMarkers.current.length > 0) {
        disasterMarkers.current.forEach(marker => {
          if (marker && marker.remove) {
            try {
              marker.remove();
            } catch (err) {
              console.error('Error removing marker:', err);
            }
          }
        });
        disasterMarkers.current = [];
      }
    }
    // If clicking the currently selected filter (except 'all' which is handled above), deselect it
    else if (selectedFilter === typeId) {
      setSelectedFilter(null);
      showDisastersOnMap(null);
    } else {
      setSelectedFilter(typeId);
      showDisastersOnMap(typeId);
    }
  };

  // Handle clearing the search query
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSuggestions([]);
  };

  // Create icon for legend display
  const createLegendIcon = (disasterType) => {
    let iconSvg = '';
    switch(disasterType) {
      case 'earthquake':
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 18L4 15L7 18L11 13L15 18L18 14L22 18" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 8L7 12L12 5L15 9L20 2" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 22H11L12 17L13 22Z" fill="#EF4444" stroke="#EF4444" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'flood':
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 10L12 4L20 10" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 10V19H18V10" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 13H21" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 16H22" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 19H21" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="9" y="13" width="2" height="2" fill="#3B82F6"/>
          <path d="M13 19V15H15V19" stroke="#3B82F6" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'cyclone':
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12Z" fill="#8B5CF6" stroke="#8B5CF6" stroke-width="0.5"/>
        </svg>`;
        break;
      case 'landslide':
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L20 6" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M6 11L18 11" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M5 16L7 16L12 16L16 16L19 16" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 21L20 21" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M19 6L17 21" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M10 6L12 21" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          <path d="M5 6L7 21" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
        break;
      case 'tsunami':
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 18C2 18 5 14 8 14C11 14 13 18 16 18C19 18 22 14 22 14" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12C2 12 5 8 8 8C11 8 13 12 16 12C19 12 22 8 22 8" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 6C2 6 5 2 8 2C11 2 13 6 16 6C19 6 22 2 22 2" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'fire':
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C16.4183 21 20 17.4183 20 13C20 10 18 7.5 16 6C16 8 15.5 9 14 10C14 7 13 5 11 3C9 5 7 8 7 13C7 17.4183 8.5 21 12 21Z" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      default:
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }
    return iconSvg;
  };

  // Handle zoom in
  const handleZoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.setZoom(mapInstance.current.getZoom() + 1);
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.setZoom(mapInstance.current.getZoom() - 1);
        }
  };
  
  // UI rendering
  return (
    <FirefighterLayout>
      {/* Map container that fills the entire viewport */}
      <div 
        className="w-full h-full absolute inset-0 z-0"
        style={{
          height: '100vh',
          margin: 0,
          padding: 0,
          position: 'fixed', 
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {/* Leaflet map container */}
        <div
          ref={mapRef}
          className="leaflet-container"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            background: darkMode ? '#1f2937' : '#f3f4f6'
          }}
        ></div>
        
        {/* Overlays */}
        {/* Search overlay */}
        <div className="absolute top-4 left-0 right-0 z-30 px-4">
          <div className="flex justify-start items-start">
            {/* Search input field - positioned more to the left */}
            <div className="w-1/5 min-w-[250px] ml-14">
              <div className="relative">
                <div className={`relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-md transition-all ${searchResults.length > 0 ? 'rounded-b-none' : ''}`}>
                  <div className="pl-4 pr-2 text-gray-400 dark:text-gray-500">
                      {isSearching ? (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
                      ) : (
                        <FaSearch className="h-6 w-6" />
                      )}
                    </div>
                    <input
                      type="text"
                    className="w-full py-3.5 px-2 bg-transparent border-none outline-none text-gray-800 dark:text-white text-sm"
                    placeholder={language === 'en' ? 'Search Durjog Prohori Map' : 'দুর্যোগ প্রহরী মানচিত্র অনুসন্ধান করুন'}
                      value={searchQuery}
                      onChange={handleSearchChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                      className="px-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                
                {/* Search results dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 bg-white dark:bg-gray-800 mt-0 rounded-b-lg shadow-lg max-h-60 overflow-y-auto z-50">
                    {searchResults.map((result, index) => (
                      <div
                        key={`${result.place_id || index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                      >
                        <div className="text-gray-400 dark:text-gray-500 mr-3">
                          <FaLocationArrow className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm font-medium dark:text-white">{result.display_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
              
            {/* Horizontal disaster category buttons - aligned with search box */}
              <div className="flex items-center overflow-x-auto scrollbar-hide pr-4 ml-36">
                {disasterTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleFilterSelect(type.id)}
                    className={`flex items-center px-3 py-3 rounded-md text-sm font-medium whitespace-nowrap mr-1.5 category-pill
                      ${selectedFilter === type.id 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 active' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                    style={{ minWidth: type.id === 'all' ? '80px' : '90px' }}
                  >
                    {type.id !== 'all' && (
                      <div 
                        className="w-5 h-5 flex items-center justify-center mr-2 rounded-full"
                        style={{ backgroundColor: type.color + '20', border: `1px solid ${type.color}` }}
                      >
                        <div 
                          dangerouslySetInnerHTML={{ __html: createLegendIcon(type.id) }}
                          style={{ transform: 'scale(0.8)' }}
                        ></div>
                      </div>
                    )}
                    <span className="mx-auto">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
        {/* Map controls (bottom right) - using fixed positioning to stay at bottom */}
        <div className="fixed right-4 bottom-6 z-50 flex flex-col items-center space-y-3">
            {/* Find my location button */}
            <button
              onClick={findMyLocation}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              aria-label={language === 'en' ? 'Find my location' : 'আমার অবস্থান খুঁজুন'}
            >
              <FaLocationArrow className="h-5 w-5" />
            </button>
            
            {/* Zoom in button */}
            <button 
              onClick={handleZoomIn}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={language === 'en' ? 'Zoom in' : 'জুম ইন'}
            >
              <FaPlus className="h-4 w-4" />
            </button>
            
            {/* Zoom out button */}
            <button 
              onClick={handleZoomOut}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={language === 'en' ? 'Zoom out' : 'জুম আউট'}
            >
              <FaMinus className="h-4 w-4" />
            </button>
          </div>
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          )}
      </div>
      
      {/* Add CSS fixes for Leaflet */}
      <style>{`
        .leaflet-container {
          height: 100vh !important;
          width: 100% !important;
          position: absolute !important;
          top: 0 !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .leaflet-bottom {
          bottom: 0 !important;
        }
        
        .leaflet-control-attribution {
          position: absolute !important;
          bottom: 0 !important;
          right: 0 !important;
          margin: 0 !important;
        }
      `}</style>
    </FirefighterLayout>
  );
};

export default FirefighterMap; 