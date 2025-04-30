import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';

const SavedTrails = () => {
  const { user } = useAuth();
  const [savedTrails, setSavedTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingTrail, setRemovingTrail] = useState(null);
  
  // Fetch user's saved trails
  useEffect(() => {
    const fetchSavedTrails = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSavedTrails(userData.savedTrails || []);
        } else {
          setSavedTrails([]);
        }
      } catch (err) {
        console.error("Error fetching saved trails:", err);
        setError("Failed to load your saved trails. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedTrails();
  }, [user]);
  
  // Remove a trail from saved trails
  const handleRemoveTrail = async (trail) => {
    if (!user) return;
    
    try {
      setRemovingTrail(trail.id);
      
      const userDocRef = doc(db, "users", user.uid);
      
      // Remove the trail from the savedTrails array
      await updateDoc(userDocRef, {
        savedTrails: arrayRemove(trail)
      });
      
      // Update the local state
      setSavedTrails(prevTrails => prevTrails.filter(t => t.id !== trail.id));
    } catch (err) {
      console.error("Error removing trail:", err);
      setError("Failed to remove trail. Please try again.");
    } finally {
      setRemovingTrail(null);
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
                You need to be logged in to view your saved trails.
              </p>
              <div className="mt-4">
                <Link to="/login" className="text-sm font-medium text-yellow-700 hover:text-yellow-600">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Saved Trails</h1>
          <p className="mt-2 text-lg text-gray-600">
            View and manage the trails you've saved for future adventures.
          </p>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!loading && !error && savedTrails.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No saved trails</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't saved any trails yet.</p>
            <div className="mt-6">
              <Link
                to="/trails"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Explore Trails
              </Link>
            </div>
          </div>
        )}
        
        {/* Saved Trails List */}
        {!loading && !error && savedTrails.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedTrails.map(trail => (
              <div key={trail.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <Link to={`/trails/${trail.id}`} className="block">
                  <div className="h-48 relative">
                    <img 
                      src={trail.imageUrl || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=870'} 
                      alt={trail.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-xl font-bold text-white">{trail.name}</h3>
                      <p className="text-sm text-gray-200">{trail.location}</p>
                    </div>
                  </div>
                </Link>
                
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                      trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {trail.difficulty}
                    </span>
                    
                    <button
                      onClick={() => handleRemoveTrail(trail)}
                      disabled={removingTrail === trail.id}
                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                      title="Remove from saved trails"
                    >
                      {removingTrail === trail.id ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <Link
                      to={`/trails/${trail.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      View Trail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedTrails; 