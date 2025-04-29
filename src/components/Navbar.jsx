import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll events to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  if (loading) {
    return null; // or a loading spinner
  }

  // Enhanced 3D animation variants
  const navVariants = {
    visible: { 
      y: 0, 
      opacity: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    hidden: { 
      y: -20, 
      opacity: 0,
      rotateX: -20,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  const linkVariants = {
    hover: { 
      scale: 1.05,
      y: -4,
      rotateY: 5,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      } 
    },
    tap: { 
      scale: 0.95,
      rotateY: -5
    }
  };

  const mobileMenuVariants = {
    open: {
      opacity: 1,
      height: "auto",
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    closed: {
      opacity: 0,
      height: 0,
      rotateX: -30,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const mobileItemVariants = {
    open: { 
      opacity: 1, 
      x: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    closed: { 
      opacity: 0, 
      x: -20,
      rotateY: -30,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav
      className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 shadow-lg fixed w-full z-50 backdrop-blur-sm"
      initial="visible"
      animate={isVisible ? "visible" : "hidden"}
      variants={navVariants}
      style={{ perspective: "1000px" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05, rotateY: 10 }}
                whileTap={{ scale: 0.95, rotateY: -10 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-white drop-shadow-glow"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  whileHover={{ 
                    rotate: 10, 
                    scale: 1.1,
                    filter: "drop-shadow(0 0 0.5rem rgba(255,255,255,0.5))"
                  }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </motion.svg>
                <motion.span 
                  className="text-xl font-bold text-white tracking-wide drop-shadow-glow"
                  whileHover={{ y: -2 }}
                >
                  TrailMate
                </motion.span>
              </motion.div>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
              {[
                { path: '/', label: 'Home' },
                { path: '/trails', label: 'Trails' },
                { path: '/destinations', label: 'Destinations' },
                { path: '/map', label: 'Map' },
                { path: '/community', label: 'Community' },
                { path: '/planner', label: 'Planner' },
                { path: '/gear', label: 'Gear' }
              ].map(({ path, label }) => (
                <motion.div 
                  key={path}
                  whileHover="hover"
                  whileTap="tap"
                  variants={linkVariants}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Link
                    to={path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === path
                        ? 'text-teal-400 bg-slate-800/50'
                        : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/30'
                    } transition-colors`}
                  >
                    {label}
                    {location.pathname === path && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full"
                        layoutId="navbar-underline"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{
                          boxShadow: "0 0 10px rgba(255,255,255,0.5)",
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user ? (
              <>
                <motion.div 
                  whileHover="hover" 
                  whileTap="tap" 
                  variants={linkVariants}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Link
                    to="/profile"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/profile'
                        ? 'text-teal-400 bg-slate-800/50'
                        : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/30'
                    } transition-colors`}
                  >
                    Profile
                  </Link>
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-slate-800/30 transition-colors"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.div 
                  whileHover="hover" 
                  whileTap="tap" 
                  variants={linkVariants}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Link
                    to="/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/login'
                        ? 'text-teal-400 bg-slate-800/50'
                        : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/30'
                    } transition-colors`}
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div 
                  whileHover="hover" 
                  whileTap="tap" 
                  variants={linkVariants}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Link
                    to="/register"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/register'
                        ? 'text-teal-400 bg-slate-800/50'
                        : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/30'
                    } transition-colors`}
                  >
                    Register
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-teal-400 hover:bg-slate-800/30 focus:outline-none backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotateY: 10 }}
              whileTap={{ scale: 0.9, rotateY: -10 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <span className="sr-only">Open main menu</span>
              <AnimatePresence mode="wait">
                {!isOpen ? (
                  <motion.svg
                    key="menu"
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ opacity: 0, rotateX: -90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: 90 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="close"
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ opacity: 0, rotateX: 90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: -90 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu with 3D animations */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="sm:hidden bg-slate-800/95 backdrop-blur-sm"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            style={{ 
              transformStyle: "preserve-3d",
              perspective: "1000px"
            }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[
                { path: '/', label: 'Home' },
                { path: '/trails', label: 'Trails' },
                { path: '/destinations', label: 'Destinations' },
                { path: '/map', label: 'Map' },
                { path: '/community', label: 'Community' },
                { path: '/planner', label: 'Planner' },
                { path: '/gear', label: 'Gear' }
              ].map(({ path, label }) => (
                <motion.div 
                  key={path} 
                  variants={mobileItemVariants}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Link
                    to={path}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === path
                        ? 'text-teal-400 bg-slate-800/50'
                        : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/30'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
              
              {user ? (
                <>
                  <motion.div 
                    variants={mobileItemVariants}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Link
                      to="/profile"
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        location.pathname === '/profile'
                          ? 'text-teal-400 bg-slate-800/50'
                          : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/30'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                  </motion.div>
                  <motion.div 
                    variants={mobileItemVariants}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left text-slate-300 hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800/30 transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div 
                    variants={mobileItemVariants}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Link
                      to="/login"
                      className="text-slate-300 hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800/30 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div 
                    variants={mobileItemVariants}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Link
                      to="/register"
                      className="text-slate-300 hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800/30 transition-colors shadow-glow"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 