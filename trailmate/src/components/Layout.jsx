import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Track scroll position for header transparency effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <div className="flex flex-col min-h-screen font-body relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-topography opacity-[0.015] pointer-events-none z-0"></div>
      
      {/* Header - Glass Effect & Dynamic Transparency */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'glass-dark py-3 shadow-lg' 
            : 'bg-transparent py-5'
        }`}
      >
        <nav className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link 
                to="/" 
                className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-adventure-400 hover:from-primary-300 hover:to-adventure-300 transition-all"
              >
                TrailMate
              </Link>
              <div className="hidden md:flex items-center space-x-1">
                <Link 
                  to="/" 
                  className={`px-4 py-2 rounded-lg transition-all ${
                    location.pathname === '/' 
                      ? 'text-primary-500 bg-white/10' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/trails" 
                  className={`px-4 py-2 rounded-lg transition-all ${
                    location.pathname === '/trails' 
                      ? 'text-primary-500 bg-white/10' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Trails
                </Link>
                <Link 
                  to="/map" 
                  className={`px-4 py-2 rounded-lg transition-all ${
                    location.pathname === '/map' 
                      ? 'text-primary-500 bg-white/10' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Map
                </Link>
                <Link 
                  to="/planner" 
                  className={`px-4 py-2 rounded-lg transition-all ${
                    location.pathname === '/planner' 
                      ? 'text-primary-500 bg-white/10' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Planner
                </Link>
                <Link 
                  to="/gear" 
                  className={`px-4 py-2 rounded-lg transition-all ${
                    location.pathname === '/gear' 
                      ? 'text-primary-500 bg-white/10' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Gear
                </Link>
                <Link 
                  to="/community" 
                  className={`px-4 py-2 rounded-lg transition-all ${
                    location.pathname === '/community' 
                      ? 'text-primary-500 bg-white/10' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Community
                </Link>
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    location.pathname === '/profile' 
                      ? 'text-primary-500 bg-white/10' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm">Profile</span>
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="btn px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="btn-outline text-white border-white/20 hover:border-white/40 px-5 py-2 rounded-lg transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary px-5 py-2 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content - With top padding for fixed header */}
      <main className="flex-grow pt-24 z-10">
        {children}
      </main>

      {/* Footer - Natural flow with gradient background */}
      <footer className="mt-auto z-10">
        <div className="bg-gradient-to-b from-night-900 to-night-950 text-white/80">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* About Section */}
              <div>
                <h3 className="font-display text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-adventure-400 mb-4">About TrailMate</h3>
                <p className="text-sm">
                  Your ultimate companion for trail planning, gear recommendations, and community insights. Discover new paths, connect with fellow hikers, and elevate your outdoor experiences.
                </p>
                <div className="mt-4 flex space-x-3">
                  <a href="#" className="w-9 h-9 rounded-full bg-night-800 hover:bg-night-700 flex items-center justify-center transition-all">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="w-9 h-9 rounded-full bg-night-800 hover:bg-night-700 flex items-center justify-center transition-all">
                    <span className="sr-only">Instagram</span>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="w-9 h-9 rounded-full bg-night-800 hover:bg-night-700 flex items-center justify-center transition-all">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-display text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-adventure-400 mb-4">Quick Links</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Link to="/trails" className="hover:text-primary-400 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Explore Trails
                  </Link>
                  <Link to="/gear" className="hover:text-primary-400 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Gear Guide
                  </Link>
                  <Link to="/community" className="hover:text-primary-400 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Community
                  </Link>
                  <Link to="/quiz" className="hover:text-primary-400 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Trail Quiz
                  </Link>
                  <Link to="/map" className="hover:text-primary-400 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Interactive Map
                  </Link>
                  <Link to="/planner" className="hover:text-primary-400 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Trip Planner
                  </Link>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-display text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-adventure-400 mb-4">Contact</h3>
                <div className="text-sm space-y-3">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@trailmate.com
                  </p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    (555) 123-4567
                  </p>
                  <form className="mt-4">
                    <p className="text-sm mb-2">Subscribe to our newsletter:</p>
                    <div className="flex">
                      <input
                        type="email"
                        placeholder="Your email"
                        className="bg-night-800 text-white px-3 py-2 text-sm rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary-500 border border-night-700 flex-grow"
                      />
                      <button
                        type="submit"
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm rounded-r-lg transition-colors"
                      >
                        Join
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-night-800 mt-8 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
                <p>© {new Date().getFullYear()} TrailMate. All rights reserved.</p>
                <div className="flex space-x-6 mt-3 md:mt-0">
                  <Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy</Link>
                  <Link to="/terms" className="hover:text-primary-400 transition-colors">Terms</Link>
                  <Link to="/cookies" className="hover:text-primary-400 transition-colors">Cookies</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 