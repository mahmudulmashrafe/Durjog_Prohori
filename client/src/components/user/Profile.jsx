import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { FaUser, FaEnvelope, FaSignOutAlt, FaMapMarkerAlt, FaPhone, FaEdit, FaCheck, FaTimes, FaGlobe, FaMoon, FaSun, FaCamera, FaTint } from 'react-icons/fa';
import axios from 'axios';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    address: '',
    blood_type: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Email verification state
  const [emailVerification, setEmailVerification] = useState({
    isVerifying: false,
    emailOTP: '',
    verified: false,
    sentOTP: false
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
  }, []);

  // Set initial form data when user data changes
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        blood_type: user.blood_type || ''
      });
    }
  }, [user, isEditing]);

  const fetchUserData = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.user) {
        const userData = response.data.user;
        
        // Store the full user data in local storage and context
        updateUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setFormData({
          username: userData.username || '',
          name: userData.name || '',
          email: userData.email || '',
          address: userData.address || '',
          blood_type: userData.blood_type || ''
        });
      }
    } catch (error) {
      setError('Failed to load profile data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset email verification state when input changes
    if (name === 'email' && value !== user?.email) {
      setEmailVerification({
        isVerifying: false,
        emailOTP: '',
        verified: false,
        sentOTP: false
      });
    }
  };

  const sendEmailOTP = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/auth/send-email-otp',
        { newEmail: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setEmailVerification(prev => ({
          ...prev,
          isVerifying: true,
          sentOTP: true
        }));
        setSuccess('OTP sent to your email');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error sending OTP');
    }
  };

  const verifyEmailOTP = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/auth/verify-email-otp',
        {
          newEmail: formData.email,
          emailOTP: emailVerification.emailOTP
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setEmailVerification(prev => ({
          ...prev,
          verified: true,
          isVerifying: false
        }));
        
        // Update user's email and name in the database
        const updateResponse = await axios.put(
          '/api/auth/update-profile',
          { 
            email: formData.email.trim(),
            name: formData.name.trim() 
          },
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (updateResponse.data.success) {
          // Refresh user data
          const profileResponse = await axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (profileResponse.data && profileResponse.data.user) {
            const updatedUser = profileResponse.data.user;
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            updateUser(updatedUser);
            
            setFormData({
              name: updatedUser.name || '',
              email: updatedUser.email || '',
              username: updatedUser.username || '',
              address: updatedUser.address || '',
              blood_type: updatedUser.blood_type || ''
            });
          }
          
          setSuccess('Profile updated successfully');
        } else {
          setError('Email verification succeeded but update failed');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');

      // First, upload the profile image if there is one
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', profileImage);
        imageFormData.append('isEditing', 'true');

        try {
          const imageResponse = await axios.post(
            '/api/auth/upload-profile-image',
            imageFormData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          if (!imageResponse.data.success) {
            throw new Error('Failed to upload profile image');
          }
        } catch (imageError) {
          setError(imageError.response?.data?.message || 'Failed to upload profile image');
          return;
        }
      }

      // Then update other profile information
      const updateData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        blood_type: formData.blood_type
      };
      
      console.log('Submitting profile update with data:', updateData);
      
      // Only include email if it has changed
      if (formData.email !== user?.email) {
        updateData.email = formData.email.trim();
      }
      
      // Only include username if it has changed
      if (formData.username !== user?.username) {
        updateData.username = formData.username.trim();
      }
      
      // First, just try to update name and address
      if (!updateData.email) {
        const response = await axios.put(
          '/api/auth/update-profile',
          updateData,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Profile update response:', response.data);
        
        if (response.data.success) {
          // Refresh user data
          const profileResponse = await axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (profileResponse.data && profileResponse.data.user) {
            const updatedUser = profileResponse.data.user;
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            updateUser(updatedUser);
            
            setFormData({
              name: updatedUser.name || '',
              email: updatedUser.email || '',
              username: updatedUser.username || '',
              address: updatedUser.address || '',
              blood_type: updatedUser.blood_type || ''
            });
          }
          
          setSuccess('Profile updated successfully');
          setIsEditing(false);
          setProfileImage(null);
          setImagePreview(null);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      address: user?.address || '',
      blood_type: user?.blood_type || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
    setImagePreview(null);
    setProfileImage(null);
    
    setEmailVerification({
      isVerifying: false,
      emailOTP: '',
      verified: false,
      sentOTP: false
    });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    if (!isEditing) return;
    
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('hasVisitedProfile'); // Clear the visit flag
    logout();
  };

  return (
    <div className="p-1 space-y-2 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in overflow-auto max-h-[calc(100vh-20px)] pb-32 scrollbar-hide">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Profile Header - Updated to match the design in the image */}
      <div className="flex items-center justify-between mb-3 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            ) : user?.profileImage ? (
              <div className="w-full h-full">
                <img 
                  src={`http://localhost:5002/api/auth/profile-image/${user.profileImage}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon');
                    if (fallbackIcon) {
                      fallbackIcon.style.display = 'block';
                    }
                  }}
                />
                <FaUser className="text-2xl text-gray-600 dark:text-gray-400 fallback-icon" style={{display: 'none'}} />
              </div>
            ) : (
              <FaUser className="text-2xl text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
              {user?.name || user?.username || 'User'}
            </h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FaMapMarkerAlt className="mr-1 text-orange-500" />
              <span>{user?.address || 'Location not set'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: user?.name || '',
              email: user?.email || '',
              username: user?.username || '',
              address: user?.address || '',
              blood_type: user?.blood_type || ''
            });
            setIsEditing(true);
          }}
          className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <FaEdit className="mr-1" />
          Edit
        </button>
      </div>

      {/* User Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
          {/* Regular Information Fields - Always Visible */}
          {/* Username */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center w-full">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 mr-3">
                <FaUser className="text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-grow">
                <div className="text-xs text-gray-500 dark:text-gray-400">Username</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-gray-600 border dark:border-gray-500 rounded px-2 py-1 font-medium text-gray-800 dark:text-white text-sm"
                    placeholder="Enter username"
                    autoComplete="off"
                  />
                ) : (
                  <div className="font-medium text-gray-800 dark:text-white">{user?.username || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Email */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center w-full">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-2 mr-3">
                <FaEnvelope className="text-green-600 dark:text-green-300" />
              </div>
              <div className="flex-grow">
                <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-gray-600 border dark:border-gray-500 rounded px-2 py-1 font-medium text-gray-800 dark:text-white text-sm"
                      placeholder="Enter email address"
                      autoComplete="off"
                    />
                    {formData.email !== user?.email && !emailVerification.sentOTP && (
                      <button
                        onClick={sendEmailOTP}
                        className="text-primary text-xs hover:text-primary-dark"
                      >
                        Verify Email Change
                      </button>
                    )}
                    {emailVerification.isVerifying && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="Email OTP"
                          value={emailVerification.emailOTP}
                          onChange={(e) => setEmailVerification(prev => ({
                            ...prev,
                            emailOTP: e.target.value
                          }))}
                          className="w-full bg-white dark:bg-gray-600 border dark:border-gray-500 rounded px-2 py-1 text-xs"
                        />
                        <button
                          onClick={verifyEmailOTP}
                          className="text-primary text-xs hover:text-primary-dark"
                        >
                          Verify OTP
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="font-medium text-gray-800 dark:text-white flex items-center flex-wrap">
                    <span className="break-all mr-1">
                      {user?.email || `${user?.phone_number || 'user'}.durjogprohori@gmail.com`}
                    </span>
                    {user?.is_email_verified && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ✓
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Phone */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center w-full">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2 mr-3">
                <FaPhone className="text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex-grow">
                <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                <div className="font-medium text-gray-800 dark:text-white flex items-center">
                  <span>{user?.phone_number || 'Not set'}</span>
                  {user?.is_phone_verified && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Blood Type */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center w-full">
              <div className="rounded-full bg-red-100 dark:bg-red-900 p-2 mr-3">
                <FaTint className="text-red-600 dark:text-red-300" />
              </div>
              <div className="flex-grow">
                <div className="text-xs text-gray-500 dark:text-gray-400">Blood Type</div>
                {isEditing ? (
                  <select
                    name="blood_type"
                    value={formData.blood_type || ''}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-gray-600 border dark:border-gray-500 rounded px-2 py-1 font-medium text-gray-800 dark:text-white text-sm"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <div className="font-medium text-gray-800 dark:text-white">
                    {user?.blood_type || 'Not set'}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Additional Fields - Only Visible in Edit Mode */}
          {isEditing && (
            <>
              {/* Name */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between md:col-span-2">
                <div className="flex items-center w-full">
                  <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-2 mr-3">
                    <FaUser className="text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Full Name</div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-gray-600 border dark:border-gray-500 rounded px-2 py-1 font-medium text-gray-800 dark:text-white text-sm"
                      placeholder="Enter your full name"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between md:col-span-2">
                <div className="flex items-center w-full">
                  <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-2 mr-3">
                    <FaMapMarkerAlt className="text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-gray-600 border dark:border-gray-500 rounded px-2 py-1 font-medium text-gray-800 dark:text-white text-sm"
                      placeholder="Enter your address"
                      rows="2"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
              
              {/* Profile Image */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex flex-col items-center justify-center md:col-span-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Profile Image</div>
                <div 
                  className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2 relative cursor-pointer"
                  onClick={handleImageClick}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : user?.profileImage ? (
                    <div className="w-full h-full">
                      <img 
                        src={`http://localhost:5002/api/auth/profile-image/${user.profileImage}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon');
                          if (fallbackIcon) {
                            fallbackIcon.style.display = 'block';
                          }
                        }}
                      />
                      <FaUser className="text-3xl text-gray-600 dark:text-gray-400 fallback-icon" style={{display: 'none'}} />
                    </div>
                  ) : (
                    <FaUser className="text-3xl text-gray-600 dark:text-gray-400" />
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <FaCamera className="text-white text-xl" />
                  </div>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <span className="text-xs text-gray-500 dark:text-gray-400">Click to update profile image</span>
              </div>
            </>
          )}
        </div>
        
        {/* Edit Mode Buttons */}
        {isEditing && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors"
              disabled={formData.email !== user?.email && !emailVerification.verified}
            >
              <FaCheck className="mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded relative text-sm mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-2 py-1 rounded relative text-sm mb-3">
          {success}
        </div>
      )}
      
      {/* Settings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 mt-4">
        <h2 className="text-base font-semibold mb-1 text-gray-900 dark:text-white">{t('settings')}</h2>
        
        {/* Language Switch */}
        <div className="flex items-center justify-between p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <div className="flex items-center">
            <FaGlobe className="text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0 text-sm" />
            <span className="text-gray-700 dark:text-gray-300 text-sm">{t('language')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className={`px-2 py-1 text-xs rounded ${
                language === 'en' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              ENG
            </button>
            <button
              onClick={toggleLanguage}
              className={`px-2 py-1 text-xs rounded ${
                language === 'bn' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              বাং
            </button>
          </div>
        </div>

        {/* Theme Switch */}
        <div className="flex items-center justify-between p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <div className="flex items-center">
            {darkMode ? (
              <FaMoon className="text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0 text-sm" />
            ) : (
              <FaSun className="text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0 text-sm" />
            )}
            <span className="text-gray-700 dark:text-gray-300 text-sm">{t('theme')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`px-2 py-1 text-xs rounded ${
                !darkMode 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('light')}
            </button>
            <button
              onClick={toggleTheme}
              className={`px-2 py-1 text-xs rounded ${
                darkMode 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('dark')}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Us Section - More Compact */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 mt-3 mb-3">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-1 mb-1">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">{t('contactUs')}</h2>
        </div>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center p-1">
            <FaEnvelope className="flex-shrink-0 mr-1 h-3 w-3 text-blue-500" />
            <span>{t('emailContact')}</span>
          </div>
          <div className="flex items-center p-1">
            <FaMapMarkerAlt className="flex-shrink-0 mr-1 h-3 w-3 text-red-500" />
            <span>{t('addressContact')}</span>
          </div>
        </div>
      </div>
      
      {/* Logout Section - Gorgeous Design */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mt-6 mb-24">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg text-base font-medium"
        >
          <span className="mr-3">{t('logout')}</span>
          <FaSignOutAlt className="flex-shrink-0 text-lg animate-pulse" />
        </button>
      </div>
    </div>
  );
};

export default Profile; 