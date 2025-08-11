import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationArrow, FaSearch, FaTimes } from 'react-icons/fa';

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

// User location marker (blue dot)
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
      background-color: rgb(38, 122, 220);
      border: 4px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>
    </div>
  `,
  className: 'custom-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const MapSelector = ({ onLocationSelect, initialLocation }) => {
  // ===== STATE AND REFS =====
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ===== CALLBACKS =====
  // Define handleLocationError first as it has no dependencies
  const handleLocationError = useCallback((error) => {
    console.error('Error getting location:', error.message);
    setErrorMessage(`Could not get your location: ${error.message}`);
    setIsLoading(false);
  }, []);

  // Define updateLocationData with required dependencies
  const updateLocationData = useCallback(async (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates in updateLocationData:', { lat, lng });
      setErrorMessage('Invalid coordinates received.');
      setIsLoading(false);
      return;
    }
    
    // Clear any previous errors
    setErrorMessage('');
    setIsLoading(true);
    
    console.log(`Updating location data for: ${lat}, ${lng}`);
    
    // Update coordinates for parent component
    const updatedLocation = {
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    };
    
    try {
      // Get address for clicked location using Nominatim - same approach as AuthorityDisasters
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=en`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // Use the full display name directly without modification
        onLocationSelect({
          ...updatedLocation,
          location: data.display_name
        });
      } else {
        const fallbackName = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onLocationSelect({
          ...updatedLocation,
          location: fallbackName
        });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      const fallbackName = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onLocationSelect({
        ...updatedLocation,
        location: fallbackName
      });
      
      setErrorMessage('Could not fetch location details. Using coordinates instead.');
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect]);

  // Handle map click events (depends on updateLocationData)
  const handleMapClick = useCallback((e) => {
    if (!e || !e.latlng || typeof e.latlng.lat !== 'number' || typeof e.latlng.lng !== 'number') {
      console.error('Invalid map click data:', e);
      setErrorMessage('Invalid map click data received.');
      return;
    }
    
    const { lat, lng } = e.latlng;
    
    console.log(`Map clicked at: ${lat}, ${lng}`);
    
    // Remove existing marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    // Add new marker
    if (mapInstanceRef.current) {
      markerRef.current = L.marker([lat, lng], {
        icon: locationMarkerIcon,
        draggable: true
      }).addTo(mapInstanceRef.current);
      
      // Add drag end event
      markerRef.current.on('dragend', function() {
        const newPos = markerRef.current.getLatLng();
        if (newPos && typeof newPos.lat === 'number' && typeof newPos.lng === 'number') {
          updateLocationData(newPos.lat, newPos.lng);
        } else {
          console.error('Invalid marker position:', newPos);
        }
      });
      
      // Update location data
      updateLocationData(lat, lng);
    } else {
      console.error('Map instance not available for click handler');
    }
  }, [updateLocationData]);

  // Handle successful geolocation (depends on updateLocationData)
  const handleLocationFound = useCallback((e) => {
    // Fix: Make sure e.latlng exists and contains valid lat/lng properties
    if (!e || !e.latlng || typeof e.latlng.lat !== 'number' || typeof e.latlng.lng !== 'number') {
      console.error('Invalid location data received:', e);
      setErrorMessage('Received invalid location data.');
      setIsLoading(false);
      return;
    }
    
    const { lat, lng } = e.latlng;
    
    console.log(`Current location found: ${lat}, ${lng}`);
    
    // Check if map instance exists
    if (!mapInstanceRef.current) {
      console.error('Map instance not available for location handler');
      setErrorMessage('Map not initialized properly.');
      setIsLoading(false);
      return;
    }
    
    // Remove existing marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    // Add marker at user's location
    markerRef.current = L.marker([lat, lng], {
      icon: locationMarkerIcon,
      draggable: true
    }).addTo(mapInstanceRef.current);
    
    // Add user location marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      userMarkerRef.current = L.marker([lat, lng], {
        icon: userLocationIcon
      }).addTo(mapInstanceRef.current);
    }
    
    // Add drag end event listener
    markerRef.current.on('dragend', function() {
      const newPos = markerRef.current.getLatLng();
      if (newPos && typeof newPos.lat === 'number' && typeof newPos.lng === 'number') {
        updateLocationData(newPos.lat, newPos.lng);
      }
    });
    
    // Update location data
    updateLocationData(lat, lng);
  }, [updateLocationData]);

  // ===== EFFECTS =====
  // Initialize map
  useEffect(() => {
    // Skip if already initialized or ref not ready
    if (mapInstanceRef.current || !mapRef.current) return;
    
    console.log('Initializing map component...');
    
    // Check if initialLocation has valid coordinates, otherwise use defaults
    let initialCoords = [23.8103, 90.4125]; // Default to Dhaka
    let initialZoom = 13;
    
    if (initialLocation && 
        initialLocation.latitude && 
        initialLocation.longitude && 
        !isNaN(parseFloat(initialLocation.latitude)) && 
        !isNaN(parseFloat(initialLocation.longitude))) {
      initialCoords = [
        parseFloat(initialLocation.latitude), 
        parseFloat(initialLocation.longitude)
      ];
      initialZoom = 15;
      console.log('Using initial coordinates:', initialCoords);
    } else {
      console.log('Using default coordinates (Dhaka)');
    }
    
    try {
      const map = L.map(mapRef.current, {
        center: initialCoords,
        zoom: initialZoom,
        zoomControl: false,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add zoom control in top right
      L.control.zoom({
        position: 'topright'
      }).addTo(map);

      // Place initial marker if location exists with valid coordinates
      if (initialLocation && 
          initialLocation.latitude && 
          initialLocation.longitude && 
          !isNaN(parseFloat(initialLocation.latitude)) && 
          !isNaN(parseFloat(initialLocation.longitude))) {
        markerRef.current = L.marker(
          initialCoords,
          { icon: locationMarkerIcon, draggable: true }
        ).addTo(map);
        
        // Add drag end event
        markerRef.current.on('dragend', function() {
          const newPos = markerRef.current.getLatLng();
          if (newPos && typeof newPos.lat === 'number' && typeof newPos.lng === 'number') {
            updateLocationData(newPos.lat, newPos.lng);
          }
        });
      }

      // Handle map click to set location
      map.on('click', handleMapClick);

      // Add loading events
      map.on('dataloading', () => setIsLoading(true));
      map.on('dataload', () => setIsLoading(false));

      // Store map instance
      mapInstanceRef.current = map;
      
      // Fix map rendering issues that can occur
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
      
      console.log('Map initialized successfully');
      setMapLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setErrorMessage('Failed to initialize map: ' + error.message);
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        console.log('Cleaning up map resources...');
        
        // Remove handlers first
        mapInstanceRef.current.off('click', handleMapClick);
        mapInstanceRef.current.off('locationfound');
        mapInstanceRef.current.off('locationerror');
        mapInstanceRef.current.off('dataloading');
        mapInstanceRef.current.off('dataload');
        
        // Then remove map
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        
        // Clear markers
        markerRef.current = null;
        userMarkerRef.current = null;
      }
    };
  }, [initialLocation, handleMapClick, updateLocationData]);

  // Setup location event handlers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    
    console.log('Setting up location event handlers');
    
    // Remove any existing handlers first
    mapInstanceRef.current.off('locationfound');
    mapInstanceRef.current.off('locationerror');
    
    // Add handlers
    mapInstanceRef.current.on('locationfound', handleLocationFound);
    mapInstanceRef.current.on('locationerror', handleLocationError);
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('locationfound');
        mapInstanceRef.current.off('locationerror');
      }
    };
  }, [mapLoaded, handleLocationFound, handleLocationError]);

  // ===== HANDLERS =====
  // Remaining handlers that don't need to be memoized or have circular dependencies
  const handleLocateClick = () => {
    if (!mapInstanceRef.current) {
      console.error('Map not initialized');
      setErrorMessage('Map not initialized properly.');
      return;
    }
    
    // Clear previous errors
    setErrorMessage('');
    // Show loading indicator
    setIsLoading(true);
    
    // Make sure we remove any previous handlers before adding new ones
    mapInstanceRef.current.off('locationfound');
    mapInstanceRef.current.off('locationerror');
    
    // Add event handlers
    mapInstanceRef.current.on('locationfound', handleLocationFound);
    mapInstanceRef.current.on('locationerror', handleLocationError);
    
    // Start location detection
    mapInstanceRef.current.locate({ 
      setView: true, 
      maxZoom: 16,
      enableHighAccuracy: true,
      timeout: 8000
    });
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    console.log('Searching for location:', searchQuery);
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        { 
          headers: { 
            'Accept-Language': 'en',
            'User-Agent': 'Durjog-Prohori-Application'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Search request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        console.log('Search results:', data);
        setSearchResults(data);
        setShowSearchResults(true);
      } else {
        console.log('No search results found');
        setSearchResults([]);
        setErrorMessage('No locations found for your search. Try a different query or use the map.');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      setSearchResults([]);
      setErrorMessage('Location search failed. Please try again or use the map.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleSearchResultClick = useCallback((result) => {
    if (!result || !result.lat || !result.lon) {
      console.error('Invalid search result:', result);
      setErrorMessage('Invalid search result data.');
      return;
    }
    
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates in search result:', result);
      setErrorMessage('Invalid coordinates in search result.');
      return;
    }
    
    console.log(`Search result selected: ${lat}, ${lng}, ${result.display_name}`);
    
    // Center map on selected location
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
    } else {
      console.error('Map instance not available for search result');
      return;
    }
    
    // Remove existing marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    // Add new marker
    markerRef.current = L.marker([lat, lng], {
      icon: locationMarkerIcon,
      draggable: true
    }).addTo(mapInstanceRef.current);
    
    // Use the display_name directly from the search result
    if (result.display_name) {
      onLocationSelect({
        location: result.display_name,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      });
    }
    
    // Add drag end event
    markerRef.current.on('dragend', function() {
      const newPos = markerRef.current.getLatLng();
      if (newPos && typeof newPos.lat === 'number' && typeof newPos.lng === 'number') {
        updateLocationData(newPos.lat, newPos.lng);
      }
    });
    
    // Clear search
    setSearchQuery('');
    setShowSearchResults(false);
  }, [updateLocationData, onLocationSelect]);

  return (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden h-[400px] mb-4">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full z-0"></div>
      
      {/* Search controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="relative flex-1">
          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="w-full py-2 px-3 pr-10 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-12 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
              aria-label="Search"
            >
              <FaSearch className="h-4 w-4" />
            </button>
          </div>
          
          {/* Search results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result.place_id || `result-${result.lat}-${result.lon}`}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSearchResultClick(result)}
                >
                  <p className="text-sm font-medium">{result.display_name}</p>
                  <p className="text-xs text-gray-500">{result.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Locate me button */}
        <button
          onClick={handleLocateClick}
          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 flex items-center"
          title="Use my current location"
          aria-label="Use my current location"
        >
          <FaLocationArrow className="h-5 w-5" />
        </button>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-16 left-4 right-4 bg-blue-100 text-blue-800 p-2 rounded-md text-sm flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading location data...</span>
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="absolute top-16 left-4 right-4 bg-red-100 text-red-800 p-2 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 p-2 rounded-md text-sm">
        <p>Click on the map to select a location or use the search bar above.</p>
      </div>
    </div>
  );
};

export default MapSelector; 