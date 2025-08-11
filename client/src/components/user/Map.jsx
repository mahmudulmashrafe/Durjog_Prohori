import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationArrow, FaSearch, FaTimes } from 'react-icons/fa';
import { MdWater, MdOutlineWhatshot, MdTornado, MdLandscape, MdWaves, MdWarning, MdTerrain, MdHelp } from 'react-icons/md';
import axios from 'axios';



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
        border: 2px solid #0EA5E9;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Wave pattern -->
          <path d="M2 12C4 12 4 15 6 15C8 15 8 12 10 12C12 12 12 15 14 15C16 15 16 12 18 12C20 12 20 15 22 15" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round"/>
          <path d="M2 7C4 7 4 10 6 10C8 10 8 7 10 7C12 7 12 10 14 10C16 10 16 7 18 7C20 7 20 10 22 10" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round"/>
          <!-- Shoreline -->
          <path d="M2 17C6 17 6 19 12 19C18 19 18 17 22 17" stroke="#15803D" stroke-width="2" stroke-linecap="round"/>
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
          <path d="M12 2C8 7 9 11 9 11C9 11 6 10 6 6C3 9 3 14 5 17C7 20 10 22 14 22C18 22 22 19 22 14C22 9 19 7 19 7C19 7 19 11 16 11C16 11 17 5 12 2Z" fill="#DC2626" stroke="#DC2626" stroke-width="1.5"/>
          <path d="M12 16C13.1046 16 14 15.1046 14 14C14 12.8954 13.1046 12 12 12C10.8954 12 10 12.8954 10 14C10 15.1046 10.8954 16 12 16Z" fill="#FEF3C7"/>
        </svg>
      </div>
    </div>
  `,
  className: 'fire-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom other icon
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
          <circle cx="12" cy="12" r="8" stroke="#6B7280" stroke-width="2"/>
          <path d="M12 7V13" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="1" fill="#6B7280"/>
        </svg>
      </div>
    </div>
  `,
  className: 'other-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Create pulse animation for accuracy circle
const pulseStyle = `
  .location-accuracy {
    opacity: 1 !important;
  }
`;

const Map = () => {
  const { t, language } = useLanguage();
  const { darkMode } = useTheme();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
          const [disasters, setDisasters] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const disasterMarkersRef = useRef([]);
  const [userLocation, setUserLocation] = useState(() => {
    // Try to get cached location from localStorage
    const cached = localStorage.getItem('lastKnownLocation');
    return cached ? JSON.parse(cached) : null;
  });
  const [locationError, setLocationError] = useState(null);
  const watchIdRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Disaster categories for the horizontal row below search bar
  const disasterCategories = [
    { id: 'all', label: t('All Disasters'), icon: <MdWarning className="h-5 w-5" />, color: '#3B82F6' },
    { id: 'earthquake', label: t('Earthquake'), icon: <MdLandscape className="h-5 w-5" />, color: '#EF4444' },
    { id: 'flood', label: t('Flood'), icon: <MdWater className="h-5 w-5" />, color: '#3B82F6' },
    { id: 'cyclone', label: t('Cyclone'), icon: <MdTornado className="h-5 w-5" />, color: '#8B5CF6' },
    { id: 'landslide', label: t('Landslide'), icon: <MdTerrain className="h-5 w-5" />, color: '#F59E0B' },
    { id: 'tsunami', label: t('Tsunami'), icon: <MdWaves className="h-5 w-5" />, color: '#10B981' },
    { id: 'fire', label: t('Fire'), icon: <MdOutlineWhatshot className="h-5 w-5" />, color: '#DC2626' },
    { id: 'other', label: t('Other'), icon: <MdHelp className="h-5 w-5" />, color: '#6B7280' }
  ];



  useEffect(() => {
    // Add pulse animation style to head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = pulseStyle;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);



  const handleLocationFound = (e) => {
    const { lat, lng } = e.latlng;
    const accuracy = e.accuracy;

    // Cache the location
    const locationData = { lat, lng, accuracy };
    localStorage.setItem('lastKnownLocation', JSON.stringify(locationData));

    // Update user location state
    setUserLocation(locationData);
    setLocationError(null);

    // Remove existing markers if they exist
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (userCircleRef.current) {
      userCircleRef.current.remove();
    }

    // Add marker for user location with custom icon (green dot)
    userMarkerRef.current = L.marker([lat, lng], {
      icon: userLocationIcon,
      title: t('yourLocation')
    }).addTo(mapInstanceRef.current);

    // Add circle to show accuracy
    userCircleRef.current = L.circle([lat, lng], {
      radius: accuracy / 2,
      className: 'location-accuracy',
      color: '#26DC4E',
      fillColor: '#26DC4E',
      fillOpacity: 0.2,
      weight: 2,
      opacity: 0.8,
      interactive: false
    }).addTo(mapInstanceRef.current);

    // Only add the draggable red marker if it doesn't exist yet
    if (!searchMarkerRef.current) {
      searchMarkerRef.current = L.marker([lat, lng], {
        icon: locationMarkerIcon,
        draggable: true
      }).addTo(mapInstanceRef.current);

      // Add dragend event listener to update search when marker is dragged
      searchMarkerRef.current.on('dragend', async function(e) {
        const marker = e.target;
        const position = marker.getLatLng();
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
          const data = await response.json();
          if (data.display_name) {
            // Remove these lines to prevent updating search query
            // setSearchQuery(data.display_name);
            // setSearchResults([data]);
            
            // Instead, just update the popup with location info
            marker.bindPopup(`
              <div class="p-2 max-w-xs">
                <h3 class="font-bold mb-1">${language === 'en' ? 'Location' : 'অবস্থান'}</h3>
                <p class="text-sm mb-1">${data.display_name}</p>
                <p class="text-sm">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}</p>
              </div>
            `, {maxWidth: 220}).openPopup();
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
        }
      });
    }

    // Center map on user location only if no search marker exists or during initial load
    if (!searchMarkerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 14);
    }
  };

  const handleLocationError = (error) => {
    console.error('Location error:', error);
    // Only set error message for actual location errors
    if (error && error.code) { // Check if it's a real geolocation error object
      let errorMessage = '';
      switch(error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage = t('Location access denied. Please enable location permissions.');
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage = t('Your location information is unavailable.');
          break;
        case 3: // TIMEOUT
          errorMessage = t('The request to get your location timed out.');
          break;
        default:
          errorMessage = t('An unknown error occurred while getting your location.');
      }
      setLocationError(errorMessage);
    }
  };

  const handleLocateClick = () => {
    if (!mapInstanceRef.current) return;
    
    // Clear any previous location errors
    setLocationError(null);

    mapInstanceRef.current.locate({
      setView: true,
      maxZoom: 14,
      enableHighAccuracy: true,
      timeout: 3000 // Reduced timeout to 3 seconds
    });
  };

  // Function to start watching position using browser's geolocation API
  const startWatchingPosition = () => {
    if ('geolocation' in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 3000, // Reduced timeout to 3 seconds
        maximumAge: 1000 // Allow 1-second-old cached positions
      };

      // If we have a cached location, show it immediately
      if (userLocation) {
        handleLocationFound({
          latlng: { lat: userLocation.lat, lng: userLocation.lng },
          accuracy: userLocation.accuracy
        });
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        position => {
          if (mapInstanceRef.current) {
            handleLocationFound({
              latlng: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              accuracy: position.coords.accuracy
            });
          }
        },
        error => {
          console.error('Geolocation error:', error);
          handleLocationError(error);
        },
        options
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
      
      if (data.length > 0) {
        const { lat, lon } = data[0];
        if (searchMarkerRef.current) {
          searchMarkerRef.current.remove();
        }
        
        searchMarkerRef.current = L.marker([lat, lon], {
          icon: locationMarkerIcon,
          draggable: true
        }).addTo(mapInstanceRef.current);
        
        mapInstanceRef.current.setView([lat, lon], 14);
        
        // Add dragend event listener to update search when marker is dragged
        searchMarkerRef.current.on('dragend', async function(e) {
          const marker = e.target;
          const position = marker.getLatLng();
          
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
            const data = await response.json();
            if (data.display_name) {
              // Remove these lines to prevent updating search query
              // setSearchQuery(data.display_name);
              // setSearchResults([data]);
              
              // Instead, just update the popup with location info
              marker.bindPopup(`
                <div class="p-2 max-w-xs">
                  <h3 class="font-bold mb-1">${language === 'en' ? 'Location' : 'অবস্থান'}</h3>
                  <p class="text-sm mb-1">${data.display_name}</p>
                  <p class="text-sm">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}</p>
                </div>
              `, {maxWidth: 220}).openPopup();
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // Center map on the selected location
    mapInstanceRef.current.setView([lat, lon], 15);
    
    // Remove existing search marker if it exists
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }
    
    // Add search marker for the selected location
    searchMarkerRef.current = L.marker([lat, lon], {
      icon: locationMarkerIcon,
      draggable: true
    }).addTo(mapInstanceRef.current);
    
    // Generate location risk assessment
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
    
    // Create detailed popup content
    let popupContent = `
      <div class="location-info-popup p-2 max-w-xs">
        <h3 class="font-bold text-sm mb-1">${language === 'en' ? 'Location Information' : 'অবস্থান তথ্য'}</h3>
        <p class="text-xs mb-1"><strong>${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}:</strong> ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>
        <p class="text-xs mb-2"><strong>${language === 'en' ? 'Address' : 'ঠিকানা'}:</strong> ${result.display_name}</p>
    
        <div class="text-xs mb-2 mt-1 border-t pt-1">
          <strong class="text-blue-600">${language === 'en' ? 'Risk Assessment' : 'ঝুঁকি মূল্যায়ন'}:</strong><br>
          <div class="grid grid-cols-2 gap-1 mt-1">
            <div>${language === 'en' ? 'Flood Risk' : 'বন্যার ঝুঁকি'}:</div>
            <div class="text-right font-medium ${floodRisk >= 7 ? 'text-red-500' : floodRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${floodRisk}/10</div>
            
            <div>${language === 'en' ? 'Cyclone Risk' : 'ঘূর্ণিঝড়ের ঝুঁকি'}:</div>
            <div class="text-right font-medium ${cycloneRisk >= 7 ? 'text-red-500' : cycloneRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${cycloneRisk}/10</div>
            
            <div>${language === 'en' ? 'Landslide Risk' : 'ভূমিধসের ঝুঁকি'}:</div>
            <div class="text-right font-medium ${landslideRisk >= 7 ? 'text-red-500' : landslideRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${landslideRisk}/10</div>
            
            <div>${language === 'en' ? 'Elevation' : 'উচ্চতা'}:</div>
            <div class="text-right">${elevation} ${language === 'en' ? 'm' : 'মিটার'}</div>
          </div>
        </div>
        
        <div class="text-xs mb-1 mt-1 border-t pt-1">
          <strong class="text-green-600">${language === 'en' ? 'Safety Tips' : 'নিরাপত্তা টিপস'}:</strong>
          <ul class="list-disc ml-4 mt-0.5">
            ${floodRisk >= 7 ? `<li>${language === 'en' ? 'Keep supplies ready' : 'সরবরাহ প্রস্তুত রাখুন'}</li>` : ''}
            ${cycloneRisk >= 7 ? `<li>${language === 'en' ? 'Know evacuation route' : 'পলায়ন পথ জানুন'}</li>` : ''}
            ${landslideRisk >= 7 ? `<li>${language === 'en' ? 'Alert during heavy rain' : 'বৃষ্টিতে সতর্ক থাকুন'}</li>` : ''}
          </ul>
        </div>
      </div>
    `;
    
    // Bind popup to marker and open it
    searchMarkerRef.current.bindPopup(popupContent, {
      maxWidth: 220,
      className: 'location-details-popup'
    }).openPopup();
    
    // Set up drag event handler for the marker
    searchMarkerRef.current.on('dragend', async function(e) {
      const marker = e.target;
      const position = marker.getLatLng();
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18`);
        const data = await response.json();
        if (data.display_name) {
          // Show simplified popup after dragging
          marker.setPopupContent(`
            <div class="p-3">
              <h3 class="font-bold mb-2">${language === 'en' ? 'Updated Location' : 'আপডেট করা অবস্থান'}</h3>
              <p class="text-sm mb-1">${data.display_name}</p>
              <p class="text-sm mb-2">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}</p>
              <button class="analyze-btn bg-blue-500 text-white px-3 py-1 rounded text-sm">
                ${language === 'en' ? 'Analyze Location' : 'অবস্থান বিশ্লেষণ করুন'}
              </button>
            </div>
          `);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    });
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    
    // Remove existing search marker if it exists
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }
    
    // Add new marker at clicked location
    searchMarkerRef.current = L.marker([lat, lng], {
      icon: locationMarkerIcon,
      draggable: true
    }).addTo(mapInstanceRef.current);
    
    // Get address and detailed location information
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`);
      const data = await response.json();
      
      if (data.display_name) {
        // Generate risk assessment data based on geographical regions
        // Coastal areas (southern Bangladesh) - higher cyclone risk
        const isCoastal = lat < 23.0 && lng > 89.0;
        
        // Major river basins - higher flood risk
        const isRiverBasin = (
          (lat > 23.5 && lat < 25.5 && lng > 89.0 && lng < 90.5) || // Brahmaputra basin
          (lat > 23.0 && lat < 24.5 && lng > 90.5 && lng < 92.0) || // Meghna basin
          (lat > 22.5 && lat < 24.5 && lng > 88.0 && lng < 89.5)    // Ganges basin
        );
        
        // Hilly areas - higher landslide risk
        const isHilly = lat < 24.0 && lng > 91.5;
        
        // Simulate risk levels (1-10)
        const floodRisk = isRiverBasin ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
        const cycloneRisk = isCoastal ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
        const landslideRisk = isHilly ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 1;
        
        // Get elevation data (simulated)
        const elevation = isHilly ? Math.floor(Math.random() * 300) + 100 : Math.floor(Math.random() * 100);
        
        // Create detailed popup content
        let popupContent = `
          <div class="location-info-popup p-2 max-w-xs">
            <h3 class="font-bold text-sm mb-1">${language === 'en' ? 'Location Information' : 'অবস্থান তথ্য'}</h3>
            <p class="text-xs mb-1"><strong>${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
            <p class="text-xs mb-2"><strong>${language === 'en' ? 'Address' : 'ঠিকানা'}:</strong> ${data.display_name}</p>
        
            <div class="text-xs mb-2 mt-1 border-t pt-1">
              <strong class="text-blue-600">${language === 'en' ? 'Risk Assessment' : 'ঝুঁকি মূল্যায়ন'}:</strong><br>
              <div class="grid grid-cols-2 gap-1 mt-1">
                <div>${language === 'en' ? 'Flood Risk' : 'বন্যার ঝুঁকি'}:</div>
                <div class="text-right font-medium ${floodRisk >= 7 ? 'text-red-500' : floodRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${floodRisk}/10</div>
                
                <div>${language === 'en' ? 'Cyclone Risk' : 'ঘূর্ণিঝড়ের ঝুঁকি'}:</div>
                <div class="text-right font-medium ${cycloneRisk >= 7 ? 'text-red-500' : cycloneRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${cycloneRisk}/10</div>
                
                <div>${language === 'en' ? 'Landslide Risk' : 'ভূমিধসের ঝুঁকি'}:</div>
                <div class="text-right font-medium ${landslideRisk >= 7 ? 'text-red-500' : landslideRisk >= 4 ? 'text-yellow-500' : 'text-green-500'}">${landslideRisk}/10</div>
                
                <div>${language === 'en' ? 'Elevation' : 'উচ্চতা'}:</div>
                <div class="text-right">${elevation} ${language === 'en' ? 'm' : 'মিটার'}</div>
              </div>
            </div>
            
            <div class="text-xs mb-1 mt-1 border-t pt-1">
              <strong class="text-green-600">${language === 'en' ? 'Safety Tips' : 'নিরাপত্তা টিপস'}:</strong>
              <ul class="list-disc ml-4 mt-0.5">
                ${floodRisk >= 7 ? `<li>${language === 'en' ? 'Keep supplies ready' : 'সরবরাহ প্রস্তুত রাখুন'}</li>` : ''}
                ${cycloneRisk >= 7 ? `<li>${language === 'en' ? 'Know evacuation route' : 'পলায়ন পথ জানুন'}</li>` : ''}
                ${landslideRisk >= 7 ? `<li>${language === 'en' ? 'Alert during heavy rain' : 'বৃষ্টিতে সতর্ক থাকুন'}</li>` : ''}
              </ul>
            </div>
          </div>
        `;
        
        // Add important nearby features if available
        if (data.address) {
          const nearbyFeatures = [];
          
          // Check for nearby important places
          const importantPlaces = ['hospital', 'police', 'fire_station', 'school', 'shelter'];
          importantPlaces.forEach(place => {
            if (data.address[place]) {
              nearbyFeatures.push(`${language === 'en' ? 'Nearby' : 'কাছাকাছি'} ${place}: ${data.address[place]}`);
            }
          });
          
          if (nearbyFeatures.length > 0) {
            popupContent += `
              <div class="text-xs mb-2 mt-1 border-t pt-1">
                <strong class="text-green-600">${language === 'en' ? 'Nearby Facilities' : 'কাছাকাছি সুবিধাদি'}:</strong><br>
                ${nearbyFeatures.join('<br>')}
              </div>
            `;
          }
        }
        
        // Add safety instructions based on risk assessment
        let safetyTips = '';
        if (floodRisk >= 7) {
          safetyTips += `<li>${language === 'en' ? 'Keep supplies ready' : 'সরবরাহ প্রস্তুত রাখুন'}</li>`;
        }
        if (cycloneRisk >= 7) {
          safetyTips += `<li>${language === 'en' ? 'Know evacuation route' : 'পলায়ন পথ জানুন'}</li>`;
        }
        if (landslideRisk >= 7) {
          safetyTips += `<li>${language === 'en' ? 'Alert during heavy rain' : 'বৃষ্টিতে সতর্ক থাকুন'}</li>`;
        }
        
        if (safetyTips) {
          popupContent += `
            <div class="text-xs mb-2 mt-1 border-t pt-1">
              <strong class="text-red-600">${language === 'en' ? 'Safety Tips' : 'নিরাপত্তা টিপস'}:</strong>
              <ul class="list-disc ml-4 mt-0.5">
                ${safetyTips}
              </ul>
            </div>
          `;
        }
        
        popupContent += `</div>`;
        
        // Add popup to marker and open it
        searchMarkerRef.current.bindPopup(popupContent, {
          maxWidth: 220,
          className: 'location-details-popup'
        }).openPopup();
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Show a basic popup with coordinates if geocoding fails
      searchMarkerRef.current.bindPopup(`
        <div class="p-2 max-w-xs">
          <h3 class="font-bold">${language === 'en' ? 'Selected Location' : 'নির্বাচিত অবস্থান'}</h3>
          <p class="text-sm">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        </div>
      `, {maxWidth: 220}).openPopup();
    }
    
    // Add dragend event listener with improved popup handling
    searchMarkerRef.current.on('dragend', async function(e) {
      const marker = e.target;
      const position = marker.getLatLng();
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18`);
        const data = await response.json();
        if (data.display_name) {
          // Show simplified popup after dragging
          marker.setPopupContent(`
            <div class="p-3">
              <h3 class="font-bold mb-2">${language === 'en' ? 'Updated Location' : 'আপডেট করা অবস্থান'}</h3>
              <p class="text-sm mb-1">${data.display_name}</p>
              <p class="text-sm mb-2">${language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}</p>
              <button class="analyze-btn bg-blue-500 text-white px-3 py-1 rounded text-sm">
                ${language === 'en' ? 'Analyze Location' : 'অবস্থান বিশ্লেষণ করুন'}
              </button>
            </div>
          `);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    });
  };

  // Fetch disasters data
  const fetchDisastersData = async () => {
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
      showDisastersOnMap(currentFilter, validDisasters);
    } catch (error) {
      console.error('Error fetching disasters:', error);
    }
  };

  // Show disasters on map based on filter
  const showDisastersOnMap = (filterType = 'all', disastersData = disasters) => {
    if (!mapInstanceRef.current) return;
    
    // Clear existing markers
    disasterMarkersRef.current.forEach(marker => marker.remove());
    disasterMarkersRef.current = [];

    // Filter disasters based on type
    const filteredDisasters = filterType === 'all'
      ? disastersData
      : disastersData.filter(d => d.type === filterType);
      
    console.log(`Displaying ${filteredDisasters.length} disasters on map for filter: ${filterType}`);

    // Add markers for filtered disasters
    filteredDisasters.forEach(disaster => {
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
          icon = otherIcon;
      }
      
      const marker = L.marker([disaster.latitude, disaster.longitude], {
        icon: icon,
        title: disaster.name
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div class="disaster-popup p-3 max-w-xs">
          <h3 class="font-bold text-lg mb-1">${disaster.name}</h3>
          <p class="text-sm mb-1"><strong>Type:</strong> ${disaster.type}</p>
          <p class="text-sm mb-1"><strong>Location:</strong> ${disaster.location}</p>
          <p class="text-sm mb-1"><strong>Danger Level:</strong> ${disaster.dangerLevel}</p>
          <p class="text-sm mb-1"><strong>Date:</strong> ${new Date(disaster.dateTime).toLocaleString()}</p>
        </div>
      `);

      disasterMarkersRef.current.push(marker);
    });
  };

  // Handle disaster category click
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    
    // Filter disasters based on selected category
    if (categoryId === 'all') {
      showDisastersOnMap('all');
      setCurrentFilter('all');
    } else {
      showDisastersOnMap(categoryId);
      setCurrentFilter(categoryId);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
    // Create map instance
    const map = L.map(mapRef.current, {
      center: userLocation ? [userLocation.lat, userLocation.lng] : [23.8103, 90.4125],
      zoom: userLocation ? 14 : 7,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: false // Disable default zoom control
      });

      // Add zoom control to bottom right
      L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

      // Add OpenStreetMap base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

      // Add click event handler to map
    map.on('click', handleMapClick);

      // Add location found event handler
    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);
      
      // Prevent location errors from showing during zoom operations
      map.on('zoomstart', () => {
        setLocationError(null);
      });

    // Store map instance
    mapInstanceRef.current = map;

      // Start watching position immediately
      startWatchingPosition();

    // Fetch initial disasters data
    fetchDisastersData();

      // Force a resize event to ensure map renders properly
    map.invalidateSize();
    } catch (err) {
      console.error("Error initializing map:", err);
    }

    // Cleanup function
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick);
        mapInstanceRef.current.off('locationfound', handleLocationFound);
        mapInstanceRef.current.off('locationerror', handleLocationError);
        mapInstanceRef.current.off('zoomstart');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Refresh disasters data periodically
  useEffect(() => {
    const interval = setInterval(fetchDisastersData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update map size when dark mode changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, [darkMode]);

  return (
    <div className="fixed inset-0 top-16 bottom-14">
      <div className={`h-full ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
        <div className="h-full">
          <div className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} relative`}>
            {/* Map Container */}
            <div 
              ref={mapRef}
              className="w-full h-full"
              style={{ 
                touchAction: 'none',
                msContentZooming: 'none',
                cursor: 'grab'
              }}
              onWheel={(e) => e.stopPropagation()}
            ></div>

            {/* Search Bar - Centered at top with rounded shape like Google Maps */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-xl px-4">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-xl overflow-hidden google-search-bar">
                <div className="p-3.5 text-gray-500 dark:text-gray-300">
                  {isSearching ? (
                    <div className="animate-spin h-5 w-5 border-t-2 border-blue-500 rounded-full"></div>
                  ) : (
                    <FaSearch className="h-5 w-5" />
                  )}
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('Search Durjog Prohori Maps')}
                  className="flex-1 py-3 pr-3 bg-transparent border-none focus:outline-none dark:text-white text-sm"
                />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                    className="p-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                      >
                    <FaTimes className="h-4 w-4" />
                      </button>
                    )}
                </div>
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                <div className="mt-2 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchResultClick(result)}
                        className={`w-full text-left px-4 py-3 transition-colors duration-200
                          ${darkMode 
                          ? 'text-gray-100 hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-100'}
                        ${index > 0 ? `border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
                      >
                        {result.display_name}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
            <div className="mt-2 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchResultClick(result)}
                    className={`w-full text-left px-4 py-3 transition-colors duration-200
                      ${darkMode 
                      ? 'text-gray-100 hover:bg-gray-700' 
                      : 'text-gray-900 hover:bg-gray-100'}
                    ${index > 0 ? `border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}

            {/* Disaster Category Buttons - Horizontal row below search bar */}
            <div className="absolute top-20 left-0 right-0 z-[9998] flex justify-center overflow-hidden">
              <div className="flex items-center space-x-2 overflow-x-auto px-4 py-2 scrollbar-hide">
                {disasterCategories.map((category) => (
              <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex flex-col items-center px-4 py-2 rounded-full whitespace-nowrap ${
                      selectedCategory === category.id || (category.id === 'all' && !selectedCategory)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    } border border-gray-200 dark:border-gray-700 shadow-md`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium" style={{ color: category.id !== 'all' && (selectedCategory === category.id ? category.color : '') }}>
                        {category.icon}
                      </span>
                      <span className="text-sm font-medium">{category.label}</span>
                  </div>
                    </button>
                  ))}
                </div>
            </div>
            
            {/* Location Button */}
            <button
              onClick={handleLocateClick}
              className="absolute bottom-24 right-4 z-[1000] p-3 rounded-full shadow-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
              title={t('findMyLocation')}
            >
              <FaLocationArrow className="h-4 w-4 text-blue-500" />
            </button>

            {/* Location Error Message */}
            {locationError && (
              <div className="absolute top-28 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100">
                {locationError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global styles for scrollbar hiding */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
        
        .google-search-bar {
          filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
        }
      `}</style>
    </div>
  );
};

export default Map; 