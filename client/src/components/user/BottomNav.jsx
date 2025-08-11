import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBell, FaUser, FaExclamationTriangle, FaUsers } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { darkMode } = useTheme();

  const navItems = [
    { path: '/user/home', icon: <FaHome />, label: t('home') },
    { path: '/user/alerts', icon: <FaExclamationTriangle />, label: t('alert') },
    { path: '/user/community', icon: <FaUsers />, label: t('community') },
    { path: '/user/notification', icon: <FaBell />, label: t('notification') },
    { path: '/user/profile', icon: <FaUser />, label: t('profile') }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} z-50 pb-6`}>
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                location.pathname === item.path
                  ? darkMode
                    ? 'text-blue-400'
                    : 'text-primary'
                  : darkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;