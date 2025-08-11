import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import AuthorityLayout from '../components/authority/AuthorityLayout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationArrow, FaSearch, FaTimes, FaEye } from 'react-icons/fa';

const AuthorityUserDisasterReport = () => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  
  // State for reports data
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Filter states
  const [filterDisasterType, setFilterDisasterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(7); // Changed back to 7 rows per page
  
  // Disaster types mapping
  const disasterTypesMap = {
    'earthquake': { en: 'Earthquake', bn: 'ভূমিকম্প', color: '#EF4444' },
    'flood': { en: 'Flood', bn: 'বন্যা', color: '#3B82F6' },
    'cyclone': { en: 'Cyclone', bn: 'ঘূর্ণিঝড়', color: '#8B5CF6' },
    'landslide': { en: 'Landslide', bn: 'ভূমিধস', color: '#F59E0B' },
    'tsunami': { en: 'Tsunami', bn: 'সুনামি', color: '#10B981' },
    'fire': { en: 'Fire', bn: 'আগুন', color: '#DC2626' },
    'other': { en: 'Other', bn: 'অন্যান্য', color: '#6B7280' }
  };

  // Initialize map on component mount
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Create map instance
      mapInstance.current = L.map(mapRef.current, {
        center: [23.8103, 90.4125], // Dhaka, Bangladesh
        zoom: 7,
        zoomControl: false
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance.current);
      
      // Create a layer group for markers
      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      
      // Fix Leaflet's viewport calculation issues
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
        }
      }, 500);
    }
    
    // Clean up on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
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

  // Fetch reports data
  useEffect(() => {
    fetchUserReports();
  }, []);
  
  // Apply filters when filter state or reports change
  useEffect(() => {
    applyFilters();
  }, [reports, filterDisasterType, filterDateRange, searchQuery]);
  
  // Update map markers when filtered reports change
  useEffect(() => {
    if (mapInstance.current && markersLayer.current) {
      updateMapMarkers();
    }
  }, [filteredReports]);
  
  // Focus on selected report on map
  useEffect(() => {
    if (mapInstance.current && selectedReport) {
      mapInstance.current.setView(
        [selectedReport.latitude, selectedReport.longitude],
        15
      );
      
      // Highlight the marker
      markersLayer.current.eachLayer(layer => {
        if (layer.options.reportId === selectedReport._id) {
          layer.openPopup();
        }
      });
    }
  }, [selectedReport]);

  // Fetch user disaster reports
  const fetchUserReports = async () => {
    setLoading(true);
    try {
      // Try to get token from localStorage
      const token = localStorage.getItem('authority_token') || 
                   localStorage.getItem('token') || 
                   sessionStorage.getItem('authority_token');
      
      let response;
      
      if (token) {
        // If token exists, try using it with the API
        try {
          response = await axios.get('/api/site-reports/all', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          console.log('Token auth failed, trying direct access');
          // If authentication fails, try direct access
          response = await axios.get('/api/site-reports/direct');
        }
      } else {
        // No token, use direct access endpoint
        console.log('No auth token found, using direct access endpoint');
        response = await axios.get('/api/site-reports/direct');
      }
      
      if (response.data.success) {
        setReports(response.data.data);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch user reports');
      }
    } catch (err) {
      console.error('Error fetching user reports:', err);
      setError(err.message || 'Failed to fetch user reports');
      
      // For development: simulate data if API fails
      const mockData = [
        {
          _id: 'mock1',
          name: 'Test Report 1',
          location: 'Dhaka, Bangladesh',
          latitude: 23.8103,
          longitude: 90.4125,
          dangerLevel: 8,
          disasterType: 'earthquake',
          description: 'This is a test report for development',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'mock2',
          name: 'Test Report 2',
          location: 'Chittagong, Bangladesh',
          latitude: 22.3569,
          longitude: 91.7832,
          dangerLevel: 5,
          disasterType: 'flood',
          description: 'Another test report for development',
          createdAt: new Date().toISOString()
        }
      ];
      console.log('Using mock data as fallback');
      setReports(mockData);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters to reports
  const applyFilters = () => {
    let filtered = [...reports];
    
    // Apply disaster type filter
    if (filterDisasterType !== 'all') {
      filtered = filtered.filter(report => report.disasterType === filterDisasterType);
    }
    
    // Apply date filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.createdAt);
        if (filterDateRange === 'today') {
          // Reports from today
          return reportDate >= today;
        } else if (filterDateRange === 'yesterday') {
          // Reports from yesterday
          return reportDate >= yesterday && reportDate < today;
        } else if (filterDateRange === 'week') {
          // Reports from past week
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);
          return reportDate >= lastWeek;
        }
        return true;
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.name?.toLowerCase().includes(query) ||
        report.location?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredReports(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Update map markers
  const updateMapMarkers = () => {
    // Clear existing markers
    markersLayer.current.clearLayers();
    
    // Add markers for filtered reports
    filteredReports.forEach(report => {
      // Skip if latitude or longitude is missing or invalid
      if (!report.latitude || !report.longitude || 
          isNaN(report.latitude) || isNaN(report.longitude)) {
        console.log(`Skipping marker for report ${report._id || 'unknown'} due to invalid coordinates`);
        return;
      }
      
      // Choose marker style based on disaster type
      const markerColor = disasterTypesMap[report.disasterType || 'other']?.color || '#6B7280';
      
      // Create custom icon with disaster type color
      const customIcon = L.divIcon({
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
              border: 2px solid ${markerColor};
            ">
              <div style="
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background-color: ${markerColor};
              "></div>
            </div>
          </div>
        `,
        className: 'disaster-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      
      // Create marker
      const marker = L.marker([report.latitude, report.longitude], {
        icon: customIcon,
        reportId: report._id // Store report ID for reference
      }).addTo(markersLayer.current);
      
      // Add popup with report info
      marker.bindPopup(`
        <div class="report-popup p-3 max-w-xs">
          <h3 class="font-bold text-lg mb-1">${report.name}</h3>
          <p class="text-sm mb-1"><strong>${language === 'en' ? 'Type' : 'ধরন'}:</strong> ${getDisasterTypeText(report.disasterType)}</p>
          <p class="text-sm mb-1"><strong>${language === 'en' ? 'Location' : 'অবস্থান'}:</strong> ${report.location}</p>
          <p class="text-sm mb-1"><strong>${language === 'en' ? 'Danger Level' : 'বিপদ স্তর'}:</strong> ${report.dangerLevel}/10</p>
          <p class="text-sm mb-1"><strong>${language === 'en' ? 'Date' : 'তারিখ'}:</strong> ${formatDate(report.createdAt)}</p>
          ${report.description ? `<p class="text-sm mt-2">${report.description}</p>` : ''}
        </div>
      `);
      
      // Add click event to show report details in the sidebar
      marker.on('click', () => {
        setSelectedReport(report);
      });
    });
    
    // Adjust map view to show all markers if there are any and no report is selected
    if (filteredReports.length > 0 && !selectedReport) {
      const markers = [];
      markersLayer.current.eachLayer(layer => {
        markers.push([layer.getLatLng().lat, layer.getLatLng().lng]);
      });
      
      if (markers.length > 0) {
        mapInstance.current.fitBounds(L.latLngBounds(markers), {
          padding: [50, 50],
          maxZoom: 13
        });
      }
    }
  };
  
  // Handle disaster type filter change
  const handleFilterChange = (type) => {
    setFilterDisasterType(type);
  };
  
  // Handle date filter change
  const handleDateFilterChange = (range) => {
    setFilterDateRange(range);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Handle report row click
  const handleReportClick = (report) => {
    setSelectedReport(report);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return language === 'en' ? 'Unknown date' : 'অজানা তারিখ';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return language === 'en' ? 'Invalid date' : 'অবৈধ তারিখ';
      }
      
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return language === 'en' ? 'Date error' : 'তারিখ ত্রুটি';
    }
  };
  
  // Get translated disaster type text
  const getDisasterTypeText = (type) => {
    return disasterTypesMap[type] ? 
      (language === 'en' ? disasterTypesMap[type].en : disasterTypesMap[type].bn) : 
      type;
  };
  
  // Get danger level color
  const getDangerLevelColor = (level) => {
    if (level >= 8) return 'text-red-600';
    if (level >= 5) return 'text-orange-500';
    return 'text-yellow-500';
  };
  
  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  
  // Navigation functions
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <AuthorityLayout>
      <div className="flex flex-col h-full -mt-4">
        <div className="mb-0 bg-white dark:bg-gray-800 p-1 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-3 mb-3">
            {language === 'en' ? 'User Disaster Reports' : 'ব্যবহারকারী দুর্যোগ রিপোর্ট'}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-0">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow 
                  ${filterDisasterType === 'all'
                    ? 'text-white border'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                style={filterDisasterType === 'all' ? { backgroundColor: 'rgb(88, 10, 107)', borderColor: 'rgb(88, 10, 107)' } : {}}
              >
                {language === 'en' ? 'All Types' : 'সব ধরণ'}
              </button>
              {Object.keys(disasterTypesMap).map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterChange(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center
                    ${filterDisasterType === type
                      ? 'text-white border'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  style={filterDisasterType === type ? { backgroundColor: 'rgb(88, 10, 107)', borderColor: 'rgb(88, 10, 107)' } : {}}
                >
                  <span 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: disasterTypesMap[type].color }}
                  ></span>
                  {getDisasterTypeText(type)}
                </button>
              ))}
            </div>
            
            {/* Date filter buttons */}
            <div className="flex flex-wrap gap-2 ml-1 mt-1 md:mt-0">
              <button
                onClick={() => handleDateFilterChange('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow 
                  ${filterDateRange === 'all'
                    ? 'text-white border'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                style={filterDateRange === 'all' ? { backgroundColor: 'rgb(88, 10, 107)', borderColor: 'rgb(88, 10, 107)' } : {}}
              >
                {language === 'en' ? 'All Time' : 'সব সময়'}
              </button>
              <button
                onClick={() => handleDateFilterChange('today')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow 
                  ${filterDateRange === 'today'
                    ? 'text-white border'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                style={filterDateRange === 'today' ? { backgroundColor: 'rgb(88, 10, 107)', borderColor: 'rgb(88, 10, 107)' } : {}}
              >
                {language === 'en' ? 'Today' : 'আজ'}
              </button>
              <button
                onClick={() => handleDateFilterChange('yesterday')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow 
                  ${filterDateRange === 'yesterday'
                    ? 'text-white border'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                style={filterDateRange === 'yesterday' ? { backgroundColor: 'rgb(88, 10, 107)', borderColor: 'rgb(88, 10, 107)' } : {}}
              >
                {language === 'en' ? 'Yesterday' : 'গতকাল'}
              </button>
              <button
                onClick={() => handleDateFilterChange('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow 
                  ${filterDateRange === 'week'
                    ? 'text-white border'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                style={filterDateRange === 'week' ? { backgroundColor: 'rgb(88, 10, 107)', borderColor: 'rgb(88, 10, 107)' } : {}}
              >
                {language === 'en' ? 'Past Week' : 'গত সপ্তাহ'}
              </button>
            </div>
            
            {/* Search box */}
            <div className="relative flex-grow max-w-md ml-auto mt-1 md:mt-0">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow transition-all duration-200 h-7">
                <div className="pl-2 text-gray-500 dark:text-gray-400">
                  <FaSearch className="h-3 w-3" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={language === 'en' ? 'Search reports...' : 'রিপোর্ট খুঁজুন...'}
                  className="w-full py-1 px-1 bg-transparent border-none focus:outline-none dark:text-white text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="pr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-grow flex flex-col md:flex-row gap-0 h-[calc(100vh-140px)]">
          {/* Reports table with explicit scrolling */}
          <div className="md:w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
            <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 dark:text-white">
                {language === 'en' ? 'Reports List' : 'রিপোর্ট তালিকা'}
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'en' 
                  ? `Showing ${filteredReports.length} reports` 
                  : `${filteredReports.length}টি রিপোর্ট দেখাচ্ছে`}
              </div>
            </div>
            
            {/* Table Container with fixed header and scrollable body */}
            <div className="flex-grow flex flex-col">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">
                  {error}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4 text-center">
                  {language === 'en' 
                    ? 'No reports found matching your criteria' 
                    : 'আপনার মাপদণ্ড অনুযায়ী কোন রিপোর্ট পাওয়া যায়নি'}
                </div>
              ) : (
                <>
                  {/* Fixed Table Header */}
                  <div className="overflow-hidden rounded-t-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="text-white" style={{ backgroundColor: 'rgb(88, 10, 107)' }}>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider first:rounded-tl-lg">
                            {language === 'en' ? 'Name' : 'নাম'}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            {language === 'en' ? 'Location' : 'অবস্থান'}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            {language === 'en' ? 'Type' : 'ধরন'}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                            {language === 'en' ? 'Level' : 'স্তর'}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                            {language === 'en' ? 'Date' : 'তারিখ'}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider last:rounded-tr-lg">
                            {language === 'en' ? 'View' : 'দেখুন'}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  
                  {/* Scrollable Table Body */}
                  <div className="overflow-auto flex-grow max-h-[calc(100vh-360px)]" style={{ scrollbarWidth: 'thin' }}>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentReports.map((report) => (
                          <tr 
                            key={report._id} 
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                              selectedReport && selectedReport._id === report._id 
                                ? 'bg-blue-50 dark:bg-blue-900/20' 
                                : ''
                            }`}
                            onClick={() => handleReportClick(report)}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {report.name || (language === 'en' ? 'Unnamed' : 'নামবিহীন')}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {report.location || (language === 'en' ? 'Unknown location' : 'অজানা অবস্থান')}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${disasterTypesMap[report.disasterType || 'other']?.color}20`, 
                                  color: disasterTypesMap[report.disasterType || 'other']?.color 
                                }}
                              >
                                {getDisasterTypeText(report.disasterType || 'other')}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <span className={`font-medium ${getDangerLevelColor(report.dangerLevel || 0)}`}>
                                {report.dangerLevel || '?'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(report.createdAt).split(',')[0]}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <button 
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReportClick(report);
                                }}
                              >
                                <FaEye className="h-4 w-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination - Fixed position with clear styling */}
                  {filteredReports.length > 0 && (
                    <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-t dark:border-gray-600 flex items-center justify-between shadow-lg z-30" style={{ position: 'sticky', bottom: '0' }}>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-white">
                            {language === 'en' 
                              ? `Showing ${indexOfFirstReport + 1} to ${Math.min(indexOfLastReport, filteredReports.length)} of ${filteredReports.length} results` 
                              : `মোট ${filteredReports.length}টি ফলাফলের মধ্যে ${indexOfFirstReport + 1} থেকে ${Math.min(indexOfLastReport, filteredReports.length)} দেখাচ্ছে`}
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={prevPage}
                              disabled={currentPage === 1}
                              className={`relative inline-flex items-center px-2 py-1.5 rounded-l-md border text-sm font-medium ${
                                currentPage === 1
                                  ? 'text-gray-400 bg-gray-200 dark:text-gray-500 dark:bg-gray-600 cursor-not-allowed'
                                  : 'text-gray-700 bg-white hover:bg-gray-50 dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700'
                              }`}
                            >
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            
                            {/* Show only current page and direct adjacent */}
                            {[...Array(totalPages)].map((_, i) => {
                              // Only show current page, previous and next page
                              if (i + 1 === currentPage || 
                                  i + 1 === currentPage - 1 || 
                                  i + 1 === currentPage + 1) {
                                return (
                                  <button
                                    key={i + 1}
                                    onClick={() => goToPage(i + 1)}
                                    className={`relative inline-flex items-center px-3.5 py-1.5 border text-sm font-medium ${
                                      currentPage === i + 1
                                        ? 'z-10 border-purple-500 text-white dark:text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                                    }`}
                                    style={currentPage === i + 1 ? { backgroundColor: 'rgb(88, 10, 107)' } : {}}
                                  >
                                    {i + 1}
                                  </button>
                                );
                              }
                              return null;
                            })}
                            
                            <button
                              onClick={nextPage}
                              disabled={currentPage === totalPages}
                              className={`relative inline-flex items-center px-2 py-1.5 rounded-r-md border text-sm font-medium ${
                                currentPage === totalPages
                                  ? 'text-gray-400 bg-gray-200 dark:text-gray-500 dark:bg-gray-600 cursor-not-allowed'
                                  : 'text-gray-700 bg-white hover:bg-gray-50 dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700'
                              }`}
                            >
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Map View with slightly decreased height */}
          <div className="md:w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col relative">
            <div className="flex-grow pt-0">
              <div
                ref={mapRef}
                className="w-full h-full z-0"
                style={{ 
                  touchAction: 'none',
                  msContentZooming: 'none',
                  cursor: 'grab',
                  minHeight: '320px', // Decreased from 335px to 320px
                  maxHeight: 'calc(100vh - 190px)', // Added max height constraint
                  position: 'relative',
                  display: 'block',
                  marginTop: '0',
                  border: '3px solid rgb(88, 10, 107)',
                  borderRadius: '4px'
                }}
              ></div>
            </div>
            
            {/* Map controls moved higher */}
            <div className="absolute right-4 bottom-6 z-10 flex flex-col space-y-2">
              <button
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.setView([23.8103, 90.4125], 7);
                  }
                }}
                className="bg-white dark:bg-gray-800 shadow-md w-10 h-10 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
                aria-label={language === 'en' ? 'Reset view' : 'প্রদর্শন রিসেট করুন'}
              >
                <FaLocationArrow className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  );
};

export default AuthorityUserDisasterReport; 