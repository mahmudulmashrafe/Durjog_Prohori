import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useFirefighterAuth } from '../context/FirefighterAuthContext';
import FirefighterLayout from '../components/firefighter/FirefighterLayout';
import { toast } from 'react-toastify';

import { FaLocationArrow, FaPhone, FaCheckCircle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const FirefighterReports = () => {
    const { language } = useLanguage();
    const { firefighter } = useFirefighterAuth();
    const location = useLocation();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    
    // Filter state - always set to 'all' now that UI filter is removed
    const [statusFilter] = useState('all');
    
    const fetchReports = useCallback(async () => {
        // We need to check for firefighter ID to show only reports assigned to this firefighter
        setLoading(true);
        setError(null);
        
        try {
            // Get firefighter ID from either _id or id property
            const firefighterId = firefighter?._id || firefighter?.id;
            
            if (!firefighter || !firefighterId) {
                console.error('Firefighter ID not available', firefighter);
                setError('Authentication error: Firefighter ID not available');
                setLoading(false);
                return;
            }
            
            // Get reports based on status filter
            const endpoint = '/api/firefighter/assigned-reports';
            
            console.log('Fetching reports with filters:', {
                status: statusFilter,
                firefighterId: firefighterId
            });
            
            // Pass firefighter ID to API
            const response = await axios.get(endpoint, {
                params: {
                    status: statusFilter,
                    firefighterId: firefighterId
                }
            });
            
            console.log('Reports API response:', response.data);
            
            if (response.data.success) {
                if (!response.data.data || response.data.data.length === 0) {
                    console.log('No reports found with the current filters');
                } else {
                    console.log(`Found ${response.data.data.length} reports assigned to this firefighter`);
                    console.log('Report statuses:', response.data.data.map(r => r.status).join(', '));
                }
                // Set reports directly from API response (server handles filtering)
                setReports(response.data.data || []);
                setError(null);
            } else {
                throw new Error(response.data.message || 'Failed to fetch reports');
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
            let errorMsg = err.message;
            
            // Get more details if it's an axios error
            if (err.response) {
                console.error('Error response data:', err.response.data);
                errorMsg = err.response.data?.message || errorMsg;
            }
            
            setError(errorMsg || 'Failed to fetch reports');
            toast.error(language === 'en' 
                ? `Failed to fetch reports: ${errorMsg}`
                : `রিপোর্ট আনতে ব্যর্থ হয়েছে: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    }, [firefighter, language, statusFilter]);
    
    // Reset data when navigating to this page
    // or when the query string changes (from navbar clicks)
    useEffect(() => {
        if (firefighter) {
            // Log firefighter object for debugging
            console.log('Firefighter object:', firefighter);
            console.log('Firefighter ID:', firefighter._id || firefighter.id);
            
            // Fetch reports immediately
            fetchReports();
        }
    }, [firefighter, location.pathname, location.search, fetchReports]); // Re-run when location changes or search params change

    const handleShowMap = (report) => {
        setSelectedReport(report);
        setShowMapModal(true);
    };

    // eslint-disable-next-line no-unused-vars
    const handleStatusChange = async (reportId, newStatus) => {
        try {
            console.log(`Button clicked: ${newStatus} for report ${reportId}`);
            
            // Make sure we have a valid firefighter ID
            if (!firefighter || !firefighter._id) {
                console.error('Missing firefighter ID:', firefighter);
                toast.error(language === 'en' 
                    ? 'Cannot update status: Firefighter ID not available'
                    : 'স্টেটাস আপডেট করতে পারছি না: ফায়ারফাইটার আইডি উপলব্ধ নয়');
                return;
            }
            
            const firefighterId = firefighter._id.toString();
            console.log(`Attempting to change report ${reportId} status to ${newStatus}`);
            console.log('Using firefighter ID:', firefighterId);
            
            // Show loading toast
            const toastId = toast.loading(language === 'en' 
                ? `Updating status to ${newStatus}...` 
                : `স্টেটাস ${newStatus}-এ আপডেট করা হচ্ছে...`);
            
            const response = await axios.put(`/api/firefighter/report-status/${reportId}`, {
                status: newStatus,
                firefighterId: firefighterId
            });
            
            console.log('API response:', response.data);
            
            // Dismiss loading toast
            toast.dismiss(toastId);
            
            if (response.data.success) {
                let message = '';
                if (language === 'en') {
                    message = newStatus === 'accepted' ? 'Report accepted' : 
                                newStatus === 'declined' ? 'Report declined' : 
                                'Report marked as resolved';
                } else {
                    message = newStatus === 'accepted' ? 'রিপোর্ট গ্রহণ করা হয়েছে' : 
                                newStatus === 'declined' ? 'রিপোর্ট প্রত্যাখ্যান করা হয়েছে' : 
                                'রিপোর্ট সমাধান হিসাবে চিহ্নিত করা হয়েছে';
                }
                toast.success(message);
                
                // Update the report in the local state
                setReports(prevReports => 
                    prevReports.map(report => 
                        report._id === reportId ? 
                            { 
                                ...report, 
                                status: response.data.data.status || newStatus,
                                assignedFirefighters: response.data.data.assignedFirefighters || report.assignedFirefighters
                            } 
                            : report
                    )
                );
                
                // Fetch fresh data after a short delay
                setTimeout(() => {
                    console.log('Refreshing reports after status change');
                    fetchReports();
                }, 1000);
            } else {
                throw new Error(response.data.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Error updating report status:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
            }
            toast.error(language === 'en' 
                ? `Failed to update status: ${err.message}` 
                : `স্টেটাস আপডেট করতে ব্যর্থ হয়েছে: ${err.message}`);
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
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'accepted':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'declined':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'resolved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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
            case 'accepted':
                return language === 'en' ? 'Accepted' : 'গৃহীত';
            case 'declined':
                return language === 'en' ? 'Declined' : 'প্রত্যাখ্যাত';
            case 'resolved':
                return language === 'en' ? 'Resolved' : 'সমাধান করা হয়েছে';
            default:
                return status;
        }
    };

    // Add this function to check if the current firefighter is assigned to a report
    const isAssignedToReport = (report, firefighterId) => {
        if (!report.assignedFirefighters || !Array.isArray(report.assignedFirefighters) || !firefighterId) {
            return false;
        }
        
        return report.assignedFirefighters.some(ff => {
            if (!ff.firefighterId) return false;
            const ffIdStr = ff.firefighterId.toString();
            const currentIdStr = firefighterId.toString();
            return ffIdStr === currentIdStr;
        });
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

    return (
        <FirefighterLayout>
            <div className="py-4 max-w-full mx-0 px-0 sm:px-1">
                {/* Fixed Header with Title and Refresh Button */}
                <div className="fixed top-14 left-0 right-0 bg-white dark:bg-gray-800 z-30 border-b border-gray-200 dark:border-gray-700 px-2 py-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                {language === 'en' ? 'Instant SOS Reports' : 'ইনস্ট্যান্ট এসওএস রিপোর্ট'}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {language === 'en' 
                                    ? 'Showing reports assigned to you.' 
                                    : 'আপনার নিয়োগকৃত রিপোর্ট দেখাচ্ছে।'}
                            </p>
                        </div>
                        <div>
                            <button
                                onClick={fetchReports}
                                disabled={loading}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {language === 'en' ? 'Refresh' : 'রিফ্রেশ'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Alert - Adjusted position */}
                {error && (
                    <div className="fixed top-32 left-2 right-2 z-30 bg-red-100 text-red-800 p-4 rounded-lg">
                        {error}
                    </div>
                )}
                
                {/* Spacer for the fixed header */}
                <div className="h-16"></div>
                
                {/* Loading State */}
                {loading ? (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Debug Section - Only visible to chief or above */}
                        {firefighter && firefighter.role === 'chief' && firefighter._id && (
                            <div className="mb-4 mx-2 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                <details>
                                    <summary className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                        {language === 'en' ? 'Debug Information (Admin only)' : 'ডিবাগ তথ্য (শুধুমাত্র প্রশাসক)'}
                                    </summary>
                                    <div className="mt-3 text-sm">
                                        <p className="text-gray-700 dark:text-gray-300">
                                            {language === 'en' ? 'Current Firefighter ID:' : 'বর্তমান ফায়ারফাইটার আইডি:'} <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{firefighter._id.toString()}</code>
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                                            {language === 'en' ? 'Station:' : 'স্টেশন:'} <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{firefighter.station || 'Not set'}</code>
                                        </p>
                                        <div className="mt-2">
                                            <p className="font-bold">{language === 'en' ? 'Verify assignments by ID in MongoDB:' : 'মঙ্গোডিবি তে আইডি দ্বারা অ্যাসাইনমেন্ট যাচাই করুন:'}</p>
                                            <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto text-xs">
                                                {`db.isubmit.find({
  "assignedFirefighters.firefighterId": ObjectId("${firefighter._id}")
}).pretty()`}
                                            </pre>
                                        </div>
                                        <div className="mt-2">
                                            <p className="font-bold">{language === 'en' ? 'Verify assignments by station in MongoDB:' : 'মঙ্গোডিবি তে স্টেশন দ্বারা অ্যাসাইনমেন্ট যাচাই করুন:'}</p>
                                            <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto text-xs">
                                                {`db.isubmit.find({
  "assignedFirefighters.station": "${firefighter.station || 'YOUR_STATION'}"
}).pretty()`}
                                            </pre>
                                        </div>
                                        <div className="mt-2">
                                            <p className="font-bold">{language === 'en' ? 'How to manually assign a firefighter by ID:' : 'কীভাবে আইডি দ্বারা ম্যানুয়ালি একজন ফায়ারফাইটারকে নিয়োগ করবেন:'}</p>
                                            <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto text-xs">
                                                {`db.isubmit.updateOne(
  { _id: ObjectId("REPORT_ID_HERE") },
  { $push: { assignedFirefighters: {
      firefighterId: ObjectId("${firefighter._id}"),
      name: "${firefighter.name || 'Firefighter Name'}",
      station: "${firefighter.station || 'Fire Station'}",
      assignedAt: new Date()
    }}
  }
)`}
                                            </pre>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        )}

                        {/* Assigned Reports Table Container - Adjusted to full width */}
                        <div className="fixed top-32 bottom-4 left-0 right-0 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden z-20">
                            {/* Header and Body in single table with sticky header */}
                            <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
                                <table className="min-w-full w-full table-fixed border-collapse">
                                    <colgroup>
                                        <col style={{width: "12%"}} /> {/* Name */}
                                        <col style={{width: "12%"}} /> {/* Phone */}
                                        <col style={{width: "13%"}} /> {/* Coordinates */}
                                        <col style={{width: "10%"}} /> {/* Date */}
                                        <col style={{width: "10%"}} /> {/* Detail */}
                                        <col style={{width: "13%"}} /> {/* Status */}
                                        <col style={{width: "15%"}} /> {/* Firefighters */}
                                        <col style={{width: "15%"}} /> {/* Actions */}
                                    </colgroup>
                                    <thead className="bg-[rgb(6,143,125)] dark:bg-[rgb(6,143,125)] sticky top-0 z-10 shadow-md">
                                        <tr>
                                            <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                                {language === 'en' ? 'Name' : 'নাম'}
                                            </th>
                                            <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                                {language === 'en' ? 'Phone' : 'ফোন'}
                                            </th>
                                            <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                                {language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}
                                            </th>
                                            <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                                {language === 'en' ? 'Date' : 'তারিখ'}
                                            </th>
                                            <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                                {language === 'en' ? 'Detail' : 'বিস্তারিত'}
                                            </th>
                                            <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                                {language === 'en' ? 'Status' : 'স্ট্যাটাস'}
                                            </th>
                                            <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                                {language === 'en' ? 'Firefighters' : 'ফায়ারফাইটার'}
                                            </th>
                                            <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                                {language === 'en' ? 'Actions' : 'কার্যক্রম'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {reports.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" className="px-1 py-4 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <div className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                                                            {language === 'en' ? 'No reports found' : 'কোনও রিপোর্ট পাওয়া যায়নি'}
                                                        </div>
                                                        <div className="max-w-md text-center text-gray-500 dark:text-gray-400">
                                                            {language === 'en' 
                                                                ? 'There are currently no reports that match your filter criteria.' 
                                                                : 'আপনার ফিল্টার মানদণ্ড মেলে এমন কোন রিপোর্ট বর্তমানে নেই।'}
                                                        </div>
                                                        <button
                                                            onClick={fetchReports}
                                                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                                        >
                                                            {language === 'en' ? 'Refresh Reports' : 'রিপোর্ট রিফ্রেশ করুন'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            reports.map((report, index) => (
                                                <tr 
                                                    key={report._id} 
                                                    className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                        index % 2 === 0 
                                                        ? 'bg-white dark:bg-gray-800' 
                                                        : 'bg-gray-100 dark:bg-gray-900'
                                                    }`}
                                                >
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
                                                                    <span>{language === 'en' ? 'Call' : 'কল২'}</span>
                                                                    <span className="tooltip">{language === 'en' ? 'Call Reporter' : 'রিপোর্টারকে কল করুন'}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-3 whitespace-nowrap text-center">
                                                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                                                            {getStatusText(report.status)}
                                                        </span>
                                                        {firefighter && isAssignedToReport(report, firefighter._id || firefighter.id) && (
                                                            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                                                {language === 'en' ? '(Assigned to you)' : '(আপনাকে নিয়োগ করা হয়েছে)'}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-1 py-2 whitespace-nowrap text-center">
                                                        {report.assignedFirefighters && report.assignedFirefighters.length > 0 ? (
                                                            <div className="flex flex-col space-y-1">
                                                                {report.assignedFirefighters.map((ff, index) => {
                                                                    // Check if this firefighter matches the current user
                                                                    const isCurrentUser = firefighter && 
                                                                      ((ff.name && firefighter.name && ff.name === firefighter.name) || 
                                                                       (ff.firefighterId && firefighter._id && ff.firefighterId.toString() === firefighter._id.toString()));
                                                                    
                                                                    return (
                                                                      <div 
                                                                        key={`${report._id}-ff-${index}`} 
                                                                        className={`text-xs rounded px-1 py-0.5 ${
                                                                          isCurrentUser 
                                                                            ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700' 
                                                                            : 'bg-gray-100 dark:bg-gray-700'
                                                                        }`}
                                                                      >
                                                                        <div 
                                                                          className={`font-medium ${
                                                                            isCurrentUser 
                                                                              ? 'text-blue-800 dark:text-blue-300' 
                                                                              : 'text-gray-800 dark:text-gray-200'
                                                                          }`}
                                                                        >
                                                                          {ff.name || 'Unnamed'}
                                                                          {isCurrentUser && (
                                                                            <span className="ml-1 text-[10px]">
                                                                              {language === 'en' ? '(You)' : '(আপনি)'}
                                                                            </span>
                                                                          )}
                                                                        </div>
                                                                        {ff.station && (
                                                                          <div className={`text-[10px] ${
                                                                            isCurrentUser 
                                                                              ? 'text-blue-600 dark:text-blue-400' 
                                                                              : 'text-gray-500 dark:text-gray-400'
                                                                          }`}>
                                                                            {ff.station}
                                                                          </div>
                                                                        )}
                                                                      </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {language === 'en' ? 'Not assigned' : 'নিয়োগ করা হয়নি'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-1 py-2 whitespace-nowrap text-center action-column">
                                                        <div className="flex justify-center space-x-1">
                                                            {report.status === 'processing' && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            // Use the direct set-status endpoint
                                                                            fetch(`/api/firefighter/set-status/${report._id}/resolved`, {
                                                                                method: 'POST'
                                                                            })
                                                                            .then(response => response.json())
                                                                            .then(data => {
                                                                                if (data.success) {
                                                                                    toast.success('Report resolved');
                                                                                    fetchReports();
                                                                                } else {
                                                                                    toast.error(data.message || 'Failed to resolve report');
                                                                                }
                                                                            })
                                                                            .catch(error => {
                                                                                console.error('Error resolving report:', error);
                                                                                toast.error('Failed to resolve report');
                                                                            });
                                                                        }}
                                                                        className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 px-1.5 py-0.5 rounded transition-colors duration-200 tooltip-container text-xs"
                                                                    >
                                                                        <FaCheckCircle className="mr-0.5" size="12" />
                                                                        <span>{language === 'en' ? 'Resolve' : 'সমাধান'}</span>
                                                                        <span className="tooltip">{language === 'en' ? 'Mark as Resolved' : 'সমাধান হিসাবে চিহ্নিত করুন'}</span>
                                                                    </button>
                                                                    
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            // Use the direct set-status endpoint
                                                                            fetch(`/api/firefighter/set-status/${report._id}/declined`, {
                                                                                method: 'POST'
                                                                            })
                                                                            .then(response => response.json())
                                                                            .then(data => {
                                                                                if (data.success) {
                                                                                    toast.success('Report declined');
                                                                                    fetchReports();
                                                                                } else {
                                                                                    toast.error(data.message || 'Failed to decline report');
                                                                                }
                                                                            })
                                                                            .catch(error => {
                                                                                console.error('Error declining report:', error);
                                                                                toast.error('Failed to decline report');
                                                                            });
                                                                        }}
                                                                        className="flex items-center bg-red-100 hover:bg-red-200 text-red-700 px-1.5 py-0.5 rounded transition-colors duration-200 tooltip-container text-xs"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span>{language === 'en' ? 'Decline' : 'প্রত্যাখ্যান'}</span>
                                                                        <span className="tooltip">{language === 'en' ? 'Decline this Report' : 'এই রিপোর্ট প্রত্যাখ্যান করুন'}</span>
                                                                    </button>
                                                                </>
                                                            )}
                                                            
                                                            {report.status === 'resolved' && (
                                                                <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                                                                    {language === 'en' ? 'Resolved' : 'সমাধান করা হয়েছে'}
                                                                </span>
                                                            )}
                                                        </div>
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
            
            {/* Custom CSS styles */}
            <style>{`
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
                        width: 14%;
                    }
                    .detail-column {
                        width: 7%;
                    }
                    .date-column {
                        width: 7%;
                    }
                }
                
                @media (max-width: 1023px) {
                    .action-column {
                        width: 14%;
                    }
                    .date-column {
                        width: 7%;
                    }
                    .detail-column {
                        width: 7%;
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
                
                /* Alternating row colors */
                .custom-scrollbar tbody tr:nth-child(odd) {
                    background-color: #f0f0f0;
                }
                
                .custom-scrollbar tbody tr:nth-child(even) {
                    background-color: #ffffff;
                }
                
                /* Dark mode alternating row colors */
                .dark .custom-scrollbar tbody tr:nth-child(odd) {
                    background-color: #1a2234;
                }
                
                .dark .custom-scrollbar tbody tr:nth-child(even) {
                    background-color: #111827;
                }
                
                /* Row hover effect */
                .custom-scrollbar tbody tr:hover {
                    background-color: #f1f5f9 !important;
                }
                
                .dark .custom-scrollbar tbody tr:hover {
                    background-color: #374151 !important;
                }
            `}</style>
        </FirefighterLayout>
    );
};

export default FirefighterReports; 