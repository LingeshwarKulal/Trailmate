import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Store the current path in localStorage before redirecting
    localStorage.setItem('authReturnUrl', location.pathname);
    
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute; 