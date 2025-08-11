import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthorityAuthContext = createContext();

export const useAuthorityAuth = () => useContext(AuthorityAuthContext);

export const AuthorityAuthProvider = ({ children }) => {
  const [authority, setAuthority] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authorityToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Set the auth token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch authority user data
          const res = await axios.get('/api/authority/profile');
          
          if (res.data.success) {
            setAuthority(res.data.authority);
            setIsAuthenticated(true);
          } else {
            // Token invalid, remove it
            localStorage.removeItem('authorityToken');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error initializing authority auth:', error);
          localStorage.removeItem('authorityToken');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Register authority - normally would not be exposed in UI
  const register = async (formData) => {
    try {
      setError(null);
      const res = await axios.post('/api/authority/register', formData);
      
      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem('authorityToken', res.data.token);
        setAuthority(res.data.authority);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        return { success: true };
      }
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Registration failed. Please try again.'
      );
      return { success: false, error };
    }
  };

  // Login authority
  const login = async (username, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/authority/signin', { username, password });
      
      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem('authorityToken', res.data.token);
        setAuthority(res.data.authority);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        return { success: true };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Logout authority
  const logout = () => {
    localStorage.removeItem('authorityToken');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setAuthority(null);
    setIsAuthenticated(false);
  };

  // Update authority profile
  const updateProfile = async (formData) => {
    try {
      setError(null);
      const res = await axios.put('/api/authority/profile', formData);
      
      if (res.data.success) {
        setAuthority(res.data.authority);
        return { success: true };
      }
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Profile update failed. Please try again.'
      );
      return { success: false, error };
    }
  };

  // Change password
  const changePassword = async (formData) => {
    try {
      setError(null);
      const res = await axios.put('/api/authority/change-password', formData);
      
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Password change failed. Please try again.'
      );
      return { success: false, error };
    }
  };

  return (
    <AuthorityAuthContext.Provider
      value={{
        authority,
        token,
        isAuthenticated,
        isLoading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthorityAuthContext.Provider>
  );
};

export default AuthorityAuthContext; 