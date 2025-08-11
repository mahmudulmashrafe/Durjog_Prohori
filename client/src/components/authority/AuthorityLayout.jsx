import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuthorityAuth } from '../../context/AuthorityAuthContext';
import { FaBell, FaUser, FaBars, FaLanguage, FaMoon, FaSun, FaSignOutAlt, FaTachometerAlt, FaExclamationTriangle, FaMapMarkedAlt, FaHeadset, FaUserFriends } from 'react-icons/fa';
import axios from 'axios';
import './AuthorityLayout.css';

// Define the authority theme color
const AUTHORITY_COLOR = 'rgb(88, 10, 107)';
const AUTHORITY_HOVER_COLOR = 'rgb(110, 15, 135)';

const AuthorityLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  const { logout } = useAuthorityAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [authorityData, setAuthorityData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const profileFetchedRef = useRef(false);
  
  // Added state for disaster tab selection
  const [activeDisasterTab, setActiveDisasterTab] = useState('Earthquake');
  
  // Check if current page is disasters page
  const isDisastersPage = location.pathname === '/authority/disasters';

  // Disaster type tabs data
  const disasterTypes = [
    { value: 'Earthquake', label: language === 'en' ? 'Earthquake' : 'ভূমিকম্প' },
    { value: 'Flood', label: language === 'en' ? 'Flood' : 'বন্যা' },
    { value: 'Cyclone', label: language === 'en' ? 'Cyclone' : 'সাইক্লোন' },
    { value: 'Landslide', label: language === 'en' ? 'Landslide' : 'ভূমিধস' },
    { value: 'Tsunami', label: language === 'en' ? 'Tsunami' : 'সুনামি' },
    { value: 'Fire', label: language === 'en' ? 'Fire' : 'আগুন' },
    { value: 'Other', label: language === 'en' ? 'Other' : 'অন্যান্য' }
  ];

  // Fetch authority data
  useEffect(() => {
    const fetchAuthorityData = async () => {
      if (profileFetchedRef.current) return;
      
      try {
        const response = await axios.get('/api/authority/profile');
        if (response.data.success) {
          setAuthorityData(response.data.authority);
          profileFetchedRef.current = true;
        }
      } catch (error) {
        console.error('Error fetching authority data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorityData();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleSidebar = () => {
    setIsSidebarHidden(!isSidebarHidden);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/authority/signin');
  };

  const menuItems = [
    {
      path: '/authority/dashboard',
      icon: <FaTachometerAlt className="h-5 w-5" />,
      label: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'
    },
    {
      path: '/authority/disasters',
      icon: <FaExclamationTriangle className="h-5 w-5" />,
      label: language === 'en' ? 'Disasters' : 'দুর্যোগ'
    },
    {
      path: '/authority/map',
      icon: <FaMapMarkedAlt className="h-5 w-5" />,
      label: language === 'en' ? 'Map' : 'মানচিত্র'
    },
    {
      path: '/authority/sos-reports',
      icon: <FaHeadset className="h-5 w-5" />,
      label: language === 'en' ? 'Disaster Reported' : 'দুর্যোগ রিপোর্ট'
    },
    {
      path: '/authority/isubmit-reports',
      icon: <FaHeadset className="h-5 w-5" />,
      label: "SOS"
    },
    {
      path: '/authority/donation-manage',
      icon: <FaUserFriends className="h-5 w-5" />,
      label: language === 'en' ? 'Donation Management' : 'দান ব্যবস্থাপনা'
    }
  ];

  // Check if current page is map page
  const isMapPage = location.pathname === '/authority/map';

  return (
    <div className={`relative flex flex-col ${isMapPage ? 'h-screen overflow-hidden' : 'min-h-screen'} w-full`}>
      {/* Left Sidebar - Vertical Navigation (overlays content) */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-black shadow-lg z-[100] flex-shrink-0 md:block transition-transform duration-200 ease-in-out ${isSidebarHidden ? 'transform -translate-x-full' : 'transform translate-x-0'}`}>
        {/* App Name and Toggle */}
        <div className="flex items-center justify-between h-14 border-b border-gray-200 dark:border-gray-800 px-4 text-white" style={{ backgroundColor: AUTHORITY_COLOR }}>
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
        
        {/* Menu Items - Full width with no gaps */}
        <div className="py-4 w-full">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 w-full transition-colors border-0 ${
              location.pathname === item.path
                ? 'bg-gray-100 dark:bg-gray-800' : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            style={location.pathname === item.path ? { color: AUTHORITY_COLOR } : {}}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      
        {/* Divider - Full width */}
        <div className="my-3 border-t border-gray-200 dark:border-gray-700 w-full"></div>
          
        {/* Settings Section */}
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center w-full text-left px-4 py-3 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border-0 transition-colors"
        >
          <FaLanguage className="h-5 w-5 mr-3" />
          <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
        </button>
          
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center w-full text-left px-4 py-3 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border-0 transition-colors"
        >
          {darkMode ? <FaSun className="h-5 w-5 mr-3" /> : <FaMoon className="h-5 w-5 mr-3" />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
            
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-left px-4 py-3 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border-0 transition-colors"
        >
          <FaSignOutAlt className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
        </div>
      </div>
      
      {/* Floating Notification and Profile Icons */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-3">
        {/* Notifications */}
        <button
          className="p-3 rounded-full bg-white shadow-md hover:bg-gray-100 relative"
          style={{ color: AUTHORITY_COLOR }}
          aria-label="Notifications"
        >
          <FaBell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
          </button>
          
        {/* Profile Link */}
          <Link
            to="/authority/profile"
          className="flex items-center p-3 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
          style={{ color: AUTHORITY_COLOR }}
          >
          <FaUser className="h-6 w-6" />
        </Link>
      </div>
      
      {/* Centered Disaster Type Tabs */}
      {isDisastersPage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden px-3 py-2">
            {disasterTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setActiveDisasterTab(type.value);
                  // Dispatch custom event to notify AuthorityDisasters component
                  const event = new CustomEvent('disasterTabChange', { 
                    detail: { activeTab: type.value } 
                  });
                  document.dispatchEvent(event);
                }}
                className={`px-4 py-2 mx-1 text-sm font-medium rounded-md transition-colors ${
                  activeDisasterTab === type.value
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={activeDisasterTab === type.value ? { backgroundColor: AUTHORITY_COLOR } : {}}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Hamburger Menu - Only visible when sidebar is hidden */}
      {isSidebarHidden && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={toggleSidebar}
            className="p-3 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
            style={{ color: AUTHORITY_COLOR }}
            aria-label="Toggle sidebar"
          >
            <FaBars className="h-7 w-7" />
          </button>
        </div>
      )}
          
      {/* Mobile Menu Toggle Button */}
      <div className="fixed top-4 left-16 z-60 md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none transition-transform duration-300"
          style={{ color: AUTHORITY_COLOR }}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="h-5 w-5 transition-transform duration-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`fixed top-16 left-0 right-0 md:hidden z-40 shadow-md transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`} style={{ backgroundColor: AUTHORITY_COLOR }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-2 mx-2 my-1 rounded-md text-white transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-opacity-80'
                : 'hover:bg-opacity-60'
            }`}
            style={{ backgroundColor: location.pathname === item.path ? AUTHORITY_HOVER_COLOR : 'transparent' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        
        {/* Settings for mobile */}
        <button
          onClick={toggleLanguage}
          className="flex items-center w-full text-left px-4 py-2 mx-2 my-1 rounded-md text-white hover:bg-opacity-60"
          style={{ backgroundColor: 'transparent' }}
        >
          <FaLanguage className="h-5 w-5 mr-3" />
          <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
        </button>
        
        <button
          onClick={toggleTheme}
          className="flex items-center w-full text-left px-4 py-2 mx-2 my-1 rounded-md text-white hover:bg-opacity-60"
          style={{ backgroundColor: 'transparent' }}
        >
          {darkMode ? <FaSun className="h-5 w-5 mr-3" /> : <FaMoon className="h-5 w-5 mr-3" />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        
        {/* Add Logout option to mobile menu */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-left px-4 py-2 mx-2 my-1 rounded-md text-white hover:bg-opacity-60"
          style={{ backgroundColor: 'transparent' }}
        >
          <FaSignOutAlt className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full transition-all duration-300">
        {/* Content Area with no top padding */}
        <div className={`pt-0 p-0 ${isMapPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthorityLayout; 