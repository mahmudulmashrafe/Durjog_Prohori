import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const NotificationItem = ({ notification, type }) => {
  const { language } = useLanguage();

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'en' ? 'en-US' : 'bn-BD');
  };

  const getResponderName = () => {
    if (type === 'firefighter') {
      return notification.firefighter?.name || 'Unknown Firefighter';
    } else {
      return notification.ngo?.name || 'Unknown NGO';
    }
  };

  const getStatusText = (status) => {
    if (language === 'en') {
      switch (status) {
        case 'pending': return 'Pending';
        case 'accepted': return 'Accepted';
        case 'declined': return 'Declined';
        default: return 'Unknown';
      }
    } else {
      switch (status) {
        case 'pending': return 'অপেক্ষারত';
        case 'accepted': return 'গৃহীত';
        case 'declined': return 'প্রত্যাখ্যাত';
        default: return 'অজানা';
      }
    }
  };

  const getTypeIcon = () => {
    if (type === 'firefighter') {
      return (
        <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start">
        {getTypeIcon()}
        
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
              {type === 'firefighter' 
                ? (language === 'en' ? 'Firefighter Assignment' : 'অগ্নিনির্বাপক নিয়োগ')
                : (language === 'en' ? 'NGO Assignment' : 'এনজিও নিয়োগ')}
            </h4>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(notification.status)}`}>
              {getStatusText(notification.status)}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            <span className="font-medium">{getResponderName()}</span> 
            {language === 'en' 
              ? ` assigned to ${notification.disaster?.type || 'disaster'} at ${notification.disaster?.location || 'unknown location'}`
              : ` ${notification.disaster?.location || 'অজানা স্থানে'} ${notification.disaster?.type || 'দুর্যোগে'} নিয়োগ করা হয়েছে`}
          </p>
          
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {formatDate(notification.createdAt || new Date())}
          </div>
          
          {notification.reason && notification.status === 'declined' && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded text-sm text-red-800 dark:text-red-200">
              <span className="font-semibold">
                {language === 'en' ? 'Reason: ' : 'কারণ: '}
              </span>
              {notification.reason}
            </div>
          )}

          {notification.resources && notification.resources.length > 0 && (
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'en' ? 'Resources: ' : 'সংস্থান: '}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {notification.resources.map((resource, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                  >
                    {resource}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem; 