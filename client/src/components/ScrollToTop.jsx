import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// This component handles scrolling to top when navigating between routes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Only scroll to top if the path has changed
    if (prevPathRef.current !== pathname) {
      // Try both methods to ensure compatibility across browsers
      if (window.scrollTo) {
        // Method 1: Simple immediate scroll
        window.scrollTo(0, 0);
      }
      
      if (document.documentElement) {
        // Method 2: Set scroll on HTML element
        document.documentElement.scrollTop = 0;
      }
      
      if (document.body) {
        // Method 3: Set scroll on body
        document.body.scrollTop = 0;
      }
      
      // Update the previous path
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  // Also handle on component mount
  useEffect(() => {
    // Force scroll to top on initial load
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Add CSS to ensure global scroll behavior is auto, not smooth
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default ScrollToTop; 