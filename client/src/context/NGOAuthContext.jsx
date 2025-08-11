import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const NGOAuthContext = createContext();

export const useNGOAuth = () => useContext(NGOAuthContext);

export const NGOAuthProvider = ({ children }) => {
  const [ngo, setNGO] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('ngoToken');
    if (token) {
      loadNGO(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Load NGO data using token
  const loadNGO = async (token) => {
    try {
      setLoading(true);
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Loading NGO profile...');
      // Get NGO profile
      const res = await axios.get('/api/ngo/profile');
      console.log('Initial profile data response:', res.data);
      
      if (res.data.success) {
        // Ensure location data is properly mapped
        const ngoData = {
          ...res.data.ngo,
          location: res.data.ngo.location || '',
          latitude: res.data.ngo.latitude || '',
          longitude: res.data.ngo.longitude || '',
          donationreceived: res.data.ngo.donationreceived || []
        };
        console.log('Updated initial NGO data with location and donations:', ngoData);
        setNGO(ngoData);
        setIsAuthenticated(true);
      } else {
        // If response is not successful, clear token
        localStorage.removeItem('ngoToken');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setNGO(null);
      }
    } catch (err) {
      console.error('Error loading NGO:', err);
      // Clear token on error
      localStorage.removeItem('ngoToken');
      delete axios.defaults.headers.common['Authorization'];
      setError(err.response?.data?.message || 'Error loading NGO profile');
      setIsAuthenticated(false);
      setNGO(null);
    } finally {
      setLoading(false);
    }
  };

  // Login NGO
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Connect to the NGO signin endpoint
      const res = await axios.post('/api/ngo/signin', {
        username,
        password
      });
      
      if (res.data.success) {
        const { token, ngo } = res.data;
        
        // Save token to local storage
        localStorage.setItem('ngoToken', token);
        
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setNGO(ngo);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        setError(res.data.message || 'Login failed');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout NGO
  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('ngoToken');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setNGO(null);
    setIsAuthenticated(false);
  };

  // Update NGO profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      
      const res = await axios.put('http://localhost:5002/api/ngo/profile', profileData);
      
      if (res.data.success) {
        setNGO({
          ...ngo,
          ...res.data.ngo
        });
        return { success: true };
      } else {
        setError(res.data.message || 'Update failed');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      console.error('Update profile error:', err);
      const errorMessage = err.response?.data?.message || 'Update failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      
      const res = await axios.put('http://localhost:5002/api/ngo/change-password', {
        currentPassword,
        newPassword
      });
      
      if (res.data.success) {
        return { success: true };
      } else {
        setError(res.data.message || 'Password change failed');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      console.error('Change password error:', err);
      const errorMessage = err.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Refresh NGO profile data
  const refreshProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ngoToken');
      
      if (!token) {
        throw new Error('No token available');
      }
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Refreshing NGO profile data...');
      // Get full NGO profile
      const res = await axios.get('http://localhost:5002/api/ngo/profile');
      console.log('Profile API response:', res.data);
      
      if (res.data.success) {
        // Ensure location data is properly mapped
        const ngoData = {
          ...res.data.ngo,
          location: res.data.ngo.location || '',
          latitude: res.data.ngo.latitude || '',
          longitude: res.data.ngo.longitude || '',
          donationreceived: res.data.ngo.donationreceived || []
        };
        console.log('Updated NGO data with location and donations:', ngoData);
        setNGO(ngoData);
        return { success: true, ngo: ngoData };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      console.error('Error refreshing NGO profile:', err);
      const errorMessage = err.response?.data?.message || 'Failed to refresh profile';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <NGOAuthContext.Provider
      value={{
        ngo,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        updateProfile,
        changePassword,
        refreshProfile,
        clearError
      }}
    >
      {children}
    </NGOAuthContext.Provider>
  );
}; 