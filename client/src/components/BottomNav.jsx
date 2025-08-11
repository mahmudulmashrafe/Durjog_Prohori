import React, { useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaMapMarkerAlt, FaExclamationCircle, FaExclamationTriangle, FaUsers, FaGlobe, FaUser } from 'react-icons/fa';

const NavLink = React.memo(({ to, isActive, icon: Icon, label, onTouchStart }) => {
  // Common styles for both desktop and mobile
  const commonStyles = `flex items-center justify-center transition-all duration-150 ${
    isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
  }`;

  // Mobile-specific styles (bottom nav)
  const mobileStyles = `flex-col flex-1 min-w-0`;

  // Desktop-specific styles (sidebar)
  const desktopStyles = `w-full px-4 py-3 mb-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800`;

  return (
  <Link
    to={to}
    onTouchStart={onTouchStart}
      className={`${commonStyles} md:${desktopStyles} ${mobileStyles} md:flex-row md:justify-start md:space-x-4 select-none active:scale-95`}
    style={{ WebkitTapHighlightColor: 'transparent' }}
  >
      <Icon className={`text-lg transform transition-transform ${isActive ? 'scale-110' : ''} md:text-2xl`} />
      <span className="text-[10px] mt-0.5 font-medium md:text-base md:mt-0 truncate">{label}</span>
  </Link>
  );
});

NavLink.displayName = 'NavLink';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const commonNavLinks = useMemo(() => [
    { to: '/user/home', icon: FaHome, label: 'Home' },
    { to: '/user/disaster', icon: FaExclamationTriangle, label: 'Disaster' },
    { to: '/user/map', icon: FaMapMarkerAlt, label: 'Map' },
    { to: '/user/earthquakes', icon: FaGlobe, label: 'Report' },
    { to: '/user/sos', icon: FaExclamationCircle, label: 'SOS' },
    { to: '/user/community', icon: FaUsers, label: 'Community' }
  ], []);

  const desktopNavLinks = useMemo(() => [
    ...commonNavLinks,
    { to: '/user/profile', icon: FaUser, label: 'Profile' }
  ], [commonNavLinks]);

  const isActive = useCallback((path) => {
    if (path === '/user/disaster') {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  }, [location.pathname]);

  const handleTouchStart = useCallback((to) => {
    navigate(to, { replace: true });
  }, [navigate]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 flex-col transition-colors duration-200">
        <div className="flex flex-col space-y-2">
          {desktopNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              isActive={isActive(link.to)}
              onTouchStart={() => handleTouchStart(link.to)}
            />
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-safe-area transition-colors duration-200">
        <div className="grid grid-cols-6 gap-0 px-1 py-1">
          {commonNavLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            isActive={isActive(link.to)}
            onTouchStart={() => handleTouchStart(link.to)}
          />
        ))}
      </div>
    </div>
    </>
  );
};

BottomNav.displayName = 'BottomNav';

export default BottomNav; 