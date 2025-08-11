import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState('');
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  // Check database connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setDebug('');
        await axios.get('http://localhost:5002/api/admin/setup-default-admin');
        setDebug(prev => prev + '\nServer connection successful.');
      } catch (err) {
        setDebug(prev => prev + '\nServer connection error: ' + err.message);
      }
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebug('');
    
    if (!username || !password) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    setDebug(`Attempting to login with username: ${username}`);
    
    try {
      // Send a direct request to check if the server is responding
      try {
        const directResponse = await axios.post('http://localhost:5002/api/admin/signin', 
          { username, password },
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: true 
          }
        );
        setDebug(prev => prev + `\nDirect API response: ${JSON.stringify(directResponse.data)}`);

        // If the direct request succeeds, use the token and admin data
        if (directResponse.data && directResponse.data.token) {
          localStorage.setItem('adminToken', directResponse.data.token);
          localStorage.setItem('admin', JSON.stringify(directResponse.data.admin));
          navigate('/admin/home');
          return;
        }
      } catch (directErr) {
        setDebug(prev => prev + `\nDirect API error: ${directErr.message}`);
        if (directErr.response) {
          setDebug(prev => prev + `\nError response: ${JSON.stringify(directErr.response.data)}`);
        }
      }
      
      // Try the login through the context
      const result = await adminLogin(username, password);
      
      setDebug(prev => prev + `\nLogin result: ${JSON.stringify(result)}`);
      
      if (result.success) {
        navigate('/admin/home');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setDebug(prev => prev + `\nError: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-white">Admin Login</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your credentials to access admin dashboard</p>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaUser />
              </span>
              <input
                type="text"
                id="username"
                className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary dark:focus:border-primary dark:text-white"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaLock />
              </span>
              <input
                type="password"
                id="password"
                className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary dark:focus:border-primary dark:text-white"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg bg-primary text-white font-medium transition duration-200 ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {debug && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono overflow-auto max-h-40">
            <pre className="whitespace-pre-wrap dark:text-gray-300">
              {debug}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin; 