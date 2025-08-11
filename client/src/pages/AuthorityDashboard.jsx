import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AuthorityLayout from '../components/authority/AuthorityLayout';
import axios from 'axios';
import { FaUserAlt, FaFireExtinguisher, FaHandHoldingHeart, FaUserShield, FaPencilAlt, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';

const AuthorityDashboard = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [counts, setCounts] = useState({
    users: 0,
    firefighters: 0,
    ngos: 0,
    authorities: 0
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const AUTHORITY_COLOR = 'rgb(88, 10, 107)';
  
  useEffect(() => {
    fetchCounts();
    fetchEntities(activeTab);
  }, [activeTab]);
  
  const fetchCounts = async () => {
    try {
      const response = await axios.get('/api/users/counts');
      if (response.data.success) {
        setCounts(response.data.counts);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
      // Use mock data for development
      setCounts({
        users: 24,
        firefighters: 12,
        ngos: 8,
        authorities: 4
      });
    }
  };
  
  const fetchEntities = async (entityType) => {
    setLoading(true);
    try {
      console.log(`Attempting to fetch ${entityType}...`);
      
      // Correct the API endpoint path based on the type
      let apiEndpoint;
      switch(entityType) {
        case 'users':
          apiEndpoint = '/api/users/users';
          break;
        case 'firefighters':
          apiEndpoint = '/api/users/firefighters';
          break;
        case 'ngos':
          apiEndpoint = '/api/users/ngos';
          break;
        case 'authorities':
          apiEndpoint = '/api/users/authorities';
          break;
        default:
          apiEndpoint = `/api/${entityType}`;
      }
      
      console.log(`Using API endpoint: ${apiEndpoint}`);
      const response = await axios.get(apiEndpoint);
      
      console.log(`API Response for ${entityType}:`, response.data);
      
      if (response.data.success) {
        // For debugging - inspect the first item to understand structure
        if (response.data[entityType] && response.data[entityType].length > 0) {
          console.log(`First ${entityType.slice(0, -1)} data structure:`, response.data[entityType][0]);
        }
        
        setEntities(response.data[entityType]);
      } else {
        console.error(`Failed to fetch ${entityType}:`, response.data.message);
        // Use mock data
        const mockData = generateMockData(entityType, 10);
        console.log(`Using mock data for ${entityType}:`, mockData[0]);
        setEntities(mockData);
      }
    } catch (error) {
      console.error(`Error fetching ${entityType}:`, error);
      // Add more detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error config:', error.config);
      }
      
      // Use mock data for development
      const mockData = generateMockData(entityType, 10);
      console.log(`Using mock data for ${entityType}:`, mockData[0]);
      setEntities(mockData);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setLoading(true);
    try {
      // Use the correct API endpoint
      const deleteEndpoint = `/api/users/${activeTab}/${deleteTarget._id}`;
      console.log(`Deleting: ${deleteEndpoint}`);
      
      await axios.delete(deleteEndpoint);
      
      // Update the list
      setEntities(entities.filter(entity => entity._id !== deleteTarget._id));
      
      // Update counts
      setCounts(prev => ({
        ...prev,
        [activeTab]: Math.max(0, prev[activeTab] - 1)
      }));
      
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting entity:', error);
      
      // For development: simulate success
      setEntities(entities.filter(entity => entity._id !== deleteTarget._id));
      setCounts(prev => ({
        ...prev,
        [activeTab]: Math.max(0, prev[activeTab] - 1)
      }));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = async (formData) => {
    if (!editTarget) return;
    
    setLoading(true);
    try {
      // Use the correct API endpoint
      const editEndpoint = `/api/users/${activeTab}/${editTarget._id}`;
      console.log(`Updating: ${editEndpoint} with data:`, formData);
      
      await axios.put(editEndpoint, formData);
      
      // Update the list
      setEntities(entities.map(entity => 
        entity._id === editTarget._id ? { ...entity, ...formData } : entity
      ));
      
      setShowEditModal(false);
      setEditTarget(null);
    } catch (error) {
      console.error('Error updating entity:', error);
      
      // For development: simulate success
      setEntities(entities.map(entity => 
        entity._id === editTarget._id ? { ...entity, ...formData } : entity
      ));
      setShowEditModal(false);
      setEditTarget(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdd = async (formData) => {
    setLoading(true);
    try {
      // Use the correct API endpoint for adding a new entity
      const addEndpoint = `/api/users/${activeTab}`;
      console.log(`Adding new ${activeTab.slice(0, -1)} with data:`, formData);
      
      const response = await axios.post(addEndpoint, formData);
      
      if (response.data.success) {
        console.log(`Successfully added new ${activeTab.slice(0, -1)}:`, response.data);
        
        // Update the list - add the new entity with the returned ID
        const newEntity = {
          ...formData,
          _id: response.data.id || `temp_${Date.now()}` // Use returned ID or generate temporary one
        };
        setEntities([newEntity, ...entities]);
        
        // Update counts
        setCounts(prev => ({
          ...prev,
          [activeTab]: prev[activeTab] + 1
        }));
      } else {
        console.error(`Failed to add ${activeTab.slice(0, -1)}:`, response.data.message);
      }
      
      setShowAddModal(false);
    } catch (error) {
      console.error(`Error adding ${activeTab.slice(0, -1)}:`, error);
      
      // For development: simulate success with mock data
      const mockId = `mock_${Date.now()}`;
      const newEntity = {
        ...formData,
        _id: mockId,
        createdAt: new Date().toISOString()
      };
      setEntities([newEntity, ...entities]);
      
      setCounts(prev => ({
        ...prev,
        [activeTab]: prev[activeTab] + 1
      }));
      
      setShowAddModal(false);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredEntities = searchTerm.trim() === '' 
    ? entities 
    : entities.filter(entity => {
        const searchRegex = new RegExp(searchTerm, 'i');
        return (
          searchRegex.test(entity.name) || 
          searchRegex.test(entity.email) || 
          searchRegex.test(entity.username || '') ||
          searchRegex.test(entity._id)
        );
      });
  
  // Generate mock data that matches the MongoDB schema
  const generateMockData = (type, count) => {
    const result = [];
    
    for (let i = 1; i <= count; i++) {
      // Base user schema according to MongoDB collections
      const baseUser = {
        _id: `mock_${type}_${i}`,
        username: `${type.slice(0, -1)}${i}`,
        name: `${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1)} Name ${i}`,
        email: `${type.slice(0, -1)}${i}@example.com`,
        status: i % 5 === 0 ? 'inactive' : 'active',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000).toISOString()
      };
      
      switch (type) {
        case 'users':
          result.push({
            ...baseUser,
            phone_number: `+88017${Math.floor(10000000 + Math.random() * 90000000)}`,
            address: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'][Math.floor(Math.random() * 5)]
          });
          break;
          
        case 'firefighters':
          result.push({
            ...baseUser,
            station: `Fire Station ${Math.floor(Math.random() * 5) + 1}`,
            badgeNumber: `FF-${100 + i}`,
            phoneNumber: `+88018${Math.floor(10000000 + Math.random() * 90000000)}`,
            yearsOfService: Math.floor(Math.random() * 15) + 1
          });
          break;
          
        case 'ngos':
          result.push({
            ...baseUser,
            organization: `NGO Organization ${i}`,
            registrationNumber: `NGO-${2023}-${100 + i}`,
            phoneNumber: `+88019${Math.floor(10000000 + Math.random() * 90000000)}`,
            location: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'][Math.floor(Math.random() * 5)]
          });
          break;
          
        case 'authorities':
          result.push({
            ...baseUser,
            department: `Department ${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}`,
            badgeNumber: `AUTH-${100 + i}`,
            phoneNumber: `+88016${Math.floor(10000000 + Math.random() * 90000000)}`,
            yearsOfService: Math.floor(Math.random() * 20) + 1
          });
          break;
          
        default:
          break;
      }
    }
    
    return result;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Add explicit field access with fallbacks
  const getUserField = (entity, field, fallbacks = [], defaultValue = 'N/A') => {
    if (entity[field] !== undefined && entity[field] !== null) {
      return entity[field];
    }
    
    for (const fallback of fallbacks) {
      if (entity[fallback] !== undefined && entity[fallback] !== null) {
        return entity[fallback];
      }
    }
    
    return defaultValue;
  };
  
  return (
    <AuthorityLayout>
      <div className="w-full px-4 py-0">
        <div className="mb-1">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-0">
            {language === 'en' ? 'User Management Dashboard' : 'ব্যবহারকারী ব্যবস্থাপনা ড্যাশবোর্ড'}
          </h1>
        </div>
        
        {/* Statistics Cards that act as navigation buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl">
          <button
            onClick={() => setActiveTab('users')}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center transition-all duration-300 w-full 
              ${activeTab === 'users' 
                ? 'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]' 
                : 'shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9),4px_-4px_8px_rgba(255,255,255,0.9),-4px_4px_8px_rgba(0,0,0,0.15)]'} 
              hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mr-4 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)]">
              <FaUserAlt className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'en' ? 'Total Users' : 'মোট ব্যবহারকারী'}</p>
              <p className="text-2xl font-bold">{counts.users}</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('firefighters')}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center transition-all duration-300 w-full 
              ${activeTab === 'firefighters' 
                ? 'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]' 
                : 'shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9),4px_-4px_8px_rgba(255,255,255,0.9),-4px_4px_8px_rgba(0,0,0,0.15)]'} 
              hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100 text-red-600 mr-4 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)]">
              <FaFireExtinguisher className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-base text-gray-500 dark:text-gray-400">{language === 'en' ? 'Total Firefighters' : 'মোট ফায়ারফাইটার'}</p>
              <p className="text-2xl font-bold">{counts.firefighters}</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('ngos')}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center transition-all duration-300 w-full 
              ${activeTab === 'ngos' 
                ? 'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]' 
                : 'shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9),4px_-4px_8px_rgba(255,255,255,0.9),-4px_4px_8px_rgba(0,0,0,0.15)]'} 
              hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 text-green-600 mr-4 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)]">
              <FaHandHoldingHeart className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-base text-gray-500 dark:text-gray-400">{language === 'en' ? 'Total NGOs' : 'মোট এনজিও'}</p>
              <p className="text-2xl font-bold">{counts.ngos}</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('authorities')}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center transition-all duration-300 w-full 
              ${activeTab === 'authorities' 
                ? 'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]' 
                : 'shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9),4px_-4px_8px_rgba(255,255,255,0.9),-4px_4px_8px_rgba(0,0,0,0.15)]'} 
              hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 mr-4 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)]">
              <FaUserShield className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-base text-gray-500 dark:text-gray-400">{language === 'en' ? 'Total Authorities' : 'মোট কর্তৃপক্ষ'}</p>
              <p className="text-2xl font-bold">{counts.authorities}</p>
            </div>
          </button>
        </div>
        
                  {/* User List */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-2 overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Search and Actions */}
          <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl border-b border-gray-200 dark:border-gray-700">
            <div className="relative flex-1 max-w-lg w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <FaSearch className="h-5 w-5" />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 rounded-2xl focus:outline-none transition-all duration-300
                border border-gray-200 dark:border-gray-700
                shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] 
                focus:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                placeholder={language === 'en' ? `Search ${activeTab}...` : `${activeTab} অনুসন্ধান করুন...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              className={`flex items-center px-6 py-3 text-sm text-white rounded-2xl transition-all duration-300 
              bg-gradient-to-r from-purple-600 to-purple-700 
              shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.9),2px_-2px_4px_rgba(255,255,255,0.9),-2px_2px_4px_rgba(0,0,0,0.15)] 
              hover:shadow-[2px_2px_8px_rgba(0,0,0,0.2),-2px_-2px_8px_rgba(255,255,255,0.9),2px_-2px_8px_rgba(255,255,255,0.9),-2px_2px_8px_rgba(0,0,0,0.2)]
              hover:-translate-y-0.5 hover:scale-105
              active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0 active:scale-100`}
              onClick={() => {
                setShowAddModal(true);
              }}
            >
              <FaPlus className="mr-2" />
              {language === 'en' ? `Add ${activeTab.slice(0, -1)}` : `${activeTab.slice(0, -1)} যোগ করুন`}
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: AUTHORITY_COLOR }}></div>
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="text-center p-2 text-gray-500 dark:text-gray-400">
              {language === 'en' ? `No ${activeTab} found` : `কোন ${activeTab} পাওয়া যায়নি`}
            </div>
          ) : (
            <div className="relative">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-purple-800 to-purple-900">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          {language === 'en' ? 'NAME' : 'নাম'}
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          {language === 'en' ? 'EMAIL & PHONE' : 'ইমেইল ও ফোন'}
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          {language === 'en' ? 'LOCATION' : 'অবস্থান'}
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          {language === 'en' ? 'STATUS' : 'স্ট্যাটাস'}
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          {language === 'en' ? 'JOINED' : 'যোগদান'}
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                          {language === 'en' ? 'ACTIONS' : 'অ্যাকশন'}
                        </th>
                      </tr>
                    </thead>
                </table>
              </div>
              <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredEntities.map((entity) => (
                        <tr key={entity._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 py-1 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {getUserField(entity, 'name')}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              @{getUserField(entity, 'username')}
                            </div>
                          </td>
                          <td className="px-3 py-1 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {getUserField(entity, 'email')}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {getUserField(entity, 'phone_number', ['phoneNumber', 'phone'])}
                            </div>
                          </td>
                          
                          {activeTab === 'users' && (
                            <td className="px-3 py-1 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {getUserField(entity, 'address', ['location'])}
                              </div>
                            </td>
                          )}
                          
                          {(activeTab === 'firefighters' || activeTab === 'authorities') && (
                            <td className="px-3 py-1 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">{getUserField(entity, 'badgeNumber') || 'N/A'}</div>
                            </td>
                          )}
                          
                          {activeTab === 'ngos' && (
                            <td className="px-3 py-1 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">{getUserField(entity, 'registrationNumber') || 'N/A'}</div>
                            </td>
                          )}
                          
                          <td className="px-3 py-1 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${getUserField(entity, 'status') === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
                            >
                              {getUserField(entity, 'status') === 'active' 
                                ? (language === 'en' ? 'Active' : 'সক্রিয়') 
                                : (language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়')}
                            </span>
                          </td>
                          <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(getUserField(entity, 'createdAt'))}
                          </td>
                          <td className="px-3 py-1 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => {
                                setEditTarget(entity);
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                            >
                              <FaPencilAlt />
                            </button>
                            <button 
                              onClick={() => {
                                setDeleteTarget(entity);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Add CSS for table scrolling */}
        <style>{`
          /* Custom scrollbar styles */
          .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
          }
          
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          
          /* For Firefox */
          .overflow-y-auto {
            scrollbar-width: thin;
            scrollbar-color: #888 #f1f1f1;
          }
          
          /* Fix table layout */
          table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
          }
          
          thead {
            background: linear-gradient(to right, rgb(107, 33, 168), rgb(88, 28, 135));
          }
          
          th {
            position: sticky;
            top: 0;
            z-index: 1;
          }
          
          tbody tr:hover {
            background-color: rgba(243, 244, 246, 0.1);
          }
          
          /* Ensure consistent column widths between header and body tables */
          th:nth-child(1), td:nth-child(1) { width: 20%; }
          th:nth-child(2), td:nth-child(2) { width: 25%; }
          th:nth-child(3), td:nth-child(3) { width: 20%; }
          th:nth-child(4), td:nth-child(4) { width: 15%; }
          th:nth-child(5), td:nth-child(5) { width: 12%; }
          th:nth-child(6), td:nth-child(6) { width: 8%; }
        `}</style>
        
        {/* Add CSS for firefighter table */}
        <style>{`
          .firefighter-table-container {
            position: relative;
            margin-top: -1px;
          }
          
          .firefighter-table {
            position: relative;
            overflow: auto;
          }
          
          .table-fixed-header {
            position: sticky;
            top: 0;
            z-index: 10;
          }
        `}</style>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {language === 'en' ? 'Confirm Deletion' : 'মুছে ফেলার নিশ্চিতকরণ'}
              </h3>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'en' 
                ? `Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.` 
                : `আপনি কি নিশ্চিত যে আপনি ${deleteTarget.name} মুছতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {language === 'en' ? 'Delete' : 'মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Modal - Comprehensive Edition for User Collection */}
      {showEditModal && editTarget && activeTab === 'users' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center" style={{ color: AUTHORITY_COLOR }}>
                <FaUserAlt className="mr-2" style={{ color: AUTHORITY_COLOR }} />
                {language === 'en' ? 'Edit User' : 'ব্যবহারকারী সম্পাদনা করুন'}
              </h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditTarget(null);
                }} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // For debugging
                console.log('Submitting new user data:', data);
                
                handleEdit(data);
              }} className="space-y-4">
                {/* Username field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Username' : 'ব্যবহারকারীর নাম'} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={editTarget.username}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'User login identifier' : 'ব্যবহারকারী লগইন শনাক্তকারী'}
                  </p>
                </div>
                
                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Password' : 'পাসওয়ার্ড'} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password to change"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'Leave blank to keep current password' : 'বর্তমান পাসওয়ার্ড রাখতে খালি রাখুন'}
                  </p>
                </div>
                
                {/* Name field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Full Name' : 'পুরো নাম'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editTarget.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editTarget.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Phone number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    defaultValue={editTarget.phoneNumber || editTarget.phone_number}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Address field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Address' : 'ঠিকানা'}
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editTarget.address || editTarget.location}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Status field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Account Status' : 'অ্যাকাউন্ট স্ট্যাটাস'}
                  </label>
                  <select
                    name="status"
                    defaultValue={editTarget.status || 'active'}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">{language === 'en' ? 'Active' : 'সক্রিয়'}</option>
                    <option value="inactive">{language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: AUTHORITY_COLOR, borderColor: AUTHORITY_COLOR }}
                  >
                    {language === 'en' ? 'Update User' : 'ব্যবহারকারী সম্পাদনা করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Add New User Modal */}
      {showAddModal && activeTab === 'users' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center" style={{ color: AUTHORITY_COLOR }}>
                <FaUserAlt className="mr-2" style={{ color: AUTHORITY_COLOR }} />
                {language === 'en' ? 'Add New User' : 'নতুন ব্যবহারকারী যোগ করুন'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // For debugging
                console.log('Submitting new user data:', data);
                
                handleAdd(data);
              }} className="space-y-4">
                {/* Username field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Username' : 'ব্যবহারকারীর নাম'} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Password' : 'পাসওয়ার্ড'} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Name field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Full Name' : 'পুরো নাম'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Phone number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'Format: +8801XXXXXXXXX' : 'ফরম্যাট: +৮৮০১XXXXXXXXX'}
                  </p>
                </div>
                
                {/* Address field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Address' : 'ঠিকানা'}
                  </label>
                  <textarea
                    name="address"
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  ></textarea>
                </div>
                
                {/* Status field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Account Status' : 'অ্যাকাউন্ট স্ট্যাটাস'}
                  </label>
                  <select
                    name="status"
                    defaultValue="active"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">{language === 'en' ? 'Active' : 'সক্রিয়'}</option>
                    <option value="inactive">{language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: AUTHORITY_COLOR, borderColor: AUTHORITY_COLOR }}
                  >
                    {language === 'en' ? 'Add User' : 'ব্যবহারকারী যোগ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Add New Firefighter Modal */}
      {showAddModal && activeTab === 'firefighters' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center" style={{ color: AUTHORITY_COLOR }}>
                <FaFireExtinguisher className="mr-2" style={{ color: AUTHORITY_COLOR }} />
                {language === 'en' ? 'Add New Firefighter' : 'নতুন ফায়ারফাইটার যোগ করুন'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // For debugging
                console.log('Submitting new firefighter data:', data);
                
                handleAdd(data);
              }} className="space-y-4">
                {/* Username field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Username' : 'ব্যবহারকারীর নাম'} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Password' : 'পাসওয়ার্ড'} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Name field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Full Name' : 'পুরো নাম'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Phone number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Phone Number' : 'ফোন নম্বর'} *
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'Format: +8801XXXXXXXXX' : 'ফরম্যাট: +৮৮০১XXXXXXXXX'}
                  </p>
                </div>
                
                {/* Station field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Fire Station' : 'ফায়ার স্টেশন'} *
                  </label>
                  <input
                    type="text"
                    name="station"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Badge Number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Badge Number' : 'ব্যাজ নম্বর'} *
                  </label>
                  <input
                    type="text"
                    name="badgeNumber"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Years of Service field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Years of Service' : 'সেবার বছর'}
                  </label>
                  <input
                    type="number"
                    name="yearsOfService"
                    min="0"
                    max="50"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Status field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Status' : 'অবস্থা'}
                  </label>
                  <select
                    name="status"
                    defaultValue="active"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">{language === 'en' ? 'Active' : 'সক্রিয়'}</option>
                    <option value="inactive">{language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: AUTHORITY_COLOR, borderColor: AUTHORITY_COLOR }}
                  >
                    {language === 'en' ? 'Add Firefighter' : 'ফায়ারফাইটার যোগ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Add placeholder modal for NGOs and Authorities */}
      {showAddModal && activeTab === 'ngos' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center" style={{ color: AUTHORITY_COLOR }}>
                <FaHandHoldingHeart className="mr-2" style={{ color: AUTHORITY_COLOR }} />
                {language === 'en' ? 'Add New NGO' : 'নতুন এনজিও যোগ করুন'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // For debugging
                console.log('Submitting new NGO data:', data);
                
                handleAdd(data);
              }} className="space-y-4">
                {/* Username field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Username' : 'ব্যবহারকারীর নাম'} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Password' : 'পাসওয়ার্ড'} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Organization Name field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Organization Name' : 'সংগঠনের নাম'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Phone number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Phone Number' : 'ফোন নম্বর'} *
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'Format: +8801XXXXXXXXX' : 'ফরম্যাট: +৮৮০১XXXXXXXXX'}
                  </p>
                </div>
                
                {/* Registration Number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Registration Number' : 'নিবন্ধন নম্বর'} *
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Location field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Location' : 'অবস্থান'} *
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Status field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Status' : 'অবস্থা'}
                  </label>
                  <select
                    name="status"
                    defaultValue="active"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">{language === 'en' ? 'Active' : 'সক্রিয়'}</option>
                    <option value="inactive">{language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: AUTHORITY_COLOR, borderColor: AUTHORITY_COLOR }}
                  >
                    {language === 'en' ? 'Add NGO' : 'এনজিও যোগ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {showAddModal && activeTab === 'authorities' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center" style={{ color: AUTHORITY_COLOR }}>
                <FaUserShield className="mr-2" style={{ color: AUTHORITY_COLOR }} />
                {language === 'en' ? 'Add New Authority' : 'নতুন কর্তৃপক্ষ যোগ করুন'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // For debugging
                console.log('Submitting new authority data:', data);
                
                handleAdd(data);
              }} className="space-y-4">
                {/* Username field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Username' : 'ব্যবহারকারীর নাম'} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Password' : 'পাসওয়ার্ড'} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Name field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Full Name' : 'পুরো নাম'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Phone number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Phone Number' : 'ফোন নম্বর'} *
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'Format: +8801XXXXXXXXX' : 'ফরম্যাট: +৮৮০১XXXXXXXXX'}
                  </p>
                </div>
                
                {/* Department field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Department' : 'বিভাগ'} *
                  </label>
                  <input
                    type="text"
                    name="department"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Badge Number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Badge Number' : 'ব্যাজ নম্বর'} *
                  </label>
                  <input
                    type="text"
                    name="badgeNumber"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Years of Service field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Years of Service' : 'সেবার বছর'}
                  </label>
                  <input
                    type="number"
                    name="yearsOfService"
                    min="0"
                    max="50"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Status field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Status' : 'অবস্থা'}
                  </label>
                  <select
                    name="status"
                    defaultValue="active"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">{language === 'en' ? 'Active' : 'সক্রিয়'}</option>
                    <option value="inactive">{language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: AUTHORITY_COLOR, borderColor: AUTHORITY_COLOR }}
                  >
                    {language === 'en' ? 'Add Authority' : 'কর্তৃপক্ষ যোগ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {showEditModal && editTarget && activeTab === 'firefighters' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center" style={{ color: AUTHORITY_COLOR }}>
                <FaFireExtinguisher className="mr-2" style={{ color: AUTHORITY_COLOR }} />
                {language === 'en' ? 'Edit Firefighter' : 'ফায়ারফাইটার সম্পাদনা করুন'}
              </h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditTarget(null);
                }} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // For debugging
                console.log('Submitting firefighter edit data:', data);
                
                handleEdit(data);
              }} className="space-y-4">
                {/* Username field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Username' : 'ব্যবহারকারীর নাম'} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={editTarget.username}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Password' : 'পাসওয়ার্ড'} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password to change"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'Leave blank to keep current password' : 'বর্তমান পাসওয়ার্ড রাখতে খালি রাখুন'}
                  </p>
                </div>
                
                {/* Name field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Full Name' : 'পুরো নাম'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editTarget.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editTarget.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Phone number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    defaultValue={editTarget.phoneNumber || editTarget.phone_number}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Badge Number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Badge Number' : 'ব্যাজ নম্বর'} *
                  </label>
                  <input
                    type="text"
                    name="badgeNumber"
                    defaultValue={editTarget.badgeNumber}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Years of Service field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Years of Service' : 'সেবার বছর'} *
                  </label>
                  <input
                    type="number"
                    name="yearsOfService"
                    defaultValue={editTarget.yearsOfService}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Status field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Account Status' : 'অ্যাকাউন্ট স্ট্যাটাস'}
                  </label>
                  <select
                    name="status"
                    defaultValue={editTarget.status || 'active'}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">{language === 'en' ? 'Active' : 'সক্রিয়'}</option>
                    <option value="inactive">{language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: AUTHORITY_COLOR, borderColor: AUTHORITY_COLOR }}
                  >
                    {language === 'en' ? 'Update Firefighter' : 'ফায়ারফাইটার আপডেট করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editTarget && activeTab === 'ngos' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center" style={{ color: AUTHORITY_COLOR }}>
                <FaHandHoldingHeart className="mr-2" style={{ color: AUTHORITY_COLOR }} />
                {language === 'en' ? 'Edit NGO' : 'এনজিও সম্পাদনা করুন'}
              </h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditTarget(null);
                }} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // For debugging
                console.log('Submitting NGO edit data:', data);
                
                handleEdit(data);
              }} className="space-y-4">
                {/* Organization Name field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Organization Name' : 'সংগঠনের নাম'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editTarget.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editTarget.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Phone number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    defaultValue={editTarget.phoneNumber || editTarget.phone_number}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Address field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Address' : 'ঠিকানা'}
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editTarget.address || editTarget.location}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Status field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Account Status' : 'অ্যাকাউন্ট স্ট্যাটাস'}
                  </label>
                  <select
                    name="status"
                    defaultValue={editTarget.status || 'active'}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">{language === 'en' ? 'Active' : 'সক্রিয়'}</option>
                    <option value="inactive">{language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: AUTHORITY_COLOR, borderColor: AUTHORITY_COLOR }}
                  >
                    {language === 'en' ? 'Update NGO' : 'এনজিও আপডেট করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editTarget && activeTab === 'authorities' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center" style={{ color: AUTHORITY_COLOR }}>
                <FaUserShield className="mr-2" style={{ color: AUTHORITY_COLOR }} />
                {language === 'en' ? 'Edit Authority' : 'কর্তৃপক্ষ সম্পাদনা করুন'}
              </h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditTarget(null);
                }} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // For debugging
                console.log('Submitting authority edit data:', data);
                
                handleEdit(data);
              }} className="space-y-4">
                {/* Username field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Username' : 'ব্যবহারকারীর নাম'} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={editTarget.username}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Password' : 'পাসওয়ার্ড'} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password to change"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'Leave blank to keep current password' : 'বর্তমান পাসওয়ার্ড রাখতে খালি রাখুন'}
                  </p>
                </div>
                
                {/* Name field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Full Name' : 'পুরো নাম'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editTarget.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editTarget.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Phone number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    defaultValue={editTarget.phoneNumber || editTarget.phone_number}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Department field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Department' : 'বিভাগ'} *
                  </label>
                  <input
                    type="text"
                    name="department"
                    defaultValue={editTarget.department}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Badge Number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Badge Number' : 'ব্যাজ নম্বর'} *
                  </label>
                  <input
                    type="text"
                    name="badgeNumber"
                    defaultValue={editTarget.badgeNumber}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                {/* Status field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Account Status' : 'অ্যাকাউন্ট স্ট্যাটাস'}
                  </label>
                  <select
                    name="status"
                    defaultValue={editTarget.status || 'active'}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">{language === 'en' ? 'Active' : 'সক্রিয়'}</option>
                    <option value="inactive">{language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: AUTHORITY_COLOR, borderColor: AUTHORITY_COLOR }}
                  >
                    {language === 'en' ? 'Update Authority' : 'কর্তৃপক্ষ আপডেট করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AuthorityLayout>
  );
};

export default AuthorityDashboard; 