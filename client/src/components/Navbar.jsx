import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { FaUser, FaMoon, FaSun, FaGlobe, FaBell } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import api from '../api/api';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [lastCheckedTime, setLastCheckedTime] = useState(Date.now());

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      if (response.data.success) {
        // Count notifications that arrived after last check
        const newCount = response.data.data.filter(
          notif => !notif.read && new Date(notif.createdAt).getTime() > lastCheckedTime
        ).length;
        setNewNotificationCount(newCount);
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up interval for checking notifications
    const intervalId = setInterval(fetchNotifications, 30000); // Check every 30 seconds

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/user/signin');
  };

  // Handle notification click
  const handleNotificationClick = (e) => {
    e.preventDefault();
    setShowNotificationPanel(true);
    setLastCheckedTime(Date.now());
    setNewNotificationCount(0);
  };

  // Handle marking a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'disaster':
        return 'text-red-500';
      case 'alert':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  // Hide navbar on /home route
  if (location.pathname === '/home') {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 ${darkMode ? 'bg-gray-800' : 'bg-primary'} shadow-lg z-50 transition-colors`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/user/home" className="text-white text-xl font-bold">
              {t('appName')}
            </Link>
          </div>

          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              {!isAuthenticated && (
                <>
                  <button
                    onClick={toggleLanguage}
                    className="text-white hover:text-gray-200 p-2 rounded-full flex items-center space-x-1"
                    aria-label="Toggle Language"
                  >
                    <FaGlobe className="w-5 h-5" />
                    <span className="text-sm font-medium">{language === 'en' ? 'BN' : 'EN'}</span>
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="text-white hover:text-gray-200 p-2 rounded-full flex items-center space-x-1"
                    aria-label="Toggle Theme"
                  >
                    {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                  </button>
                </>
              )}

              {isAuthenticated && (
                <div className="md:hidden flex items-center ml-1 space-x-2">
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={handleNotificationClick}
                      className="relative p-2 rounded-full text-white hover:text-gray-200 transition-colors"
                    >
                      <FaBell className="text-xl" />
                      {newNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[1rem] h-4 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                          {newNotificationCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Panel */}
                    {showNotificationPanel && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 bg-black bg-opacity-25 z-40"
                          onClick={() => setShowNotificationPanel(false)}
                        />
                        
                        {/* Panel */}
                        <div 
                          className={`
                            absolute mt-2 w-screen sm:w-80 max-h-[80vh]
                            ${darkMode ? 'bg-gray-800' : 'bg-white'} 
                            rounded-lg shadow-lg overflow-hidden z-50
                            transform origin-top-right transition-all duration-200 ease-out
                          `}
                          style={{ 
                            maxWidth: 'calc(100vw - 2rem)',
                            right: '7.5rem', // Reduced right offset to move panel slightly left
                            transform: 'translateX(50%)' // Center the panel on the notification icon
                          }}
                        >
                          <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
                            <h2 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {t('notifications')}
                            </h2>
                            <button
                              onClick={() => setShowNotificationPanel(false)}
                              className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              <IoMdClose size={20} />
                            </button>
                          </div>

                          <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
                            {notifications.length === 0 ? (
                              <div className={`p-3 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {t('noNotifications')}
                              </div>
                            ) : (
                              <div>
                                {notifications.map((notification) => (
                                  <div
                                    key={notification._id}
                                    className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} 
                                      ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} 
                                      ${new Date(notification.createdAt).getTime() > lastCheckedTime ? 'bg-blue-50 dark:bg-blue-900/20' : ''} 
                                      cursor-pointer`}
                                    onClick={() => markNotificationAsRead(notification._id)}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <FaBell className={`mt-1 text-base flex-shrink-0 ${getNotificationColor(notification.type)}`} />
                                      <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {notification.title}
                                        </p>
                                        <p className={`mt-0.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                                          {notification.message}
                                        </p>
                                        <p className={`mt-0.5 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                          {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Profile Icon */}
                  <Link
                    to="/user/profile"
                    className="text-white p-2 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <FaUser className="text-xl" />
                  </Link>
                </div>
              )}

              <div className="hidden md:flex items-center space-x-3 ml-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/user/map"
                      className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('map')}
                    </Link>
                    <Link
                      to="/user/alerts"
                      className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('alerts')}
                    </Link>
                    <div className="flex items-center space-x-3">
                      <span className="text-white">{user?.name}</span>
                      <button
                        onClick={handleLogout}
                        className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} ${darkMode ? 'text-white' : 'text-primary'} px-4 py-2 rounded-md text-sm font-medium transition-colors`}
                      >
                        {t('logout')}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/user/signin"
                      className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('login')}
                    </Link>
                    <Link
                      to="/user/signup"
                      className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-primary'} px-4 py-2 rounded-md text-sm font-medium transition-colors`}
                    >
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;