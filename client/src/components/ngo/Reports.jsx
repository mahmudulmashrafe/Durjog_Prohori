import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNGOAuth } from '../../context/NGOAuthContext';
import { toast } from 'react-toastify';
import { FaLocationArrow, FaCheck, FaTimes } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import api from '../../api/api';

const Reports = () => {
    const { language } = useLanguage();
    const { ngo } = useNGOAuth();
    const location = useLocation();
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedDisaster, setSelectedDisaster] = useState(null);
    
    const handleStatusUpdate = async (disaster, newStatus) => {
        try {
            setLoading(true);
            const response = await api.put(
                `/api/ngo/update-status/${disaster.disasterType}/${disaster._id}`,
                { status: newStatus }
            );

            if (response.data.success) {
                toast.success(language === 'en' 
                    ? `Status updated to ${newStatus}` 
                    : `স্ট্যাটাস ${newStatus === 'resolved' ? 'সমাধান' : 'প্রত্যাখ্যান'} করা হয়েছে`);
                fetchDisasters();
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error(language === 'en' 
                ? 'Failed to update status' 
                : 'স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const fetchDisasters = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const ngoId = ngo?._id || ngo?.id;
            
            if (!ngo || !ngoId) {
                console.error('NGO ID not available', ngo);
                setError('Authentication error: NGO ID not available');
                setLoading(false);
                return;
            }
            
            const response = await api.get('/api/ngo/assigned-disasters');
            
            console.log('Disasters API response:', response.data);
            
            if (response.data.success) {
                if (!response.data.data || response.data.data.length === 0) {
                    console.log('No disasters found assigned to this NGO');
                } else {
                    console.log(`Found ${response.data.data.length} disasters assigned to this NGO`);
                }
                setDisasters(response.data.data || []);
                setError(null);
            } else {
                throw new Error(response.data.message || 'Failed to fetch disasters');
            }
        } catch (err) {
            console.error('Error fetching disasters:', err);
            let errorMsg = err.message;
            
            if (err.response) {
                console.error('Error response data:', err.response.data);
                errorMsg = err.response.data?.message || errorMsg;
            }
            
            setError(errorMsg || 'Failed to fetch disasters');
            toast.error(language === 'en' 
                ? `Failed to fetch disasters: ${errorMsg}`
                : `দুর্যোগ আনতে ব্যর্থ হয়েছে: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    }, [ngo, language]);
    
    useEffect(() => {
        if (ngo) {
            console.log('NGO object:', ngo);
            console.log('NGO ID:', ngo._id || ngo.id);
            fetchDisasters();
        }
    }, [ngo, location.pathname, location.search, fetchDisasters]);

    const handleShowMap = (disaster) => {
        setSelectedDisaster(disaster);
        setShowMapModal(true);
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
            <div className="text-center">
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {dateFormatter.format(date)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {timeFormatter.format(date)}
                </div>
            </div>
        );
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'resolved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'declined':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusText = (status) => {
        if (language === 'en') {
            switch (status) {
                case 'pending': return 'Pending';
                case 'processing': return 'Processing';
                case 'resolved': return 'Resolved';
                case 'declined': return 'Declined';
                default: return status;
            }
        } else {
            switch (status) {
                case 'pending': return 'অপেক্ষমান';
                case 'processing': return 'প্রক্রিয়াকরণ';
                case 'resolved': return 'সমাধান';
                case 'declined': return 'প্রত্যাখ্যান';
                default: return status;
            }
        }
    };

    // Map Modal Component
    const MapModal = () => (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex">
            <div className="relative p-4 w-full max-w-xl m-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {language === 'en' ? 'Disaster Location' : 'দুর্যোগের অবস্থান'}
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
                        <div className="mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                {language === 'en' ? 'Disaster Details' : 'দুর্যোগের বিবরণ'}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">
                                {language === 'en' ? selectedDisaster?.title : selectedDisaster?.titleBn}
                            </p>
                        </div>
                        
                        {selectedDisaster?.latitude && selectedDisaster?.longitude && (
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {language === 'en' ? 'Coordinates' : 'স্থানাঙ্ক'}
                                </h4>
                                <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                                    {selectedDisaster.latitude.toFixed(6)}, {selectedDisaster.longitude.toFixed(6)}
                                </span>
                            </div>
                        )}
                        
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => window.open(`https://www.google.com/maps?q=${selectedDisaster?.latitude},${selectedDisaster?.longitude}`, '_blank')}
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
        <div className="py-4 max-w-full mx-0 px-0 sm:px-1">
            {/* Fixed Header with Title and Refresh Button */}
            <div className="fixed top-14 left-0 right-0 bg-white dark:bg-gray-800 z-30 border-b border-gray-200 dark:border-gray-700 px-2 py-3">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            {language === 'en' ? 'Disaster Reports' : 'দুর্যোগ প্রতিবেদন'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {language === 'en' 
                                ? 'Manage disaster reports and responses.' 
                                : 'দুর্যোগ প্রতিবেদন এবং প্রতিক্রিয়া পরিচালনা করুন।'}
                        </p>
                    </div>
                    
                    <button
                        onClick={fetchDisasters}
                        disabled={loading}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {language === 'en' ? 'Refresh' : 'রিফ্রেশ'}
                    </button>
                </div>
            </div>

            {/* Error Alert */}
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : (
                <>
                    {/* Debug Section - Only visible to admin */}
                    {ngo && ngo.role === 'admin' && ngo._id && (
                        <div className="mb-4 mx-2 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <details>
                                <summary className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                    {language === 'en' ? 'Debug Information (Admin only)' : 'ডিবাগ তথ্য (শুধুমাত্র প্রশাসক)'}
                                </summary>
                                <div className="mt-3 text-sm">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {language === 'en' ? 'Current NGO ID:' : 'বর্তমান এনজিও আইডি:'} <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{ngo._id.toString()}</code>
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                                        {language === 'en' ? 'Organization:' : 'সংগঠন:'} <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{ngo.organization || 'Not set'}</code>
                                    </p>
                                </div>
                            </details>
                        </div>
                    )}

                    {/* Assigned Disasters Table Container */}
                    <div className="fixed top-32 bottom-4 left-0 right-0 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden z-20">
                        <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
                            <table className="min-w-full w-full table-fixed border-collapse">
                                <colgroup>
                                    <col style={{width: "20%"}} /> {/* Title */}
                                    <col style={{width: "15%"}} /> {/* Type */}
                                    <col style={{width: "20%"}} /> {/* Location */}
                                    <col style={{width: "15%"}} /> {/* Date */}
                                    <col style={{width: "10%"}} /> {/* Detail */}
                                    <col style={{width: "10%"}} /> {/* Status */}
                                    <col style={{width: "10%"}} /> {/* Actions */}
                                </colgroup>
                                <thead className="bg-[rgb(6,143,125)] dark:bg-[rgb(6,143,125)] sticky top-0 z-10 shadow-md">
                                    <tr>
                                        <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                            {language === 'en' ? 'Title' : 'শিরোনাম'}
                                        </th>
                                        <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                            {language === 'en' ? 'Type' : 'ধরন'}
                                        </th>
                                        <th className="px-3 py-5 text-center text-sm font-bold text-white dark:text-white uppercase tracking-wider">
                                            {language === 'en' ? 'Location' : 'অবস্থান'}
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
                                            {language === 'en' ? 'Actions' : 'কার্যক্রম'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {disasters.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-1 py-4 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <div className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                                                        {language === 'en' ? 'No disasters found' : 'কোনও দুর্যোগ পাওয়া যায়নি'}
                                                    </div>
                                                    <div className="max-w-md text-center text-gray-500 dark:text-gray-400">
                                                        {language === 'en' 
                                                            ? 'There are currently no disasters assigned to you.' 
                                                            : 'আপনার নিয়োগকৃত কোন দুর্যোগ বর্তমানে নেই।'}
                                                    </div>
                                                    <button
                                                        onClick={fetchDisasters}
                                                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                    >
                                                        {language === 'en' ? 'Refresh Disasters' : 'দুর্যোগ রিফ্রেশ করুন'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        disasters.map((disaster, index) => (
                                            <tr 
                                                key={`${disaster.disasterType}-${disaster._id}`} 
                                                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                    index % 2 === 0 
                                                    ? 'bg-white dark:bg-gray-800' 
                                                    : 'bg-gray-100 dark:bg-gray-900'
                                                }`}
                                            >
                                                <td className="px-1 py-3 whitespace-normal text-center">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {language === 'en' ? disaster.name || disaster.title : disaster.nameBn || disaster.titleBn}
                                                    </div>
                                                </td>
                                                <td className="px-1 py-3 whitespace-nowrap text-center">
                                                    <div className="text-sm text-gray-900 dark:text-white capitalize">
                                                        {disaster.disasterType}
                                                    </div>
                                                </td>
                                                <td className="px-1 py-3 whitespace-normal text-center">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {language === 'en' ? disaster.location : disaster.locationBn}
                                                    </div>
                                                </td>
                                                <td className="px-1 py-2 whitespace-nowrap date-column text-center">
                                                    <div className="text-xs">
                                                        {formatDate(disaster.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-1 py-2 whitespace-nowrap text-center detail-column">
                                                    <div className="flex justify-center space-x-1">
                                                        <button
                                                            onClick={() => handleShowMap(disaster)}
                                                            className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded transition-colors duration-200 tooltip-container text-xs"
                                                        >
                                                            <FaLocationArrow className="mr-0.5" size="12" /> 
                                                            <span>{language === 'en' ? 'Map' : 'মানচিত্র'}</span>
                                                            <span className="tooltip">{language === 'en' ? 'View on Map' : 'মানচিত্রে দেখুন'}</span>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-1 py-2 whitespace-nowrap text-center">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(disaster.status)}`}>
                                                        {getStatusText(disaster.status)}
                                                    </span>
                                                </td>
                                                <td className="px-1 py-2 whitespace-nowrap text-center">
                                                    {disaster.status === 'pending' && (
                                                        <div className="flex justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleStatusUpdate(disaster, 'resolved')}
                                                                className="bg-green-100 hover:bg-green-200 text-green-700 p-1.5 rounded-full transition-colors"
                                                                title={language === 'en' ? 'Accept' : 'গ্রহণ করুন'}
                                                            >
                                                                <FaCheck size="14" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(disaster, 'declined')}
                                                                className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded-full transition-colors"
                                                                title={language === 'en' ? 'Decline' : 'প্রত্যাখ্যান করুন'}
                                                            >
                                                                <FaTimes size="14" />
                                                            </button>
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
                    height: 0px;
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

                .custom-scrollbar thead {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                }

                .custom-scrollbar tbody {
                    position: relative;
                }

                table.table-fixed {
                    table-layout: fixed;
                    width: 100%;
                    border-spacing: 0;
                    border-collapse: collapse;
                }
                
                .custom-scrollbar tbody tr:nth-child(odd) {
                    background-color: #f0f0f0;
                }
                
                .custom-scrollbar tbody tr:nth-child(even) {
                    background-color: #ffffff;
                }
                
                .dark .custom-scrollbar tbody tr:nth-child(odd) {
                    background-color: #1a2234;
                }
                
                .dark .custom-scrollbar tbody tr:nth-child(even) {
                    background-color: #111827;
                }
                
                .custom-scrollbar tbody tr:hover {
                    background-color: #f1f5f9 !important;
                }
                
                .dark .custom-scrollbar tbody tr:hover {
                    background-color: #374151 !important;
                }
            `}</style>
        </div>
    );
};

export default Reports; 