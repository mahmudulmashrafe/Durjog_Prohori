import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

const NgoAssignForm = ({ disaster, onAssign, onCancel }) => {
  const { language } = useLanguage();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNgo, setSelectedNgo] = useState('');
  const [message, setMessage] = useState('');
  const [resourcesNeeded, setResourcesNeeded] = useState({
    food: false,
    water: false,
    medicine: false,
    shelter: false,
    clothing: false,
    other: false
  });
  const [otherResources, setOtherResources] = useState('');

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/ngos');
        setNgos(response.data);
        setLoading(false);
      } catch (err) {
        setError(language === 'en' 
          ? 'Failed to load NGOs. Please try again.' 
          : 'এনজিও লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setLoading(false);
      }
    };

    fetchNgos();
  }, [language]);

  const handleResourceChange = (resource) => {
    setResourcesNeeded({ 
      ...resourcesNeeded, 
      [resource]: !resourcesNeeded[resource] 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedNgo) {
      setMessage(language === 'en' 
        ? 'Please select an NGO' 
        : 'অনুগ্রহ করে একটি এনজিও নির্বাচন করুন');
      return;
    }

    // Get selected resources
    const selectedResources = Object.keys(resourcesNeeded)
      .filter(key => resourcesNeeded[key])
      .map(key => key === 'other' ? otherResources : key);

    try {
      onAssign(selectedNgo, selectedResources);
    } catch (err) {
      setMessage(language === 'en' 
        ? 'Failed to assign NGO. Please try again.' 
        : 'এনজিও নিয়োগ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg mb-4">
        {error}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <div className="p-3 mb-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
          {message}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          {language === 'en' ? 'Select NGO' : 'এনজিও নির্বাচন করুন'}
        </label>
        <select
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={selectedNgo}
          onChange={(e) => setSelectedNgo(e.target.value)}
        >
          <option value="">{language === 'en' ? '-- Select NGO --' : '-- এনজিও নির্বাচন করুন --'}</option>
          {ngos.map((ngo) => (
            <option key={ngo._id} value={ngo._id}>
              {ngo.name} - {ngo.specialization} ({ngo.available ? 
                (language === 'en' ? 'Available' : 'উপলব্ধ') : 
                (language === 'en' ? 'Busy' : 'ব্যস্ত')})
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          {language === 'en' ? 'Resources Needed' : 'প্রয়োজনীয় সংস্থান'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600" 
              checked={resourcesNeeded.food}
              onChange={() => handleResourceChange('food')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Food' : 'খাবার'}
            </span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600" 
              checked={resourcesNeeded.water}
              onChange={() => handleResourceChange('water')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Water' : 'পানি'}
            </span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600" 
              checked={resourcesNeeded.medicine}
              onChange={() => handleResourceChange('medicine')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Medicine' : 'ঔষধ'}
            </span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600" 
              checked={resourcesNeeded.shelter}
              onChange={() => handleResourceChange('shelter')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Shelter' : 'আশ্রয়'}
            </span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600" 
              checked={resourcesNeeded.clothing}
              onChange={() => handleResourceChange('clothing')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Clothing' : 'পোশাক'}
            </span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600" 
              checked={resourcesNeeded.other}
              onChange={() => handleResourceChange('other')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Other' : 'অন্যান্য'}
            </span>
          </label>
        </div>
        
        {resourcesNeeded.other && (
          <input
            type="text"
            className="mt-2 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            placeholder={language === 'en' ? 'Specify other resources...' : 'অন্যান্য সংস্থান উল্লেখ করুন...'}
            value={otherResources}
            onChange={(e) => setOtherResources(e.target.value)}
          />
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          {language === 'en' ? 'Additional Notes' : 'অতিরিক্ত নোট'}
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          rows="3"
          placeholder={language === 'en' 
            ? 'Any specific requirements or details...' 
            : 'কোন নির্দিষ্ট প্রয়োজন বা বিবরণ...'}
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
        >
          {language === 'en' ? 'Cancel' : 'বাতিল করুন'}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {language === 'en' ? 'Assign NGO' : 'এনজিও নিয়োগ করুন'}
        </button>
      </div>
    </form>
  );
};

export default NgoAssignForm; 