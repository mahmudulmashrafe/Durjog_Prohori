import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaWater, FaWind, FaMountain, FaWaveSquare, FaFire, FaQuestionCircle, FaMapMarkerAlt, FaTimes, FaCalendarAlt, FaSync, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

// Utility functions
const getTypeIcon = (type) => {
  switch (type) {
    case 'earthquake': return '🌋';
    case 'flood': return '💧';
    case 'cyclone': return '🌪️';
    case 'landslide': return '⛰️';
    case 'tsunami': return '🌊';
    case 'fire': return '🔥';
    case 'other': return '⚠️';
    default: return '🔍';
  }
};

// Filter options
const createFilterOptions = (language) => [
  { value: 'all', label: language === 'en' ? 'All Disasters' : 'সব দুর্যোগ' },
  { value: 'earthquake', label: language === 'en' ? 'Earthquake' : 'ভূমিকম্প' },
  { value: 'flood', label: language === 'en' ? 'Flood' : 'বন্যা' },
  { value: 'cyclone', label: language === 'en' ? 'Cyclone' : 'ঘূর্ণিঝড়' },
  { value: 'landslide', label: language === 'en' ? 'Landslide' : 'ভূমিধস' },
  { value: 'tsunami', label: language === 'en' ? 'Tsunami' : 'সুনামি' },
  { value: 'fire', label: language === 'en' ? 'Fire' : 'আগুন' },
  { value: 'other', label: language === 'en' ? 'Other' : 'অন্যান্য' }
];

// Disaster Card component for displaying disaster data
const DisasterCard = ({ disaster, onClick, type, language }) => {
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  // Get color based on disaster type
  const getTypeColor = (type) => {
    switch(type) {
      case 'earthquake': return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'flood': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
      case 'cyclone': return 'border-teal-500 bg-teal-50 dark:bg-teal-900/10';
      case 'landslide': return 'border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10';
      case 'tsunami': return 'border-blue-700 bg-blue-50 dark:bg-blue-900/10';
      case 'fire': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/10';
      default: return 'border-purple-500 bg-purple-50 dark:bg-purple-900/10';
    }
  };
  
  return (
    <div 
      className={`rounded-lg border-t-4 h-[280px] flex flex-col cursor-pointer transition-all hover:shadow-lg ${getTypeColor(type)}`}
      onClick={() => onClick(disaster)}
    >
      {/* Header with icon and danger level */}
      <div className="p-4 flex justify-between items-start border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getTypeIcon(type)}</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {language === 'en' 
              ? type.charAt(0).toUpperCase() + type.slice(1)
              : type === 'earthquake' ? 'Earthquake'
              : type === 'flood' ? 'Flood'
              : type === 'cyclone' ? 'Cyclone'
              : type === 'landslide' ? 'Landslide'
              : type === 'tsunami' ? 'Tsunami'
              : type === 'fire' ? 'Fire'
              : 'Other'
            }
          </span>
        </div>
        <div className={`px-2 py-1 rounded text-sm font-medium ${
          disaster.dangerLevel >= 8 ? 'bg-red-600 text-white' : 
          disaster.dangerLevel >= 5 ? 'bg-orange-400 text-white' : 
          'bg-yellow-300 text-gray-800'
        }`}>
          Level {disaster.dangerLevel || 'N/A'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Name */}
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">
        {disaster.name || 'Unnamed Disaster'}
        </h3>

        {/* Location */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
            <span className="line-clamp-2">{disaster.location || 'Location not specified'}</span>
          </div>
        </div>

        {/* Date/Time */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-auto">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 flex-shrink-0" />
            <span>{formatDate(disaster.time || disaster.created_at || disaster.updatedAt || disaster.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Disaster Cards component
const DisasterCards = ({ disasters, disasterType }) => {
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  
  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {disasters.length > 0 ? (
          disasters.map((disaster) => (
            <DisasterCard 
              key={disaster._id || disaster.id || Math.random().toString()}
              disaster={disaster}
              onClick={setSelectedDisaster}
              type={disasterType}
            />
          ))
        ) : (
          <div className="col-span-1 md:col-span-3 text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
            No disasters found
          </div>
        )}
      </div>
      
      {selectedDisaster && (
        <DisasterDetailsModal 
          disaster={selectedDisaster} 
          onClose={() => setSelectedDisaster(null)}
          disasterType={disasterType}
        />
      )}
    </div>
  );
};

// Disaster Details Modal component
const DisasterDetailsModal = ({ disaster, onClose, disasterType }) => {
  if (!disaster) return null;

  // Get color based on disaster type
  const getTypeColor = (type) => {
    switch(type) {
      case 'earthquake': return 'border-red-500 dark:border-red-400';
      case 'flood': return 'border-blue-500 dark:border-blue-400';
      case 'cyclone': return 'border-teal-500 dark:border-teal-400';
      case 'landslide': return 'border-yellow-700 dark:border-yellow-600';
      case 'tsunami': return 'border-blue-700 dark:border-blue-600';
      case 'fire': return 'border-orange-500 dark:border-orange-400';
      default: return 'border-purple-500 dark:border-purple-400';
    }
  };
  
  // Get matching icon based on disaster type
  const getTypeIcon = (type) => {
    switch(type) {
      case 'earthquake': return <FaExclamationTriangle className="text-red-500" />;
      case 'flood': return <FaWater className="text-blue-500" />;
      case 'cyclone': return <FaWind className="text-teal-500" />;
      case 'landslide': return <FaMountain className="text-yellow-700" />;
      case 'tsunami': return <FaWaveSquare className="text-blue-700" />;
      case 'fire': return <FaFire className="text-orange-500" />;
      default: return <FaQuestionCircle className="text-purple-500" />;
    }
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border-t-4 ${getTypeColor(disasterType)} overflow-hidden animate-slideUp mt-20`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="mr-3 text-2xl">{getTypeIcon(disasterType)}</span>
            <h3 className="font-semibold text-lg">{disaster.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-start">
              <FaMapMarkerAlt className="text-gray-500 mr-3 mt-1" />
              <div>
                <div className="font-medium">Location</div>
                <div>{disaster.location || 'Location not specified'}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Lat: {disaster.latitude?.toFixed(6) || 'N/A'}, 
                  Lng: {disaster.longitude?.toFixed(6) || 'N/A'}
                </div>
              </div>
            </div>
            
            {/* Time */}
            <div className="flex items-start">
              <FaCalendarAlt className="text-gray-500 mr-3 mt-1" />
              <div>
                <div className="font-medium">Date & Time</div>
                <div>{formatDate(disaster.time || disaster.created_at || disaster.updatedAt || disaster.createdAt)}</div>
              </div>
            </div>
            
            {/* Danger Level */}
            <div className="flex items-start">
              <FaExclamationTriangle className="text-gray-500 mr-3 mt-1" />
              <div>
                <div className="font-medium">Danger Level</div>
                <div className="mt-1">
        <span className={`px-2 py-1 rounded ${
          disaster.dangerLevel >= 8 ? 'bg-red-600 text-white' : 
          disaster.dangerLevel >= 5 ? 'bg-orange-400 text-white' : 
          'bg-yellow-300 text-gray-800'
        }`}>
                    {disaster.dangerLevel || 'N/A'}
        </span>
                </div>
              </div>
            </div>
            
            {/* Description if available */}
            {disaster.description && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-medium mb-1">Description</div>
                <p className="text-sm">{disaster.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Update the animation keyframes for the modal */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideUp {
          from {
            transform: translateY(70px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        `
      }} />
    </div>
  );
};

// Disaster Section component (no longer collapsible)
const DisasterSection = ({ 
  title, 
  type, 
  icon,
  disasters,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
      <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
        <span className="text-xl mr-2">{icon}</span>
          <h2 className="text-lg font-semibold">
            {title} <span className="text-sm text-gray-500 dark:text-gray-400">({disasters.length})</span>
          </h2>
      </div>
      
      <div className="p-3">
        <DisasterCards 
          disasters={disasters}
          disasterType={type}
        />
        </div>
    </div>
  );
};

const FloatingFilter = ({ activeType, onSelect, language }) => {
  const [showOptions, setShowOptions] = useState(false);
  const filterRef = useRef(null);
  const filterOptions = createFilterOptions(language);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={filterRef} className="fixed bottom-32 right-3 md:bottom-36 md:right-4 z-50">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="p-2 md:p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
        title={language === 'en' ? 'Filter disasters' : 'দুর্যোগ ফিল্টার করুন'}
      >
        <span className="text-base md:text-lg">{getTypeIcon(activeType)}</span>
      </button>

      {showOptions && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(option.value);
                setShowOptions(false);
              }}
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-150 hover:scale-110
                ${activeType === option.value 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              title={option.label}
            >
              <span className="text-base md:text-lg">{getTypeIcon(option.value)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Disaster = () => {
  const { language } = useLanguage();
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [mongoDbEarthquakes, setMongoDbEarthquakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disasterData, setDisasterData] = useState({
    earthquake: [],
    flood: [],
    cyclone: [],
    landslide: [],
    tsunami: [],
    fire: [],
    other: []
  });
  const [activeDisasterType, setActiveDisasterType] = useState('all');
  const fetchTimeoutRef = useRef(null);

  // Fetch all disaster types data
  const fetchDisasters = async (disasterType) => {
    setLoading(prev => ({ ...prev, [disasterType]: true }));
    try {
      const res = await axios.get(`/api/disasters/${disasterType}`);
      if (res.data.success) {
        // Filter out invisible disasters
        const visibleDisasters = res.data.data.filter(disaster => 
          disaster.visible === 1 || disaster.isVisible === 1 || disaster.visible === true || disaster.isVisible === true
        );
        setDisasterData(prev => ({ ...prev, [disasterType]: visibleDisasters }));
      }
        } catch (error) {
      console.error(`Error fetching ${disasterType}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [disasterType]: false }));
    }
  };

  // Fetch earthquakes from local MongoDB
  const fetchMongoDbEarthquakes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/disasters/mongodb/earthquakes');
      
      if (response.data.success) {
        // Process data to ensure compatibility with the UI
        const processedData = response.data.data.map(item => {
          return {
            _id: item._id,
            name: item.name || item.title || "Unnamed Earthquake",
            location: item.location || item.place || "Unknown Location",
            latitude: item.latitude || (item.coordinates ? item.coordinates[1] : 0),
            longitude: item.longitude || (item.coordinates ? item.coordinates[0] : 0),
            dangerLevel: item.dangerLevel || item.magnitude || 5,
            time: item.dateTime || item.time || item.createdAt,
            visible: item.visible !== undefined ? item.visible : 1
          };
        });
        
        setMongoDbEarthquakes(processedData);
      }
    } catch (error) {
      console.error('Error fetching MongoDB earthquakes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch USGS earthquake data
  const fetchEarthquakeData = async () => {
    try {
      setLoading(true);
      const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=20&maxlatitude=27&minlongitude=88&maxlongitude=93&orderby=time&limit=10`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.features || !Array.isArray(data.features)) {
        console.error('Invalid data format:', data);
        return;
      }

      const formattedData = data.features.map(feature => ({
        _id: feature.id,
        name: `M${feature.properties.mag.toFixed(1)} Earthquake`,
        location: feature.properties.place,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        dangerLevel: Math.min(Math.ceil(feature.properties.mag * 1.5), 10), // Convert magnitude to 1-10 scale
        time: new Date(feature.properties.time).toLocaleString()
      }));

      setEarthquakeData(formattedData);
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all disaster types
    fetchEarthquakeData();
    fetchMongoDbEarthquakes();
    fetchDisasters('earthquake');
    fetchDisasters('flood');
    fetchDisasters('cyclone');
    fetchDisasters('landslide');
    fetchDisasters('tsunami');
    fetchDisasters('fire');
    fetchDisasters('other');

    // Setup auto-refresh every 5 minutes
    fetchTimeoutRef.current = setInterval(() => {
      fetchEarthquakeData();
      fetchMongoDbEarthquakes();
      fetchDisasters('earthquake');
      fetchDisasters('flood');
      fetchDisasters('cyclone');
      fetchDisasters('landslide');
      fetchDisasters('tsunami');
      fetchDisasters('fire');
      fetchDisasters('other');
    }, 300000); // 5 minutes

    return () => {
      if (fetchTimeoutRef.current) {
        clearInterval(fetchTimeoutRef.current);
      }
    };
  }, []);

  const disasterTypes = [
    {
      name: language === 'en' ? 'All Disaster' : 'সব দুর্যোগ',
      icon: <FaExclamationTriangle className="text-red-500" />,
      type: 'earthquake',
      data: [...earthquakeData, ...disasterData.earthquake]
    },
    {
      name: language === 'en' ? 'Earthquake' : 'ভূমিকম্প',
      icon: <FaGlobe className="text-green-500" />,
      type: 'earth',
      data: mongoDbEarthquakes
    },
    {
      name: language === 'en' ? 'Flood' : 'বন্যা',
      icon: <FaWater className="text-blue-500" />,
      type: 'flood',
      data: disasterData.flood
    },
    {
      name: language === 'en' ? 'Cyclone' : 'ঘূর্ণিঝড়',
      icon: <FaWind className="text-teal-500" />,
      type: 'cyclone',
      data: disasterData.cyclone
    },
    {
      name: language === 'en' ? 'Landslide' : 'ভূমিধস',
      icon: <FaMountain className="text-yellow-700" />,
      type: 'landslide',
      data: disasterData.landslide
    },
    {
      name: language === 'en' ? 'Tsunami' : 'সুনামি',
      icon: <FaWaveSquare className="text-blue-700" />,
      type: 'tsunami',
      data: disasterData.tsunami
    },
    {
      name: language === 'en' ? 'Fire' : 'আগুন',
      icon: <FaFire className="text-orange-500" />,
      type: 'fire',
      data: disasterData.fire
    },
    {
      name: language === 'en' ? 'Other' : 'অন্যান্য',
      icon: <FaQuestionCircle className="text-purple-500" />,
      type: 'other',
      data: disasterData.other
    }
  ];

  // Get total number of all disasters
  const allDisastersCount = disasterTypes.reduce((count, disaster) => {
    if (disaster.type !== 'all') {
      return count + disaster.data.length;
    }
    return count;
  }, 0);

  // Update the count on the "All Disasters" option
  disasterTypes[0].data = Array(allDisastersCount);

  // Handle refresh button click
  const handleRefresh = () => {
    setLoading(true);
    fetchEarthquakeData();
    fetchMongoDbEarthquakes();
    fetchDisasters('earthquake');
    fetchDisasters('flood');
    fetchDisasters('cyclone');
    fetchDisasters('landslide');
    fetchDisasters('tsunami');
    fetchDisasters('fire');
    fetchDisasters('other');
    setTimeout(() => setLoading(false), 1000);
  };

  // Get filtered disasters
  const getFilteredDisasters = () => {
    if (activeDisasterType === 'all') {
      return [
        ...earthquakeData,
        ...disasterData.earthquake,
        ...disasterData.flood,
        ...disasterData.cyclone,
        ...disasterData.landslide,
        ...disasterData.tsunami,
        ...disasterData.fire,
        ...disasterData.other
      ];
    }
    
    switch (activeDisasterType) {
      case 'earthquake':
        return [...earthquakeData, ...disasterData.earthquake];
      case 'flood':
        return disasterData.flood;
      case 'cyclone':
        return disasterData.cyclone;
      case 'landslide':
        return disasterData.landslide;
      case 'tsunami':
        return disasterData.tsunami;
      case 'fire':
        return disasterData.fire;
      case 'other':
        return disasterData.other;
      default:
        return [];
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="h-full overflow-y-auto">
      <div className="p-2 pt-1 max-w-7xl mx-auto">
          {/* Display filtered disasters */}
          <div className="px-4 pb-20">
            <DisasterSection
              title={createFilterOptions(language).find(opt => opt.value === activeDisasterType)?.label || ''}
              type={activeDisasterType}
              icon={getTypeIcon(activeDisasterType)}
              disasters={getFilteredDisasters()}
            />
            </div>

          {/* Floating refresh button */}
            <button 
              onClick={handleRefresh} 
            className="fixed bottom-20 right-3 p-2 md:bottom-24 md:right-4 md:p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-200 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105 z-50"
              title={language === 'en' ? 'Refresh data' : 'তথ্য রিফ্রেশ করুন'}
            >
            <FaSync className={`${loading ? "animate-spin" : ""} text-base md:text-lg`} />
          </button>

          {/* Floating filter button */}
          <FloatingFilter
            activeType={activeDisasterType}
            onSelect={setActiveDisasterType}
            language={language}
          />
        </div>
      </div>
    </div>
  );
};

export default Disaster; 