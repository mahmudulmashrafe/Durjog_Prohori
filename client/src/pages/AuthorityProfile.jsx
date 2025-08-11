import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import AuthorityLayout from '../components/authority/AuthorityLayout';

// Define the authority theme color
const AUTHORITY_COLOR = 'rgb(88, 10, 107)';
const AUTHORITY_GRADIENT_TO = 'rgb(110, 15, 135)';

const AuthorityProfile = () => {
  const { language } = useLanguage();
  // Not using darkMode but keeping the import for future use
  useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    department: '',
    phoneNumber: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/authority/profile');
        if (response.data.success) {
          const authorityData = response.data.authority;
          console.log('Fetched authority data:', authorityData); // For debugging
          setProfile(authorityData);
          setFormData({
            name: authorityData.name || '',
            email: authorityData.email || '',
            designation: authorityData.role || '',
            department: authorityData.department || '',
            phoneNumber: authorityData.phoneNumber || '',
          });
        } else {
          setError(language === 'en' ? 'Failed to load profile' : 'প্রোফাইল লোড করতে ব্যর্থ');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(language === 'en' ? 'Error loading profile data' : 'প্রোফাইল ডাটা লোড করতে সমস্যা');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create payload with fields that the API accepts
      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        // Note: designation is displayed from role but we don't send it back in updates
        // as it's restricted by the API
        department: formData.department,
      };
      
      console.log('Sending update payload:', payload); // For debugging
      
      const response = await axios.put('/api/authority/profile', payload);
      
      if (response.data.success) {
        // Update role display in local state for designation
        setProfile({
          ...profile, 
          ...payload,
          role: profile.role // Preserve the original role
        });
        setIsEditing(false);
      } else {
        setError(language === 'en' ? 'Failed to update profile' : 'প্রোফাইল আপডেট করতে ব্যর্থ');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(language === 'en' ? 'Error updating profile' : 'প্রোফাইল আপডেট করতে সমস্যা');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <AuthorityLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: AUTHORITY_COLOR }}></div>
        </div>
      </AuthorityLayout>
    );
  }

  return (
    <AuthorityLayout>
      <div className="w-full max-w-5xl mx-auto p-2">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header section */}
          <div style={{ background: `linear-gradient(to right, ${AUTHORITY_COLOR}, ${AUTHORITY_GRADIENT_TO})` }} className="px-4 py-3">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                {language === 'en' ? 'Authority Profile' : 'কর্তৃপক্ষ প্রোফাইল'}
              </h1>
              
              {/* Edit Button for viewing mode */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-3 py-1 bg-white rounded-lg transition-all duration-300 shadow-sm hover:bg-gray-100"
                  style={{ color: AUTHORITY_COLOR }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  {language === 'en' ? 'Edit Profile' : 'প্রোফাইল সম্পাদনা'}
                </button>
              )}
            </div>
          </div>

          {/* Content section */}
          <div className="p-4">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
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

            {!isEditing ? (
              // View Mode - Clean design
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: AUTHORITY_COLOR }}>
                        {language === 'en' ? 'Personal Information' : 'ব্যক্তিগত তথ্য'}
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500">{language === 'en' ? 'Name' : 'নাম'}</div>
                          <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"
                                 style={{ color: AUTHORITY_COLOR }}>
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {profile?.name || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-500">{language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}</div>
                          <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"
                                 style={{ color: AUTHORITY_COLOR }}>
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {profile?.email || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-500">{language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}</div>
                          <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"
                                 style={{ color: AUTHORITY_COLOR }}>
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {profile?.phoneNumber || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: AUTHORITY_COLOR }}>
                        {language === 'en' ? 'Professional Information' : 'পেশাগত তথ্য'}
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500">{language === 'en' ? 'Designation' : 'পদবি'}</div>
                          <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"
                                 style={{ color: AUTHORITY_COLOR }}>
                              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                            </svg>
                            {/* Display role value but show as designation to the user */}
                            {profile?.role ? (
                              language === 'en' ? 
                                profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 
                                profile.role === 'admin' ? 'অ্যাডমিন' : 
                                profile.role === 'manager' ? 'ম্যানেজার' : 
                                profile.role === 'officer' ? 'অফিসার' : 
                                profile.role === 'supervisor' ? 'সুপারভাইজার' : 'প্রদান করা হয়নি'
                            ) : (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-500">{language === 'en' ? 'Department' : 'বিভাগ'}</div>
                          <div className="text-lg font-medium mt-1 flex items-center text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"
                                 style={{ color: AUTHORITY_COLOR }}>
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                            {profile?.department || (language === 'en' ? 'Not provided' : 'প্রদান করা হয়নি')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode - Clean design
              <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en' ? 'Name' : 'নাম'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-transparent transition-all"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${AUTHORITY_COLOR}33`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder={language === 'en' ? 'Enter your name' : 'আপনার নাম লিখুন'}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-transparent transition-all"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${AUTHORITY_COLOR}33`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder={language === 'en' ? 'Enter your email' : 'আপনার ইমেইল লিখুন'}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-transparent transition-all"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${AUTHORITY_COLOR}33`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder={language === 'en' ? 'Enter your phone number' : 'আপনার ফোন নম্বর লিখুন'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en' ? 'Designation' : 'পদবি'}
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                      disabled
                      title={language === 'en' ? 'Designation cannot be changed directly' : 'পদবি সরাসরি পরিবর্তন করা যাবে না'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'en' ? 'This field is managed by system administrators' : 'এই ক্ষেত্রটি সিস্টেম প্রশাসকদের দ্বারা পরিচালিত হয়'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en' ? 'Department' : 'বিভাগ'}
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-transparent transition-all"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${AUTHORITY_COLOR}33`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder={language === 'en' ? 'Enter your department' : 'আপনার বিভাগ লিখুন'}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 mt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-300"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    style={{ background: `linear-gradient(to right, ${AUTHORITY_COLOR}, ${AUTHORITY_GRADIENT_TO})` }}
                    className="px-3 py-1.5 text-white rounded-md transition-all duration-300 shadow hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {language === 'en' ? 'Saving...' : 'সংরক্ষণ হচ্ছে...'}
                      </span>
                    ) : (
                      <span>{language === 'en' ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AuthorityLayout>
  );
};

export default AuthorityProfile; 