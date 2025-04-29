import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import SimpleLayout from './components/SimpleLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import TrailList from './pages/TrailList';
import TrailDetail from './pages/TrailDetail';
import Community from './pages/Community';
import TrailMap from './pages/TrailMap';
import TrailPlanner from './pages/TrailPlanner';
import Explore from './pages/Explore';
import NotFound from './pages/NotFound';
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
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="/trails" element={<TrailList />} />
          <Route path="/trails/:id" element={<TrailDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/map" element={<TrailMap />} />
          <Route path="/planner" element={<TrailPlanner />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SimpleLayout>
    </AuthErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
