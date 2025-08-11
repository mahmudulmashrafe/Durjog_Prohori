import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import AuthorityLayout from '../components/authority/AuthorityLayout';
import { FaLocationArrow, FaPhone, FaUsers, FaBolt } from 'react-icons/fa';

const AuthorityIsubmitReports = () => {
  const { language } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  // State for firefighter assignment
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [reportForAssignment, setReportForAssignment] = useState(null);
  const [selectedFirefighters, setSelectedFirefighters] = useState([]);

  // Fetch isubmit reports on component mount
  useEffect(() => {
    fetchIsubmitReports();
  }, [statusFilter]);

  const fetchIsubmitReports = async () => {
    setLoading(true);
    try {
      // Get isubmit reports from our endpoint
      const endpoint = '/api/isubmit/all';
      
      const response = await axios.get(endpoint);
      
      console.log('Isubmit reports:', response.data);
      
      if (response.data.success) {
        setReports(response.data.data);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch isubmit reports');
      }
    } catch (err) {
      console.error('Error fetching isubmit reports:', err);
      setError(err.message || 'Failed to fetch isubmit reports');
      toast.error(language === 'en' 
        ? 'Failed to fetch isubmit reports' 
        : 'isubmit রিপোর্ট আনতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // No map initialization needed

  const handleShowMap = (report) => {
    setSelectedReport(report);
    setShowMapModal(true);
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const response = await axios.put(`/api/isubmit/status/${reportId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success(language === 'en' 
          ? 'Report status updated' 
          : 'রিপোর্ট স্টেটাস আপডেট হয়েছে');
          
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
      console.error('Error updating report status:', err);
      toast.error(language === 'en' 
        ? 'Failed to update status' 
        : 'স্টেটাস আপডেট করতে ব্যর্থ হয়েছে');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = language === 'en' ? 
      { year: 'numeric', month: 'short', day: 'numeric' } : 
      { year: 'numeric', month: 'short', day: 'numeric' };
    
    const timeOptions = language === 'en' ? 
      { hour: '2-digit', minute: '2-digit', hour12: false } : 
      { hour: '2-digit', minute: '2-digit', hour12: false };
      
    const dateFormatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'bn-BD', options);
    const timeFormatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'bn-BD', timeOptions);
    
    return (
      <div className="text-xs">
        {dateFormatter.format(date)}
        <br />
        {timeFormatter.format(date)}
      </div>
    );
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'pending':
        return language === 'en' ? 'Pending' : 'বিচারাধীন';
      case 'processing':
        return language === 'en' ? 'Processing' : 'প্রক্রিয়াজাতকরণ';
      case 'resolved':
        return language === 'en' ? 'Resolved' : 'সমাধান করা হয়েছে';
      case 'declined':
        return language === 'en' ? 'Declined' : 'প্রত্যাখ্যাত';
      default:
        return status;
    }
  };

  // Map Modal Component - Simplified to just show report info and Google Maps button
  const MapModal = () => (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex">
      <div className="relative p-4 w-full max-w-xl m-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'en' ? 'Report Location' : 'রিপোর্টের অবস্থান'}
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
                <p className="text-gray-700 dark:text-gray-300">{selectedReport.location || 'Location not specified'}</p>
                <div className="flex items-center mt-2">
                  <FaPhone className="text-green-500 mr-2" />
                  <a href={`tel:${selectedReport.phoneNumber}`} className="text-blue-500 hover:underline">
                    {selectedReport.phoneNumber || 'No phone number'}
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
                <div className="mt-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Coordinates: ' : 'স্থানাঙ্ক: '}
                    {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Map Actions */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => window.open(`https://www.google.com/maps?q=${selectedReport?.latitude},${selectedReport?.longitude}`, '_blank')}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 mr-2 flex items-center"
              >
                <FaLocationArrow className="mr-2" />
                {language === 'en' ? 'Open in Google Maps' : 'গুগল ম্যাপে খুলুন'}
              </button>
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
  );

  const handleAssignFirefighters = async () => {
    if (!reportForAssignment || selectedFirefighters.length === 0) {
      toast.error(language === 'en' 
        ? 'Please select at least one firefighter' 
        : 'অনুগ্রহ করে কমপক্ষে একজন অগ্নিনির্বাপক নির্বাচন করুন');
      return;
    }

    try {
      const response = await axios.put(`/api/isubmit/assign-firefighters/${reportForAssignment._id}`, {
        firefighters: selectedFirefighters
      });
      
      if (response.data.success) {
        toast.success(language === 'en' 
          ? 'Firefighters assigned successfully'
          : 'সফলভাবে অগ্নিনির্বাপক নিয়োগ করা হয়েছে');
        
        // Update the report in the local state
        setReports(prevReports => 
          prevReports.map(report => 
            report._id === reportForAssignment._id ? response.data.data : report
          )
        );
        
        // Close the modal
        setShowAssignModal(false);
        setReportForAssignment(null);
        setSelectedFirefighters([]);
      } else {
        throw new Error(response.data.message || 'Failed to assign firefighters');
      }
    } catch (err) {
      console.error('Error assigning firefighters:', err);
      toast.error(language === 'en'
        ? err.response?.data?.message || 'Failed to assign firefighters'
        : 'অগ্নিনির্বাপকদের নিয়োগ করতে ব্যর্থ হয়েছে');
    }
  };

  const openAssignModal = async (report) => {
    // If report is declined, first update status to processing
    if (report.status === 'declined') {
      try {
        // Update the status first
        const updatedReport = await axios.put(`/api/isubmit/status/${report._id}`, {
          status: 'processing'
        });
        
        if (updatedReport.data.success) {
          toast.success(language === 'en' 
            ? 'Report reactivated for reassignment' 
            : 'পুনরায় নিয়োগের জন্য রিপোর্ট পুনরায় সক্রিয় করা হয়েছে');
            
          // Update the report in the local state
          setReports(prevReports => 
            prevReports.map(r => 
              r._id === report._id ? { ...r, status: 'processing' } : r
            )
          );
          
          // Use the updated report
          report = { ...report, status: 'processing' };
        }
      } catch (error) {
        console.error('Error reactivating report:', error);
        toast.error(language === 'en' 
          ? 'Failed to reactivate report' 
          : 'রিপোর্ট পুনরায় সক্রিয় করতে ব্যর্থ হয়েছে');
      }
    }
    
    setReportForAssignment(report);
    setSelectedFirefighters(report.assignedFirefighters || []);
    setShowAssignModal(true);
  };

  const handleAutoAssign = async (report) => {
    try {
      setLoading(true);
      
      // If report is declined, first update status to processing
      if (report.status === 'declined') {
        await handleStatusChange(report._id, 'processing');
      }
      
      // Get nearby firefighters
      const response = await axios.get(`/api/firefighter/nearby`, {
        params: {
          latitude: report.latitude,
          longitude: report.longitude,
          limit: 8,
          maxDistance: 30000 // 30km
        }
      });
      
      if (!response.data.success || !response.data.firefighters.length) {
        toast.warning(language === 'en' 
          ? 'No nearby firefighters found' 
          : 'কাছাকাছি অগ্নিনির্বাপক পাওয়া যায়নি');
        setLoading(false);
        return;
      }
      
      // Log the number of firefighters returned
      console.log(`Auto-assign: Received ${response.data.firefighters.length} firefighters from API`);
      
      // Get the nearest firefighter only
      const nearestOne = response.data.firefighters
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 1);
      
      // Create the expected format
      const firefighters = nearestOne.map(ff => ({
        firefighterId: ff.id,
        name: ff.name,
        phoneNumber: ff.phoneNumber,
        station: ff.station,
        distance: ff.distance
      }));
      
      // Assign the firefighter
      const assignResponse = await axios.put(`/api/isubmit/assign-firefighters/${report._id}`, {
        firefighters
      });
      
      if (assignResponse.data.success) {
        let successMessage;
        if (report.status === 'declined') {
          successMessage = language === 'en'
            ? `Report reactivated and firefighter assigned`
            : `রিপোর্ট পুনরায় সক্রিয় করা হয়েছে এবং অগ্নিনির্বাপক নিয়োগ করা হয়েছে`;
        } else {
          successMessage = language === 'en'
            ? `Automatically assigned the nearest firefighter`
            : `স্বয়ংক্রিয়ভাবে সবচেয়ে কাছের অগ্নিনির্বাপক স্বয়ংক্রিয়ভাবে নিয়োগ করা হয়েছে`;
        }
        
        toast.success(successMessage);
        
        // Update the report in the local state
        setReports(prevReports => 
          prevReports.map(r => 
            r._id === report._id ? assignResponse.data.data : r
          )
        );
      }
    } catch (error) {
      console.error('Error auto-assigning firefighter:', error);
      toast.error(language === 'en' 
        ? 'Failed to auto-assign firefighter' 
        : 'স্বয়ংক্রিয়ভাবে অগ্নিনির্বাপক নিয়োগ করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthorityLayout>
      <div className="py-0 max-w-full mx-0 px-0 sm:px-0">
        <div className="mb-1 flex flex-col sm:flex-row justify-between items-start sm:items-center px-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'en' ? 'Instant Submit Reports' : 'তাৎক্ষণিক জমা রিপোর্ট'}
          </h1>
          
          {/* Filter by Status */}
          <div className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Filter:' : 'ফিল্টার:'}
            </span>
            <select
              className="p-1 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{language === 'en' ? 'All' : 'সকল'}</option>
              <option value="pending">{language === 'en' ? 'Pending' : 'বিচারাধীন'}</option>
              <option value="processing">{language === 'en' ? 'Processing' : 'প্রক্রিয়াজাতকরণ'}</option>
              <option value="resolved">{language === 'en' ? 'Resolved' : 'সমাধান করা হয়েছে'}</option>
              <option value="declined">{language === 'en' ? 'Declined' : 'প্রত্যাখ্যাত'}</option>
            </select>
            <button
              onClick={fetchIsubmitReports}
              className="p-1 bg-primary text-white rounded-md hover:bg-primary-dark text-sm"
            >
              {language === 'en' ? 'Refresh' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-1 mx-2 bg-red-100 text-red-800 p-2 rounded-lg">
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
            {/* Isubmit Reports Table Container */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mx-0">
              {/* Fixed Header */}
              <table className="min-w-full w-full table-fixed border-collapse border-b border-gray-200 dark:border-gray-700">
                <thead style={{ backgroundColor: 'rgb(88, 10, 107)' }}>
                  <tr>
                    <th className="px-1 py-2 text-center text-xs font-bold text-white uppercase tracking-wider w-[11.5%]">
                      {language === 'en' ? 'Name' : 'নাম'}
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-bold text-white uppercase tracking-wider w-[11.5%]">
                      {language === 'en' ? 'Phone' : 'ফোন'}
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-bold text-white uppercase tracking-wider w-[11.5%]">
                      {language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}
                    </th>
                    <th className="px-0 py-2 text-center text-xs font-bold text-transparent dark:text-transparent uppercase tracking-wider w-[2.1%] border-none" style={{ backgroundColor: 'rgb(88, 10, 107)' }}>
                       
                    </th>
                    <th className="px-0 py-2 text-center text-xs font-bold text-transparent dark:text-transparent uppercase tracking-wider w-[1.1%] border-none" style={{ backgroundColor: 'rgb(88, 10, 107)' }}>
                      
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-bold text-white uppercase tracking-wider date-column w-[8%]">
                      {language === 'en' ? 'Date' : 'তারিখ'}
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-bold text-white uppercase tracking-wider detail-column w-[7.5%]">
                      {language === 'en' ? 'Detail' : 'বিস্তারিত'}
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-bold text-white uppercase tracking-wider w-[12.5%]">
                      {language === 'en' ? 'Firefighters' : 'অগ্নিনির্বাপক'}
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-bold text-white uppercase tracking-wider w-[12.5%]">
                      {language === 'en' ? 'Status' : 'অবস্থা'}
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-bold text-white uppercase tracking-wider action-column w-[19.5%]">
                      {language === 'en' ? 'Actions' : 'কার্যক্রম'}
                    </th>
                  </tr>
                </thead>
              </table>
              
              {/* Scrollable Body */}
              <div className="max-h-[72vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                <table className="min-w-full w-full table-fixed border-collapse">
                  <colgroup>
                    <col style={{width: "11.5%"}} /> {/* Name */}
                    <col style={{width: "11.5%"}} /> {/* Phone */}
                    <col style={{width: "11.5%"}} /> {/* Coordinates */}
                    <col style={{width: "2.1%"}} /> {/* Separator */}
                    <col style={{width: "8%"}} /> {/* Date */}
                    <col style={{width: "14.5%"}} /> {/* Detail */}
                    <col style={{width: "12.5%"}} /> {/* Firefighters */}
                    <col style={{width: "7.5%"}} /> {/* Status */}
                    <col style={{width: "19.5%"}} /> {/* Actions */}
                  </colgroup>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-1 py-4 text-center text-gray-500 dark:text-gray-400">
                          {language === 'en' ? 'No reports found' : 'কোন রিপোর্ট পাওয়া যায়নি'}
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-1 py-3 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {report.name}
                            </div>
                          </td>
                          <td className="px-1 py-3 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {report.phoneNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="px-1 py-3 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {report.latitude.toFixed(6)}, 
                              <br />
                              {report.longitude.toFixed(6)}
                            </div>
                          </td>
                          <td className="px-1 py-2 text-center text-transparent dark:text-transparent bg-gray-50 dark:bg-gray-700 border-none">
                            
                          </td>
                          <td className="px-1 py-2 whitespace-nowrap date-column text-center">
                            <div className="text-xs">
                              {formatDate(report.createdAt)}
                            </div>
                          </td>
                          <td className="px-1 py-2 whitespace-nowrap text-center detail-column">
                            <div className="flex justify-center space-x-1">
                              <button
                                onClick={() => handleShowMap(report)}
                                className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded transition-colors duration-200 tooltip-container text-xs"
                              >
                                <FaLocationArrow className="mr-0.5" size="12" /> 
                                <span>{language === 'en' ? 'Map' : 'মানচিত্র'}</span>
                                <span className="tooltip">{language === 'en' ? 'View on Map' : 'মানচিত্রে দেখুন'}</span>
                              </button>
                              
                              {report.phoneNumber && (
                                <a
                                  href={`tel:${report.phoneNumber}`}
                                  className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 px-1.5 py-0.5 rounded transition-colors duration-200 tooltip-container text-xs"
                                >
                                  <FaPhone className="mr-0.5" size="12" />
                                  <span>{language === 'en' ? 'Call' : 'কল'}</span>
                                  <span className="tooltip">{language === 'en' ? 'Call Reporter' : 'রিপোর্টারকে কল করুন'}</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-1 py-3 whitespace-nowrap text-center">
                            {report.assignedFirefighters && report.assignedFirefighters.length > 0 ? (
                              <div className="relative group">
                                <span className="bg-orange-100 text-orange-800 font-medium px-2.5 py-0.5 rounded-full text-xs">
                                  {report.assignedFirefighters.length} {language === 'en' ? 'assigned' : 'নিয়োগ'}
                                </span>
                                <div className="absolute left-0 mt-1 z-10 bg-white dark:bg-gray-800 shadow-lg rounded p-2 text-xs text-gray-600 dark:text-gray-300 hidden group-hover:block min-w-72 border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="font-medium mb-1 border-b pb-1 text-orange-600 text-center">
                                    {language === 'en' ? 'Assigned Firefighters:' : 'নিয়োগকৃত অগ্নিনির্বাপক:'}
                                  </div>
                                  {[...report.assignedFirefighters]
                                    .sort((a, b) => a.distance - b.distance)
                                    .map((ff, idx) => (
                                    <div key={idx} className="py-1 border-b last:border-b-0">
                                      <div className="font-medium text-gray-900 dark:text-white text-center">{ff.name}</div>
                                      <div className="flex justify-between">
                                        <div className="text-xs text-gray-500">{ff.station}</div>
                                        <div className="text-xs text-green-600">{(ff.distance / 1000).toFixed(2)} km</div>
                                      </div>
                                      {ff.phoneNumber && (
                                        <div className="text-blue-500 text-xs mt-0.5 text-center">
                                          <a href={`tel:${ff.phoneNumber}`} className="flex items-center justify-center">
                                            <FaPhone className="mr-1" size={10} /> {ff.phoneNumber}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                {language === 'en' ? 'None' : 'কোনটি নয়'}
                              </span>
                            )}
                          </td>
                          <td className="px-1 py-3 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                              {getStatusText(report.status)}
                            </span>
                          </td>
                          <td className="px-1 py-2 whitespace-nowrap text-center action-column">
                            {report.status === 'resolved' ? (
                              <div className="text-gray-400 font-medium">----</div>
                            ) : (
                              <div className="flex justify-center space-x-1">
                                {(report.status === 'pending' || report.status === 'processing' || report.status === 'declined') && (
                                  <button
                                    onClick={() => openAssignModal(report)}
                                    className="flex items-center bg-orange-100 hover:bg-orange-200 text-orange-700 px-1.5 py-0.5 rounded transition-colors duration-200 tooltip-container text-xs"
                                  >
                                    <FaUsers className="mr-0.5" size="12" />
                                    <span>{language === 'en' ? 'Assign' : 'নিয়োগ'}</span>
                                    <span className="tooltip">{language === 'en' ? 'Assign Firefighters Manually' : 'হাতে করে অগ্নিনির্বাপক নিয়োগ করুন'}</span>
                                  </button>
                                )}
                                
                                {(report.status === 'pending' || report.status === 'processing' || report.status === 'declined') && (
                                  <button
                                    onClick={() => handleAutoAssign(report)}
                                    className="flex items-center bg-purple-100 hover:bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded transition-colors duration-200 tooltip-container text-xs"
                                    disabled={loading}
                                  >
                                    <FaBolt className="mr-0.5" size="12" />
                                    <span>{language === 'en' ? 'Auto' : 'অটো'}</span>
                                    <span className="tooltip">{language === 'en' ? 'Auto-Assign Nearest Firefighter' : 'সবচেয়ে কাছের অগ্নিনির্বাপক স্বয়ংক্রিয়ভাবে নিয়োগ করুন'}</span>
                                  </button>
                                )}
                                
                                {report.status === 'declined' && (
                                  <button
                                    onClick={() => handleStatusChange(report._id, 'processing')}
                                    className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded transition-colors duration-200 tooltip-container text-xs"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>{language === 'en' ? 'Reactivate' : 'পুনরায় সক্রিয়'}</span>
                                    <span className="tooltip">{language === 'en' ? 'Mark as Processing & Reassign' : 'প্রক্রিয়াধীন হিসেবে চিহ্নিত করুন এবং পুনরায় নিয়োগ করুন'}</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Map Modal */}
      {showMapModal && <MapModal />}
      
      {/* Firefighter Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex">
          <div className="relative p-4 w-full max-w-4xl m-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {language === 'en' ? 'Assign Firefighters' : 'অগ্নিনির্বাপক নিয়োগ করুন'}
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                {reportForAssignment && (
                  <div className="mb-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white">{reportForAssignment.name}</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {reportForAssignment.location || `${reportForAssignment.latitude.toFixed(6)}, ${reportForAssignment.longitude.toFixed(6)}`}
                    </p>
                    {reportForAssignment.phoneNumber && (
                      <div className="flex items-center mt-2">
                        <FaPhone className="text-green-500 mr-2" />
                        <a href={`tel:${reportForAssignment.phoneNumber}`} className="text-blue-500 hover:underline">
                          {reportForAssignment.phoneNumber}
                        </a>
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {language === 'en' ? 'Coordinates: ' : 'স্থানাঙ্ক: '}
                        {reportForAssignment.latitude.toFixed(6)}, {reportForAssignment.longitude.toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Nearby Firefighters List */}
                {reportForAssignment && (
                  <>
                    {/* Show already assigned firefighters if any */}
                    {reportForAssignment.assignedFirefighters && reportForAssignment.assignedFirefighters.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          {language === 'en' ? 'Currently Assigned Firefighters' : 'বর্তমানে নিয়োগকৃত অগ্নিনির্বাপক'}
                          <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {reportForAssignment.assignedFirefighters.length}
                          </span>
                        </h4>
                        <div className="bg-orange-50 dark:bg-gray-700 rounded-md p-3 border border-orange-200 dark:border-orange-900">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[...reportForAssignment.assignedFirefighters]
                              .sort((a, b) => a.distance - b.distance)
                              .map((ff, idx) => (
                                <div key={idx} className="flex items-start bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">{ff.name}</div>
                                    <div className="text-sm text-gray-500">{ff.station}</div>
                                    <div className="flex justify-between items-center mt-1">
                                      <div className="text-xs text-green-600">{(ff.distance / 1000).toFixed(2)} km</div>
                                      {ff.phoneNumber && (
                                        <a href={`tel:${ff.phoneNumber}`} className="text-blue-500 text-xs flex items-center">
                                          <FaPhone className="mr-1" size={10} /> {ff.phoneNumber}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  
                    <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">
                      {language === 'en' ? 'Assign More Firefighters' : 'আরও অগ্নিনির্বাপক নিয়োগ করুন'}
                    </h4>
                    <NearbyFirefightersList
                      latitude={reportForAssignment.latitude}
                      longitude={reportForAssignment.longitude}
                      language={language}
                      onSelectFirefighters={(newSelection) => {
                        if (newSelection) {
                          setSelectedFirefighters(newSelection);
                          return newSelection;
                        }
                        return selectedFirefighters;
                      }}
                      initialSelected={reportForAssignment.assignedFirefighters || []}
                    />
                  </>
                )}

                <div className="mt-4 flex flex-wrap justify-between gap-2">
                  <div className="flex-1"></div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAssignModal(false)}
                      className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {language === 'en' ? 'Cancel' : 'বাতিল করুন'}
                    </button>
                    <button
                      onClick={handleAssignFirefighters}
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200"
                      disabled={selectedFirefighters.length === 0}
                    >
                      <FaUsers className="mr-2" />
                      {language === 'en' ? 'Assign Firefighters' : 'অগ্নিনির্বাপক নিয়োগ করুন'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom CSS for the map marker pulse animation */}
      <style>{`
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          
          100% {
            transform: scale(0.8);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        /* Tooltip styles */
        .tooltip-container {
          position: relative;
        }

        .tooltip {
          visibility: hidden;
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(55, 65, 81, 0.9);
          color: white;
          text-align: center;
          padding: 4px 8px;
          border-radius: 4px;
          z-index: 10;
          white-space: nowrap;
          font-size: 0.7rem;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: rgba(55, 65, 81, 0.9) transparent transparent transparent;
        }

        .tooltip-container:hover .tooltip {
          visibility: visible;
          opacity: 1;
        }

        /* Adjust table for better button spacing */
        @media (min-width: 1024px) {
          .action-column {
            min-width: 280px;
            width: auto;
            max-width: 300px;
            padding-right: 0 !important;
            margin-left: 0;
            text-align: center;
          }
          .date-column {
            max-width: 90px;
            width: 90px;
            padding-left: 4px !important;
            padding-right: 4px !important;
            font-size: 0.7rem;
          }
          .detail-column {
            max-width: 150px;
            width: auto;
            text-align: center;
          }
        }
        
        @media (max-width: 1023px) {
          .action-column {
            min-width: 220px;
            width: auto;
            padding-right: 0 !important;
            margin-left: 0;
            text-align: center;
          }
          .date-column {
            max-width: 80px;
            width: 80px;
            padding-left: 4px !important;
            padding-right: 4px !important;
            font-size: 0.7rem;
          }
          .detail-column {
            max-width: 145px;
            width: auto;
            text-align: center;
          }
        }
        
        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 0px; /* Hide horizontal scrollbar */
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Fix for sticky header */
        .sticky-header {
          position: sticky;
          top: 0;
          z-index: 20;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          background-color: rgb(249 250 251); /* bg-gray-50 */
          backdrop-filter: blur(8px);
          margin-bottom: 0;
        }
        
        .dark .sticky-header {
          background-color: rgb(55 65 81); /* dark:bg-gray-700 */
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        /* Force the header to be fixed on top and tbody to scroll */
        .custom-scrollbar thead {
          position: sticky;
          top: 0;
          z-index: 20;
        }

        /* Ensure tbody takes the scrollable area */
        .custom-scrollbar tbody {
          position: relative;
        }

        /* Width control for columns to prevent horizontal scrolling */
        table.table-fixed {
          table-layout: fixed;
          width: 100%;
          border-spacing: 0;
          border-collapse: collapse;
        }
      `}</style>
    </AuthorityLayout>
  );
};

// Component to show nearby firefighters
const NearbyFirefightersList = ({ latitude, longitude, language, onSelectFirefighters, initialSelected = [] }) => {
  const [loading, setLoading] = useState(true);
  const [firefighters, setFirefighters] = useState([]);
  const [error, setError] = useState(null);
  
  // Get currently selected firefighters from parent component
  const [selectedFirefighters, setSelectedFirefighters] = useState(initialSelected);

  // Fetch nearby firefighters when component mounts
  useEffect(() => {
    const fetchNearbyFirefighters = async () => {
      setLoading(true);
      try {
        // First attempt - with distance limit
        const response = await axios.get(`/api/firefighter/nearby`, {
          params: {
            latitude,
            longitude,
            limit: 8,
            maxDistance: 30000 // 30km
          }
        });
        
        if (response.data.success) {
          let firefighterList = response.data.firefighters;
          
          // Log the number of firefighters returned
          console.log(`Received ${firefighterList.length} firefighters from API within 30km`);
          
          // If fewer than 3 firefighters found, try getting all without distance filter
          if (firefighterList.length < 3) {
            console.log('Fewer than 3 firefighters found within distance, fetching all firefighters');
            try {
              const allResponse = await axios.get(`/api/firefighter/all`);
              
              if (allResponse.data.success && allResponse.data.firefighters.length > 0) {
                // If successful, calculate distances manually
                const allFirefighters = allResponse.data.firefighters.map(ff => {
                  // Calculate distance using the haversine formula
                  const dLat = (ff.latitude - latitude) * Math.PI / 180;
                  const dLng = (ff.longitude - longitude) * Math.PI / 180;
                  const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(latitude * Math.PI / 180) * Math.cos(ff.latitude * Math.PI / 180) * 
                    Math.sin(dLng/2) * Math.sin(dLng/2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                  const distance = 6371 * 1000 * c; // Distance in meters
                  
                  return {
                    ...ff,
                    distance
                  };
                });
                
                // Sort by distance
                allFirefighters.sort((a, b) => a.distance - b.distance);
                
                console.log(`Total firefighters found: ${allFirefighters.length}`);
                firefighterList = allFirefighters;
              }
            } catch (err) {
              console.error('Error fetching all firefighters:', err);
            }
          }
          
          setFirefighters(firefighterList);
          
          // Initialize with any pre-selected firefighters from parent
          if (initialSelected.length > 0) {
            setSelectedFirefighters(initialSelected);
          }
        } else {
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
      fetchNearbyFirefighters();
    }
  }, [latitude, longitude, initialSelected]);

  // Handle select/deselect firefighter
  const handleToggleSelect = (firefighter) => {
    let updatedSelection;
    
    // Check if this firefighter is already selected
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
      // Remove from selection
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
      // Add to selection with the expected structure for the backend
      const newEntry = {
        firefighterId: firefighter.id,
        name: firefighter.name,
        phoneNumber: firefighter.phoneNumber,
        station: firefighter.station,
        distance: firefighter.distance
      };
      
      updatedSelection = [...selectedFirefighters, newEntry];
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
      
      {/* Action buttons */}
      <div className="flex flex-wrap justify-between mb-3 gap-2">
        <button
          onClick={() => {
            // Find the nearest firefighter from the list and select it
            if (firefighters.length > 0) {
              // Sort by distance and get the nearest one
              const nearestOne = [...firefighters]
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 1);
              
              // Create the expected format
              const selectedEntries = nearestOne.map(ff => ({
                firefighterId: ff.id,
                name: ff.name,
                phoneNumber: ff.phoneNumber,
                station: ff.station,
                distance: ff.distance
              }));
              
              // Set as the selected firefighters
              setSelectedFirefighters(selectedEntries);
              if (onSelectFirefighters) {
                onSelectFirefighters(selectedEntries);
              }
              
              toast.info(
                language === 'en' 
                  ? `Selected the nearest firefighter`
                  : `সবচেয়ে কাছের অগ্নিনির্বাপক নির্বাচিত হয়েছে`
              );
            }
          }}
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded transition-colors duration-200"
          disabled={firefighters.length === 0 || loading}
        >
          <FaBolt className="mr-2" />
          {language === 'en' ? 'Auto-Select Nearest' : 'সবচেয়ে কাছের নির্বাচন করুন'}
        </button>
        
        <button
          onClick={() => {
            // Clear selection
            setSelectedFirefighters([]);
            if (onSelectFirefighters) {
              onSelectFirefighters([]);
            }
          }}
          className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {language === 'en' ? 'Clear Selection' : 'নির্বাচন মুছুন'}
        </button>
      </div>
      
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
            {firefighters
              .sort((a, b) => a.distance - b.distance)
              .map((firefighter, index) => (
              <tr 
                key={firefighter.id}
                className={index < 3 ? 'bg-green-50' : ''}
              >
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
                  {index === 0 && (
                    <span className="ml-1.5 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                      {language === 'en' ? 'Nearest' : 'সবচেয়ে কাছে'}
                    </span>
                  )}
                  {index === 1 && (
                    <span className="ml-1.5 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded opacity-80">
                      {language === 'en' ? '2nd Nearest' : '২য় কাছে'}
                    </span>
                  )}
                  {index === 2 && (
                    <span className="ml-1.5 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded opacity-70">
                      {language === 'en' ? '3rd Nearest' : '৩য় কাছে'}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {firefighter.station}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={index < 3 ? 'font-medium text-green-600' : ''}>
                    {(firefighter.distance / 1000).toFixed(2)} km
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthorityIsubmitReports;