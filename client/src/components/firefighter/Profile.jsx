import React, { useState, useEffect } from 'react';
import { useFirefighterAuth } from '../../context/FirefighterAuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaMapMarkedAlt, FaTimes } from 'react-icons/fa';
import MapSelector from '../common/MapSelector';

// Mock data in case the backend API is not accessible
const mockFirefighterData = {
  id: 'mock-id',
  username: 'fire',
  name: 'Default Firefighter',
  email: 'firefighter@durjogprohori.com',
  phoneNumber: '+8801700000001',
  role: 'chief',
  station: 'Central Fire Station',
  location: 'Dhaka Fire Station',
  latitude: 23.810331,
  longitude: 90.412521,
  badgeNumber: 'FD-001',
  status: 'active'
};

const FirefighterProfile = () => {
  const { language } = useLanguage();
  const { 
    firefighter: firefighterFromContext, 
    loading: authLoading, 
    updateProfile,
    refreshProfile 
  } = useFirefighterAuth();
  
  // Use mock data as fallback if firefighter data from context is not available
  const firefighter = firefighterFromContext || mockFirefighterData;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMapPopup, setShowMapPopup] = useState(false);

  // Refresh profile data when component mounts
  useEffect(() => {
    const loadFullProfile = async () => {
      // Check if we're missing any essential fields
      if (firefighterFromContext && 
          (!firefighterFromContext.location || 
          firefighterFromContext.latitude === undefined || 
          firefighterFromContext.longitude === undefined || 
          !firefighterFromContext.phoneNumber ||
          (!firefighterFromContext._id && !firefighterFromContext.id))) {
        console.log("Profile component detected missing fields, refreshing profile data...");
        try {
          await refreshProfile();
        } catch (error) {
          console.error("Error refreshing profile data:", error);
        }
      }
    };

    loadFullProfile();
  }, [firefighterFromContext, refreshProfile]);

  useEffect(() => {
    // Initialize form data when editing is enabled
    if (isEditing && firefighter) {
      setFormData({
        name: firefighter.name || '',
        email: firefighter.email || '',
        phoneNumber: firefighter.phoneNumber || '',
        location: firefighter.location || '',
        latitude: firefighter.latitude !== undefined ? firefighter.latitude : '',
        longitude: firefighter.longitude !== undefined ? firefighter.longitude : ''
      });
    }
  }, [isEditing, firefighter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationSelect = (locationData) => {
    setFormData({
      ...formData,
      location: locationData.location || '',
      latitude: locationData.latitude || '',
      longitude: locationData.longitude || ''
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }

      // Process location data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      };

      // Call the updateProfile function from context
      const result = await updateProfile(updateData);
      
      if (result.success) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  // Add a function to open the map popup
  const openMapPopup = () => {
    setShowMapPopup(true);
  };

  // Add a function to close the map popup
  const closeMapPopup = () => {
    setShowMapPopup(false);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header section */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-2">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">
              {language === 'en' ? 'Firefighter Profile' : 'অগ্নিনির্বাপক প্রোফাইল'}
            </h1>
            
            {/* Edit/Save Buttons */}
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center px-3 py-1 bg-white text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center px-3 py-1 bg-white text-green-600 hover:bg-gray-100 rounded-lg transition-all duration-300 shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {loading ? (language === 'en' ? 'Saving...' : 'সংরক্ষণ হচ্ছে...') : (language === 'en' ? 'Save' : 'সংরক্ষণ')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-3 py-1 bg-white text-red-600 hover:bg-gray-100 rounded-lg transition-all duration-300 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  {language === 'en' ? 'Edit Profile' : 'প্রোফাইল সম্পাদনা'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="px-2 pt-1 pb-2">
          {/* Error Message */}
          {error && (
            <div className="mb-0 bg-red-50 border-l-4 border-red-500 p-2 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-0 bg-green-50 border-l-4 border-green-500 p-2 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Profile Information - Now positioned at the top of the content section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full">
              <h3 className="text-xs uppercase tracking-wider text-red-600 mb-2 font-semibold">
                {language === 'en' ? 'Professional Information' : 'পেশাগত তথ্য'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Name' : 'নাম'}</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder={language === 'en' ? 'Enter your name' : 'আপনার নাম লিখুন'}
                      required
                    />
                  ) : (
                    <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {firefighter?.name || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}</div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder={language === 'en' ? 'Enter your email' : 'আপনার ইমেইল লিখুন'}
                      required
                    />
                  ) : (
                    <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {firefighter?.email || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder={language === 'en' ? 'Enter your phone number' : 'আপনার ফোন নম্বর লিখুন'}
                    />
                  ) : (
                    <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {firefighter?.phoneNumber || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Username' : 'ইউজারনেম'}</div>
                  <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {firefighter?.username || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Role' : 'ভূমিকা'}</div>
                  <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    {firefighter?.role ? (
                      language === 'en' ? 
                        firefighter.role.charAt(0).toUpperCase() + firefighter.role.slice(1) : 
                        firefighter.role === 'chief' ? 'প্রধান' : 
                        firefighter.role === 'captain' ? 'ক্যাপ্টেন' : 
                        firefighter.role === 'firefighter' ? 'অগ্নিনির্বাপক' : 'প্রদান করা হয়নি'
                    ) : (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full">
              <h3 className="text-xs uppercase tracking-wider text-red-600 mb-2 font-semibold">
                {language === 'en' ? 'Station Information' : 'স্টেশন তথ্য'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Station Name' : 'স্টেশনের নাম'}</div>
                  <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-1a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    {firefighter?.station || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                  </div>
                </div>
                
                {/* Firefighter ID (MongoDB Object ID) */}
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Station ID' : 'স্টেশন আইডি'}</div>
                  <div className="text-sm font-mono mt-1 flex items-center text-gray-800 bg-gray-100 p-2 rounded-md overflow-x-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="break-all">{firefighter?._id || firefighter?.id || (language === 'en' ? 'Not available' : 'উপলব্ধ নয়')}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Location' : 'অবস্থান'}</div>
                  {isEditing ? (
                    <div className="flex items-center mt-1">
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder={language === 'en' ? 'Enter your location' : 'আপনার অবস্থান লিখুন'}
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={openMapPopup}
                        className="ml-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
                        title={language === 'en' ? 'Select on Map' : 'মানচিত্রে নির্বাচন করুন'}
                      >
                        <FaMapMarkedAlt className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {firefighter?.location || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Latitude' : 'অক্ষাংশ'}</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder={language === 'en' ? 'Enter latitude' : 'অক্ষাংশ লিখুন'}
                      readOnly
                    />
                  ) : (
                    <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {firefighter?.latitude !== undefined ? firefighter.latitude : (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Longitude' : 'দ্রাঘিমাংশ'}</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder={language === 'en' ? 'Enter longitude' : 'দ্রাঘিমাংশ লিখুন'}
                      readOnly
                    />
                  ) : (
                    <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {firefighter?.longitude !== undefined ? firefighter.longitude : (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-row justify-between space-x-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">{language === 'en' ? 'Badge Number' : 'ব্যাজ নম্বর'}</div>
                    <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                      </svg>
                      {firefighter?.badgeNumber || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">{language === 'en' ? 'Status' : 'অবস্থা'}</div>
                    <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        firefighter.status === 'active' ? 'bg-green-100 text-green-800' :
                        firefighter.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {firefighter?.status ? (
                          language === 'en' ? 
                            firefighter.status.charAt(0).toUpperCase() + firefighter.status.slice(1) : 
                            firefighter.status === 'active' ? 'সক্রিয়' : 
                            firefighter.status === 'on-leave' ? 'ছুটিতে' : 
                            firefighter.status === 'inactive' ? 'নিষ্ক্রিয়' : 'অজানা'
                        ) : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Any other content would go here */}
        </div>
      </div>

      {/* Map popup */}
      {showMapPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {language === 'en' ? 'Select Location on Map' : 'মানচিত্রে অবস্থান নির্বাচন করুন'}
              </h3>
              <button 
                onClick={closeMapPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                {language === 'en' 
                  ? 'Click on the map to set your location, latitude, and longitude.' 
                  : 'আপনার অবস্থান, অক্ষাংশ এবং দ্রাঘিমাংশ সেট করতে মানচিত্রে ক্লিক করুন।'}
              </p>
              <div className="h-[500px]">
                <MapSelector
                  onLocationSelect={(data) => {
                    handleLocationSelect(data);
                    closeMapPopup();
                  }}
                  initialLocation={{
                    latitude: parseFloat(formData.latitude) || undefined,
                    longitude: parseFloat(formData.longitude) || undefined,
                    location: formData.location
                  }}
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeMapPopup}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all mr-2"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                onClick={closeMapPopup}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
              >
                {language === 'en' ? 'Done' : 'সম্পন্ন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirefighterProfile; 