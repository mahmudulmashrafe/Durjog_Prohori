/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import useEarthquakeStore from '../../store/earthquakeStore';
import EarthquakeNotifications from './EarthquakeNotifications';
// eslint-disable-next-line no-unused-vars
import { FaFilter, FaSync, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaTimes, FaLocationArrow, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Earthquakes = () => {
  // eslint-disable-next-line no-unused-vars
  const { earthquakes, loading, error, lastUpdated, fetchEarthquakes, fetchEarthquakesByMagnitude } = useEarthquakeStore();
  // eslint-disable-next-line no-unused-vars
  const [magnitudeFilter, setMagnitudeFilter] = useState({ min: 0, max: 10 });
  // eslint-disable-next-line no-unused-vars
  const [showFilters, setShowFilters] = useState(false);
  const [siteReports, setSiteReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const { token } = useAuth();

  // eslint-disable-next-line no-unused-vars
  const mapRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const leafletMap = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const marker = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const tileLayerRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [showMapModal, setShowMapModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Define a global marker icon to use consistently throughout the component
  // eslint-disable-next-line no-unused-vars
  const locationMarkerIcon = L.divIcon({
    html: `
      <div style="background-color: #e74c3c; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); position: relative;">
        <div style="position: absolute; bottom: -8px; left: 6px; width: 8px; height: 8px; background-color: rgba(0,0,0,0.5); transform: rotate(45deg);"></div>
      </div>
    `,
    className: 'location-marker',
    iconSize: [24, 36],
    iconAnchor: [12, 36]
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    dangerLevel: '5',
    disasterType: 'earthquake',
    description: '',
    visible: true,
    fullAddress: ''
  });

  // Make sure the map and marker references are defined outside of all component functions
  // eslint-disable-next-line no-unused-vars
  let mapInstance = null;
  // eslint-disable-next-line no-unused-vars
  let markerInstance = null;
  // eslint-disable-next-line no-unused-vars
  let tileLayerInstance = null;

  // Create a separate Map component that won't get rerendered when location data is fetched
  // eslint-disable-next-line react/display-name
  const MapComponent = React.memo(({ formData, setFormData }) => {
    const mapElementRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markerRef = useRef(null);
    
    // Create Google-style marker icon function
    const createGoogleMarkerIcon = () => {
      return L.divIcon({
        html: `
          <div style="width: 32px; height: 44px; position: relative;">
            <div style="
              background-color: #4285F4; 
              width: 24px; 
              height: 24px; 
              border-radius: 50%; 
              position: absolute;
              top: 0;
              left: 4px;
              border: 2px solid white;
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute;
              top: 18px;
              left: 16px;
              transform: translateX(-50%);
              width: 2px;
              height: 20px;
              background: linear-gradient(to bottom, #4285F4, rgba(66, 133, 244, 0));
            "></div>
            <div style="
              position: absolute;
              bottom: 2px;
              left: 16px;
              transform: translateX(-50%);
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: rgba(0,0,0,0.2);
            "></div>
          </div>
        `,
        className: 'google-marker-icon',
        iconSize: [32, 44],
        iconAnchor: [16, 44]
      });
    };
    
    // Initialize map
    useEffect(() => {
      if (!mapElementRef.current) return;
      
      // Only create map if it doesn't exist
      if (!leafletMapRef.current) {
        console.log("Creating new map");
        
        // Default to Bangladesh center if no coordinates
        const defaultLat = formData.latitude ? parseFloat(formData.latitude) : 23.8103;
        const defaultLng = formData.longitude ? parseFloat(formData.longitude) : 90.4125;
        
        // Create map with mobile-friendly options
        leafletMapRef.current = L.map(mapElementRef.current, {
          center: [defaultLat, defaultLng],
          zoom: formData.latitude && formData.longitude ? 15 : 7,
          zoomControl: false,
          tap: true, // Enable tap for mobile
          dragging: true, // Enable dragging
          touchZoom: true, // Enable touch zoom
          doubleClickZoom: true, // Enable double click zoom
          scrollWheelZoom: true, // Enable scroll wheel zoom
          boxZoom: true, // Enable box zoom
          keyboard: true, // Enable keyboard navigation
          zoomAnimation: true, // Enable zoom animation
          fadeAnimation: true, // Enable fade animation
          inertia: true // Enable inertia
        });
        
        // Add zoom control to top-right (easier to reach on mobile)
        L.control.zoom({
          position: 'topright'
        }).addTo(leafletMapRef.current);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(leafletMapRef.current);
        
        // Add marker if coordinates exist
        if (formData.latitude && formData.longitude) {
          addOrUpdateMarker(parseFloat(formData.latitude), parseFloat(formData.longitude));
        }
        
        // Add click handler
        leafletMapRef.current.on('click', handleMapClick);
      }
      
      // Ensure map is rendered properly
      setTimeout(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      }, 100);
      
      // Cleanup
      return () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.off('click', handleMapClick);
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
          markerRef.current = null;
        }
      };
    }, []);
    
    // Update map when coordinates change
    useEffect(() => {
      if (!leafletMapRef.current) return;
      
      // Update map view if coordinates exist
      if (formData.latitude && formData.longitude) {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        
        // Update or add marker
        addOrUpdateMarker(lat, lng);
        
        // Update map view
        leafletMapRef.current.setView([lat, lng], 15);
      } else if (markerRef.current) {
        // Remove marker if no coordinates
        markerRef.current.remove();
        markerRef.current = null;
      }
      
      // Ensure map is rendered properly
      setTimeout(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      }, 100);
    }, [formData.latitude, formData.longitude]);
    
    // Function to add or update marker
    const addOrUpdateMarker = (lat, lng) => {
      // Create Google-style marker icon
      const markerIcon = createGoogleMarkerIcon();
      
      // Update existing marker or create new one
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], {
          icon: markerIcon,
          draggable: true
        }).addTo(leafletMapRef.current);
        
        // Add drag end handler
        markerRef.current.on('dragend', handleMarkerDrag);
      }
    };
    
    // Handle map click
    const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;
      console.log(`Map clicked at: ${lat}, ${lng}`);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      }));
      
      // Add or update marker
      addOrUpdateMarker(lat, lng);
      
      // Show loading toast
      const loadingToast = toast.loading('Getting location details...');
      
      try {
        // Fetch location details
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'Durjog-Prohori-Disaster-Management-System'
            }
          }
        );
        
        const data = await response.json();
        toast.dismiss(loadingToast);
        
        if (data && data.display_name) {
          // Update location
          setFormData(prev => ({
            ...prev,
            location: data.display_name,
            fullAddress: data.display_name
          }));
          
          toast.success('Location details updated');
        } else {
          // Use fallback
          const fallbackName = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setFormData(prev => ({
            ...prev,
            location: fallbackName,
            fullAddress: fallbackName
          }));
          
          toast.warn('Could not get location details');
        }
      } catch (error) {
        // Handle error
        console.error('Error getting location details:', error);
        toast.dismiss(loadingToast);
        toast.error('Error getting location details');
        
        // Use fallback
        const fallbackName = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setFormData(prev => ({
          ...prev,
          location: fallbackName,
          fullAddress: fallbackName
        }));
      }
    };
    
    // Handle marker drag
    const handleMarkerDrag = async (e) => {
      const position = e.target.getLatLng();
      console.log(`Marker dragged to: ${position.lat}, ${position.lng}`);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        latitude: position.lat.toFixed(6),
        longitude: position.lng.toFixed(6)
      }));
      
      // Show loading toast
      const loadingToast = toast.loading('Getting location details...');
      
      try {
        // Fetch location details
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'Durjog-Prohori-Disaster-Management-System'
            }
          }
        );
        
        const data = await response.json();
        toast.dismiss(loadingToast);
        
        if (data && data.display_name) {
          // Update location
          setFormData(prev => ({
            ...prev,
            location: data.display_name,
            fullAddress: data.display_name
          }));
          
          toast.success('Location details updated');
        } else {
          // Use fallback
          const fallbackName = `Location at ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
          setFormData(prev => ({
            ...prev,
            location: fallbackName,
            fullAddress: fallbackName
          }));
          
          toast.warn('Could not get location details');
        }
      } catch (error) {
        // Handle error
        console.error('Error getting location details:', error);
        toast.dismiss(loadingToast);
        toast.error('Error getting location details');
        
        // Use fallback
        const fallbackName = `Location at ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        setFormData(prev => ({
          ...prev,
          location: fallbackName,
          fullAddress: fallbackName
        }));
      }
    };
    
    // Get current user location
      // eslint-disable-next-line no-unused-vars
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        toast.info('Getting your current location...');
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Update form data
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6)
            }));
            
            // Update map
            if (leafletMapRef.current) {
              leafletMapRef.current.setView([latitude, longitude], 15);
              addOrUpdateMarker(latitude, longitude);
            }
            
            // Show success
            toast.success('Location coordinates updated');
            
            // Fetch location details
            handleMapClick({ latlng: { lat: latitude, lng: longitude } });
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast.error('Could not get your location');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        toast.error('Geolocation is not supported by your browser');
      }
    };
    
    return (
      <div className="relative h-full w-full">
        <div ref={mapElementRef} className="absolute inset-0"></div>
        
        {/* Map Controls - More visible button */}
        <div className="absolute top-3 left-3 z-[1000] flex flex-col space-y-2 pointer-events-auto">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors border-2 border-gray-200"
            title="Get Current Location"
            aria-label="Get Current Location"
            style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            <FaLocationArrow className="text-blue-600 text-lg" />
          </button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-1 sm:p-2 text-xs text-center text-gray-600 dark:text-gray-300">
          Tap on map to select location
        </div>
      </div>
    );
  });

  // Updated ReportModal component with improved mobile compatibility
  const ReportModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-[70] flex justify-center items-center p-2 sm:p-4" onClick={() => setShowModal(false)}>
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-2 ${editingReport ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'}`}>
                {editingReport ? <FaEdit className="text-lg" /> : <FaPlus className="text-lg" />}
              </span>
              {editingReport ? 'Update Disaster Report' : 'Add New Disaster Report'}
            </h2>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors p-2 rounded-full"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={e => handleFormSubmit(e)} className="space-y-4">
            {/* Stack vertically on mobile, two-column on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* LEFT COLUMN - Form Fields */}
              <div className="space-y-3 sm:space-y-4 order-2 lg:order-1">
                {/* Name Field */}
                <div>
                  <label htmlFor="disaster-name" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 sm:mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="disaster-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter disaster name"
                    autoFocus
                    required
                  />
                </div>
                
                {/* Location Field */}
                <div>
                  <label htmlFor="disaster-location" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 sm:mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="disaster-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Address or location name"
                    required
                  />
                </div>
                
                {/* Coordinates - Stack on very small screens */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label htmlFor="disaster-latitude" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 sm:mb-2">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="disaster-latitude"
                      type="text"
                      inputMode="decimal"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.select()}
                      className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="23.8103"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="disaster-longitude" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 sm:mb-2">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="disaster-longitude"
                      type="text"
                      inputMode="decimal"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.select()}
                      className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="90.4125"
                      required
                    />
                  </div>
                </div>

                {/* Disaster Type */}
                <div>
                  <label htmlFor="disaster-type" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 sm:mb-2">
                    Disaster Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="disaster-type"
                    name="disasterType"
                    value={formData.disasterType}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="SOS">SOS</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="flood">Flood</option>
                    <option value="cyclone">Cyclone</option>
                    <option value="landslide">Landslide</option>
                    <option value="tsunami">Tsunami</option>
                    <option value="fire">Fire</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {/* Danger Level */}
                <div>
                  <label htmlFor="disaster-danger" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 sm:mb-2">
                    Danger Level: <span className="text-blue-600 dark:text-blue-400 font-semibold">{formData.dangerLevel}</span> <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Low</span>
                  <input
                    id="disaster-danger"
                    type="range"
                    name="dangerLevel"
                    min="1"
                    max="10"
                    value={formData.dangerLevel}
                    onChange={handleInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                  />
                    <span className="text-xs text-gray-500">High</span>
                  </div>
                </div>
                
                {/* Description Field */}
                <div>
                  <label htmlFor="disaster-description" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    id="disaster-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide additional details about the disaster..."
                  ></textarea>
                </div>
                
                {/* Visibility */}
                <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <input
                    type="checkbox"
                    name="visible"
                    id="visible"
                    checked={formData.visible}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="visible" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Make this report visible to others <span className="text-xs text-gray-500">(Help others in the area)</span>
                  </label>
                </div>
                
                {/* Action Buttons - Full width on mobile */}
                <div className="pt-4 sm:pt-5 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    {editingReport ? (
                      <>
                        <FaEdit className="mr-1.5" /> Update Report
                      </>
                    ) : (
                      <>
                        <FaPlus className="mr-1.5" /> Submit Report
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* RIGHT COLUMN - Map (show first on mobile) */}
              <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow border border-gray-300 dark:border-gray-700 order-1 lg:order-2">
                {/* Replace map ref with separate MapComponent */}
                <MapComponent formData={formData} setFormData={setFormData} />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Format date to display time and date separately
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
    };
  };

  useEffect(() => {
    // Fetch earthquakes on component mount
    fetchEarthquakes();
    fetchSiteReports();
    
    // Setup scroll sync for mobile
    const tableContainer = document.getElementById('table-container');
    const fixedHeader = document.getElementById('fixed-header');
    
    if (tableContainer && fixedHeader) {
      const handleScroll = () => {
        fixedHeader.scrollLeft = tableContainer.scrollLeft;
      };
      
      tableContainer.addEventListener('scroll', handleScroll);
      
      // Force initial alignment
      setTimeout(() => {
        fixedHeader.scrollLeft = tableContainer.scrollLeft;
      }, 100);
      
      // Update on resize for responsive layouts
      const handleResize = () => {
        fixedHeader.scrollLeft = tableContainer.scrollLeft;
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup event listeners
      return () => {
        tableContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [fetchEarthquakes]);

  const handleRefresh = () => {
    fetchEarthquakes();
    fetchSiteReports();
  };

  const fetchSiteReports = async () => {
    setReportsLoading(true);
    try {
      // Get fresh token from localStorage
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setReportError('Authentication token not found. Please log in again.');
        setReportsLoading(false);
        return;
      }
      
      const response = await axios.get('/api/site-reports', {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      if (response.data.success) {
        setSiteReports(response.data.data);
      }
      setReportError(null);
    } catch (err) {
      console.error('Error fetching site reports:', err);
      setReportError(err.response?.data?.message || 'Failed to fetch your disaster reports');
      
      // Check for auth errors
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      }
    } finally {
      setReportsLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchEarthquakesByMagnitude(magnitudeFilter.min, magnitudeFilter.max);
  };

  // eslint-disable-next-line no-unused-vars
  const getMagnitudeColor = (magnitude) => {
    if (magnitude >= 6) return 'text-red-600';
    if (magnitude >= 5) return 'text-orange-500';
    if (magnitude >= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getDangerLevelColor = (level) => {
    if (level >= 8) return 'bg-red-500';
    if (level >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open modal to add new report
  const handleAddReport = () => {
    setEditingReport(null);
    setFormData({
      name: '',
      location: '',
      latitude: '',
      longitude: '',
      dangerLevel: '5',
      disasterType: 'earthquake',
      description: '',
      visible: true,
      fullAddress: ''
    });
    setShowModal(true);
  };

  // Open modal to edit report
  const handleEditReport = (report) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      dangerLevel: report.dangerLevel.toString(),
      disasterType: report.disasterType || 'earthquake',
      description: report.description || '',
      visible: report.visible !== 0,
      fullAddress: report.fullAddress || ''
    });
    setShowModal(true);
  };

  // Delete a report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await axios.delete(`/api/site-reports/${reportId}`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      if (response.data.success) {
        toast.success('Report deleted successfully');
        fetchSiteReports(); // Refresh the list
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      toast.error(err.response?.data?.message || 'Failed to delete report');
      
      // Check for auth errors
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      }
    }
  };

  // Improved handleFormSubmit with better debugging and data handling
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submit triggered");
    
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      console.log("Current form data:", formData);
      
      // Prepare the data - IMPORTANT: exclude fullAddress as it's not needed in the DB
      const reportData = {
        name: formData.name,
        location: formData.location,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        dangerLevel: parseInt(formData.dangerLevel),
        disasterType: formData.disasterType,
        description: formData.description,
        visible: formData.visible ? 1 : 0
      };
      
      console.log("Prepared report data for API:", reportData);
      
      let response;
      
      if (editingReport) {
        // Update existing report
        console.log(`Updating report with ID: ${editingReport._id}`);
        response = await axios.put(`/api/site-reports/${editingReport._id}`, reportData, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        toast.success('Report updated successfully');
      } else {
        // Create new report
        console.log("Creating new report");
        response = await axios.post('/api/site-reports', reportData, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        toast.success('Report added successfully');
      }
      
      console.log("API response:", response.data);
      
      if (response.data.success) {
        setShowModal(false);
        fetchSiteReports(); // Refresh the list
      } else {
        console.warn("API returned success: false", response.data);
        toast.error(response.data.message || 'Failed to save report');
      }
    } catch (err) {
      console.error('Error saving report:', err);
      
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        toast.error(err.response.data?.message || 'Failed to save report');
      } else {
        toast.error('Failed to save report: ' + (err.message || 'Unknown error'));
      }
      
      // Check for auth errors
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      }
    }
  };

  // Get user's current location
  // eslint-disable-next-line no-unused-vars
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info('Getting your current location...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast.success(`Location found: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          
          // If modal is open, update the form data
          if (showModal) {
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6)
            }));
            
            // Fetch location details
            fetchLocationDetails(latitude, longitude);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not get your location');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };
  
  // Fetch location details from coordinates
  const fetchLocationDetails = async (lat, lng) => {
    const loadingToast = toast.loading('Getting location details...');
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Durjog-Prohori-Disaster-Management-System'
          }
        }
      );
      
      const data = await response.json();
      toast.dismiss(loadingToast);
      
      if (data && data.display_name) {
        setFormData(prev => ({
          ...prev,
          location: data.display_name,
          fullAddress: data.display_name
        }));
        
        toast.success('Location details updated');
      } else {
        const fallbackName = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setFormData(prev => ({
          ...prev,
          location: fallbackName,
          fullAddress: fallbackName
        }));
        
        toast.warn('Could not get location details');
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      toast.dismiss(loadingToast);
      toast.error('Error getting location details');
      
      const fallbackName = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setFormData(prev => ({
        ...prev,
        location: fallbackName,
        fullAddress: fallbackName
      }));
    }
  };

  // Show report details
  const handleShowDetails = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  // Get consistent disaster type color
  const getDisasterTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'earthquake':
        return {
          bg: 'bg-orange-500',
          bgLight: 'bg-orange-100',
          bgDark: 'bg-orange-900/30',
          text: 'text-orange-800',
          textDark: 'text-orange-300',
          border: 'border-orange-500'
        };
      case 'flood':
        return {
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-100',
          bgDark: 'bg-blue-900/30',
          text: 'text-blue-800',
          textDark: 'text-blue-300',
          border: 'border-blue-500'
        };
      case 'cyclone':
        return {
          bg: 'bg-teal-500',
          bgLight: 'bg-teal-100',
          bgDark: 'bg-teal-900/30',
          text: 'text-teal-800',
          textDark: 'text-teal-300',
          border: 'border-teal-500'
        };
      case 'landslide':
        return {
          bg: 'bg-yellow-500',
          bgLight: 'bg-yellow-100',
          bgDark: 'bg-yellow-900/30',
          text: 'text-yellow-800',
          textDark: 'text-yellow-300',
          border: 'border-yellow-500'
        };
      case 'tsunami':
        return {
          bg: 'bg-cyan-500',
          bgLight: 'bg-cyan-100',
          bgDark: 'bg-cyan-900/30',
          text: 'text-cyan-800',
          textDark: 'text-cyan-300',
          border: 'border-cyan-500'
        };
      case 'fire':
        return {
          bg: 'bg-red-500',
          bgLight: 'bg-red-100',
          bgDark: 'bg-red-900/30',
          text: 'text-red-800',
          textDark: 'text-red-300',
          border: 'border-red-500'
        };
      case 'sos':
        return {
          bg: 'bg-red-600',
          bgLight: 'bg-red-100',
          bgDark: 'bg-red-900/40',
          text: 'text-red-800',
          textDark: 'text-red-300',
          border: 'border-red-600'
        };
      default:
        return {
          bg: 'bg-gray-500',
          bgLight: 'bg-gray-100',
          bgDark: 'bg-gray-700',
          text: 'text-gray-800',
          textDark: 'text-gray-300',
          border: 'border-gray-500'
        };
    }
  };

  // Report Details Modal component
  const ReportDetailsModal = () => {
    if (!showDetailModal || !selectedReport) return null;
    
    const disasterColor = getDisasterTypeColor(selectedReport.disasterType);
    const formattedDate = formatDate(selectedReport.createdAt);

  return (
      <div className="fixed inset-0 z-[70] flex items-start justify-center pt-56 px-4" onClick={() => setShowDetailModal(false)}>
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[70vh] overflow-y-auto border border-gray-200 dark:border-gray-700 animate-slideInUp"
          onClick={(e) => e.stopPropagation()}
          style={{backdropFilter: 'blur(8px)'}}
        >
          {/* Header with colored stripe based on disaster type */}
          <div className={`h-1.5 w-full rounded-t-lg ${disasterColor.bg}`}></div>
            
          <div className="px-5 py-4">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 pr-2 flex-1">
                {selectedReport.name}
              </h2>
        <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-full transition-colors flex-shrink-0"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
        </button>
      </div>
      
            <div className="space-y-4">
              {/* Quick Details Row */}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${disasterColor.bgLight} ${disasterColor.text} dark:${disasterColor.bgDark} dark:${disasterColor.textDark}`}>
                  <span className="capitalize">{selectedReport.disasterType || 'earthquake'}</span>
                </span>
                
                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex flex-col">
                    <span>{formattedDate.time}</span>
                    <span className="text-xs">{formattedDate.date}</span>
                  </div>
                </span>
                
                <span className="text-gray-500 dark:text-gray-400 flex items-center ml-auto">
                  {selectedReport.visible ? (
                    <span className="flex items-center text-green-600 dark:text-green-400 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Public
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 dark:text-red-400 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      Private
                    </span>
                  )}
                </span>
              </div>
              
              {/* Danger Level */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-24">Danger Level:</span>
                <div className="flex-1 flex items-center">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full mr-2 ${
                    getDangerLevelColor(selectedReport.dangerLevel)
                  } text-white font-bold shadow-sm`}>
                    {selectedReport.dangerLevel}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded">
                    <div 
                      className={`h-full rounded ${getDangerLevelColor(selectedReport.dangerLevel)}`}
                      style={{ width: `${selectedReport.dangerLevel * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm">
                <div className="flex items-start">
                  <span className={`${disasterColor.text} dark:${disasterColor.textDark} mt-0.5 mr-2 flex-shrink-0`}>
                    <FaMapMarkerAlt />
                  </span>
                  <div>
                    <div className="text-gray-900 dark:text-white break-words">
                      {selectedReport.location}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description if available */}
              {selectedReport.description && (
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                  <div className="font-medium text-gray-800 dark:text-gray-100 mb-1">Description:</div>
                  <p>{selectedReport.description}</p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-1">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditReport(selectedReport);
                  }}
                  className={`flex-1 flex items-center justify-center py-2 px-3 ${disasterColor.bgLight} hover:bg-opacity-80 ${disasterColor.text} font-medium rounded-md border ${disasterColor.border} border-opacity-30 transition-colors dark:${disasterColor.bgDark} dark:hover:bg-opacity-50 dark:${disasterColor.textDark}`}
                >
                  <FaEdit className="mr-1.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDeleteReport(selectedReport._id);
                  }}
                  className="flex-1 flex items-center justify-center py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-md border border-red-200 transition-colors dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                >
                  <FaTrash className="mr-1.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add a slideInUp animation to the global CSS
  useEffect(() => {
    // Create style element for animation if it doesn't exist
    if (!document.getElementById('custom-animations')) {
      const style = document.createElement('style');
      style.id = 'custom-animations';
      style.innerHTML = `
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.2s ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Cleanup animation styles on component unmount if needed
      // const styleEl = document.getElementById('custom-animations');
      // if (styleEl) styleEl.remove();
    };
  }, []);

  // Report Card component for displaying report data
  const ReportCard = ({ report, onClick }) => {
    const rowColor = getDisasterTypeColor(report.disasterType);
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return date.toLocaleString();
    };

    return (
      <div 
        className={`group relative rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 h-[280px] flex flex-col cursor-pointer bg-white dark:bg-gray-800 overflow-hidden`}
        onClick={() => onClick(report)}
      >
        {/* Header with icon and danger level */}
        <div className={`relative p-4 flex justify-between items-start ${rowColor.bg} backdrop-blur-sm`}>
          <div className="flex items-center space-x-2">
            <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 text-white backdrop-blur-sm shadow-md`}>
              {report.disasterType?.slice(0, 1).toUpperCase() || 'E'}
            </span>
            <span className="text-sm font-medium text-white capitalize">
              {report.disasterType || 'earthquake'}
            </span>
          </div>
          {report.dangerLevel >= 8 && (
            <div className="px-2 py-1 rounded bg-white/20 backdrop-blur-sm">
              <span className="text-xs font-medium text-white">
                High Risk
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {report.name}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {report.location || 'Location not specified'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formatDate(report.createdAt)}
              </p>
            </div>
            
            {report.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">
                {report.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                report.dangerLevel >= 8 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                report.dangerLevel >= 5 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                Danger Level {report.dangerLevel}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {report.visible ? 'Visible' : 'Hidden'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Replace the table view with this card grid view
  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="h-full overflow-y-auto">
        <div className="p-2 pt-1 max-w-7xl mx-auto">
          {/* Error Message */}
          {reportError && (
            <div className="mb-4 px-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md shadow-sm border-l-4 border-red-500 flex items-start">
              <FaExclamationTriangle className="text-lg mr-2 mt-0.5 flex-shrink-0" />
              <span>{reportError}</span>
            </div>
          )}

          {/* Cards Grid */}
          <div className="px-4 md:pl-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {siteReports.length === 0 && !reportsLoading ? (
                <div className="col-span-1 md:col-span-3 text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="bg-gray-50 dark:bg-gray-800/70 rounded-full p-3 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-1">No reports available</p>
                    <p className="text-sm">Click "Add Report" to create your first disaster report.</p>
                    <button
                      onClick={handleAddReport}
                      className="mt-5 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <FaPlus className="inline mr-2" /> Add Your First Report
                    </button>
                  </div>
                </div>
              ) : (
                siteReports.map((report) => (
                  <ReportCard 
                    key={report._id} 
                    report={report}
                    onClick={handleShowDetails}
                  />
                ))
              )}
            </div>
            
            {/* Floating Action Buttons */}
            <div className="fixed bottom-20 right-4 flex flex-col gap-4 z-50">
              {/* Add Report Button */}
              <button
                onClick={handleAddReport}
                className="p-3 bg-green-600 hover:bg-green-700 rounded-full transition-all duration-200 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Add new report"
              >
                <FaPlus className="text-lg" />
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh} 
                className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-200 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Refresh reports"
              >
                <FaSync className={reportsLoading ? "animate-spin text-lg" : "text-lg"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keep existing modals */}
      {showModal && <ReportModal />}
      {showDetailModal && <ReportDetailsModal />}
      <EarthquakeNotifications />
    </div>
  );
};

export default Earthquakes; 