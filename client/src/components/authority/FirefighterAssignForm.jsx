import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

const FirefighterAssignForm = ({ disaster, onAssign, onCancel }) => {
  const { language } = useLanguage();
  const [firefighters, setFirefighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFirefighter, setSelectedFirefighter] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFirefighters = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/firefighters');
        setFirefighters(response.data);
        setLoading(false);
      } catch (err) {
        setError(language === 'en' 
          ? 'Failed to load firefighters. Please try again.' 
          : 'অগ্নিনির্বাপক লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setLoading(false);
      }
    };

    fetchFirefighters();
  }, [language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFirefighter) {
      setMessage(language === 'en' 
        ? 'Please select a firefighter team' 
        : 'অনুগ্রহ করে একটি অগ্নিনির্বাপক দল নির্বাচন করুন');
      return;
    }

    try {
      onAssign(selectedFirefighter);
    } catch (err) {
      setMessage(language === 'en' 
        ? 'Failed to assign firefighter. Please try again.' 
        : 'অগ্নিনির্বাপক নিয়োগ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
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
          {language === 'en' ? 'Select Firefighter Team' : 'অগ্নিনির্বাপক দল নির্বাচন করুন'}
        </label>
        <select
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={selectedFirefighter}
          onChange={(e) => setSelectedFirefighter(e.target.value)}
        >
          <option value="">{language === 'en' ? '-- Select Team --' : '-- দল নির্বাচন করুন --'}</option>
          {firefighters.map((firefighter) => (
            <option key={firefighter._id} value={firefighter._id}>
              {firefighter.name} - {firefighter.station} ({firefighter.available ? 
                (language === 'en' ? 'Available' : 'উপলব্ধ') : 
                (language === 'en' ? 'Busy' : 'ব্যস্ত')})
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          {language === 'en' ? 'Emergency Details' : 'জরুরী বিবরণ'}
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          rows="3"
          placeholder={language === 'en' 
            ? 'Additional details about the emergency...' 
            : 'জরুরী অবস্থা সম্পর্কে অতিরিক্ত বিবরণ...'}
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          {language === 'en' ? 'Priority Level' : 'অগ্রাধিকার স্তর'}
        </label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input type="radio" name="priority" value="high" className="form-radio text-red-600" />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{language === 'en' ? 'High' : 'উচ্চ'}</span>
          </label>
          <label className="inline-flex items-center">
            <input type="radio" name="priority" value="medium" className="form-radio text-yellow-500" defaultChecked />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{language === 'en' ? 'Medium' : 'মধ্যম'}</span>
          </label>
          <label className="inline-flex items-center">
            <input type="radio" name="priority" value="low" className="form-radio text-green-500" />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{language === 'en' ? 'Low' : 'নিম্ন'}</span>
          </label>
        </div>
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
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {language === 'en' ? 'Assign Team' : 'দল নিয়োগ করুন'}
        </button>
      </div>
    </form>
  );
};

export default FirefighterAssignForm; 