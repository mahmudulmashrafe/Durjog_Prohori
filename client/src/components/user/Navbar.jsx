import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { BsSun, BsMoon } from 'react-icons/bs';
import { FaExclamationTriangle } from 'react-icons/fa';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if dark mode is enabled in localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              দুর্যোগ প্রহরী
            </span>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {isAuthenticated && (
              <>
                <Link
                  to="/user/alerts"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative"
                >
                  <FaExclamationTriangle className="text-xl text-yellow-500" />
                </Link>
                <div className="hidden">
                  <NotificationBell />
                </div>
              </>
            )}
            
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              {isDarkMode ? (
                <BsSun className="text-xl text-yellow-500" />
              ) : (
                <BsMoon className="text-xl" />
              )}
            </button>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 