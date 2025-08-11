import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import AuthorityLayout from '../components/authority/AuthorityLayout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationArrow, FaPhone, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const AuthoritySosReports = () => {
  const { language } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  const disasterTypesMap = {
    'earthquake': { en: 'Earthquake', bn: 'ভূমিকম্প' },
    'flood': { en: 'Flood', bn: 'বন্যা' },
    'cyclone': { en: 'Cyclone', bn: 'সাইক্লোন' },
    'landslide': { en: 'Landslide', bn: 'ভূমিধস' },
    'tsunami': { en: 'Tsunami', bn: 'সুনামি' },
    'fire': { en: 'Fire', bn: 'আগুন' },
    'other': { en: 'Other', bn: 'অন্যান্য' }
  };

  // Get translated text based on language
  const getDisasterText = (type) => {
    return disasterTypesMap[type] ? 
      (language === 'en' ? disasterTypesMap[type].en : disasterTypesMap[type].bn) : 
      type;
  };

  // Fetch SOS reports on component mount
  useEffect(() => {
    fetchSosReports();
  }, [statusFilter]);

  const fetchSosReports = async () => {
    setLoading(true);
    try {
      // Get SOS reports from our new endpoint
      const endpoint = statusFilter === 'all' ? 
        '/api/sos-reports/all/active' : 
        `/api/sos-reports/all/${statusFilter}`;
      
      const response = await axios.get(endpoint);
      
      console.log('SOS reports:', response.data);
      
      if (response.data.success) {
        setReports(response.data.data);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch SOS reports');
      }
    } catch (err) {
      console.error('Error fetching SOS reports:', err);
      setError(err.message || 'Failed to fetch SOS reports');
      toast.error(language === 'en' 
        ? 'Failed to fetch SOS reports' 
        : 'SOS রিপোর্ট আনতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Initialize map when modal shows
  useEffect(() => {
    if (showMapModal && selectedReport && !map) {
      const mapInstance = L.map('sos-map').setView(
        [selectedReport.latitude, selectedReport.longitude], 
        15
      );
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);
      
      // Add marker for the SOS location
      const sosMarker = L.marker(
        [selectedReport.latitude, selectedReport.longitude],
        {
          icon: L.divIcon({
            className: 'sos-marker',
            html: `<div class="bg-red-500 rounded-full p-2 pulse-animation">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        }
      ).addTo(mapInstance);
      
      // Add popup with SOS details
      sosMarker.bindPopup(`
        <div class="font-bold">${selectedReport.name}</div>
        <div>${selectedReport.location}</div>
        <div class="text-red-500 font-bold">
          ${language === 'en' ? 'SOS Emergency!' : 'জরুরী SOS!'}
        </div>
      `).openPopup();
      
      setMap(mapInstance);
      setMarker(sosMarker);
      
      // Clean up map when component unmounts
      return () => {
        if (mapInstance) {
          mapInstance.remove();
          setMap(null);
          setMarker(null);
        }
      };
    }
  }, [showMapModal, selectedReport]);

  // Cleanup map when modal closes
  useEffect(() => {
    if (!showMapModal && map) {
      map.remove();
      setMap(null);
      setMarker(null);
    }
  }, [showMapModal]);

  const handleShowMap = (report) => {
    setSelectedReport(report);
    setShowMapModal(true);
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const response = await axios.put(`/api/sos-reports/status/${reportId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success(language === 'en' 
          ? 'SOS report status updated' 
          : 'SOS রিপোর্ট স্টেটাস আপডেট হয়েছে');
          
        // Update the report in the local state
        setReports(prevReports => 
          prevReports.map(report => 
            report._id === reportId ? { ...report, status: newStatus } : report
          )
        );
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating SOS report status:', err);
      toast.error(language === 'en' 
        ? 'Failed to update status' 
        : 'স্টেটাস আপডেট করতে ব্যর্থ হয়েছে');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'active':
        return language === 'en' ? 'Active' : 'সক্রিয়';
      case 'resolved':
        return language === 'en' ? 'Resolved' : 'সমাধান করা হয়েছে';
      case 'cancelled':
        return language === 'en' ? 'Cancelled' : 'বাতিল করা হয়েছে';
      default:
        return status;
    }
  };

  // Map Modal Component
  const MapModal = () => (
    <div className={`fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex ${showMapModal ? 'block' : 'hidden'}`}>
      <div className="relative p-4 w-full max-w-4xl m-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'en' ? 'SOS Location' : 'SOS অবস্থান'}
            </h3>
            <button
              onClick={() => setShowMapModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            {selectedReport && (
              <div className="mb-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-white">{selectedReport.name}</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedReport.location}</p>
                <div className="flex items-center mt-2">
                  <FaPhone className="text-green-500 mr-2" />
                  <a href={`tel:${selectedReport.phoneNumber}`} className="text-blue-500 hover:underline">
                    {selectedReport.phoneNumber}
                  </a>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedReport.status)}`}>
                    {getStatusText(selectedReport.status)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(selectedReport.createdAt)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Map Container */}
            <div id="sos-map" className="w-full h-96 rounded-lg border dark:border-gray-700"></div>
            
            {/* Map Actions */}
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'en' ? 'Coordinates: ' : 'স্থানাঙ্ক: '}
                  {selectedReport && `${selectedReport.latitude.toFixed(6)}, ${selectedReport.longitude.toFixed(6)}`}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMapModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {language === 'en' ? 'Close' : 'বন্ধ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AuthorityLayout>
      <div className="py-6 max-w-7xl mx-auto px-4">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'en' ? 'SOS Emergency Reports' : 'SOS জরুরী রিপোর্ট'}
          </h1>
          
          {/* Filter by Status */}
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <span className="text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Filter:' : 'ফিল্টার:'}
            </span>
            <select
              className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{language === 'en' ? 'All' : 'সকল'}</option>
              <option value="active">{language === 'en' ? 'Active' : 'সক্রিয়'}</option>
              <option value="resolved">{language === 'en' ? 'Resolved' : 'সমাধান করা হয়েছে'}</option>
              <option value="cancelled">{language === 'en' ? 'Cancelled' : 'বাতিল করা হয়েছে'}</option>
            </select>
            <button
              onClick={fetchSosReports}
              className="p-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {language === 'en' ? 'Refresh' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-100 text-red-800 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* SOS Reports Table */}
            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'en' ? 'Name' : 'নাম'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'en' ? 'Location' : 'অবস্থান'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'en' ? 'Type' : 'ধরন'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'en' ? 'Status' : 'অবস্থা'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'en' ? 'Date' : 'তারিখ'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'en' ? 'Actions' : 'কার্যক্রম'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        {language === 'en' ? 'No SOS reports found' : 'কোন SOS রিপোর্ট পাওয়া যায়নি'}
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {report.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {report.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {getDisasterText(report.disasterType)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                            {getStatusText(report.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleShowMap(report)}
                              className="text-primary hover:text-primary-dark"
                              title={language === 'en' ? 'View on Map' : 'মানচিত্রে দেখুন'}
                            >
                              <FaLocationArrow />
                            </button>
                            <a
                              href={`tel:${report.phoneNumber}`}
                              className="text-green-500 hover:text-green-700"
                              title={language === 'en' ? 'Call' : 'কল করুন'}
                            >
                              <FaPhone />
                            </a>
                            
                            {report.status === 'active' && (
                              <button
                                onClick={() => handleStatusChange(report._id, 'resolved')}
                                className="text-green-500 hover:text-green-700"
                                title={language === 'en' ? 'Mark as Resolved' : 'সমাধান হিসেবে চিহ্নিত করুন'}
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                            
                            {report.status === 'active' && (
                              <button
                                onClick={() => handleStatusChange(report._id, 'cancelled')}
                                className="text-red-500 hover:text-red-700"
                                title={language === 'en' ? 'Cancel Report' : 'রিপোর্ট বাতিল করুন'}
                              >
                                <FaExclamationTriangle />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      
      {/* Map Modal */}
      {showMapModal && <MapModal />}
      
      {/* Custom CSS for the map marker pulse animation */}
      <style jsx>{`
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          
          100% {
            transform: scale(0.8);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </AuthorityLayout>
  );
};

export default AuthoritySosReports; 