import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URLS } from '../config';

const FirefighterAuthContext = createContext();

export const useFirefighterAuth = () => useContext(FirefighterAuthContext);

export const FirefighterAuthProvider = ({ children }) => {
  const [firefighter, setFirefighter] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('firefighterToken');
    if (token) {
      loadFirefighter(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Load firefighter data using token
  const loadFirefighter = async (token) => {
    try {
      setLoading(true);
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get firefighter profile
      const res = await axios.get(`${API_BASE_URLS.FIREFIGHTER_API}/firefighter/profile`);
      
      if (res.data.success) {
        console.log("Firefighter profile data:", res.data.firefighter);
        setFirefighter(res.data.firefighter);
        setIsAuthenticated(true);
      } else {
        // If response is not successful, clear token
        localStorage.removeItem('firefighterToken');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setFirefighter(null);
      }
    } catch (err) {
      console.error('Error loading firefighter:', err);
      // Clear token on error
      localStorage.removeItem('firefighterToken');
      delete axios.defaults.headers.common['Authorization'];
      setError(err.response?.data?.message || 'Error loading firefighter profile');
      setIsAuthenticated(false);
      setFirefighter(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh profile data manually
  const refreshProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('firefighterToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get refreshed firefighter profile
      const res = await axios.get(`${API_BASE_URLS.FIREFIGHTER_API}/firefighter/profile`);
      
      if (res.data.success) {
        console.log("Refreshed firefighter profile data:", res.data.firefighter);
        setFirefighter(res.data.firefighter);
        return { success: true };
      } else {
        setError(res.data.message || 'Failed to refresh profile');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      console.error('Profile refresh error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to refresh profile';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login firefighter
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Connect to the firefighter signin endpoint
      const res = await axios.post(`${API_BASE_URLS.FIREFIGHTER_API}/firefighter/signin`, {
        username,
        password
      });
      
      if (res.data.success) {
        const { token } = res.data;
        
        // Save token to local storage
        localStorage.setItem('firefighterToken', token);
        
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Instead of using the partial firefighter data from login response,
        // fetch the complete profile data to ensure all fields are available
        try {
          const profileRes = await axios.get(`${API_BASE_URLS.FIREFIGHTER_API}/firefighter/profile`);
          if (profileRes.data.success) {
            setFirefighter(profileRes.data.firefighter);
          } else {
            // Fallback to login response data if profile fetch fails
            setFirefighter(res.data.firefighter);
          }
        } catch (profileErr) {
          console.error('Error fetching complete profile after login:', profileErr);
          // Fallback to login response data
          setFirefighter(res.data.firefighter);
        }
        
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

  // Logout firefighter
  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('firefighterToken');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setFirefighter(null);
    setIsAuthenticated(false);
  };

  // Update firefighter profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      
      console.log("Updating profile with data:", profileData);
      const res = await axios.put(`${API_BASE_URLS.FIREFIGHTER_API}/firefighter/profile`, profileData);
      
      if (res.data.success) {
        console.log("Profile update response:", res.data);
        
        // Create a merged object with all existing fields but update the ones from the response
        setFirefighter(prevState => ({
          ...prevState,
          ...res.data.firefighter
        }));
        
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
      
      const res = await axios.put(`${API_BASE_URLS.FIREFIGHTER_API}/firefighter/change-password`, {
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

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <FirefighterAuthContext.Provider
      value={{
        firefighter,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        updateProfile,
        refreshProfile,
        changePassword,
        clearError
      }}
    >
      {children}
    </FirefighterAuthContext.Provider>
  );
}; 