import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import AuthorityLayout from '../components/authority/AuthorityLayout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationArrow, FaEdit } from 'react-icons/fa';

// Define the authority theme color to match the layout
const AUTHORITY_COLOR = 'rgb(88, 10, 107)';

const AuthorityDisasters = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('Earthquake');
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    dangerLevel: '5',
    dateTime: '',
    visible: true,
    needsFirefighters: false,
    needsNGOs: false,
    status: 'pending'
  });
  
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Set default date time value as current date and time
  useEffect(() => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
    
    setFormData(prev => ({
      ...prev,
      dateTime: localDateTime
    }));
  }, []);
  
  // Listen for tab changes from AuthorityLayout
  useEffect(() => {
    const handleTabChange = (event) => {
      setActiveTab(event.detail.activeTab);
    };
    
    // Add event listener for custom event
    document.addEventListener('disasterTabChange', handleTabChange);
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('disasterTabChange', handleTabChange);
    };
  }, []);

  // Fetch disasters based on active tab
  useEffect(() => {
    fetchDisasters();
    resetForm();
  }, [activeTab]);

  const fetchDisasters = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab.toLowerCase();
      
      if (endpoint === 'earthquake') {
        // Direct connection to MongoDB for earthquakes
        try {
          const response = await axios.get('/api/disasters/mongodb/earthquakes');
          
          // Process data if needed to ensure compatibility with the UI
          const processedData = response.data.data.map(item => {
            return {
              _id: item._id,
              name: item.name || item.title || "Unnamed Earthquake",
              location: item.location || item.place || "Unknown Location",
              latitude: item.latitude || (item.coordinates ? item.coordinates[1] : 0),
              longitude: item.longitude || (item.coordinates ? item.coordinates[0] : 0),
              dangerLevel: item.dangerLevel || item.magnitude || 5,
              dateTime: item.dateTime || item.time || item.createdAt,
              visible: item.visible !== undefined ? item.visible : 1,
              createdAt: item.createdAt || new Date().toISOString()
            };
          });
          
          setDisasters(processedData);
          setError(null);
        } catch (mongoErr) {
          console.error('Error fetching from MongoDB directly:', mongoErr);
          // Fallback to regular API if MongoDB direct connection fails
          const fallbackResponse = await axios.get(`/api/disasters/${endpoint}`);
          setDisasters(fallbackResponse.data.data);
          setError(null);
        }
      } else {
        // Use regular API for other disaster types
        const response = await axios.get(`/api/disasters/${endpoint}`);
        setDisasters(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch disasters');
      toast.error(language === 'en' 
        ? 'Failed to fetch disasters' 
        : 'দুর্যোগের তথ্য আনতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // This function can be removed as it's duplicated in the DisasterForm component
  // eslint-disable-next-line no-unused-vars
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
      
    setFormData({
      name: '',
      location: '',
      latitude: '',
      longitude: '',
      dangerLevel: '5',
      dateTime: localDateTime,
      visible: true,
      needsFirefighters: false,
      needsNGOs: false,
      status: 'pending'
    });
    setEditMode(false);
    setEditId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e, enrichedFormData) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = activeTab.toLowerCase();
      const payload = enrichedFormData || {
        name: formData.name,
        location: formData.location,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        dangerLevel: parseInt(formData.dangerLevel),
        dateTime: formData.dateTime,
        visible: formData.visible ? 1 : 0,
        needsFirefighters: formData.needsFirefighters,
        needsNGOs: formData.needsNGOs,
        status: formData.status
      };

      // Ensure that needsFirefighters and needsNGOs are boolean values, not undefined or null
      if (payload.needsFirefighters === undefined) payload.needsFirefighters = false;
      if (payload.needsNGOs === undefined) payload.needsNGOs = false;

      console.log('Submitting disaster data:', payload);
      console.log('Endpoint:', `/api/disasters/${endpoint}`);
      console.log('needsFirefighters in final payload:', payload.needsFirefighters);
      console.log('needsNGOs in final payload:', payload.needsNGOs);

      const response = await axios({
        method: editMode ? 'put' : 'post',
        url: editMode ? `/api/disasters/${endpoint}/${editId}` : `/api/disasters/${endpoint}`,
        data: payload
      });

        console.log('Server response:', response.data);
        toast.success(language === 'en' 
        ? (editMode ? 'Disaster updated successfully' : 'Disaster added successfully')
        : (editMode ? 'দুর্যোগ সফলভাবে আপডেট করা হয়েছে' : 'দুর্যোগ সফলভাবে যোগ করা হয়েছে'));
      
      // Close form and reset after successful submission
      resetForm();
      fetchDisasters();
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error(language === 'en' 
        ? err.response?.data?.message || 'Failed to save disaster' 
        : 'দুর্যোগ সংরক্ষণ করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (disaster) => {
    // Format the date for the input
    let dateTimeValue = disaster.dateTime ? 
      new Date(disaster.dateTime).toISOString().slice(0, 16) : 
      new Date(disaster.createdAt).toISOString().slice(0, 16);
      
    setFormData({
      name: disaster.name,
      location: disaster.location,
      latitude: disaster.latitude,
      longitude: disaster.longitude,
      dangerLevel: disaster.dangerLevel.toString(),
      dateTime: dateTimeValue,
      visible: disaster.visible === 1,
      needsFirefighters: disaster.needsFirefighters || false,
      needsNGOs: disaster.needsNGOs || false,
      status: disaster.status || 'pending'
    });
    setEditMode(true);
    setEditId(disaster._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // Create a custom confirmation popup instead of using window.confirm
    const confirmDelete = () => {
      return new Promise((resolve) => {
        const confirmationElement = document.createElement('div');
        confirmationElement.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4';
        confirmationElement.innerHTML = `
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <div class="flex items-center text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-xl font-bold dark:text-white">${language === 'en' ? 'Confirm Deletion' : 'মুছে ফেলার নিশ্চিতকরণ'}</h2>
            </div>
            <p class="mb-6 text-gray-700 dark:text-gray-300">
              ${language === 'en' 
                ? 'Are you sure you want to delete this disaster? This action cannot be undone.' 
                : 'আপনি কি নিশ্চিত যে আপনি এই দুর্যোগটি মুছতে চান? এই পদক্ষেপটি পূর্বাবস্থায় ফেরানো যাবে না।'}
            </p>
            <div class="flex justify-end space-x-3">
              <button id="cancel-delete" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded">
                ${language === 'en' ? 'Cancel' : 'বাতিল করুন'}
              </button>
              <button id="confirm-delete" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded">
                ${language === 'en' ? 'Delete' : 'মুছুন'}
              </button>
            </div>
          </div>
        `;
        
        document.body.appendChild(confirmationElement);
        
        document.getElementById('cancel-delete').addEventListener('click', () => {
          document.body.removeChild(confirmationElement);
          resolve(false);
        });
        
        document.getElementById('confirm-delete').addEventListener('click', () => {
          document.body.removeChild(confirmationElement);
          resolve(true);
        });
      });
    };

    const confirmed = await confirmDelete();
    
    if (!confirmed) return;

    try {
      const endpoint = activeTab.toLowerCase();
      await axios.delete(`/api/disasters/${endpoint}/${id}`);
      toast.success(language === 'en' 
        ? 'Disaster deleted successfully' 
        : 'দুর্যোগ সফলভাবে মুছে ফেলা হয়েছে');
      fetchDisasters();
    } catch (err) {
      toast.error(language === 'en' 
        ? 'Failed to delete disaster' 
        : 'দুর্যোগ মুছতে ব্যর্থ হয়েছে');
    }
  };

  const toggleVisibility = async (disaster) => {
    try {
      const endpoint = activeTab.toLowerCase();
      const newVisibility = disaster.visible === 1 ? 0 : 1;
      
      if (activeTab === 'Earthquake') {
        await axios.patch(`/api/disasters/${endpoint}/${disaster._id}/visibility`, {
          visible: newVisibility
        });
      } else {
        await axios.put(`/api/disasters/${endpoint}/${disaster._id}`, {
          name: disaster.name,
          location: disaster.location,
          latitude: disaster.latitude,
          longitude: disaster.longitude,
          dangerLevel: disaster.dangerLevel,
          dateTime: disaster.dateTime || disaster.createdAt,
          visible: newVisibility
        });
      }
      
      toast.success(language === 'en' 
        ? 'Visibility updated successfully' 
        : 'দৃশ্যমানতা সফলভাবে আপডেট করা হয়েছে');
      fetchDisasters();
    } catch (err) {
      toast.error(language === 'en' 
        ? 'Failed to update visibility' 
        : 'দৃশ্যমানতা আপডেট করতে ব্যর্থ হয়েছে');
    }
  };

  const openAddModal = () => {
    // Reset form with proper default values
    const now = new Date();
    const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
      
    setFormData({
      name: '',
      location: '',
      latitude: '',
      longitude: '',
      dangerLevel: '5',
      dateTime: localDateTime,
      visible: true,
      needsFirefighters: false,
      needsNGOs: false,
      status: 'pending'
    });
    
    setEditMode(false);
    setEditId(null);
    setShowModal(true);
  };

  // Format Date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    
    const dateFormat = date.toLocaleString(language === 'en' ? 'en-US' : 'bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const timeFormat = date.toLocaleString(language === 'en' ? 'en-US' : 'bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <div>
        <div>{dateFormat}</div>
        <div>{timeFormat}</div>
      </div>
    );
  };

  // Selected location marker (red pin) - from AuthorityMap
  const locationMarkerIcon = L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 30px;
        height: 45px;
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

  // Extracted form component to prevent re-rendering issues
  const DisasterForm = ({ formData, setFormData, handleSubmit, resetForm, editMode, loading, language }) => {
    const mapRef = React.useRef(null);
    const mapInstance = React.useRef(null);
    const locationMarker = React.useRef(null);
    const [locationName, setLocationName] = useState(formData.location || '');
    const [selectedFirefighters, setSelectedFirefighters] = useState(formData.assignedFirefighters || []);
    const [selectedNGOs, setSelectedNGOs] = useState(formData.assignedNGOs || []);
    
    // Initialize map when component mounts
    useEffect(() => {
      if (mapRef.current && !mapInstance.current) {
        // Initialize the map
        mapInstance.current = L.map(mapRef.current, {
          center: formData.latitude && formData.longitude ? 
            [parseFloat(formData.latitude), parseFloat(formData.longitude)] : 
            [23.8103, 90.4125], // Default to Dhaka, Bangladesh
          zoom: formData.latitude && formData.longitude ? 15 : 7,
          zoomControl: false
        });
        
        // Add zoom control to bottom right
        L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstance.current);
        
        // Add map tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstance.current);
        
        // Add click handler
        mapInstance.current.on('click', handleMapClick);
        
        // Add marker if coordinates exist
        if (formData.latitude && formData.longitude) {
          locationMarker.current = L.marker(
            [parseFloat(formData.latitude), parseFloat(formData.longitude)], 
            { icon: locationMarkerIcon, draggable: true }
          ).addTo(mapInstance.current);
          
          // Add drag end event
          locationMarker.current.on('dragend', async function() {
            const newPos = locationMarker.current.getLatLng();
            updateLocationData(newPos.lat, newPos.lng);
          });
          
          // Set initial location name
          setLocationName(formData.location);
        }
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
      
      // Update form data with location
      updateLocationData(lat, lng);
      
      // Add drag end event
      locationMarker.current.on('dragend', async function() {
        const newPos = locationMarker.current.getLatLng();
        updateLocationData(newPos.lat, newPos.lng);
      });
    };
    
    // Update location data
    const updateLocationData = async (lat, lng) => {
      // Update coordinates in form data
      setFormData(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      }));
      
      // Get address for clicked location using Nominatim
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=${language === 'en' ? 'en' : 'bn'}`);
        const data = await response.json();
        
        if (data && data.display_name) {
          // Use the full display name directly without any modification
          setLocationName(data.display_name);
          
          // Update location field in form data
          setFormData(prev => ({
            ...prev,
            location: data.display_name
          }));
        } else {
          const fallbackName = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setLocationName(fallbackName);
          setFormData(prev => ({
            ...prev,
            location: fallbackName
          }));
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        const fallbackName = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setLocationName(fallbackName);
        setFormData(prev => ({
          ...prev,
          location: fallbackName
        }));
      }
    };
    
    // Find my location
    const handleLocateClick = () => {
      if (!mapInstance.current) return;
      
      mapInstance.current.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true
      });
      
      mapInstance.current.on('locationfound', async (e) => {
        const { lat, lng } = e;
        
        // Remove existing marker if it exists
        if (locationMarker.current) {
          locationMarker.current.remove();
        }
        
        // Add marker at user's location
        locationMarker.current = L.marker([lat, lng], {
          icon: locationMarkerIcon,
          draggable: true
        }).addTo(mapInstance.current);
        
        // Add drag end event listener
        locationMarker.current.on('dragend', function() {
          const newPos = locationMarker.current.getLatLng();
          updateLocationData(newPos.lat, newPos.lng);
        });
        
        // Update location data
        updateLocationData(lat, lng);
      });
      
      mapInstance.current.on('locationerror', (e) => {
        console.error('Location error:', e.message);
        alert(language === 'en' ? 'Could not find your location' : 'আপনার অবস্থান পাওয়া যায়নি');
      });
    };
    
    // Handle input change for form fields
    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Handle special checkbox cases
      if (type === 'checkbox') {
        // If "Needs Firefighters" is unchecked, clear all selected firefighters
        if (name === 'needsFirefighters' && !checked) {
          setSelectedFirefighters([]);
        }
        
        // If "Needs NGOs" is unchecked, clear all selected NGOs
        if (name === 'needsNGOs' && !checked) {
          setSelectedNGOs([]);
        }
      }
      
      // If location name is changed manually, update state
      if (name === 'location') {
        setLocationName(value);
      }
      
      // Update marker position if latitude or longitude is changed manually
      if ((name === 'latitude' || name === 'longitude') && mapInstance.current && locationMarker.current) {
        const lat = name === 'latitude' ? parseFloat(value) : parseFloat(formData.latitude);
        const lng = name === 'longitude' ? parseFloat(value) : parseFloat(formData.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          locationMarker.current.setLatLng([lat, lng]);
          mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
        }
      }
    };

    // Prevent direct call to resetForm from DisasterForm component 
    // to avoid interference with parent component state
    const handleCancel = () => {
      resetForm();
    };

    // Handle form submission with selected entities
    const handleFormSubmit = (e) => {
          e.preventDefault();
          console.log('Form submitted in DisasterForm component');
      
      // Create enriched form data with proper assignments based on checkbox state
      const enrichedFormData = {
        ...formData,
        needsFirefighters: formData.needsFirefighters,
        needsNGOs: formData.needsNGOs,
        // Only include assigned firefighters if the checkbox is checked
        assignedFirefighters: formData.needsFirefighters ? 
          selectedFirefighters.map(ff => ({
            firefighterId: ff.id || ff.firefighterId,
            name: ff.name,
            station: ff.station,
            phoneNumber: ff.phoneNumber || '',
            location: ff.location || '',
            latitude: ff.latitude,
            longitude: ff.longitude,
            distance: ff.distance
          })) : [],
        // Only include assigned NGOs if the checkbox is checked
        assignedNGOs: formData.needsNGOs ? 
          selectedNGOs.map(ngo => ({
            ngoId: ngo.id || ngo.ngoId,
            name: ngo.name,
            organization: ngo.organization,
            phoneNumber: ngo.phoneNumber || '',
            email: ngo.email || '',
            location: ngo.location || '',
            latitude: ngo.latitude,
            longitude: ngo.longitude, 
            distance: ngo.distance
          })) : []
      };
      
      console.log('Enriched form data:', enrichedFormData);
      console.log('needsFirefighters value:', enrichedFormData.needsFirefighters);
      console.log('needsNGOs value:', enrichedFormData.needsNGOs);
      handleSubmit(e, enrichedFormData);
    };

    return (
      <form 
        onSubmit={handleFormSubmit}
        className="space-y-4"
      >
        {/* Three-column layout: Form fields, Map, Emergency Services */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* LEFT COLUMN - Form Fields */}
          <div className="space-y-4 lg:w-1/5">
            {/* Name Field */}
            <div>
              <label htmlFor="disaster-name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {language === 'en' ? 'Name' : 'নাম'} <span className="text-red-500">*</span>
              </label>
              <input
                id="disaster-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'en' ? 'Disaster name' : 'দুর্যোগের নাম'}
                autoFocus
                required
              />
            </div>
            
            {/* Location Field */}
            <div>
              <label htmlFor="disaster-location" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {language === 'en' ? 'Location' : 'অবস্থান'} <span className="text-red-500">*</span>
              </label>
              <input
                id="disaster-location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'en' ? 'Location' : 'অবস্থান'}
                required
              />
            </div>
            
            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="disaster-latitude" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  {language === 'en' ? 'Latitude' : 'অক্ষাংশ'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="disaster-latitude"
                  type="text"
                  inputMode="decimal"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  onFocus={(e) => e.target.select()}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="23.8103"
                  required
                />
              </div>
              <div>
                <label htmlFor="disaster-longitude" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  {language === 'en' ? 'Longitude' : 'দ্রাঘিমাংশ'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="disaster-longitude"
                  type="text"
                  inputMode="decimal"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  onFocus={(e) => e.target.select()}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="90.4125"
                  required
                />
              </div>
            </div>
            
            {/* Date and Time */}
            <div>
              <label htmlFor="disaster-datetime" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {language === 'en' ? 'Time & Date' : 'সময় ও তারিখ'} <span className="text-red-500">*</span>
              </label>
              <input
                id="disaster-datetime"
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Danger Level */}
            <div>
              <label htmlFor="disaster-danger" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {language === 'en' ? 'Danger Level (1-10)' : 'বিপদ স্তর (১-১০)'} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  id="disaster-danger"
                  type="range"
                  min="1"
                  max="10"
                  name="dangerLevel"
                  value={formData.dangerLevel || "5"}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  required
                />
                <span className="ml-3 font-bold text-lg min-w-[30px]">
                  {formData.dangerLevel || "5"}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
            
            {/* Visibility */}
            <div className="mt-4">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="disaster-visible"
                    name="visible"
                    checked={formData.visible}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${formData.visible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform duration-300 ${formData.visible ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
                <span className="ml-3 text-gray-700 dark:text-gray-300">
                  {language === 'en' ? (formData.visible ? 'Visible to users' : 'Hidden from users') : 
                    (formData.visible ? 'ব্যবহারকারীদের কাছে দৃশ্যমান' : 'ব্যবহারকারীদের কাছে অদৃশ্য')}
                </span>
              </label>
            </div>
            
            {/* Status Field */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'en' ? 'Status' : 'স্ট্যাটাস'}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="pending">{language === 'en' ? 'Pending' : 'অপেক্ষমান'}</option>
                  <option value="processing">{language === 'en' ? 'Processing' : 'প্রক্রিয়াকরণ'}</option>
                  <option value="resolved">{language === 'en' ? 'Resolved' : 'সমাধান'}</option>
                  <option value="declined">{language === 'en' ? 'Declined' : 'প্রত্যাখ্যান'}</option>
                </select>
              </div>
            </div>
            
            {/* Form Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="submit"
                style={{
                  backgroundColor: loading ? 'rgba(88, 10, 107, 0.7)' : 'rgb(88, 10, 107)',
                }}
                className={`${loading ? 'cursor-not-allowed' : 'hover:bg-purple-900'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 transition duration-150`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === 'en' ? 'Processing...' : 'প্রক্রিয়া হচ্ছে...'}
                  </span>
                ) : (
                  editMode 
                    ? (language === 'en' ? 'Update' : 'আপডেট করুন') 
                    : (language === 'en' ? 'Add' : 'যোগ করুন')
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 transition duration-150"
                disabled={loading}
              >
                {language === 'en' ? 'Cancel' : 'বাতিল করুন'}
              </button>
            </div>
          </div>
          
          {/* MIDDLE COLUMN - Map Container */}
          <div className="border rounded-lg overflow-hidden h-full lg:h-[500px] relative lg:w-5/12">
            {/* Map Element */}
            <div 
              ref={mapRef}
              className="w-full h-full"
              style={{ touchAction: 'none', cursor: 'crosshair' }}
            ></div>
            
            {/* Map controls */}
            <div className="absolute bottom-8 right-4 z-10">
              <button
                type="button"
                onClick={handleLocateClick}
                className="bg-white dark:bg-gray-800 w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                title={language === 'en' ? 'Find my location' : 'আমার অবস্থান খুঁজুন'}
              >
                <FaLocationArrow className="text-blue-500" />
              </button>
            </div>
            
            {/* Location display */}
            {locationName && (
              <div className="absolute bottom-20 left-4 right-20 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 z-10">
                <p className="text-sm font-medium">
                  <span className="text-blue-600 dark:text-blue-400">{language === 'en' ? 'Selected:' : 'নির্বাচিত:'}</span> {locationName}
                </p>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 text-xs text-gray-600 dark:text-gray-300">
              {language === 'en' 
                ? 'Click on the map to select location or drag the marker to adjust' 
                : 'অবস্থান নির্বাচন করতে মানচিত্রে ক্লিক করুন বা সমন্বয় করতে মার্কার টেনে আনুন'}
            </div>
          </div>
          
          {/* RIGHT COLUMN - Emergency Services (exactly where marked in red) */}
          <div className="space-y-4 border rounded-lg p-4 bg-gray-50 lg:w-2/5">
            <h3 className="text-lg font-semibold border-b pb-2 text-purple-800">
                {language === 'en' ? 'Emergency Services Needed' : 'প্রয়োজনীয় জরুরি সেবা'}
              </h3>
              
              <div className="space-y-4">
                {/* Needs Firefighters Checkbox */}
                <div className="flex items-center">
                  <input
                    id="needs-firefighters"
                    type="checkbox"
                    name="needsFirefighters"
                    checked={formData.needsFirefighters}
                    onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="needs-firefighters" className="ml-2 block text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Firefighters Needed' : 'অগ্নিনির্বাপক প্রয়োজন'}
                  </label>
                </div>
                
                {/* Needs NGOs Checkbox */}
                <div className="flex items-center">
                  <input
                    id="needs-ngos"
                    type="checkbox"
                    name="needsNGOs"
                    checked={formData.needsNGOs}
                    onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="needs-ngos" className="ml-2 block text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'NGOs Needed' : 'এনজিও প্রয়োজন'}
                  </label>
              </div>
            </div>
            
            {/* Show nearby firefighters if needed */}
            {formData.needsFirefighters && (
              <div className="mt-4">
                {formData.latitude && formData.longitude ? (
                  <>
                    <div className="mb-2 p-1 bg-gray-100 rounded-md text-xs text-gray-500">
                      {language === 'en' 
                        ? `Searching for firefighters near ${formData.latitude}, ${formData.longitude}` 
                        : `${formData.latitude}, ${formData.longitude} এর কাছাকাছি অগ্নিনির্বাপকদের অনুসন্ধান করা হচ্ছে`}
                    </div>
                <NearbyFirefightersList 
                  latitude={parseFloat(formData.latitude)} 
                  longitude={parseFloat(formData.longitude)} 
                  language={language}
                  onSelectFirefighters={(newSelection) => {
                        console.log('New firefighter selection:', newSelection);
                    if (newSelection) {
                      setSelectedFirefighters(newSelection);
                      return newSelection;
                    }
                    return selectedFirefighters;
                  }}
                />
                  </>
                ) : (
                  <div className="p-3 border rounded-md bg-yellow-50">
                    <p className="text-center text-amber-700 font-medium">
                      {language === 'en' ? 'Please select a location on the map first' : 'অনুগ্রহ করে প্রথমে মানচিত্রে একটি অবস্থান নির্বাচন করুন'}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Show nearby NGOs if needed */}
            {formData.needsNGOs && (
              <div className="mt-4">
                {formData.latitude && formData.longitude ? (
                  <>
                    <div className="mb-2 p-1 bg-gray-100 rounded-md text-xs text-gray-500">
                      {language === 'en' 
                        ? `Searching for NGOs near ${formData.latitude}, ${formData.longitude}` 
                        : `${formData.latitude}, ${formData.longitude} এর কাছাকাছি এনজিওদের অনুসন্ধান করা হচ্ছে`}
                    </div>
                <NearbyNGOsList 
                  latitude={parseFloat(formData.latitude)} 
                  longitude={parseFloat(formData.longitude)}
                  language={language}
                  onSelectNGOs={(newSelection) => {
                        console.log('New NGO selection:', newSelection);
                    if (newSelection) {
                      setSelectedNGOs(newSelection);
                      return newSelection;
                    }
                    return selectedNGOs;
                  }}
                />
                  </>
                ) : (
                  <div className="p-3 border rounded-md bg-yellow-50">
                    <p className="text-center text-amber-700 font-medium">
                      {language === 'en' ? 'Please select a location on the map first' : 'অনুগ্রহ করে প্রথমে মানচিত্রে একটি অবস্থান নির্বাচন করুন'}
                </p>
              </div>
            )}
            </div>
            )}
          </div>
        </div>
      </form>
    );
  };

  // Modal component
  const FormModal = () => {
    return (
      <>
        {showModal && (
          <>
            <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                onClick={() => resetForm()}
              ></div>
              <div 
                className={`
                  relative w-full max-w-8xl mx-auto my-6 z-50 p-4
                  transform transition-all duration-300 ease-out
                  ${showModal ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'}
                `}
              >
                <div 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-h-[90vh] overflow-y-auto mt-[10px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">
                      {editMode 
                        ? (language === 'en' ? 'Update Disaster' : 'দুর্যোগ আপডেট করুন') 
                        : (language === 'en' ? 'Add New Disaster' : 'নতুন দুর্যোগ যোগ করুন')}
                    </h2>
                    <button 
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700 transition duration-150"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {activeTab === 'Earthquake' ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                      <p className="text-yellow-700">
                        {language === 'en' 
                          ? 'Earthquake data is managed by automated systems and cannot be modified manually. However, you can toggle visibility by clicking the visibility indicator in the table.' 
                          : 'ভূমিকম্পের তথ্য স্বয়ংক্রিয় সিস্টেম দ্বারা পরিচালিত হয় এবং ম্যানুয়ালি পরিবর্তন করা যাবে না। তবে, টেবিলের দৃশ্যমানতা সূচক ক্লিক করে দৃশ্যমানতা টগল করতে পারেন।'}
                      </p>
                    </div>
                  ) : (
                    <DisasterForm
                      formData={formData}
                      setFormData={setFormData}
                      handleSubmit={handleSubmit}
                      resetForm={resetForm}
                      editMode={editMode}
                      loading={loading}
                      language={language}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  const DisasterContent = () => (
    <div className="w-full">
      {/* Remove the fixed disaster type tabs bar */}
      
      {/* Reduced spacer to move table higher */}
      <div className="pt-[30px]"></div>

      {/* Floating action button in bottom right */}
          {activeTab !== 'Earthquake' && (
        <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={openAddModal}
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full shadow-lg transition duration-150 hover:shadow-xl transform hover:scale-105"
            title={language === 'en' ? 'Add New Disaster' : 'নতুন দুর্যোগ যোগ করুন'}
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
        </div>
      )}
      
      {/* Table Section - Adjusted margin for higher position */}
      <div className="bg-white p-0 mt-[-10px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
            {error}
          </div>
        ) : disasters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
          {language === 'en' 
              ? 'No disasters found' 
              : 'কোন দুর্যোগ পাওয়া যায়নি'}
          </div>
        ) : (
          <div className="container mx-auto px-4">
            {/* Table with sticky header */}
            <div className="overflow-x-auto w-full border border-gray-200 rounded-lg shadow-sm">
              <div className="relative">
                {/* Fixed header */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                  {/* Fixed header table */}
                  <table className="w-full table-fixed border-collapse">
                    <colgroup>
                      <col style={{ width: '12%' }} /> {/* Name */}
                      <col style={{ width: '16%' }} /> {/* Location */}
                      <col style={{ width: '14%' }} /> {/* Coordinates */}
                      <col style={{ width: '12%' }} /> {/* Time & Date */}
                      <col style={{ width: '6%' }} />  {/* Danger */}
                      <col style={{ width: '7%' }} />  {/* Visible */}
                      <col style={{ width: '10%' }} /> {/* Status */}
                      <col style={{ width: '12%' }} /> {/* Assigned Teams */}
                      {activeTab !== 'Earthquake' && <col style={{ width: '11%' }} />} {/* Actions */}
                    </colgroup>
                    <thead style={{ backgroundColor: AUTHORITY_COLOR }} className="text-white sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-center font-semibold border-b">{language === 'en' ? 'Name' : 'নাম'}</th>
                        <th className="px-4 py-3 text-center font-semibold border-b">{language === 'en' ? 'Location' : 'অবস্থান'}</th>
                        <th className="px-4 py-3 text-center font-semibold border-b">{language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}</th>
                        <th className="px-4 py-3 text-center font-semibold border-b">{language === 'en' ? 'Time & Date' : 'সময় ও তারিখ'}</th>
                        <th className="px-4 py-3 text-center font-semibold border-b">{language === 'en' ? 'Danger' : 'বিপদ'}</th>
                        <th className="px-4 py-3 text-center font-semibold border-b">{language === 'en' ? 'Visible' : 'দৃশ্যমান'}</th>
                        <th className="px-4 py-3 text-center font-semibold border-b">{language === 'en' ? 'Status' : 'স্ট্যাটাস'}</th>
                        <th className="px-4 py-3 text-center font-semibold border-b">{language === 'en' ? 'Assigned Teams' : 'নিয়োগকৃত দল'}</th>
                        {activeTab !== 'Earthquake' && (
                          <th className="px-4 py-3 text-center font-semibold border-b">{language === 'en' ? 'Actions' : 'পদক্ষেপ'}</th>
                        )}
                      </tr>
                    </thead>
                  </table>

                  {/* Scrollable body */}
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <table className="w-full table-fixed border-collapse">
                      <colgroup>
                        <col style={{ width: '12%' }} /> {/* Name */}
                        <col style={{ width: '16%' }} /> {/* Location */}
                        <col style={{ width: '14%' }} /> {/* Coordinates */}
                        <col style={{ width: '12%' }} /> {/* Time & Date */}
                        <col style={{ width: '6%' }} />  {/* Danger */}
                        <col style={{ width: '7%' }} />  {/* Visible */}
                        <col style={{ width: '10%' }} /> {/* Status */}
                        <col style={{ width: '12%' }} /> {/* Assigned Teams */}
                        {activeTab !== 'Earthquake' && <col style={{ width: '11%' }} />} {/* Actions */}
                      </colgroup>
                      <tbody className="divide-y divide-gray-200">
                        {disasters.map((disaster, index) => (
                          <tr key={disaster._id} 
                            className={`
                              ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                              hover:bg-gray-100 transition-colors
                            `}
                          >
                            <td className="px-4 py-3 text-center align-top">{disaster.name}</td>
                            <td className="px-4 py-3 text-center align-top">{disaster.location}</td>
                            <td className="px-4 py-3 text-center align-top">
                              {disaster.latitude && disaster.longitude ? (
                                <div className="flex flex-col items-center space-y-1">
                                  <span className="text-sm">
                                    {language === 'en' ? 'Lat: ' : 'অক্ষাংশ: '}{disaster.latitude.toFixed(6)}
                                  </span>
                                  <span className="text-sm">
                                    {language === 'en' ? 'Long: ' : 'দ্রাঘিমাংশ: '}{disaster.longitude.toFixed(6)}
                                  </span>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 text-center align-top">{formatDate(disaster.dateTime || disaster.createdAt)}</td>
                            <td className="px-4 py-3 text-center align-top">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                disaster.dangerLevel >= 8 ? 'bg-red-500' : 
                                disaster.dangerLevel >= 5 ? 'bg-yellow-500' : 'bg-green-500'
                              } text-white font-bold`}>
                                {disaster.dangerLevel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center align-top">
                              <button 
                                onClick={() => toggleVisibility(disaster)} 
                                className={`
                                  inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full
                                  transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                                  ${disaster.visible === 1 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'}
                                `}
                                title={language === 'en' 
                                  ? (disaster.visible === 1 ? 'Click to hide' : 'Click to show')
                                  : (disaster.visible === 1 ? 'লুকানোর জন্য ক্লিক করুন' : 'দেখানোর জন্য ক্লিক করুন')
                                }
                              >
                                <span className="text-xs font-medium">
                                  {language === 'en'
                                    ? (disaster.visible === 1 ? 'Visible' : 'Hidden')
                                    : (disaster.visible === 1 ? 'দৃশ্যমান' : 'লুকায়িত')
                                  }
                                </span>
                                <span className={`
                                  inline-flex items-center justify-center w-4 h-4 rounded-full 
                                  transition-colors duration-200
                                  ${disaster.visible === 1 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-400 text-white'}
                                `}>
                                  {disaster.visible === 1 
                                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                      </svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                      </svg>
                                  }
                                </span>
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center align-top">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                disaster.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                disaster.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                disaster.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                disaster.status === 'declined' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {language === 'en' ? 
                                  (disaster.status?.charAt(0).toUpperCase() + disaster.status?.slice(1) || 'Pending') :
                                  (disaster.status === 'pending' ? 'অপেক্ষমান' :
                                   disaster.status === 'processing' ? 'প্রক্রিয়াকরণ' :
                                   disaster.status === 'resolved' ? 'সমাধান' :
                                   disaster.status === 'declined' ? 'প্রত্যাখ্যান' : 'অপেক্ষমান')
                                }
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center align-top">
                              <div className="flex flex-col gap-2">
                                {/* Firefighters Box */}
                                <div className={`p-2 rounded-md text-xs ${
                                  disaster.assignedFirefighters?.length > 0 
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                  <div className="font-medium mb-1">
                                    {language === 'en' ? 'Firefighters' : 'দমকল বাহিনী'} ({disaster.assignedFirefighters?.length || 0})
                                  </div>
                                  {disaster.assignedFirefighters?.length > 0 ? (
                                    <div className="text-xs">
                                      {disaster.assignedFirefighters.map((ff, i) => (
                                        <div key={i} className="truncate">
                                          {ff.name} - {ff.station}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs italic">
                                      {language === 'en' ? 'No firefighters assigned' : 'কোন দমকল বাহিনী নিযুক্ত নেই'}
                                    </div>
                                  )}
                                </div>
                                
                                {/* NGOs Box */}
                                <div className={`p-2 rounded-md text-xs ${
                                  disaster.assignedNGOs?.length > 0 
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                  <div className="font-medium mb-1">
                                    {language === 'en' ? 'NGOs' : 'এনজিও'} ({disaster.assignedNGOs?.length || 0})
                                  </div>
                                  {disaster.assignedNGOs?.length > 0 ? (
                                    <div className="text-xs">
                                      {disaster.assignedNGOs.map((ngo, i) => (
                                        <div key={i} className="truncate">
                                          {ngo.name} - {ngo.organization}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs italic">
                                      {language === 'en' ? 'No NGOs assigned' : 'কোন এনজিও নিযুক্ত নেই'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            {activeTab !== 'Earthquake' && (
                              <td className="px-4 py-3 text-center align-top">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEdit(disaster)}
                                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    title={language === 'en' ? 'Edit' : 'সম্পাদনা করুন'}
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(disaster._id)}
                                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    title={language === 'en' ? 'Delete' : 'মুছে ফেলুন'}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Render the modal */}
      <FormModal />
    </div>
  );

  return (
    <AuthorityLayout>
      <DisasterContent />
    </AuthorityLayout>
  );
};

// Component to show nearby firefighters
const NearbyFirefightersList = ({ latitude, longitude, language, onSelectFirefighters }) => {
  const [loading, setLoading] = useState(true);
  const [firefighters, setFirefighters] = useState([]);
  const [error, setError] = useState(null);
  
  // Get currently selected firefighters from parent component
  const [selectedFirefighters, setSelectedFirefighters] = useState([]);

  // Fetch nearby firefighters when component mounts
  useEffect(() => {
    const fetchNearbyFirefighters = async () => {
      console.log('Fetching nearby firefighters with:', { latitude, longitude });
      setLoading(true);
      try {
        // Ensure latitude and longitude are numbers
        const numLat = Number(latitude);
        const numLong = Number(longitude);
        console.log('Converting coordinates:', { 
          original: { latitude, longitude }, 
          converted: { latitude: numLat, longitude: numLong }
        });
        
        const response = await axios.get(`/api/firefighter/nearby`, {
          params: {
            latitude: numLat,
            longitude: numLong,
            limit: 5,
            maxDistance: 10000 // 10km
          }
        });
        
        console.log('Firefighters API response:', response.data);
        
        if (response.data.success) {
          setFirefighters(response.data.firefighters);
          console.log('Firefighters data set:', response.data.firefighters);
          
          // Initialize with any pre-selected firefighters from parent
          if (onSelectFirefighters) {
            const initialSelected = onSelectFirefighters();
            if (initialSelected && initialSelected.length > 0) {
              setSelectedFirefighters(initialSelected);
              console.log('Initial selected firefighters:', initialSelected);
            }
          }
        } else {
          console.error('API returned error:', response.data.message);
          setError(response.data.message || 'Failed to fetch nearby firefighters');
        }
      } catch (error) {
        console.error('Error fetching nearby firefighters:', error);
        setError(error.response?.data?.message || 'Failed to fetch nearby firefighters');
      } finally {
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      console.log('Starting firefighter fetch with coordinates:', latitude, longitude);
      fetchNearbyFirefighters();
    } else {
      console.log('No coordinates available for firefighter fetch');
    }
  }, [latitude, longitude, onSelectFirefighters]);

  // Handle select/deselect firefighter
  const handleToggleSelect = (firefighter) => {
    let updatedSelection;
    
    // Check if this firefighter is already selected using the same logic as the checkbox
    const isSelected = selectedFirefighters.some(f => {
      // For API results - compare using id or firefighterId
      if (typeof firefighter.id !== 'undefined' && (
        (typeof f.id !== 'undefined' && f.id === firefighter.id) || 
        (typeof f.firefighterId !== 'undefined' && f.firefighterId === firefighter.id)
      )) {
        return true;
      }
      // For stored data - compare name and station as unique composite key
      if (f.name === firefighter.name && f.station === firefighter.station) {
        return true;
      }
      return false;
    });
    
    if (isSelected) {
      // Remove from selection using the same matching logic
      updatedSelection = selectedFirefighters.filter(f => {
        // Keep all firefighters that don't match the current one
        if (typeof firefighter.id !== 'undefined' && (
          (typeof f.id !== 'undefined' && f.id === firefighter.id) || 
          (typeof f.firefighterId !== 'undefined' && f.firefighterId === firefighter.id)
        )) {
          return false; // Remove this one
        }
        if (f.name === firefighter.name && f.station === firefighter.station) {
          return false; // Remove this one
        }
        return true; // Keep this one
      });
    } else {
      // Add to selection
      updatedSelection = [...selectedFirefighters, firefighter];
    }
    
    setSelectedFirefighters(updatedSelection);
    
    // Pass selected data to parent component
    if (onSelectFirefighters) {
      onSelectFirefighters(updatedSelection);
    }
  };

  if (loading) {
    return (
      <div className="p-3 border rounded-md mt-2">
        <p className="text-center text-gray-500">
          {language === 'en' ? 'Loading nearby firefighters...' : 'কাছাকাছি অগ্নিনির্বাপকদের খোঁজা হচ্ছে...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 border rounded-md mt-2 bg-red-50">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (firefighters.length === 0) {
    return (
      <div className="p-3 border rounded-md mt-2">
        <p className="text-center text-gray-500">
          {language === 'en' ? 'No firefighters found nearby' : 'কাছাকাছি কোন অগ্নিনির্বাপক পাওয়া যায়নি'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <h4 className="text-sm font-medium mb-2">
        {language === 'en' ? 'Nearby Firefighters' : 'কাছাকাছি অগ্নিনির্বাপক'}
      </h4>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'en' ? 'Select' : 'নির্বাচন করুন'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'en' ? 'Name' : 'নাম'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'en' ? 'Station' : 'স্টেশন'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'en' ? 'Distance' : 'দূরত্ব'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {firefighters.map((firefighter) => (
              <tr key={firefighter.id}>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedFirefighters.some(f => {
                      // For API results - compare using id or firefighterId
                      if (typeof firefighter.id !== 'undefined' && (
                        (typeof f.id !== 'undefined' && f.id === firefighter.id) || 
                        (typeof f.firefighterId !== 'undefined' && f.firefighterId === firefighter.id)
                      )) {
                        return true;
                      }
                      // For stored data - compare name and station as unique composite key
                      if (f.name === firefighter.name && f.station === firefighter.station) {
                        return true;
                      }
                      return false;
                    })}
                    onChange={() => handleToggleSelect(firefighter)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {firefighter.name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {firefighter.station}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {(firefighter.distance / 1000).toFixed(2)} km
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component to show nearby NGOs
const NearbyNGOsList = ({ latitude, longitude, language, onSelectNGOs }) => {
  const [loading, setLoading] = useState(true);
  const [ngos, setNGOs] = useState([]);
  const [error, setError] = useState(null);
  
  // Get currently selected NGOs from parent component
  const [selectedNGOs, setSelectedNGOs] = useState([]);

  // Fetch nearby NGOs when component mounts
  useEffect(() => {
    const fetchNearbyNGOs = async () => {
      console.log('Fetching nearby NGOs with:', { latitude, longitude });
      setLoading(true);
      try {
        // Ensure latitude and longitude are numbers
        const numLat = Number(latitude);
        const numLong = Number(longitude);
        console.log('Converting NGO coordinates:', { 
          original: { latitude, longitude }, 
          converted: { latitude: numLat, longitude: numLong }
        });

        const response = await axios.get(`/api/ngo/nearby`, {
          params: {
            latitude: numLat,
            longitude: numLong,
            limit: 5,
            maxDistance: 10000 // 10km
          }
        });
        
        console.log('NGOs API response:', response.data);
        
        if (response.data.success) {
          setNGOs(response.data.ngos);
          console.log('NGOs data set:', response.data.ngos);
          
          // Initialize with any pre-selected NGOs from parent
          if (onSelectNGOs) {
            const initialSelected = onSelectNGOs();
            if (initialSelected && initialSelected.length > 0) {
              setSelectedNGOs(initialSelected);
              console.log('Initial selected NGOs:', initialSelected);
            }
          }
        } else {
          console.error('API returned error:', response.data.message);
          setError(response.data.message || 'Failed to fetch nearby NGOs');
        }
      } catch (error) {
        console.error('Error fetching nearby NGOs:', error);
        setError(error.response?.data?.message || 'Failed to fetch nearby NGOs');
      } finally {
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      console.log('Starting NGO fetch with coordinates:', latitude, longitude);
      fetchNearbyNGOs();
    } else {
      console.log('No coordinates available for NGO fetch');
    }
  }, [latitude, longitude, onSelectNGOs]);

  // Handle select/deselect NGO
  const handleToggleSelect = (ngo) => {
    let updatedSelection;
    
    // Check if this NGO is already selected using the same logic as the checkbox
    const isSelected = selectedNGOs.some(n => {
      // For API results - compare using id or ngoId
      if (typeof ngo.id !== 'undefined' && (
        (typeof n.id !== 'undefined' && n.id === ngo.id) ||
        (typeof n.ngoId !== 'undefined' && n.ngoId === ngo.id)
      )) {
        return true;
      }
      // For stored data - compare name and organization as unique composite key
      if (n.name === ngo.name && n.organization === ngo.organization) {
        return true;
      }
      return false;
    });
    
    if (isSelected) {
      // Remove from selection using the same matching logic
      updatedSelection = selectedNGOs.filter(n => {
        // Keep all NGOs that don't match the current one
        if (typeof ngo.id !== 'undefined' && (
          (typeof n.id !== 'undefined' && n.id === ngo.id) ||
          (typeof n.ngoId !== 'undefined' && n.ngoId === ngo.id)
        )) {
          return false; // Remove this one
        }
        if (n.name === ngo.name && n.organization === ngo.organization) {
          return false; // Remove this one
        }
        return true; // Keep this one
      });
    } else {
      // Add to selection
      updatedSelection = [...selectedNGOs, ngo];
    }
    
    setSelectedNGOs(updatedSelection);
    
    // Pass selected data to parent component
    if (onSelectNGOs) {
      onSelectNGOs(updatedSelection);
    }
  };

  if (loading) {
    return (
      <div className="p-3 border rounded-md mt-2">
        <p className="text-center text-gray-500">
          {language === 'en' ? 'Loading nearby NGOs...' : 'কাছাকাছি এনজিও খোঁজা হচ্ছে...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 border rounded-md mt-2 bg-red-50">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (ngos.length === 0) {
    return (
      <div className="p-3 border rounded-md mt-2">
        <p className="text-center text-gray-500">
          {language === 'en' ? 'No NGOs found nearby' : 'কাছাকাছি কোন এনজিও পাওয়া যায়নি'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <h4 className="text-sm font-medium mb-2">
        {language === 'en' ? 'Nearby NGOs' : 'কাছাকাছি এনজিও'}
      </h4>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'en' ? 'Select' : 'নির্বাচন করুন'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'en' ? 'Name' : 'নাম'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'en' ? 'Organization' : 'সংগঠন'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'en' ? 'Distance' : 'দূরত্ব'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ngos.map((ngo) => (
              <tr key={ngo.id}>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedNGOs.some(n => {
                      // For API results - compare using id or ngoId
                      if (typeof ngo.id !== 'undefined' && (
                        (typeof n.id !== 'undefined' && n.id === ngo.id) ||
                        (typeof n.ngoId !== 'undefined' && n.ngoId === ngo.id)
                      )) {
                        return true;
                      }
                      // For stored data - compare name and organization as unique composite key
                      if (n.name === ngo.name && n.organization === ngo.organization) {
                        return true;
                      }
                      return false;
                    })}
                    onChange={() => handleToggleSelect(ngo)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {ngo.name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {ngo.organization}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {(ngo.distance / 1000).toFixed(2)} km
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthorityDisasters; 