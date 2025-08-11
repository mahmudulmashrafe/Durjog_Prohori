import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaExclamationTriangle, 
  FaMapMarkedAlt, 
  FaUsers, 
  FaBell, 
  FaDonate,
  FaSignOutAlt
} from 'react-icons/fa';

const AdminHome = () => {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/home');
  };

  const menuItems = [
    { icon: <FaHome className="w-6 h-6" />, title: 'Home', route: '/admin/home' },
    { icon: <FaExclamationTriangle className="w-6 h-6" />, title: 'Disaster Management', route: '/admin/disasters' },
    { icon: <FaMapMarkedAlt className="w-6 h-6" />, title: 'Map', route: '/admin/map' },
    { icon: <FaUsers className="w-6 h-6" />, title: 'User Management', route: '/admin/users' },
    { icon: <FaBell className="w-6 h-6" />, title: 'SOS Management', route: '/admin/sos' },
    { icon: <FaDonate className="w-6 h-6" />, title: 'Donation Management', route: '/admin/donations' },
  ];

  const stats = [
    { title: 'Total Users', value: '24', color: 'bg-blue-500' },
    { title: 'Active Disasters', value: '3', color: 'bg-red-500' },
    { title: 'SOS Requests', value: '8', color: 'bg-yellow-500' },
    { title: 'Donations', value: '৳15,400', color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Admin Dashboard Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-gray-700 dark:text-gray-300">
              Welcome, {admin?.name || 'Admin'}
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
                  <h3 className="font-medium text-gray-700 dark:text-white">{admin?.username || 'admin'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{admin?.role || 'Administrator'}</p>
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

          {/* Recent Activity Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Activity</h2>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">New SOS Request</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Rahim Khan</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">5 minutes ago</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Disaster Alert</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">System</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2 hours ago</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">New User Registration</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Sadia Ahmed</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">4 hours ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome; 