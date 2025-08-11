import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNGOAuth } from '../context/NGOAuthContext';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const NGOSignIn = () => {
  const [formData, setFormData] = useState({
    username: 'ngo',
    password: 'ngo'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [serverStatus, setServerStatus] = useState({ status: 'checking', message: 'Checking server connection...' });
  
  const { login, isAuthenticated } = useNGOAuth();
  const navigate = useNavigate();
  
  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/ngo/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Check server connection on component mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        await axios.get('http://localhost:5002/api/server-status');
        setServerStatus({ status: 'connected', message: 'Server is connected' });
      } catch (error) {
        console.error('Error checking server:', error);
        setServerStatus({ 
          status: 'error', 
          message: `Server connection error: ${error.message}` 
        });
      }
    };
    
    checkServer();
  }, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (serverStatus.status !== 'connected') {
      setErrorMessage('Cannot sign in while the server is disconnected');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const { username, password } = formData;
      const response = await login(username, password);
      
      if (response.success) {
        navigate('/ngo/dashboard');
      } else {
        setErrorMessage(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            NGO Portal Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome to the Durjog Prohori NGO Portal
          </p>
          
          {/* Server Status Indicator */}
          <div className={`mt-4 text-sm rounded-md p-2 ${
            serverStatus.status === 'connected' 
              ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' 
              : serverStatus.status === 'checking'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200'
                : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
          }`}>
            {serverStatus.message}
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-800 dark:border-red-700 dark:text-red-100" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Username"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Password"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting || serverStatus.status !== 'connected'}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting || serverStatus.status !== 'connected'
                  ? 'bg-primary-300 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              }`}
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
              ) : null}
              Sign in
            </button>
          </div>
          
          <div className="text-center text-sm">
            <Link to="/home" className="text-primary hover:text-primary-700 dark:text-primary-300">
              Return to homepage
            </Link>
          </div>
          
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            <p>Default credentials: username &quot;ngo&quot;, password &quot;ngo&quot;</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NGOSignIn; 