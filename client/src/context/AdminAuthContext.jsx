import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults if not already done
  useEffect(() => {
    if (!axios.defaults.baseURL) {
      axios.defaults.baseURL = 'http://localhost:5002';
    }
    
    // Set default headers
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    
    // Enable credentials by default
    axios.defaults.withCredentials = true;
    
    console.log('Axios defaults configured for admin authentication');
  }, []);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        try {
          console.log('Checking admin auth with saved token');
          const response = await axios.get('/api/admin/profile', {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: true
          });
          
          console.log('Admin auth check response:', response.data);
          
          if (response.data && response.data.admin) {
            setAdmin(response.data.admin);
            setIsAdminAuthenticated(true);
          } else {
            console.error('Invalid admin data from auth check:', response.data);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('admin');
          }
        } catch (error) {
          console.error('Admin auth check error:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin');
        }
      }
      setLoading(false);
    };

    checkAdminAuth();
  }, []);

  const adminLogin = async (username, password) => {
    try {
      console.log('Attempting admin login with username:', username);
      
      // Use proper headers and configuration
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      };
      
      const response = await axios.post('/api/admin/signin', { username, password }, config);
      console.log('Admin login response:', response.data);
      
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
      setAdmin(response.data.admin);
      setIsAdminAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid credentials'
      };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
    setIsAdminAuthenticated(false);
  };

  const updateAdmin = (adminData) => {
    console.log('Updating admin data in context:', adminData);
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        admin,
        loading,
        adminLogin,
        adminLogout,
        updateAdmin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext; 