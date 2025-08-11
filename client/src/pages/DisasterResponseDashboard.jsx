import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDisasterResponseAuth } from '../context/DisasterResponseAuthContext';
import axios from 'axios';

const DisasterResponseDashboard = () => {
  const { user, logout } = useDisasterResponseAuth();
  const [activeDisasters, setActiveDisasters] = useState([]);
  const [activeSOS, setActiveSOS] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('disasterResponseToken');
        
        // Fetch active disasters
        const disasterResponse = await axios.get('/api/disasters/active', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch active SOS requests
        const sosResponse = await axios.get('/api/sos/active', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setActiveDisasters(disasterResponse.data);
        setActiveSOS(sosResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/disasterresponse/signin';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Disaster Response Dashboard</h1>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-white">{user.name}</span>
            )}
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Disasters Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Active Disasters</h2>
              {activeDisasters.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No active disasters at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {activeDisasters.map((disaster) => (
                    <div key={disaster._id} className="border-l-4 border-red-500 pl-4 py-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{disaster.type} - {disaster.location}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reported on: {new Date(disaster.createdAt).toLocaleString()}</p>
                      <div className="mt-2">
                        <Link 
                          to={`/disasterresponse/disaster/${disaster._id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active SOS Requests */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Active SOS Requests</h2>
              {activeSOS.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No active SOS requests at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {activeSOS.map((sos) => (
                    <div key={sos._id} className="border-l-4 border-yellow-500 pl-4 py-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {sos.user?.name || 'Anonymous'} - {sos.type}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Location: {sos.location?.address || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Requested on: {new Date(sos.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-2">
                        <Link
                          to={`/disasterresponse/sos/${sos._id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                        >
                          Respond to SOS
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Access Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/disasterresponse/map"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow text-center"
          >
            <div className="text-xl font-medium">Disaster Map</div>
            <div className="text-sm mt-2">View all disasters on an interactive map</div>
          </Link>
          
          <Link
            to="/disasterresponse/reports"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow text-center"
          >
            <div className="text-xl font-medium">Generate Reports</div>
            <div className="text-sm mt-2">Create summaries and analysis reports</div>
          </Link>
          
          <Link
            to="/disasterresponse/teams"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow text-center"
          >
            <div className="text-xl font-medium">Response Teams</div>
            <div className="text-sm mt-2">Manage and coordinate response teams</div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DisasterResponseDashboard; 