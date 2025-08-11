import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import AuthorityLayout from '../components/authority/AuthorityLayout';
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
        border: 2px solid #0369A1;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Ocean base -->
          <path d="M2 18H22" stroke="#0369A1" stroke-width="2.5" stroke-linecap="round"/>
          
          <!-- Main tsunami wave - blue -->
          <path d="M2 10C3 10 4 12 6 12C8 12 8 10 10 10C12 10 12 12 14 12C16 12 16 10 18 10C20 10 21 12 22 12" 
            stroke="#0369A1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          
          <!-- Smaller waves - blue -->
          <path d="M2 14C3 14 4 15 6 15C8 15 8 14 10 14C12 14 12 15 14 15C16 15 16 14 18 14C20 14 21 15 22 15"
            stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          
          <!-- Land/shore - green -->
          <path d="M15 18C15 16 16 15 18 15C20 15 21 16 21 18" 
            fill="#15803D" stroke="#15803D" stroke-width="1"/>
          
          <!-- Impact indicator - green -->
          <path d="M12 8C12 6 14 4 16 4C18 4 20 6 20 8" 
            stroke="#15803D" stroke-width="1.5" stroke-linecap="round"/>
          
          <!-- Palm tree on shore - green -->
          <path d="M18 15L17 12" stroke="#15803D" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="17" cy="11" r="1" fill="#15803D"/>
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
          <path d="M12 21C7.5 21 4 17.5 4 13C4 10 6 6.5 9 5C9 8 12 9.5 14 10C14 7 16 5 18 4C18 7 19 10 19.5 12.5C20 15 20 17 19 19C18 20.5 15.5 21 12 21Z" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 21C10 21 8.5 19.5 8.5 17.5C8.5 16 9.5 14.5 11 14C11 16 12.5 16.5 13.5 16.5C13.5 15 14.5 14 16 13.5C16 15.5 16.5 18 15.5 19.5C14.5 21 13.5 21 12 21Z" fill="#DC2626" stroke="#DC2626" stroke-width="0.5" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `,
  className: 'fire-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom other disaster icon
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
        border: 2px solid #3B82F6;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `,
  className: 'other-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const AuthorityMap = () => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const userCircle = useRef(null);
  const locationMarker = useRef(null);
  const disasterMarkers = useRef([]);
  
  // State
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [, setLocationName] = useState('');
  const [sosReports, setSosReports] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [disastersVisible, setDisastersVisible] = useState(false);
  
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
    if (mapRef.current && !mapInstance.current) {
      // Wait a moment to ensure DOM is ready
      setTimeout(() => {
        // Check again if map instance exists before creating a new one
        if (!mapInstance.current) {
          try {
            // Initialize the map
            mapInstance.current = L.map(mapRef.current, {
              center: [23.8103, 90.4125], // Dhaka, Bangladesh
              zoom: 12,
              zoomControl: false // Disable default zoom control
            });
            
            // Add map tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(mapInstance.current);
            
            // Add click handler
            mapInstance.current.on('click', handleMapClick);
            
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
    }
    
    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('click', handleMapClick);
        mapInstance.current.remove();
        mapInstance.current = null;
      }
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
      } else {
        mapRef.current.classList.remove('dark-map');
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
      
      // Fetch other disasters directly from MongoDB
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
      
      // Filter out any disasters with missing coordinates or visibility=0/false
      const validDisasters = allDisasters.filter(item => 
        item.latitude && 
        item.longitude && 
        (item.visible === true || item.visible === 1)
      );
      
      console.log(`Loaded ${validDisasters.length} visible disasters from MongoDB`);
      setDisasters(validDisasters);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching disaster data:', err);
      setLoading(false);
    }
  };
  
  // Load sample SOS reports too
  useEffect(() => {
    const sampleSosReports = [
      {
        id: '1',
        userName: 'Rahman Ali',
        message: 'Need immediate help, building collapsing',
        latitude: 23.7508,
        longitude: 90.3928,
        status: 'Urgent',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        userName: 'Fatima Begum',
        message: 'Flooding in our area, water level rising',
        latitude: 23.8103,
        longitude: 90.4125,
        status: 'Pending',
        createdAt: new Date().toISOString()
      }
    ];
    setSosReports(sampleSosReports);
  }, []);
  
  // Update map markers when disasters or filter changes
  useEffect(() => {
    if (mapInstance.current && disasters.length > 0 && selectedFilter) {
      // Slight delay to ensure map is fully initialized before adding markers
      setTimeout(() => {
        showDisastersOnMap(selectedFilter, disastersVisible);
      }, 100);
    } else if (mapInstance.current && disasters.length > 0) {
      // Clear markers if no filter is selected
      disasterMarkers.current.forEach(marker => marker.remove());
      disasterMarkers.current = [];
    }
  }, [disasters, selectedFilter, disastersVisible, mapInstance.current]);
  
  // Handle map click
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    
    // Clear search query when clicking on map
    setSearchQuery('');
    setSuggestions([]);
    setSearchResults([]);
    
    // Remove existing marker if it exists
    if (locationMarker.current) {
      locationMarker.current.remove();
    }
    
    // Add new marker
    locationMarker.current = L.marker([lat, lng], {
      icon: locationMarkerIcon,
      draggable: true
    }).addTo(mapInstance.current);
    
    // Get address for clicked location - using same approach as user map
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`);
      const data = await response.json();
      
      if (data.display_name) {
        // Use the full display name directly
        setLocationName(data.display_name);
        
        // Generate risk assessment data
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
            <strong class="text-red-600">${language === 'en' ? 'Risk Assessment' : 'ঝুঁকি মূল্যায়ন'}:</strong><br>
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
        
        popupContent += `</div>`;
        
        // Bind popup to marker and open it
        locationMarker.current.bindPopup(popupContent, {
          maxWidth: 350,
          className: 'location-details-popup'
        }).openPopup();
        }
      } catch (error) {
      console.error('Error processing location:', error);
        setLocationName('Location data unavailable');
      
      // Show basic popup with just coordinates
      locationMarker.current.bindPopup(`
        <div class="p-3">
          <h3 class="font-bold mb-2">${language === 'en' ? 'Location' : 'অবস্থান'}</h3>
          <p class="text-sm">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        </div>
      `).openPopup();
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
    
    // Close any open popups when user starts typing in search bar
    if (locationMarker.current && mapInstance.current) {
      locationMarker.current.closePopup();
    }
    
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

  // Handle zoom in
  const handleZoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    }
  };
  
  // Handle filter selection
  const handleFilterSelect = (type) => {
    if (type === selectedFilter) {
      // Toggle visibility when clicking the same filter
      setDisastersVisible(!disastersVisible);
      showDisastersOnMap(type, !disastersVisible);
    } else {
      // Select new filter and ensure disasters are visible
      setSelectedFilter(type);
      setDisastersVisible(true);
      showDisastersOnMap(type, true);
    }
  };
  
  // Show disasters on map
  const showDisastersOnMap = (filterType = '', isVisible = true) => {
    if (!mapInstance.current) return;
    
    // Clear existing markers
    disasterMarkers.current.forEach(marker => marker.remove());
    disasterMarkers.current = [];
    
    // If not visible or no filter type, just clear markers and return
    if (!isVisible || !filterType) {
      return;
    }
    
    // Filter disasters by type and ensure only visible ones are shown
    const filteredDisasters = filterType === 'all' 
      ? disasters 
      : disasters.filter(d => d.type === filterType);
    
    // Log the count of displayed disasters
    console.log(`Displaying ${filteredDisasters.length} disasters on map for filter: ${filterType}`);
    
    // Add disaster markers
    filteredDisasters.forEach(disaster => {
      try {
        // Skip if somehow an invisible disaster made it through the initial filter
        if (!(disaster.visible === true || disaster.visible === 1)) {
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
        
        // Add popup
        marker.bindPopup(`
          <div class="disaster-popup p-3 max-w-xs">
            <h3 class="font-bold text-lg mb-1">${disaster.name}</h3>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Type' : 'ধরন'}:</strong> ${disasterType.label}</p>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Location' : 'অবস্থান'}:</strong> ${disaster.location} (${disaster.latitude.toFixed(6)}, ${disaster.longitude.toFixed(6)})</p>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Danger Level' : 'বিপদ স্তর'}:</strong> ${disaster.dangerLevel}</p>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Date' : 'তারিখ'}:</strong> ${new Date(disaster.dateTime).toLocaleString()}</p>
            <div class="mt-2">
              <button class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                ${language === 'en' ? 'View Details' : 'বিস্তারিত দেখুন'}
              </button>
            </div>
          </div>
        `);
        
        disasterMarkers.current.push(marker);
      } catch (err) {
        console.error('Error adding disaster marker:', err);
      }
    });
    
    // Add SOS report markers
    sosReports.forEach(report => {
      try {
        // Create a simple SOS icon with a red circle
        const sosIcon = L.divIcon({
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background-color: #FF0000;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              transform: translate(-50%, -50%);
            "></div>
          `,
          className: 'sos-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        const marker = L.marker([report.latitude, report.longitude], {
          icon: sosIcon  
        }).addTo(mapInstance.current);
        
        // Add popup
        marker.bindPopup(`
          <div class="sos-popup p-3 max-w-xs">
            <h3 class="font-bold text-lg mb-1">${language === 'en' ? 'SOS Report' : 'এসওএস রিপোর্ট'}</h3>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Reporter' : 'রিপোর্টার'}:</strong> ${report.userName}</p>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Message' : 'বার্তা'}:</strong> ${report.message}</p>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Location' : 'অবস্থান'}:</strong> (${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)})</p>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Status' : 'অবস্থা'}:</strong> ${report.status}</p>
            <p class="text-sm mb-1"><strong>${language === 'en' ? 'Time' : 'সময়'}:</strong> ${new Date(report.createdAt).toLocaleString()}</p>
            <div class="mt-2">
              <button class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                ${language === 'en' ? 'Respond' : 'প্রতিক্রিয়া'}
              </button>
            </div>
          </div>
        `);
        
        disasterMarkers.current.push(marker);
      } catch (err) {
        console.error('Error adding SOS marker:', err);
      }
    });
  };
  
  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Search using Nominatim
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&countrycodes=bd`);
      const data = await response.json();
      
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle search result click
  const handleSearchResultClick = async (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Center map on the selected location
    mapInstance.current.setView([lat, lng], 14);
    
    // Remove existing marker if it exists
    if (locationMarker.current) {
      locationMarker.current.closePopup();
      locationMarker.current.remove();
    }
    
    // Add marker for the selected location
    locationMarker.current = L.marker([lat, lng], {
      icon: locationMarkerIcon,
      draggable: true
    }).addTo(mapInstance.current);
    
    // Get detailed information about the location
    try {
      const detailsResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&extratags=1`);
      const data = await detailsResponse.json();
      
      // Update state
      setLocationName(result.display_name);
      
      // Generate risk assessment data
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
          <p class="text-sm mb-2"><strong>${language === 'en' ? 'Address' : 'ঠিকানা'}:</strong> ${result.display_name}</p>
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
          <strong class="text-red-600">${language === 'en' ? 'Risk Assessment' : 'ঝুঁকি মূল্যায়ন'}:</strong><br>
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
      
      // Add authority specific action buttons
      popupContent += `
        <div class="mt-3 grid grid-cols-2 gap-2">
          <button class="analyze-area-btn bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 rounded text-sm">
            ${language === 'en' ? 'Analyze Area' : 'এলাকা বিশ্লেষণ করুন'}
          </button>
          <button class="deploy-units-btn bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded text-sm">
            ${language === 'en' ? 'Deploy Units' : 'ইউনিট মোতায়েন করুন'}
          </button>
        </div>
      `;
      
      popupContent += `</div>`;
      
      // Bind popup to marker and open it
      locationMarker.current.bindPopup(popupContent, {
        maxWidth: 350,
        className: 'location-details-popup'
      }).openPopup();
      
      // Add event listeners for the buttons after the popup is opened
      locationMarker.current.on('popupopen', () => {
        // Find and attach click handler to analyze area button
        const analyzeBtn = document.querySelector('.location-details-popup .analyze-area-btn');
        if (analyzeBtn) {
          analyzeBtn.addEventListener('click', () => {
            window.location.href = `/authority/analyze?lat=${lat}&lng=${lng}`;
          });
        }
        
        // Find and attach click handler to deploy units button
        const deployBtn = document.querySelector('.location-details-popup .deploy-units-btn');
        if (deployBtn) {
          deployBtn.addEventListener('click', () => {
            window.location.href = `/authority/deploy?lat=${lat}&lng=${lng}`;
          });
        }
      });
      
      // Clear search results
      setSearchResults([]);
      
    } catch (error) {
      console.error('Error getting detailed location information:', error);
      
      // Fallback popup if detailed information fails
      locationMarker.current.bindPopup(`
        <div class="p-3">
          <h3 class="font-bold mb-2">${language === 'en' ? 'Location' : 'অবস্থান'}</h3>
          <p class="text-sm mb-1">${result.display_name}</p>
          <p class="text-sm">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        </div>
      `).openPopup();
    }
    
    // Setup drag end handler for marker
    locationMarker.current.on('dragend', async function() {
      const newPos = locationMarker.current.getLatLng();
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18`);
        const data = await response.json();
        if (data.display_name) {
          setLocationName(data.display_name);
          
          // Show simplified popup after dragging
          locationMarker.current.setPopupContent(`
            <div class="p-3">
              <h3 class="font-bold mb-2">${language === 'en' ? 'Updated Location' : 'আপডেট করা অবস্থান'}</h3>
              <p class="text-sm mb-1">${data.display_name}</p>
              <p class="text-sm mb-2">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}</p>
              <button class="analyze-btn bg-blue-500 text-white px-3 py-1 rounded text-sm">
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
      }
    });
  };
  
  // Clear search
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
    <AuthorityLayout>
      <div className="fixed inset-0 overflow-hidden z-10">
        {/* Map container - Full height */}
        <div className="absolute inset-0">
          <div
            ref={mapRef}
            className={`w-full h-full z-0 google-maps-style ${darkMode ? 'dark-mode' : ''}`}
            style={{ 
              touchAction: 'none',
              msContentZooming: 'none',
              cursor: 'grab',
              minHeight: '400px',
              position: 'relative',
              display: 'block'
            }}
          ></div>
          
          {/* Google-style search bar with horizontal disaster buttons - adjusted height */}
          <div className="absolute top-6 left-24 right-20 z-20">
            <div className="flex items-center space-x-16">
              {/* Search Bar - Increased length */}
              <div className="w-80">
                <form onSubmit={handleSearch}>
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-xl overflow-hidden google-search-bar">
                    <div className="p-3 text-gray-500 dark:text-gray-300">
                      {isSearching ? (
                        <div className="animate-spin h-5 w-5 border-t-2 border-blue-500 rounded-full"></div>
                      ) : (
                        <FaSearch className="h-5 w-5" />
                      )}
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder={language === 'en' ? 'Search in Durjog Prohori' : 'দুর্যোগ প্রহরীতে অনুসন্ধান করুন'}
                      className="flex-1 py-3 pr-3 bg-transparent border-none focus:outline-none dark:text-white text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(e);
                        } else if (e.key === 'Escape') {
                          handleClearSearch();
                        }
                      }}
                      onBlur={() => {
                        // Use setTimeout to allow click events on suggestions to fire first
                        setTimeout(() => {
                          setSuggestions([]);
                        }, 200);
                      }}
                      autoComplete="off"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 outline-none focus:outline-none focus:ring-0"
                      >
                        <FaTimes className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </form>
              
                {/* Search suggestions dropdown */}
                {suggestions.length > 0 && !searchResults.length && (
                  <div className="absolute z-30 w-96 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700">
                    <div className="py-1.5 px-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'en' ? 'Suggestions' : 'পরামর্শ'}
                      </p>
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`suggestion-${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                      >
                        <div className="text-gray-400 dark:text-gray-500 mr-3">
                          <FaSearch className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm font-medium dark:text-white">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Search results dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-30 w-96 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700">
                    <div className="py-1.5 px-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'en' ? 'Search Results' : 'অনুসন্ধান ফলাফল'}
                      </p>
                    </div>
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
              
              {/* Horizontal disaster category buttons - moved next to search bar */}
              <div className="flex items-center overflow-x-auto space-x-3">
                {disasterTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleFilterSelect(type.id)}
                    className={`flex items-center px-3.5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap category-pill outline-none focus:outline-none focus:ring-0
                      ${selectedFilter === type.id 
                        ? disastersVisible 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700 active' 
                          : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 active'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                    style={{ minWidth: type.id === 'all' ? '85px' : '90px' }}
                  >
                    {type.id !== 'all' && (
                      <div 
                        className={`w-4 h-4 flex items-center justify-center mr-2 rounded-full
                          ${selectedFilter === type.id && !disastersVisible ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: type.color + '20', border: `1px solid ${type.color}` }}
                      >
                        <div 
                          dangerouslySetInnerHTML={{ __html: createLegendIcon(type.id) }}
                          style={{ transform: 'scale(0.6)' }}
                        ></div>
                      </div>
                    )}
                    <span className="mx-auto">{type.label}</span>
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
              className="bg-white dark:bg-gray-800 shadow-md w-8 h-8 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 outline-none focus:outline-none focus:ring-0"
              aria-label={language === 'en' ? 'Find my location' : 'আমার অবস্থান খুঁজুন'}
            >
              <FaLocationArrow className="h-3.5 w-3.5" />
            </button>
            
            {/* Zoom in button */}
              <button
              onClick={handleZoomIn}
              className="bg-white dark:bg-gray-800 shadow-md w-8 h-8 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 outline-none focus:outline-none focus:ring-0"
              aria-label={language === 'en' ? 'Zoom in' : 'জুম ইন'}
              >
              <FaPlus className="h-3 w-3" />
              </button>
              
            {/* Zoom out button */}
            <button 
              onClick={handleZoomOut}
              className="bg-white dark:bg-gray-800 shadow-md w-8 h-8 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 outline-none focus:outline-none focus:ring-0"
              aria-label={language === 'en' ? 'Zoom out' : 'জুম আউট'}
            >
              <FaMinus className="h-3 w-3" />
            </button>
                      </div>
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                </div>
              )}
        </div>
      </div>
    </AuthorityLayout>
  );
};

export default AuthorityMap; 