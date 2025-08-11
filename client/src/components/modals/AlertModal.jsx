import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const AlertModal = ({ notification, onClose, darkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      // Trigger animation after mount
      setTimeout(() => setIsVisible(true), 50);
    }
  }, [notification]);

  if (!notification) return null;

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

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        } pointer-events-auto`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`absolute top-0 right-0 h-full w-full sm:w-96 pointer-events-auto
          transform transition-transform duration-300 ease-out
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}
          ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <IoMdClose size={24} />
        </button>
        
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center space-x-3 mb-4">
            <FaBell className={`text-2xl ${getNotificationColor(notification.type)}`} />
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {notification.title}
            </h2>
          </div>
          
          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
            {notification.message}
          </div>
          
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg mb-4`}>
              {Object.entries(notification.data).map(([key, value]) => (
                <div key={key} className="flex justify-between mb-2 last:mb-0">
                  <span className={`capitalize ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Received: {new Date(notification.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal; 