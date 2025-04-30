import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { seedTrailsCollection } from '../utils/seedDatabase';

const Admin = () => {
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  
  // Handle database seeding
  const handleSeedDatabase = async () => {
    if (!user) {
      alert("You must be logged in to perform this action");
      return;
    }
    
    try {
      setSeeding(true);
      setSeedResult(null);
      
      const result = await seedTrailsCollection();
      setSeedResult(result);
    } catch (error) {
      console.error("Error seeding database:", error);
      setSeedResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setSeeding(false);
    }
  };
  
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You must be logged in to access the admin area.
              </p>
              <div className="mt-4">
                <a href="/login" className="text-sm font-medium text-yellow-700 hover:text-yellow-600">
                  Go to Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Database Management</h2>
        
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Seed Database</h3>
          <p className="text-gray-600 mb-4">
            This will add sample trail data to the database if no trails exist yet.
            This action is safe and will not overwrite existing data.
          </p>
          
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {seeding ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Seeding Database...
              </>
            ) : (
              'Seed Database with Sample Trails'
            )}
          </button>
          
          {seedResult && (
            <div className={`mt-4 p-4 rounded-md ${seedResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-medium">{seedResult.message}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">User Management</h2>
        <p className="text-gray-600 italic">User management features coming soon.</p>
      </div>
    </div>
  );
};

export default Admin; 