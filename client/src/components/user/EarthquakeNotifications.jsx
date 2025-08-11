import React, { useEffect } from 'react';
import useEarthquakeStore from '../../store/earthquakeStore';
import { FaExclamationTriangle } from 'react-icons/fa';

const EarthquakeNotifications = () => {
  const { 
    notifications, 
    initializeSocket, 
    disconnectSocket,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useEarthquakeStore();

  useEffect(() => {
    // Initialize socket connection when component mounts
    initializeSocket();
    
    // Clean up socket connection when component unmounts
    return () => {
      disconnectSocket();
    };
  }, [initializeSocket, disconnectSocket]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) {
    return null; // Don't render anything if there are no notifications
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 bg-primary text-white flex justify-between items-center">
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <h3 className="font-medium text-sm">Earthquake Alerts</h3>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div>
            <button 
              onClick={markAllNotificationsAsRead}
              className="w-full py-1 text-xs text-primary hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Mark all as read
            </button>
            
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-3 border-t border-gray-200 dark:border-gray-700 ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <FaExclamationTriangle className={`text-${
                      notification.data.magnitude >= 5 ? 'red' : 
                      notification.data.magnitude >= 4 ? 'yellow' : 'blue'
                    }-500`} />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            No new earthquake notifications
          </p>
        )}
      </div>
    </div>
  );
};

export default EarthquakeNotifications; 