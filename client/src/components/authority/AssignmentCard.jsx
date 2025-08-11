import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import FirefighterAssignForm from './FirefighterAssignForm';
import NgoAssignForm from './NgoAssignForm';

const AssignmentCard = ({ disaster, onAssignFirefighter, onAssignNgo }) => {
  const { language } = useLanguage();
  const [showFirefighterForm, setShowFirefighterForm] = useState(false);
  const [showNgoForm, setShowNgoForm] = useState(false);

  // Get disaster icon based on type
  const getDisasterIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'earthquake':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      case 'flood':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        );
      case 'cyclone':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'fire':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        );
      case 'landslide':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        );
      case 'tsunami':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  // Get severity color class
  const getSeverityColorClass = (severity) => {
    if (severity >= 8) return 'bg-red-600';
    if (severity >= 5) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const handleFirefighterAssign = (firefighterId) => {
    onAssignFirefighter(disaster._id, firefighterId);
    setShowFirefighterForm(false);
  };

  const handleNgoAssign = (ngoId) => {
    onAssignNgo(disaster._id, ngoId);
    setShowNgoForm(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${getSeverityColorClass(disaster.severity)} text-white mr-4`}>
              {getDisasterIcon(disaster.type)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {disaster.title || (language === 'en' ? `${disaster.type} at ${disaster.location}` : `${disaster.location} এ ${disaster.type}`)}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {new Date(disaster.time).toLocaleString(language === 'en' ? 'en-US' : 'bn-BD')}
              </div>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColorClass(disaster.severity)} text-white`}>
            {language === 'en' ? `Severity: ${disaster.severity}/10` : `তীব্রতা: ${disaster.severity}/১০`}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{disaster.location}</span>
          </div>
          
          {disaster.description && (
            <div className="text-gray-600 dark:text-gray-400 mt-2">
              {disaster.description}
            </div>
          )}
          
          {disaster.affectedAreas && (
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>{language === 'en' ? 'Affected Areas: ' : 'প্রভাবিত এলাকা: '}{disaster.affectedAreas}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setShowFirefighterForm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            {language === 'en' ? 'Assign Firefighters' : 'অগ্নিনির্বাপক নিয়োগ করুন'}
          </button>
          <button
            onClick={() => setShowNgoForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {language === 'en' ? 'Assign NGOs' : 'এনজিও নিয়োগ করুন'}
          </button>
        </div>

        {/* Firefighter Assignment Form Modal */}
        {showFirefighterForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {language === 'en' ? 'Assign Firefighters' : 'অগ্নিনির্বাপক নিয়োগ করুন'}
                </h3>
                <button 
                  onClick={() => setShowFirefighterForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FirefighterAssignForm 
                disaster={disaster}
                onAssign={handleFirefighterAssign}
                onCancel={() => setShowFirefighterForm(false)}
              />
            </div>
          </div>
        )}

        {/* NGO Assignment Form Modal */}
        {showNgoForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {language === 'en' ? 'Assign NGOs' : 'এনজিও নিয়োগ করুন'}
                </h3>
                <button 
                  onClick={() => setShowNgoForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <NgoAssignForm 
                disaster={disaster}
                onAssign={handleNgoAssign}
                onCancel={() => setShowNgoForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard; 