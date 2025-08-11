import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFirefighterAuth } from '../../context/FirefighterAuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { FaFireExtinguisher, FaSpinner } from 'react-icons/fa';

const FirefighterLogin = () => {
  const { login, error, clearError } = useFirefighterAuth();
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errorMessage) setErrorMessage('');
    if (error) clearError();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username.trim() || !formData.password.trim()) {
      setErrorMessage(language === 'en' 
        ? 'Please enter both username and password' 
        : 'অনুগ্রহ করে ইউজারনেম এবং পাসওয়ার্ড উভয়ই লিখুন।');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate('/firefighter/dashboard');
      } else {
        setErrorMessage(result.message || (language === 'en' 
          ? 'Login failed. Please check your credentials.' 
          : 'লগইন ব্যর্থ হয়েছে। আপনার তথ্য পরীক্ষা করুন।'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(language === 'en' 
        ? 'An unexpected error occurred. Please try again.' 
        : 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full space-y-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-10 rounded-xl shadow-lg`}>
        <div>
          <div className="flex justify-center">
            <FaFireExtinguisher className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            {language === 'en' ? 'Firefighter Portal' : 'অগ্নিনির্বাপক পোর্টাল'}
          </h2>
          <p className="mt-2 text-center text-sm">
            {language === 'en' ? 'Sign in to your account' : 'আপনার অ্যাকাউন্টে সাইন ইন করুন'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                {language === 'en' ? 'Username' : 'ইউজারনেম'}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${darkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'} placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm`}
                placeholder={language === 'en' ? 'Username' : 'ইউজারনেম'}
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${darkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'} placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm`}
                placeholder={language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {(errorMessage || error) && (
            <div className="text-red-500 text-sm mt-2">
              {errorMessage || error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                  {language === 'en' ? 'Signing in...' : 'সাইন ইন হচ্ছে...'}
                </>
              ) : (
                language === 'en' ? 'Sign in' : 'সাইন ইন'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-red-600 hover:text-red-500">
            {language === 'en' ? '← Back to Home' : '← হোমে ফিরে যান'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FirefighterLogin; 