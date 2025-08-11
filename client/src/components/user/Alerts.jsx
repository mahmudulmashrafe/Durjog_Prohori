import React, { useEffect, useState } from 'react';
import { FaBell, FaExclamationCircle } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/api';
import AlertModal from '../modals/AlertModal';

const Alerts = () => {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching notifications...');
      const response = await api.get('/api/notifications');
      
      console.log('Notifications API Response:', {
        success: response.data.success,
        count: response.data.data?.length || 0,
        data: response.data.data
      });
      
      if (response.data.success) {
        setNotifications(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.patch(`/api/notifications/${notificationId}/read`);

      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.patch('/api/notifications/mark-all-read');

      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notif => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} min-h-screen transition-colors`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('notifications')}
          </h1>
          {notifications.some(notif => !notif.read) && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-center">
              <FaExclamationCircle className="mr-2" />
              <span>{error}</span>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} 
                  rounded-lg shadow p-4 transition-colors cursor-pointer
                  ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <FaBell className={`text-xl ${getNotificationColor(notification.type)}`} />
                  <div className="flex-grow">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 transition-colors`}>
              <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No notifications at this time
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedNotification && (
        <AlertModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default Alerts;