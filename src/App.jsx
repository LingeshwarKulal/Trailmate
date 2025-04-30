import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import SimpleLayout from './components/SimpleLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import TrailList from './pages/TrailList';
import TrailDetail from './pages/TrailDetail';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import TrailMap from './pages/TrailMap';
import TrailPlanner from './pages/TrailPlanner';
import Explore from './pages/Explore';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import Admin from './pages/Admin';
import SavedTrails from './pages/SavedTrails';
import GearRecommendations from './pages/GearRecommendations';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import ProtectedRoute from './components/ProtectedRoute';

// Error boundary component for auth errors
const AuthErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Add global error handler
    const errorHandler = (event) => {
      console.error('Global error caught:', event.error);
      
      // Only handle auth-related errors
      if (event.error && (
        event.error.message?.includes('auth') || 
        event.error.message?.includes('firebase') ||
        event.error.code?.includes('auth/')
      )) {
        setHasError(true);
        setErrorInfo(event.error);
        
        // Redirect to login on auth errors
        navigate('/login');
      }
    };

    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, [navigate]);

  // Reset error state when route changes
  useEffect(() => {
    setHasError(false);
    setErrorInfo(null);
  }, [navigate]);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-4">
            We encountered an error with your authentication session. Please log in again.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
          {errorInfo && (
            <details className="mt-4 text-xs text-gray-500">
              <summary>Error details</summary>
              <p>{errorInfo.message}</p>
              <p>{errorInfo.stack}</p>
            </details>
          )}
        </div>
      </div>
    );
  }

  return children;
};

function AppRoutes() {
  return (
    <AuthErrorBoundary>
      <SimpleLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />
          <Route path="/trails" element={<TrailList />} />
          <Route path="/trails/:id" element={<TrailDetail />} />
          <Route 
            path="/saved-trails" 
            element={
              <ProtectedRoute>
                <SavedTrails />
              </ProtectedRoute>
            } 
          />
          <Route path="/community" element={<Community />} />
          <Route path="/community/post/:postId" element={<PostDetail />} />
          <Route path="/map" element={<TrailMap />} />
          <Route path="/gear" element={<GearRecommendations />} />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/planner" 
            element={
              <ProtectedRoute>
                <TrailPlanner />
              </ProtectedRoute>
            } 
          />
          <Route path="/explore" element={<Explore />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SimpleLayout>
    </AuthErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <SessionCheck />
      <CartProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

// Component to check for an existing session
function SessionCheck() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);
  
  useEffect(() => {
    // Try to restore authentication from localStorage if Firebase auth isn't ready yet
    // Only do this once to prevent infinite loops
    if (!user && !restoredFromStorage) {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const userInfo = JSON.parse(storedUser);
          console.log('Session restored from localStorage backup');
          // Temporarily set the user from localStorage while waiting for Firebase
          setUser(userInfo);
          setRestoredFromStorage(true);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          setRestoredFromStorage(true);
        }
      } else {
        setRestoredFromStorage(true);
      }
    }
  }, [user, setUser, restoredFromStorage]);
  
  useEffect(() => {
    // Check if we have a return URL in localStorage
    const returnUrl = localStorage.getItem('authReturnUrl');
    
    // If we have a logged-in user and a stored return URL, navigate there
    if (user && returnUrl && location.pathname === '/login') {
      localStorage.removeItem('authReturnUrl');
      navigate(returnUrl);
    }
  }, [user, navigate, location.pathname]);
  
  return null; // This component doesn't render anything
}

export default App;
