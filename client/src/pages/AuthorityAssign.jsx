import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import AuthorityLayout from '../components/authority/AuthorityLayout';
import { AssignmentCard, NotificationItem } from '../components/authority';

const AuthorityAssign = () => {
  const { language } = useLanguage();
  const [activeDisasters, setActiveDisasters] = useState([]);
  const [firefighterNotifications, setFirefighterNotifications] = useState([]);
  const [ngoNotifications, setNgoNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('disasters');

  // Fetch active disasters and notifications
  useEffect(() => {
    // Mock active disasters
    const mockDisasters = [
      {
        _id: '1',
        type: 'earthquake',
        location: 'Dhaka',
        severity: 7,
        time: new Date().toISOString(),
        title: 'Earthquake in Dhaka',
        description: 'A 5.6 magnitude earthquake hit parts of Dhaka.',
        affectedAreas: 'Mohammadpur, Dhanmondi, Mirpur'
      },
      {
        _id: '2',
        type: 'flood',
        location: 'Sylhet',
        severity: 8,
        time: new Date().toISOString(),
        title: 'Severe Flooding in Sylhet',
        description: 'Heavy rain has caused severe flooding in several areas.',
        affectedAreas: 'Sunamganj, Moulvibazar, Habiganj'
      }
    ];
    
    // Mock firefighter notifications
    const mockFirefighterNotifications = [
      {
        _id: '1',
        firefighter: {
          name: 'Dhaka Fire Station'
        },
        disaster: {
          type: 'fire',
          location: 'Gulshan, Dhaka'
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        firefighter: {
          name: 'Uttara Fire Station'
        },
        disaster: {
          type: 'earthquake',
          location: 'Uttara, Dhaka'
        },
        status: 'accepted',
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];
    
    // Mock NGO notifications
    const mockNgoNotifications = [
      {
        _id: '1',
        ngo: {
          name: 'Red Crescent Bangladesh'
        },
        disaster: {
          type: 'flood',
          location: 'Sylhet'
        },
        status: 'accepted',
        resources: ['Food', 'Water', 'Medicine'],
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        ngo: {
          name: 'BRAC'
        },
        disaster: {
          type: 'cyclone',
          location: 'Cox\'s Bazar'
        },
        status: 'declined',
        reason: 'Resources already deployed to another area',
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];

    setTimeout(() => {
      setActiveDisasters(mockDisasters);
      setFirefighterNotifications(mockFirefighterNotifications);
      setNgoNotifications(mockNgoNotifications);
      setLoading(false);
    }, 1000);
  }, [language]);

  // Handle assigning firefighter
  const handleAssignFirefighter = async (disasterId, firefighterId) => {
    // Simulate successful assignment
    const newNotification = {
      _id: Date.now().toString(),
      firefighter: {
        name: 'New Fire Brigade'
      },
      disaster: activeDisasters.find(d => d._id === disasterId),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setFirefighterNotifications([newNotification, ...firefighterNotifications]);
    
    // Show success alert
    alert(language === 'en' 
      ? 'Firefighter team has been assigned successfully!' 
      : 'অগ্নিনির্বাপক দল সফলভাবে নিয়োগ করা হয়েছে!');
  };

  // Handle assigning NGO
  const handleAssignNgo = async (disasterId, ngoId, resources = []) => {
    // Simulate successful assignment
    const newNotification = {
      _id: Date.now().toString(),
      ngo: {
        name: 'New NGO Team'
      },
      disaster: activeDisasters.find(d => d._id === disasterId),
      status: 'pending',
      resources: resources.length > 0 ? resources : ['Food', 'Shelter'],
      createdAt: new Date().toISOString()
    };
    
    setNgoNotifications([newNotification, ...ngoNotifications]);
    
    // Show success alert
    alert(language === 'en' 
      ? 'NGO has been assigned successfully!' 
      : 'এনজিও সফলভাবে নিয়োগ করা হয়েছে!');
  };

  if (loading) {
    return (
      <AuthorityLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AuthorityLayout>
    );
  }

  if (error) {
    return (
      <AuthorityLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </AuthorityLayout>
    );
  }

  return (
    <AuthorityLayout>
      <div className="w-full">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <h1 className="text-2xl font-bold">
            {language === 'en' ? 'Assign Emergency Responders' : 'জরুরী প্রতিক্রিয়াকারী নিয়োগ করুন'}
          </h1>
          <p className="opacity-90">
            {language === 'en' 
              ? 'Assign firefighters and NGOs to active disasters' 
              : 'সক্রিয় দুর্যোগে অগ্নিনির্বাপক এবং এনজিও নিয়োগ করুন'}
          </p>
        </div>

        <div className="w-full">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                activeTab === 'disasters'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('disasters')}
            >
              {language === 'en' ? 'Active Disasters' : 'সক্রিয় দুর্যোগ'}
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                activeTab === 'firefighters'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('firefighters')}
            >
              {language === 'en' ? 'Firefighter Assignments' : 'অগ্নিনির্বাপক নিয়োগ'}
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                activeTab === 'ngos'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('ngos')}
            >
              {language === 'en' ? 'NGO Assignments' : 'এনজিও নিয়োগ'}
            </button>
          </div>

          <div className="p-4">
            {/* Active Disasters Tab */}
            {activeTab === 'disasters' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDisasters.length > 0 ? (
                  activeDisasters.map((disaster) => (
                    <AssignmentCard
                      key={disaster._id}
                      disaster={disaster}
                      onAssignFirefighter={handleAssignFirefighter}
                      onAssignNgo={handleAssignNgo}
                    />
                  ))
                ) : (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded p-6 text-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                      {language === 'en' ? 'No active disasters' : 'কোন সক্রিয় দুর্যোগ নেই'}
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      {language === 'en' 
                        ? 'There are no active disasters that need response teams at this time.' 
                        : 'এই মুহূর্তে কোন সক্রিয় দুর্যোগ নেই যার জন্য প্রতিক্রিয়া দল প্রয়োজন।'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Firefighter Assignments Tab */}
            {activeTab === 'firefighters' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    {language === 'en' ? 'Firefighter Assignments' : 'অগ্নিনির্বাপক নিয়োগ'}
                  </h2>
                  <div className="flex space-x-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Pending' : 'অপেক্ষারত'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Accepted' : 'গৃহীত'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Declined' : 'প্রত্যাখ্যাত'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {firefighterNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {firefighterNotifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        type="firefighter"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded p-6 text-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                      {language === 'en' ? 'No firefighter assignments' : 'কোন অগ্নিনির্বাপক নিয়োগ নেই'}
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      {language === 'en' 
                        ? 'You haven\'t assigned any firefighter teams yet.' 
                        : 'আপনি এখনো কোন অগ্নিনির্বাপক দল নিয়োগ করেননি।'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* NGO Assignments Tab */}
            {activeTab === 'ngos' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    {language === 'en' ? 'NGO Assignments' : 'এনজিও নিয়োগ'}
                  </h2>
                  <div className="flex space-x-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Pending' : 'অপেক্ষারত'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Accepted' : 'গৃহীত'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Declined' : 'প্রত্যাখ্যাত'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {ngoNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {ngoNotifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        type="ngo"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded p-6 text-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                      {language === 'en' ? 'No NGO assignments' : 'কোন এনজিও নিয়োগ নেই'}
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      {language === 'en' 
                        ? 'You haven\'t assigned any NGOs yet.' 
                        : 'আপনি এখনো কোন এনজিও নিয়োগ করেননি।'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthorityLayout>
  );
};

export default AuthorityAssign; 