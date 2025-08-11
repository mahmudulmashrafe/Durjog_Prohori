import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useNGOAuth } from '../../context/NGOAuthContext';
import { FaHandHoldingHeart, FaClipboardList, FaMapMarkedAlt, FaBoxOpen, FaBell, FaUser, FaBars, FaLanguage, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';

const NGOLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  const { ngo, loading, logout, refreshProfile } = useNGOAuth();
  const [isSidebarHidden, setIsSidebarHidden] = useState(true);
  const profileFetchedRef = useRef(false);
  
  // Only fetch complete profile data once when component first mounts if needed
  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        if (ngo && !profileFetchedRef.current) {
          // Check if we're missing any essential fields
          const missingFields = !ngo.organization || 
            !ngo.phoneNumber || 
            !ngo.resources;
          
          if (missingFields) {
            console.log("Missing fields detected in profile data, fetching complete profile...");
            await refreshProfile();
            profileFetchedRef.current = true;
          } else {
            profileFetchedRef.current = true;
          }
        }
      } catch (error) {
        console.error("Error fetching full profile:", error);
      }
    };

    fetchFullProfile();
    // Only depend on NGO's existence, not its content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!ngo]);
  
  const toggleSidebar = () => {
    setIsSidebarHidden(!isSidebarHidden);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/ngo/signin');
  };

  const menuItems = [
    {
      path: '/ngo/dashboard',
      icon: <FaHandHoldingHeart className="h-5 w-5" />,
      label: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'
    },
    {
      path: '/ngo/reports',
      icon: <FaClipboardList className="h-5 w-5" />,
      label: language === 'en' ? 'Disaster Reports' : 'দুর্যোগ প্রতিবেদন'
    },
    {
      path: '/ngo/map',
      icon: <FaMapMarkedAlt className="h-5 w-5" />,
      label: language === 'en' ? 'Map' : 'মানচিত্র'
    },
    {
      path: '/ngo/resources',
      icon: <FaBoxOpen className="h-5 w-5" />,
      label: language === 'en' ? 'Resources' : 'সম্পদ'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <span className="ml-3">Loading...</span>
        </div>
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-white">
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-xl text-green-600 font-bold mb-4">Session expired or not authenticated</p>
          <button 
            onClick={() => navigate('/ngo/signin')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // Check if current page is map page
  const isMapPage = location.pathname === '/ngo/map';

  return (
    <div className={`relative flex flex-col ${isMapPage ? 'h-screen overflow-hidden p-0 m-0' : 'min-h-screen'} w-full`}>
      {/* Left Sidebar - Vertical Navigation (overlays content) */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-black shadow-lg z-[100] flex-shrink-0 md:block transition-transform duration-200 ease-in-out ${isSidebarHidden ? 'transform -translate-x-full' : 'transform translate-x-0'}`}>
        {/* App Name and Toggle */}
        <div className="flex items-center justify-between h-14 border-b border-gray-200 dark:border-gray-800 px-4 bg-green-600 text-white">
          <div className="text-white font-bold text-xl">দুর্যোগ প্রহরী</div>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded text-white hover:bg-opacity-80 focus:outline-none"
            style={{ backgroundColor: 'transparent' }}
            aria-label="Toggle sidebar"
          >
            <FaBars className="h-5 w-5" />
          </button>
        </div>
        
        {/* Menu Items */}
        <div className="py-4 w-full">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 w-full transition-colors ${
                location.pathname === item.path
                  ? 'bg-gray-100 dark:bg-gray-800 text-green-600 dark:text-green-400'
                  : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          
          <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>
          
          <button
            onClick={toggleLanguage}
            className="flex items-center w-full text-left px-4 py-3 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaLanguage className="h-5 w-5 mr-3" />
            <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
          
          <button
            onClick={toggleTheme}
            className="flex items-center w-full text-left px-4 py-3 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? <FaSun className="h-5 w-5 mr-3" /> : <FaMoon className="h-5 w-5 mr-3" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left px-4 py-3 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaSignOutAlt className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 w-full ${isMapPage ? 'h-screen absolute top-0 left-0 right-0 bottom-0' : ''}`}>
        {/* Floating Notification and Profile Icons */}
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 ${isMapPage ? 'bg-transparent' : ''}`}>
          <button
            className="p-3 rounded-full bg-white shadow-md text-green-500 hover:bg-gray-100 relative"
            aria-label="Notifications"
          >
            <FaBell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
          </button>
          
          <Link
            to="/ngo/profile"
            className="flex items-center p-3 rounded-full bg-white shadow-md text-green-500 hover:bg-gray-100 focus:outline-none"
          >
            <FaUser className="h-6 w-6" />
          </Link>
        </div>

        {/* Hamburger Menu Button */}
        <div className={`fixed top-4 left-4 z-50 ${isMapPage ? 'bg-transparent' : ''}`}>
          <button
            onClick={toggleSidebar}
            className="p-3 rounded-full bg-white shadow-md text-green-500 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <FaBars className="h-7 w-7" />
          </button>
        </div>

        {/* Main Content */}
        <main className={`w-full h-full ${isMapPage ? 'absolute top-0 left-0 right-0 bottom-0 p-0' : 'p-4'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default NGOLayout; 