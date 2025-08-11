import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaTint, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaSpinner } from 'react-icons/fa';

const BloodDonors = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/donations/blood-donors');
        if (response.data.success) {
          setDonors(response.data.donors);
          setFilteredDonors(response.data.donors);
        } else {
          setError('Failed to fetch donors');
        }
      } catch (error) {
        console.error('Error fetching blood donors:', error);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonors();
  }, []);
  
  useEffect(() => {
    let filtered = [...donors];
    
    // Filter by blood type if selected
    if (selectedBloodType) {
      filtered = filtered.filter(donor => donor.blood_type === selectedBloodType);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(donor => 
        donor.name.toLowerCase().includes(query) ||
        donor.location.toLowerCase().includes(query)
      );
    }
    
    setFilteredDonors(filtered);
  }, [selectedBloodType, searchQuery, donors]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0 flex items-center">
            <FaTint className="text-red-500 mr-2" /> Blood Donors Registry
          </h2>
          
          {/* Search Bar */}
          <div className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Blood Type Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedBloodType === '' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedBloodType('')}
          >
            All Types
          </button>
          
          {bloodTypes.map(type => (
            <button
              key={type}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedBloodType === type 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setSelectedBloodType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        
        {/* Donors List */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <FaSpinner className="text-red-500 animate-spin text-3xl" />
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded text-red-700 dark:text-red-100">
            {error}
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No blood donors found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Available Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDonors.map((donor, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <FaTint className="mr-1" /> {donor.blood_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {donor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {donor.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {formatDate(donor.available_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <FaPhone className="mr-2 text-gray-400" />
                        {donor.phone_number}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodDonors; 