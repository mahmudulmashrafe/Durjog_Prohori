import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:5002';
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Checking auth with saved token');
          const response = await axios.get('/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('Auth check response:', response.data);
          
          if (response.data && response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            console.error('Invalid user data from auth check:', response.data);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration with:', { name, email });
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password
      });
      console.log('Registration response:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'An error occurred during registration'
      };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'An error occurred during login'
      };
    }
  };

  const loginWithPhone = async (phone_number) => {
    try {
      console.log('Sending OTP to:', phone_number);
      const response = await axios.post('/api/auth/send-otp', { phone_number });
      console.log('OTP send response:', response.data);
      return { success: true };
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send OTP'
      };
    }
  };

  const verifyOtp = async (phone_number, otp, userData = null) => {
    try {
      console.log('Verifying OTP for:', phone_number);
      
      // If userData is provided, it means we're completing registration
      if (userData && userData.username && userData.name) {
        console.log('Completing registration with:', userData);
        const response = await axios.post('/api/auth/complete-registration', { 
          phone_number, 
          username: userData.username, 
          name: userData.name 
        });
        
        console.log('Registration completion response:', response.data);
        
        if (response.data.token && response.data.user) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
          setIsAuthenticated(true);
          return { success: true };
        }
      } else {
        // Regular OTP verification
        const response = await axios.post('/api/auth/verify-otp', { phone_number, otp });
        console.log('OTP verification response:', response.data);
        
        // If user needs to complete registration
        if (response.data.needsRegistration) {
          return { 
            success: true, 
            needsRegistration: true,
            message: response.data.message
          };
        }
        
        if (response.data.token && response.data.user) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          console.error('Invalid response format:', response.data);
          return {
            success: false,
            error: 'Invalid server response'
          };
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid OTP'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    console.log('Updating user data in context:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        loginWithPhone,
        verifyOtp,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 