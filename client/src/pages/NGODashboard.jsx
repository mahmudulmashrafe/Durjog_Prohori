import React from 'react';
import { useNGOAuth } from '../context/NGOAuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaExclamationTriangle, 
  FaMapMarkedAlt, 
  FaUsers, 
  FaBell, 
  FaDonate,
  FaSignOutAlt,
  FaBoxOpen,
  FaHandHoldingHeart
} from 'react-icons/fa';

const NGODashboard = () => {
  const { ngo, logout } = useNGOAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const menuItems = [
    { icon: <FaHome className="w-6 h-6" />, title: 'Home', route: '/ngo/dashboard' },
    { icon: <FaExclamationTriangle className="w-6 h-6" />, title: 'Disaster Alerts', route: '/ngo/disasters' },
    { icon: <FaMapMarkedAlt className="w-6 h-6" />, title: 'Relief Map', route: '/ngo/map' },
    { icon: <FaBoxOpen className="w-6 h-6" />, title: 'Resource Management', route: '/ngo/resources' },
    { icon: <FaHandHoldingHeart className="w-6 h-6" />, title: 'Relief Operations', route: '/ngo/operations' },
    { icon: <FaBell className="w-6 h-6" />, title: 'Notifications', route: '/ngo/notifications' },
  ];

  const stats = [
    { title: 'Active Disasters', value: '3', color: 'bg-red-500' },
    { title: 'Resources Available', value: '24', color: 'bg-blue-500' },
    { title: 'Active Operations', value: '6', color: 'bg-green-500' },
    { title: 'Team Members', value: '12', color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* NGO Dashboard Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary dark:text-white">NGO Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-gray-700 dark:text-gray-300">
              Welcome, {ngo?.name || 'NGO User'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0 mb-6 md:mb-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 bg-primary text-white p-3 rounded-full">
                  <FaUsers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-white">{ngo?.username || 'ngo'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ngo?.organization || 'Relief Organization'}</p>
                </div>
              </div>
            </div>
            
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => navigate(item.route)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        window.location.pathname === item.route 
                          ? 'bg-primary bg-opacity-10 text-primary dark:text-primary' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span>{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Dashboard Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                  <div className={`${stat.color} h-2`}></div>
                  <div className="p-4">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</h3>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Available Resources</h2>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Food Packages</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">250</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Available
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Medical Kits</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">75</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Available
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Emergency Tents</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">30</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Activity</h2>
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                      <FaExclamationTriangle />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Flood Alert</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">New flood alert issued for Dhaka Division. Prepare for emergency response.</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <FaBoxOpen />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Resource Update</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">5 hours ago</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">50 new emergency food packages added to inventory.</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <FaHandHoldingHeart />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Operation Completed</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Relief operation in Sylhet completed successfully. 200 families received aid.</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard; 