import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import PixelBackground from './components/PixelBackground';
import CustomCursor from './components/CustomCursor';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

// Lazy-load below-the-fold components (includes framer-motion)
const Portfolio = lazy(() => import('./components/Portfolio'));
const Experience = lazy(() => import('./components/Experience'));
const Footer = lazy(() => import('./components/Footer'));
const Archive = lazy(() => import('./components/Archive'));

// Lazy-load analytics
const Analytics = lazy(() =>
  import('@vercel/analytics/react').then(m => ({ default: m.Analytics }))
);
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then(m => ({ default: m.SpeedInsights }))
);

// Component to handle animations and scroll on route change
const NavigationHandler = () => {
  const { pathname, hash } = useLocation();
  const location = useLocation();

  // Scroll handling
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const scrollToHash = () => {
      const element = document.querySelector(hash);
      element?.scrollIntoView({ behavior: 'smooth' });
      return Boolean(element);
    };

    if (scrollToHash()) return;

    // Lazy-loaded sections may not exist yet on a direct visit.
    const observer = new MutationObserver(() => {
      if (scrollToHash()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname, hash]);

  // Animation handling
  useEffect(() => {
    const shouldPreventAnimation = location.state?.preventAnimation;

    if (shouldPreventAnimation) {
      // Returning from Archive: Make everything visible immediately
      const elements = document.querySelectorAll('.animate-on-scroll, .section');
      elements.forEach(el => el.classList.add('visible'));
    } else {
      // Normal load: Setup observer
      const observerOptions = {
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const sections = document.querySelectorAll('.section');
      sections.forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
      });

      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      animatedElements.forEach(el => observer.observe(el));

      return () => observer.disconnect();
    }
  }, [location.state]);

  return null;
};

// Main Home Component (Existing Layout)
const Home = () => (
  <>
    <PixelBackground />
    <SplashScreen />
    <div className="noise-overlay"></div>
    <CustomCursor />
    <Navbar />
    <main>
      <Hero />
      <Suspense fallback={null}>
        <Portfolio />
        <Experience />
        <Footer />
      </Suspense>
    </main>
  </>
);

function App() {
  return (
    <Router>
      <NavigationHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={
          <>
            <PixelBackground />
            <div className="noise-overlay"></div>
            <CustomCursor />
            <Suspense fallback={null}>
              <Archive />
            </Suspense>
          </>
        } />
      </Routes>
      <Suspense fallback={null}>
        <Analytics />
        <SpeedInsights />
      </Suspense>
    </Router>
  );
}

export default App;
