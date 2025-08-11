import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLock, FaUser, FaExclamationCircle, FaShieldAlt, FaHome, FaArrowRight } from 'react-icons/fa';
import { useAuthorityAuth } from '../context/AuthorityAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const AuthoritySignIn = () => {
  const { login, error } = useAuthorityAuth();
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { username, password } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    // Validate form
    if (!username || !password) {
      setFormError(language === 'en' ? 'Please enter both username and password' : 'অনুগ্রহ করে ইউজারনেম এবং পাসওয়ার্ড উভয়ই লিখুন');
      return;
    }
    
    setLoading(true);
    setFormError('');
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        navigate('/authority/dashboard');
      } else {
        setFormError(result.message || (language === 'en' ? 'Login failed' : 'লগইন ব্যর্থ হয়েছে'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormError(language === 'en' ? 'An error occurred during login' : 'লগইন করার সময় একটি ত্রুটি ঘটেছে');
    }
    
    setLoading(false);
  };

  // Add ripple effect to buttons
  useEffect(() => {
    const buttons = document.querySelectorAll('.ripple-button');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
    
    return () => {
      buttons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
      });
    };
  }, []);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Restored original header */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-500 p-3 flex justify-between items-center shadow-md z-10">
        <Link to="/" className="flex items-center space-x-2">
          <FaShieldAlt className="h-6 w-6 text-white" />
          <div className="text-white font-bold text-xl">
            {language === 'en' ? 'Durjog Prohori' : 'দুর্যোগ প্রহরী'}
          </div>
        </Link>
        <div className="flex space-x-4">
          <button
            onClick={toggleLanguage}
            className="ripple-button relative overflow-hidden text-white hover:bg-red-700 rounded-md px-3 py-1 transition-colors"
          >
            {language === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button
            onClick={toggleTheme}
            className="ripple-button relative overflow-hidden text-white hover:bg-red-700 rounded-md px-3 py-1 transition-colors mr-1"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      
      {/* Keep form positioned high and prevent scrolling */}
      <main className="flex flex-col items-center px-4 sm:px-6 lg:px-8 overflow-hidden h-screen" style={{ paddingTop: "70px" }}>
        <div className="max-w-xs w-full">
          {/* Card with login form - rectangular (height > width) */}
          <div>
            <div className="bg-white dark:bg-gray-800 py-4 px-4 shadow-md sm:rounded-lg sm:px-5 border border-gray-200 dark:border-gray-700">
              {/* Title moved inside form - larger and bolder */}
              <h2 className="text-center text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
                {language === 'en' ? 'Authority Portal' : 'কর্তৃপক্ষ পোর্টাল'}
          </h2>
              
              {/* Form error message - more compact */}
              {(formError || error) && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-2 rounded-r">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaExclamationCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {formError || error}
                      </p>
                    </div>
                  </div>
      </div>
              )}
      
              <form className="space-y-4" onSubmit={onSubmit}>
                {/* Username field */}
            <div>
                  <label htmlFor="username" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'en' ? 'Username' : 'ইউজারনেম'}
              </label>
                  <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={onChange}
                  className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 transition dark:bg-gray-700 dark:text-white text-sm"
                  placeholder={language === 'en' ? 'Enter your username' : 'আপনার ইউজারনেম লিখুন'}
                  autoComplete="username"
                />
              </div>
            </div>
            
                {/* Password field */}
            <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
              </label>
                  <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={onChange}
                  className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 transition dark:bg-gray-700 dark:text-white text-sm"
                  placeholder={language === 'en' ? 'Enter your password' : 'আপনার পাসওয়ার্ড লিখুন'}
                  autoComplete="current-password"
                />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                  </div>
                  </div>
                </div>
            
                {/* Submit button */}
                <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="ripple-button relative overflow-hidden w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {language === 'en' ? 'Signing in...' : 'সাইন ইন হচ্ছে...'}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{language === 'en' ? 'Sign in' : 'সাইন ইন'}</span>
                    <FaArrowRight className="h-4 w-4" aria-hidden="true" />
                  </div>
                )}
              </button>
            </div>
          </form>
          
              {/* More compact spacing for footer links */}
              <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {language === 'en' ? 'Or' : 'অথবা'}
                </span>
                  </div>
              </div>
            </div>
            
              {/* Home page link - more compact */}
              <div className="mt-3">
              <Link
                to="/"
                className="ripple-button relative overflow-hidden w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaHome className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                  </span>
                  {language === 'en' ? 'Return to Home Page' : 'হোম পেজে ফিরে যান'}
              </Link>
              </div>
            </div>
          </div>
          
          {/* Footer text */}
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>
              {language === 'en' 
                ? '© 2023 Durjog Prohori. All rights reserved.' 
                : '© ২০২৩ দুর্যোগ প্রহরী। সর্বস্বত্ব সংরক্ষিত।'}
            </p>
          </div>
        </div>
      </main>
      
      {/* CSS for ripple effect */}
      <style type="text/css">
        {`
          .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 600ms linear;
            background-color: rgba(255, 255, 255, 0.7);
          }
          
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AuthoritySignIn; 