import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNGOAuth } from '../context/NGOAuthContext';
import NGOLayout from '../components/ngo/NGOLayout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationArrow, FaSearch, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

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
        background-color: rgb(22, 163, 74);
        border: 4px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  className: 'custom-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Selected location marker (green pin)
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
        background-color: #16A34A;
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

// Create a generic disaster icon with specified color
// eslint-disable-next-line no-unused-vars
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
        border: 2px solid #B91C1C;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Mountain/hill in green -->
          <path d="M3 20L9 10L15 16L21 8" stroke="#15803D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Trees -->
          <circle cx="7" cy="8" r="1.5" fill="#15803D"/>
          <circle cx="10" cy="6" r="1" fill="#15803D"/>
          <!-- Landslide/falling rocks in red -->
          <path d="M12 12L16 18L20 14" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="14" cy="15" r="1" fill="#B91C1C"/>
          <circle cx="17" cy="17" r="1" fill="#B91C1C"/>
          <!-- Danger zone -->
          <path d="M4 20L20 20" stroke="#B91C1C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
        border: 2px solid #0891B2;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 12C2 12 5.5 9 8 9C10.5 9 11.5 10 14 10C16.5 10 19 7 19 7" stroke="#0891B2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 16C2 16 5.5 13 8 13C10.5 13 11.5 14 14 14C16.5 14 19 11 19 11" stroke="#0891B2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 20C2 20 5.5 17 8 17C10.5 17 11.5 18 14 18C16.5 18 19 15 19 15" stroke="#0891B2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.8807 13.3807 12 12 12C10.6193 12 9.5 10.8807 9.5 9.5Z" stroke="#6B7280" stroke-width="2"/>
          <path d="M5 17H19L16 14L13 16L10 13L5 17Z" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#6B7280" stroke-width="2"/>
        </svg>
      </div>
    </div>
  `,
  className: 'other-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// SOS emergency icon with pulsing animation
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

// Disaster types configuration
const disasterTypes = [
  { id: 'all', label: 'All Types', labelBn: 'সব ধরনের', color: '#6B7280' },
  { id: 'earthquake', label: 'Earthquake', labelBn: 'ভূমিকম্প', color: '#EF4444' },
  { id: 'flood', label: 'Flood', labelBn: 'বন্যা', color: '#3B82F6' },
  { id: 'cyclone', label: 'Cyclone', labelBn: 'ঘূর্ণিঝড়', color: '#8B5CF6' },
  { id: 'landslide', label: 'Landslide', labelBn: 'ভূমিধস', color: '#B91C1C' },
  { id: 'tsunami', label: 'Tsunami', labelBn: 'সুনামি', color: '#0891B2' },
  { id: 'fire', label: 'Fire', labelBn: 'আগুন', color: '#DC2626' },
  { id: 'other', label: 'Other', labelBn: 'অন্যান্য', color: '#6B7280' }
];

const NGOMap = () => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const { ngo } = useNGOAuth();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const userCircle = useRef(null);
  const locationMarker = useRef(null);
  const disasterMarkers = useRef([]);
  
  // State
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  // eslint-disable-next-line no-unused-vars
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [searchResults, setSearchResults] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isSearching, setIsSearching] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [locationName, setLocationName] = useState('');
  const [sosReports, setSosReports] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
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
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map with a slight delay to ensure container is ready
    const timer = setTimeout(() => {
      if (mapRef.current) {
        try {
          // Create map instance
          mapInstance.current = L.map(mapRef.current, {
            center: [23.8103, 90.4125], // Dhaka, Bangladesh
            zoom: 12,
            zoomControl: false,
            attributionControl: false, // Hide attribution to save space
          });
          
          // Add map tiles with custom styling
          // eslint-disable-next-line no-unused-vars
          const mapTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(mapInstance.current);
          
          // Apply custom styling to mimic Google Maps but with NGO green theme
          mapRef.current.style.filter = darkMode ? 'grayscale(20%) brightness(90%)' : 'saturate(95%) hue-rotate(-5deg)';
          
          // Add click handler
          mapInstance.current.on('click', handleMapClick);
          
          // Add global functions for responding to emergencies and SOS calls
          window.respond = (disasterId) => {
            handleDisasterResponse(disasterId);
          };

          window.respondToSOS = (sosId) => {
            handleSOSResponse(sosId);
          };
          
          // Fix Leaflet's viewport calculation issues
          setTimeout(() => {
            if (mapInstance.current) {
              mapInstance.current.invalidateSize();
              
              // Display markers after initialization is complete
              if (disasters.length > 0) {
                showDisastersOnMap(selectedFilter);
              }
            }
          }, 100);
        } catch (err) {
          console.error('Error initializing map:', err);
        }
      }
    }, 300);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.off('click', handleMapClick);
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      delete window.respond;
      delete window.respondToSOS;
    };
  }, []);

  // Recalculate map size when container dimensions might change
  useEffect(() => {
    const handleResize = () => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial invalidateSize after component mounts
    const timer = setTimeout(() => {
      handleResize();
    }, 500);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
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

  // Fetch disaster data when component mounts
  useEffect(() => {
    fetchDisastersData();
    
    // Set up periodic refresh every 3 minutes
    const refreshInterval = setInterval(() => {
      fetchDisastersData();
    }, 180000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Fetch disasters data
  const fetchDisastersData = async () => {
    try {
      setLoading(true);
      const allDisasters = [];

      // Fetch earthquake data (special collection name)
      try {
        const response = await axios.get('/api/disasters/mongodb/earthquakes');
        const data = response.data.data.map(item => ({
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
        allDisasters.push(...data);
      } catch (err) {
        console.error('Error fetching earthquakes:', err);
      }

      // Fetch all other disaster types from MongoDB using consistent naming
      const disasterTypes = [
        { type: 'flood', collection: 'disasterflood' },
        { type: 'landslide', collection: 'disasterlandslide' },
        { type: 'tsunami', collection: 'disastertsunami' },
        { type: 'fire', collection: 'disasterfire' },
        { type: 'cyclone', collection: 'disastercyclone' },
        { type: 'other', collection: 'disasterother' }
      ];

      // Fetch each disaster type
      for (const { type, collection } of disasterTypes) {
        try {
          const response = await axios.get(`/api/disasters/mongodb/${collection}`);
          if (response.data && response.data.data) {
            const typeData = response.data.data.map(item => ({
              _id: item._id,
              type: type,
              name: item.name || type.charAt(0).toUpperCase() + type.slice(1),
              location: item.location || "Unknown Location",
              latitude: item.latitude,
              longitude: item.longitude,
              dangerLevel: item.dangerLevel || 'Medium',
              dateTime: item.dateTime || item.createdAt,
              description: item.description,
              visible: item.visible
            }));
            allDisasters.push(...typeData);
          }
        } catch (err) {
          console.error(`Error fetching ${type} disasters:`, err);
        }
      }

      // Also fetch SOS reports to display on map
      try {
        const sosResponse = await axios.get('/api/sos/reports');
        if (sosResponse.data?.data) {
          setSosReports(sosResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching SOS reports:', err);
        // If no SOS reports found, at least prevent application from crashing
        setSosReports([]);
      }
      
      // Filter disasters with valid coordinates and ensure visibility
      const validDisasters = allDisasters.filter(d => {
        return d.latitude && d.longitude && 
               !isNaN(parseFloat(d.latitude)) && 
               !isNaN(parseFloat(d.longitude)) &&
               (d.visible === true || d.visible === 1 || d.visible === undefined);
      });
      
      console.log(`Fetched ${validDisasters.length} valid disasters out of ${allDisasters.length} total`);
      
      // Update state with fetched disasters
      setDisasters(validDisasters);
      
      // Show disasters on map after data is loaded
      if (mapInstance.current) {
        setTimeout(() => {
          showDisastersOnMap(selectedFilter);
        }, 100);
      }
    } catch (err) {
      console.error('Error in fetchDisastersData:', err);
      setError(err.message || 'Error fetching disaster data');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle map click
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    
    // Remove existing marker if it exists
    if (locationMarker.current) {
      locationMarker.current.remove();
    }
    
    // Add new marker
    locationMarker.current = L.marker([lat, lng], {
      icon: locationMarkerIcon,
      draggable: true
    }).addTo(mapInstance.current);
    
    // Get address for clicked location
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`);
      const data = await response.json();
      if (data.display_name) {
        // Use the full display name directly
        setLocationName(data.display_name);
        
        // Generate risk assessment data based on location
        // Coastal areas - higher cyclone risk
        const isCoastal = lat < 23.0 && lng > 89.0;
        
        // Major river basins - higher flood risk
        const isRiverBasin = (
          (lat > 23.5 && lat < 25.5 && lng > 89.0 && lng < 90.5) || // Brahmaputra basin
          (lat > 23.0 && lat < 24.5 && lng > 90.5 && lng < 92.0) || // Meghna basin
          (lat > 22.5 && lat < 24.5 && lng > 88.0 && lng < 89.5)    // Ganges basin
        );
        
        // Hilly areas - higher landslide risk
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
        
        // Get elevation data (simulated)
        const elevation = isHilly ? Math.floor(Math.random() * 300) + 100 : Math.floor(Math.random() * 100);
        
        // Overall risk score (1-10)
        const overallRisk = Math.round((floodRisk + cycloneRisk + landslideRisk + fireRisk) / 4);
        
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
            <strong class="text-green-600">${language === 'en' ? 'Risk Assessment' : 'ঝুঁকি মূল্যায়ন'}:</strong><br>
            <div class="grid grid-cols-2 gap-1 mt-1">
              <div>${language === 'en' ? 'Flood Risk' : 'বন্যার ঝুঁকি'}:</div>
              <div class="text-right font-medium ${floodRisk >= 7 ? 'text-red-500' : floodRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${floodRisk}/10</div>
              
              <div>${language === 'en' ? 'Cyclone Risk' : 'ঘূর্ণিঝড়ের ঝুঁকি'}:</div>
              <div class="text-right font-medium ${cycloneRisk >= 7 ? 'text-red-500' : cycloneRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${cycloneRisk}/10</div>
              
              <div>${language === 'en' ? 'Landslide Risk' : 'ভূমিধসের ঝুঁকি'}:</div>
              <div class="text-right font-medium ${landslideRisk >= 7 ? 'text-red-500' : landslideRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${landslideRisk}/10</div>
              
              <div>${language === 'en' ? 'Fire Risk' : 'আগুনের ঝুঁকি'}:</div>
              <div class="text-right font-medium ${fireRisk >= 7 ? 'text-red-500' : fireRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${fireRisk}/10</div>
              
              <div>${language === 'en' ? 'Overall Risk' : 'সামগ্রিক ঝুঁকি'}:</div>
              <div class="text-right font-medium ${overallRisk >= 7 ? 'text-red-500' : overallRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${overallRisk}/10</div>
              
              <div>${language === 'en' ? 'Elevation' : 'উচ্চতা'}:</div>
              <div class="text-right">${elevation} ${language === 'en' ? 'm' : 'মিটার'}</div>
            </div>
          </div>
        `;
        
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
        
        // Add NGO specific action buttons
        popupContent += `
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button class="analyze-area-btn bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded text-sm">
              ${language === 'en' ? 'Analyze Area' : 'এলাকা বিশ্লেষণ করুন'}
            </button>
            <button class="deploy-teams-btn bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 rounded text-sm">
              ${language === 'en' ? 'Deploy Teams' : 'টিম মোতায়েন করুন'}
            </button>
          </div>
        `;
        
        popupContent += `</div>`;
        
        // Bind popup to marker and open it
        locationMarker.current.bindPopup(popupContent, {
          maxWidth: 350,
          className: 'location-details-popup'
        }).openPopup();
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocationName('Location data unavailable');
      
      // Add simple popup with just coordinates if reverse geocoding fails
      locationMarker.current.bindPopup(`
        <div class="p-3">
          <h3 class="font-bold mb-2">${language === 'en' ? 'Location' : 'অবস্থান'}</h3>
          <p class="text-sm">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        </div>
      `).openPopup();
    }
    
    // Add drag end event
    locationMarker.current.on('dragend', async function() {
      const newPos = locationMarker.current.getLatLng();
      
      // Get address for new position
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18`);
        const data = await response.json();
        if (data.display_name) {
          // Use the full display name directly
          setLocationName(data.display_name);
          
          // Update popup with new location details
          locationMarker.current.bindPopup(`
            <div class="p-2">
              <p class="text-sm font-semibold">${data.display_name}</p>
              <p class="text-xs mt-1">Lat: ${newPos.lat.toFixed(6)}, Lng: ${newPos.lng.toFixed(6)}</p>
            </div>
          `).openPopup();
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        setLocationName('Location data unavailable');
      }
    });
  };
  
  // Find my location
  const findMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (userMarker.current) {
            userMarker.current.remove();
          }
          if (userCircle.current) {
            userCircle.current.remove();
          }
          
          userMarker.current = L.marker([latitude, longitude], {
            icon: userLocationIcon
          }).addTo(mapInstance.current);
          
          userCircle.current = L.circle([latitude, longitude], {
            radius: 1000,
            color: 'rgb(22, 163, 74)',
            fillColor: 'rgba(22, 163, 74, 0.1)',
            fillOpacity: 0.1
          }).addTo(mapInstance.current);
          
          mapInstance.current.setView([latitude, longitude], 13);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // If search value is too short, don't search
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    
    // Set a new timeout to prevent excessive API calls while typing
    const timeoutId = setTimeout(async () => {
      try {
        // Query Nominatim API for location suggestions
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=8&countrycodes=bd`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        
        const data = await response.json();
        
        // Process the API response
        if (data && Array.isArray(data)) {
          // Extract unique location names from results
          const locationResults = data.map(item => ({
            name: item.display_name,
            lat: item.lat,
            lon: item.lon
          }));
          
          // Also include common locations that match
          const matchingCommonLocations = commonLocations
            .filter(loc => loc.toLowerCase().includes(value.toLowerCase()))
            .map(name => ({ name, isCommon: true }));
          
          // Combine API results with common locations, remove duplicates
          const combinedResults = [...locationResults];
          
          // Add common locations that aren't already in API results
          matchingCommonLocations.forEach(commonLoc => {
            if (!combinedResults.some(r => r.name.includes(commonLoc.name))) {
              combinedResults.push(commonLoc);
            }
          });
          
          // Limit total suggestions
          setSuggestions(combinedResults.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        // Fallback to common locations if API fails
        const filtered = commonLocations.filter(location =>
          location.toLowerCase().includes(value.toLowerCase())
        ).map(name => ({ name, isCommon: true }));
        setSuggestions(filtered);
      }
    }, 500); // 500ms delay before sending API request
    
    setTypingTimeout(timeoutId);
  };
  
  // Search for a location and show it on the map
  const searchLocation = async (locationInfo) => {
    try {
      setIsSearching(true);
      let lat, lon, displayName;
      
      // If we have coordinates directly from suggestion, use them
      if (locationInfo.lat && locationInfo.lon) {
        lat = locationInfo.lat;
        lon = locationInfo.lon;
        displayName = locationInfo.name;
      } 
      // Otherwise, geocode the location name
      else {
        // Use Nominatim to geocode the location
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInfo.name)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          lat = data[0].lat;
          lon = data[0].lon;
          displayName = data[0].display_name;
        } else {
          console.log('Location not found');
          setIsSearching(false);
          return;
        }
      }
      
      // Move map to the location
      mapInstance.current.setView([lat, lon], 14);
      
      // Create a marker for the searched location
      if (locationMarker.current) {
        locationMarker.current.remove();
      }
      
      locationMarker.current = L.marker([lat, lon], {
        icon: locationMarkerIcon,
        draggable: true
      }).addTo(mapInstance.current);
      
      // Get additional data for this location
      try {
        const detailsResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&extratags=1`);
        const data = await detailsResponse.json();
        
        // Generate risk assessment data based on location
        // Coastal areas - higher cyclone risk
        const isCoastal = lat < 23.0 && lon > 89.0;
        
        // Major river basins - higher flood risk
        const isRiverBasin = (
          (lat > 23.5 && lat < 25.5 && lon > 89.0 && lon < 90.5) || // Brahmaputra basin
          (lat > 23.0 && lat < 24.5 && lon > 90.5 && lon < 92.0) || // Meghna basin
          (lat > 22.5 && lat < 24.5 && lon > 88.0 && lon < 89.5)    // Ganges basin
        );
        
        // Hilly areas - higher landslide risk
        const isHilly = lat < 24.0 && lon > 91.5;
        
        // Urban areas - higher fire risk
        const isUrban = (
          (lat > 23.7 && lat < 23.9 && lon > 90.3 && lon < 90.5) || // Dhaka
          (lat > 22.3 && lat < 22.4 && lon > 91.7 && lon < 91.9) || // Chittagong
          (lat > 22.8 && lat < 22.9 && lon > 89.5 && lon < 89.6)    // Khulna
        );
        
        // Simulate risk levels (1-10)
        const floodRisk = isRiverBasin ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
        const cycloneRisk = isCoastal ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
        const landslideRisk = isHilly ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 1;
        const fireRisk = isUrban ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 4) + 1;
        
        // Get elevation data (simulated)
        const elevation = isHilly ? Math.floor(Math.random() * 300) + 100 : Math.floor(Math.random() * 100);
        
        // Overall risk score (1-10)
        const overallRisk = Math.round((floodRisk + cycloneRisk + landslideRisk + fireRisk) / 4);
        
        // Create popup content with location and risk information
        let popupContent = `
          <div class="location-info-popup p-3 max-w-sm">
            <h3 class="font-bold text-lg mb-2">${language === 'en' ? 'Location Information' : 'অবস্থান তথ্য'}</h3>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}:</strong> ${lat}, ${lon}</p>
            <p class="text-sm mb-2"><strong>${language === 'en' ? 'Address' : 'ঠিকানা'}:</strong> ${displayName}</p>
        `;
        
        // Add address details if available
        if (data && data.address) {
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
            <strong class="text-green-600">${language === 'en' ? 'Risk Assessment' : 'ঝুঁকি মূল্যায়ন'}:</strong><br>
            <div class="grid grid-cols-2 gap-1 mt-1">
              <div>${language === 'en' ? 'Flood Risk' : 'বন্যার ঝুঁকি'}:</div>
              <div class="text-right font-medium ${floodRisk >= 7 ? 'text-red-500' : floodRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${floodRisk}/10</div>
              
              <div>${language === 'en' ? 'Cyclone Risk' : 'ঘূর্ণিঝড়ের ঝুঁকি'}:</div>
              <div class="text-right font-medium ${cycloneRisk >= 7 ? 'text-red-500' : cycloneRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${cycloneRisk}/10</div>
              
              <div>${language === 'en' ? 'Landslide Risk' : 'ভূমিধসের ঝুঁকি'}:</div>
              <div class="text-right font-medium ${landslideRisk >= 7 ? 'text-red-500' : landslideRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${landslideRisk}/10</div>
              
              <div>${language === 'en' ? 'Fire Risk' : 'আগুনের ঝুঁকি'}:</div>
              <div class="text-right font-medium ${fireRisk >= 7 ? 'text-red-500' : fireRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${fireRisk}/10</div>
              
              <div>${language === 'en' ? 'Overall Risk' : 'সামগ্রিক ঝুঁকি'}:</div>
              <div class="text-right font-medium ${overallRisk >= 7 ? 'text-red-500' : overallRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${overallRisk}/10</div>
              
              <div>${language === 'en' ? 'Elevation' : 'উচ্চতা'}:</div>
              <div class="text-right">${elevation} ${language === 'en' ? 'm' : 'মিটার'}</div>
            </div>
          </div>
        `;
        
        // Add any available extra tags
        if (data && data.extratags) {
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
        
        // Add NGO specific action buttons
        popupContent += `
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button class="analyze-area-btn bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded text-sm">
              ${language === 'en' ? 'Analyze Area' : 'এলাকা বিশ্লেষণ করুন'}
            </button>
            <button class="deploy-teams-btn bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 rounded text-sm">
              ${language === 'en' ? 'Deploy Teams' : 'টিম মোতায়েন করুন'}
            </button>
          </div>
        `;
        
        popupContent += `</div>`;
        
        // Bind popup to marker and open it
        locationMarker.current.bindPopup(popupContent, {
          maxWidth: 350,
          className: 'location-details-popup'
        }).openPopup();
        
      } catch (error) {
        console.error('Error getting detailed location information:', error);
        
        // Fallback to simple popup if detailed information fails
        locationMarker.current.bindPopup(`
          <div class="p-3">
            <h3 class="font-bold mb-2">${language === 'en' ? 'Location' : 'অবস্থান'}</h3>
            <p class="text-sm mb-1">${displayName}</p>
            <p class="text-sm">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${lat}, ${lon}</p>
          </div>
        `).openPopup();
      }
      
      // Add drag end event handler
      locationMarker.current.on('dragend', async function() {
        const newPos = locationMarker.current.getLatLng();
        
        // Get address for new position
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18&addressdetails=1&extratags=1`);
          const data = await response.json();
          if (data.display_name) {
            setLocationName(data.display_name);
            
            // Generate risk assessment data based on location
            // Coastal areas - higher cyclone risk
            const isCoastal = newPos.lat < 23.0 && newPos.lng > 89.0;
            
            // Major river basins - higher flood risk
            const isRiverBasin = (
              (newPos.lat > 23.5 && newPos.lat < 25.5 && newPos.lng > 89.0 && newPos.lng < 90.5) || // Brahmaputra basin
              (newPos.lat > 23.0 && newPos.lat < 24.5 && newPos.lng > 90.5 && newPos.lng < 92.0) || // Meghna basin
              (newPos.lat > 22.5 && newPos.lat < 24.5 && newPos.lng > 88.0 && newPos.lng < 89.5)    // Ganges basin
            );
            
            // Hilly areas - higher landslide risk
            const isHilly = newPos.lat < 24.0 && newPos.lng > 91.5;
            
            // Urban areas - higher fire risk
            const isUrban = (
              (newPos.lat > 23.7 && newPos.lat < 23.9 && newPos.lng > 90.3 && newPos.lng < 90.5) || // Dhaka
              (newPos.lat > 22.3 && newPos.lat < 22.4 && newPos.lng > 91.7 && newPos.lng < 91.9) || // Chittagong
              (newPos.lat > 22.8 && newPos.lat < 22.9 && newPos.lng > 89.5 && newPos.lng < 89.6)    // Khulna
            );
            
            // Simulate risk levels (1-10)
            const floodRisk = isRiverBasin ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
            const cycloneRisk = isCoastal ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
            const landslideRisk = isHilly ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 1;
            const fireRisk = isUrban ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 4) + 1;
            
            // Get elevation data (simulated)
            const elevation = isHilly ? Math.floor(Math.random() * 300) + 100 : Math.floor(Math.random() * 100);
            
            // Overall risk score (1-10)
            const overallRisk = Math.round((floodRisk + cycloneRisk + landslideRisk + fireRisk) / 4);
            
            // Create popup content with location and risk information
            let popupContent = `
              <div class="location-info-popup p-3 max-w-sm">
                <h3 class="font-bold text-lg mb-2">${language === 'en' ? 'Updated Location' : 'আপডেট করা অবস্থান'}</h3>
                <p class="text-sm mb-1"><strong>${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}:</strong> ${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}</p>
                <p class="text-sm mb-2"><strong>${language === 'en' ? 'Address' : 'ঠিকানা'}:</strong> ${data.display_name}</p>
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
                <strong class="text-green-600">${language === 'en' ? 'Risk Assessment' : 'ঝুঁকি মূল্যায়ন'}:</strong><br>
                <div class="grid grid-cols-2 gap-1 mt-1">
                  <div>${language === 'en' ? 'Flood Risk' : 'বন্যার ঝুঁকি'}:</div>
                  <div class="text-right font-medium ${floodRisk >= 7 ? 'text-red-500' : floodRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${floodRisk}/10</div>
                  
                  <div>${language === 'en' ? 'Cyclone Risk' : 'ঘূর্ণিঝড়ের ঝুঁকি'}:</div>
                  <div class="text-right font-medium ${cycloneRisk >= 7 ? 'text-red-500' : cycloneRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${cycloneRisk}/10</div>
                  
                  <div>${language === 'en' ? 'Landslide Risk' : 'ভূমিধসের ঝুঁকি'}:</div>
                  <div class="text-right font-medium ${landslideRisk >= 7 ? 'text-red-500' : landslideRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${landslideRisk}/10</div>
                  
                  <div>${language === 'en' ? 'Fire Risk' : 'আগুনের ঝুঁকি'}:</div>
                  <div class="text-right font-medium ${fireRisk >= 7 ? 'text-red-500' : fireRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${fireRisk}/10</div>
                  
                  <div>${language === 'en' ? 'Overall Risk' : 'সামগ্রিক ঝুঁকি'}:</div>
                  <div class="text-right font-medium ${overallRisk >= 7 ? 'text-red-500' : overallRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${overallRisk}/10</div>
                  
                  <div>${language === 'en' ? 'Elevation' : 'উচ্চতা'}:</div>
                  <div class="text-right">${elevation} ${language === 'en' ? 'm' : 'মিটার'}</div>
                </div>
              </div>
            `;
            
            // Add NGO specific action buttons
            popupContent += `
              <div class="mt-3 grid grid-cols-2 gap-2">
                <button class="analyze-area-btn bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded text-sm">
                  ${language === 'en' ? 'Analyze Area' : 'এলাকা বিশ্লেষণ করুন'}
                </button>
                <button class="deploy-teams-btn bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 rounded text-sm">
                  ${language === 'en' ? 'Deploy Teams' : 'টিম মোতায়েন করুন'}
                </button>
              </div>
            `;
            
            popupContent += `</div>`;
            
            // Bind popup to marker and open it
            locationMarker.current.bindPopup(popupContent, {
              maxWidth: 350,
              className: 'location-details-popup'
            }).openPopup();
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setLocationName('Location data unavailable');
          
          // Add simple popup with just coordinates if reverse geocoding fails
          locationMarker.current.bindPopup(`
            <div class="p-3">
              <h3 class="font-bold mb-2">${language === 'en' ? 'Location' : 'অবস্থান'}</h3>
              <p class="text-sm">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}</p>
            </div>
          `).openPopup();
        }
      });
    } catch (error) {
      console.error('Error searching for location:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setSearchResults([]);
  };
  
  // Filter disasters by type
  const handleFilterSelect = (type) => {
    setSelectedFilter(type);
    showDisastersOnMap(type);
  };

  // Show disasters on map based on filter
  const showDisastersOnMap = (filterType) => {
    if (!mapInstance.current) return;
    
    // Clear previous markers
    disasterMarkers.current.forEach(marker => {
      if (marker) {
        marker.remove();
      }
    });
    disasterMarkers.current = [];
    
    // Filter disasters based on selected type
    let filteredDisasters = filterType === 'all' 
      ? disasters 
      : disasters.filter(d => d.type === filterType);
    
    console.log(`Displaying ${filteredDisasters.length} disasters on map for filter: ${filterType}`);
    
    // Add markers for each disaster
    filteredDisasters.forEach(disaster => {
      try {
        const lat = parseFloat(disaster.latitude);
        const lng = parseFloat(disaster.longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Invalid coordinates for disaster ${disaster._id}`);
          return;
        }
        
        // Skip if somehow an invisible disaster made it through the initial filter
        if (!(disaster.visible === true || disaster.visible === 1 || disaster.visible === undefined)) {
          return;
        }
        
        // eslint-disable-next-line no-unused-vars
        const disasterType = disasterTypes.find(t => t.id === disaster.type) || disasterTypes[0];
        
        // Choose icon based on disaster type
        let icon;
        switch (disaster.type) {
          case 'flood':
            icon = floodIcon;
            break;
          case 'earthquake':
            icon = earthquakeIcon;
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
          default:
            icon = otherIcon;
        }
        
        // Create marker
        const marker = L.marker([lat, lng], { icon }).addTo(mapInstance.current);
        
        // Popup content
        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold">${disaster.name}</h3>
            <p class="text-sm">${disaster.location}</p>
            <p class="text-xs my-1">${language === 'en' ? 'Type' : 'ধরন'}: ${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}</p>
            <p class="text-xs my-1">${language === 'en' ? 'Danger Level' : 'বিপদ স্তর'}: ${disaster.dangerLevel}</p>
            <p class="text-xs my-1">${language === 'en' ? 'Date' : 'তারিখ'}: ${new Date(disaster.dateTime).toLocaleString()}</p>
            ${disaster.description ? `<p class="text-xs my-1">${disaster.description}</p>` : ''}
            <button 
              class="mt-2 bg-green-600 text-white text-xs px-2 py-1 rounded" 
              onclick="respond('${disaster._id}')"
            >
              ${language === 'en' ? 'Respond to Emergency' : 'জরুরী অবস্থায় সাড়া দিন'}
            </button>
          </div>
        `;
        
        // Add popup to marker
        marker.bindPopup(popupContent);
        
        // Store marker reference
        disasterMarkers.current.push(marker);
      } catch (err) {
        console.error(`Error creating marker for disaster ${disaster._id}:`, err);
      }
    });
    
    // Add SOS markers
    sosReports.forEach(sos => {
      try {
        const lat = parseFloat(sos.latitude);
        const lng = parseFloat(sos.longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid SOS coordinates');
          return;
        }
        
        const marker = L.marker([lat, lng], { icon: sosIcon }).addTo(mapInstance.current);
        
        // Popup content for SOS
        const sosPopupContent = `
          <div class="p-2">
            <h3 class="font-bold text-red-600">${language === 'en' ? 'SOS EMERGENCY' : 'এসওএস জরুরি'}</h3>
            <p class="text-sm">${sos.location || 'Unknown location'}</p>
            <p class="text-xs my-1">${language === 'en' ? 'Reported by' : 'রিপোর্ট করেছেন'}: ${sos.name || sos.userName || 'Anonymous'}</p>
            <p class="text-xs my-1">${language === 'en' ? 'Phone' : 'ফোন'}: ${sos.phoneNumber || sos.phone || 'Not provided'}</p>
            <p class="text-xs my-1">${language === 'en' ? 'Time' : 'সময়'}: ${new Date(sos.createdAt || Date.now()).toLocaleString()}</p>
            ${sos.message ? `<p class="text-xs my-1">${language === 'en' ? 'Message' : 'বার্তা'}: ${sos.message}</p>` : ''}
            <button 
              class="mt-2 bg-red-600 text-white text-xs px-2 py-1 rounded" 
              onclick="respondToSOS('${sos._id}')"
            >
              ${language === 'en' ? 'Respond to SOS' : 'এসওএসে সাড়া দিন'}
            </button>
          </div>
        `;
        marker.bindPopup(sosPopupContent);
        
        // Store marker reference
        disasterMarkers.current.push(marker);
      } catch (err) {
        console.error(`Error creating marker for SOS:`, err);
      }
    });
  };
  
  // Handle disaster response
  const handleDisasterResponse = async (disasterId) => {
    try {
      if (!ngo || !ngo._id) {
        alert(language === 'en' ? 'You need to be logged in as an NGO to respond' : 'সাড়া দিতে আপনাকে একটি এনজিও হিসাবে লগইন করতে হবে');
        return;
      }
      
      // Send response to server
      await axios.post(`${API_BASE_URL}/ngo/respond-disaster`, {
        ngoId: ngo._id,
        disasterId: disasterId
      });
      
      alert(language === 'en' ? 'Response submitted successfully!' : 'সাড়া সফলভাবে জমা হয়েছে!');
    } catch (err) {
      console.error('Error submitting response:', err);
      alert(language === 'en' ? 'Failed to submit response. Please try again.' : 'সাড়া জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  };
  
  // Handle SOS response
  const handleSOSResponse = async (sosId) => {
    try {
      if (!ngo || !ngo._id) {
        alert(language === 'en' ? 'You need to be logged in as an NGO to respond' : 'সাড়া দিতে আপনাকে একটি এনজিও হিসাবে লগইন করতে হবে');
        return;
      }
      
      // Send response to server
      await axios.post(`${API_BASE_URL}/ngo/respond-sos`, {
        ngoId: ngo._id,
        sosId: sosId
      });
      
      alert(language === 'en' ? 'SOS response submitted!' : 'এসওএস সাড়া জমা হয়েছে!');
    } catch (err) {
      console.error('Error submitting SOS response:', err);
      alert(language === 'en' ? 'Failed to submit SOS response. Please try again.' : 'এসওএস সাড়া জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  // Create SVG icons for disaster type buttons
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
          <path d="M3 20L9 10L15 16L21 8" stroke="#15803D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="7" cy="8" r="1.5" fill="#15803D"/>
          <circle cx="10" cy="6" r="1" fill="#15803D"/>
          <path d="M12 12L16 18L20 14" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="14" cy="15" r="1" fill="#B91C1C"/>
          <circle cx="17" cy="17" r="1" fill="#B91C1C"/>
          <path d="M4 20L20 20" stroke="#B91C1C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'tsunami':
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 18H22" stroke="#0369A1" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M2 10C3 10 4 12 6 12C8 12 8 10 10 10C12 10 12 12 14 12C16 12 16 10 18 10C20 10 21 12 22 12" 
            stroke="#0369A1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 14C3 14 4 15 6 15C8 15 8 14 10 14C12 14 12 15 14 15C16 15 16 14 18 14C20 14 21 15 22 15"
            stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 18C15 16 16 15 18 15C20 15 21 16 21 18" 
            fill="#15803D" stroke="#15803D" stroke-width="1"/>
          <path d="M12 8C12 6 14 4 16 4C18 4 20 6 20 8" 
            stroke="#15803D" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M18 15L17 12" stroke="#15803D" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="17" cy="11" r="1" fill="#15803D"/>
        </svg>`;
        break;
      case 'fire':
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C7.5 21 4 17.5 4 13C4 10 6 6.5 9 5C9 8 12 9.5 14 10C14 7 16 5 18 4C18 7 19 10 19.5 12.5C20 15 20 17 19 19C18 20.5 15.5 21 12 21Z" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 21C10 21 8.5 19.5 8.5 17.5C8.5 16 9.5 14.5 11 14C11 16 12.5 16.5 13.5 16.5C13.5 15 14.5 14 16 13.5C16 15.5 16.5 18 15.5 19.5C14.5 21 13.5 21 12 21Z" fill="#DC2626" stroke="#DC2626" stroke-width="0.5" stroke-linejoin="round"/>
        </svg>`;
        break;
      default:
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }

    return iconSvg;
  };

  return (
    <NGOLayout>
      <div className="fixed inset-0 overflow-hidden z-10">
        {/* Map container - Full height and width, no scroll */}
        <div className="absolute inset-0">
          {/* Map div */}
          <div 
            ref={mapRef} 
            className="w-full h-full z-0" 
            style={{ 
              touchAction: 'none',
              msContentZooming: 'none',
              cursor: 'grab',
              minHeight: '400px',
              position: 'relative',
              display: 'block'
            }}
          />
          
          {/* Google-style search bar with horizontal disaster buttons */}
          <div className="absolute top-4 left-24 right-4 z-20">
            <div className="flex items-start space-x-20">
              {/* Search Bar */}
              <div className="w-80">
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-xl overflow-hidden google-search-bar h-10">
                  <div className="p-2.5 text-gray-500 dark:text-gray-300">
                    <FaSearch className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    className="flex-1 py-2 pr-3 bg-transparent border-none focus:outline-none dark:text-white text-sm"
                    placeholder={language === 'en' ? "Search Durjog Prohori Map" : "দুর্যোগ প্রহরী মানচিত্র অনুসন্ধান করুন"}
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="p-2.5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                    >
                      <FaTimes className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                
                {/* Search suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute z-30 w-80 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-auto border border-gray-200 dark:border-gray-700">
                    <div className="py-1.5 px-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'en' ? 'Suggestions' : 'পরামর্শ'}
                      </p>
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                        onClick={() => {
                          setSearchQuery(suggestion.name);
                          setSuggestions([]);
                          searchLocation(suggestion);
                        }}
                      >
                        <div className="text-gray-400 dark:text-gray-500 mr-3">
                          <FaSearch className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm font-medium dark:text-white">{suggestion.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Horizontal disaster category buttons */}
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {disasterTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleFilterSelect(type.id)}
                    className={`flex items-center px-3 py-2.5 rounded-full text-xs font-medium whitespace-nowrap mr-2 category-pill
                      ${selectedFilter === type.id 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border border-green-300 dark:border-green-700 active' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                    style={{ minWidth: type.id === 'all' ? '90px' : '100px' }}
                  >
                    {type.id !== 'all' && (
                      <div 
                        className="w-3.5 h-3.5 flex items-center justify-center mr-1 rounded-full"
                        style={{ backgroundColor: type.color + '20', border: `1px solid ${type.color}` }}
                      >
                        <div 
                          dangerouslySetInnerHTML={{ __html: createLegendIcon(type.id) }}
                          style={{ transform: 'scale(0.5)' }}
                        ></div>
                      </div>
                    )}
                    <span className="mx-auto">{language === 'en' ? type.label : type.labelBn}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Map controls (bottom right) */}
          <div className="absolute right-4 bottom-8 z-20 flex flex-col items-center space-y-2">
            {/* Find my location button */}
            <button
              onClick={findMyLocation}
              className="bg-white dark:bg-gray-800 shadow-lg w-10 h-10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              aria-label={language === 'en' ? 'Find my location' : 'আমার অবস্থান খুঁজুন'}
            >
              <FaLocationArrow className="h-4 w-4" />
            </button>
            
            {/* Zoom in button */}
            <button
              onClick={() => mapInstance.current && mapInstance.current.zoomIn()}
              className="bg-white dark:bg-gray-800 shadow-lg w-10 h-10 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={language === 'en' ? 'Zoom in' : 'জুম ইন'}
            >
              <FaPlus className="h-3.5 w-3.5" />
            </button>
            
            {/* Zoom out button */}
            <button
              onClick={() => mapInstance.current && mapInstance.current.zoomOut()}
              className="bg-white dark:bg-gray-800 shadow-lg w-10 h-10 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={language === 'en' ? 'Zoom out' : 'জুম আউট'}
            >
              <FaMinus className="h-3.5 w-3.5" />
            </button>
          </div>
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="absolute top-16 left-0 right-0 mx-auto w-full max-w-md px-4 z-20">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
                <p>{error}</p>
                <button 
                  className="mt-2 bg-red-500 text-white px-4 py-1 rounded text-sm"
                  onClick={() => {
                    setError(null);
                    fetchDisastersData();
                  }}
                >
                  {language === 'en' ? 'Retry' : 'পুনরায় চেষ্টা করুন'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </NGOLayout>
  );
};

export default NGOMap; 