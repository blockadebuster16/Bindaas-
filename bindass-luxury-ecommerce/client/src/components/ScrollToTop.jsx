import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on every route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Avoid smooth scrolling interference when changing pages
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
