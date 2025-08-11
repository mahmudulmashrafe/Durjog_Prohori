import React, { useState, useEffect } from 'react';
import { BsBell, BsBellFill } from 'react-icons/bs';
import api from '../../api/api';
import AlertModal from '../modals/AlertModal';
import { useTheme } from '../../context/ThemeContext';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchTodayNotifications();
    // Fetch notifications every minute
    const interval = setInterval(fetchTodayNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodayNotifications = async () => {
    try {
      const response = await api.get('/api/notifications/today');
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.data.filter(notif => !notif.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      fetchTodayNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/mark-all-read');
      fetchTodayNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification, e) => {
    e.stopPropagation();
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification._id);
    }
    setShowNotifications(false);
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (selectedNotification) {
      setSelectedNotification(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative"
      >
        {unreadCount > 0 ? <BsBellFill className="text-xl" /> : <BsBell className="text-xl" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No notifications today
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={(e) => handleNotificationClick(notification, e)}
                >
                  <div className="font-medium dark:text-white">{notification.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

export default NotificationBell; 