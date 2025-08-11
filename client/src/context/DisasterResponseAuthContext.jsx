import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const DisasterResponseAuthContext = createContext();

export const useDisasterResponseAuth = () => {
  return useContext(DisasterResponseAuthContext);
};

export const DisasterResponseAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('disasterResponseToken');
    
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/disasterresponse/verify', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.valid) {
            setIsAuthenticated(true);
            setUser(response.data.user);
          } else {
            localStorage.removeItem('disasterResponseToken');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (err) {
          console.error('Error verifying token:', err);
          localStorage.removeItem('disasterResponseToken');
          setIsAuthenticated(false);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/api/disasterresponse/login', { email, password });
      const token = response.data.token;
      
      localStorage.setItem('disasterResponseToken', token);
      setIsAuthenticated(true);
      setUser(response.data.user);
      
      return {
        success: true,
        message: 'Login successful',
        user: response.data.user
      };
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
      return {
        success: false,
        message: err.response?.data?.message || 'An error occurred during login'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('disasterResponseToken');
    setIsAuthenticated(false);
    setUser(null);
    return {
      success: true,
      message: 'Logout successful'
    };
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout
  };

  return (
    <DisasterResponseAuthContext.Provider value={value}>
      {children}
    </DisasterResponseAuthContext.Provider>
  );
}; 