import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

// Sample trail data (fallback if Firestore data isn't available)
const sampleTrailDetails = {
  id: 1,
    name: 'Pine Ridge Trail',
    location: 'Mount Evergreen, California',
    difficulty: 'Moderate',
    distance: '5.2 miles',
    elevationGain: '850 ft',
    duration: '3-4 hours',
    rating: 4.7,
    reviewCount: 128,
  description: 'A beautiful trail winding through pine forests with panoramic mountain views. The trail offers diverse scenery from dense forest sections to open vistas overlooking the valley below. Wildlife sightings are common, including deer and various bird species. The path is well-maintained with clear markers throughout.',
  trailhead: {
    coordinates: [37.7749, -122.4194],
    address: '1234 Forest Road, Evergreen, CA 95123',
    parking: 'Limited parking available at trailhead. Arrive early on weekends.',
    facilities: ['Restrooms', 'Information Board', 'Picnic Area']
  },
  bestSeasons: ['Spring', 'Fall'],
  tags: ['forest', 'views', 'wildlife', 'family-friendly', 'photography'],
    images: [
      'https://images.unsplash.com/photo-1510227272981-87123e259b17?auto=format&fit=crop&q=80&w=870',
    'https://images.unsplash.com/photo-1576176539998-0237d4b6a3cc?auto=format&fit=crop&q=80&w=774',
    'https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&q=80&w=774'
  ],
    reviews: [
      {
      id: 101,
      user: 'HikingEnthusiast',
      date: '2023-09-15',
        rating: 5,
      comment: 'Absolutely beautiful trail with diverse scenery. The viewpoints are spectacular!'
      },
      {
      id: 102,
      user: 'MountainLover',
      date: '2023-08-22',
        rating: 4,
      comment: 'Great trail, but a bit crowded on weekends. Try to go on weekdays if possible.'
    }
  ],
  tips: [
    'Bring plenty of water, especially during summer months',
    'Some sections can be muddy after rain',
    'Cell service is spotty - download offline maps'
    ],
  nearbyTrails: [2, 5]
};

const TrailDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [trail, setTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);

  // Fetch trail details from Firestore
  useEffect(() => {
    const fetchTrailDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch trail data
        const trailDocRef = doc(db, "trails", id);
        const trailDoc = await getDoc(trailDocRef);
        
        if (trailDoc.exists()) {
          const trailData = {
            id: trailDoc.id,
            ...trailDoc.data()
          };
          setTrail(trailData);
        } else {
          console.log("No trail document found, using sample data");
          // If no document exists, use sample data but with the correct ID
          setTrail({
            ...sampleTrailDetails,
            id: id
          });
        }
      } catch (err) {
        console.error("Error fetching trail details:", err);
        setError("Failed to load trail details. Please try again later.");
        // Still set the sample data as fallback
        setTrail({
          ...sampleTrailDetails,
          id: id
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrailDetails();
  }, [id]);

  // Check if the trail is already saved by the user
  useEffect(() => {
    const checkIfTrailIsSaved = async () => {
      if (!user || !trail) return;
      
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Check if trail is in user's savedTrails array
          const savedTrailsArray = userData.savedTrails || [];
          const isTrailSaved = savedTrailsArray.some(savedTrail => 
            savedTrail.id === trail.id
          );
          
          setIsSaved(isTrailSaved);
        }
      } catch (err) {
        console.error("Error checking if trail is saved:", err);
      }
    };
    
    checkIfTrailIsSaved();
  }, [user, trail]);
  
  // Save or unsave trail
  const toggleSaveTrail = async () => {
    if (!user) {
      // Redirect to login or show login prompt
      alert("Please log in to save trails");
      return;
    }
    
    if (!trail) return;
    
    try {
      setSavingInProgress(true);
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error("User document doesn't exist");
        return;
      }
      
      // Create the trail object to save
      const trailToSave = {
        id: trail.id,
        name: trail.name,
        location: trail.location,
        difficulty: trail.difficulty,
        isFavorite: false,
        imageUrl: trail.images?.[0] || trail.imageUrl
      };
      
      if (isSaved) {
        // Remove trail from saved trails
        await updateDoc(userDocRef, {
          savedTrails: arrayRemove(trailToSave)
        });
        setIsSaved(false);
      } else {
        // Add trail to saved trails
        await updateDoc(userDocRef, {
          savedTrails: arrayUnion(trailToSave)
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error saving/unsaving trail:", err);
      alert("There was an error updating your saved trails. Please try again.");
    } finally {
      setSavingInProgress(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <Link to="/trails" className="text-sm font-medium text-red-700 hover:text-red-600">
                  Go back to trails
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Trail Not Found</h2>
          <p className="mt-2 text-gray-600">The trail you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Link to="/trails" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
              View All Trails
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Trail Header/Hero */}
      <div className="relative h-96">
        <div className="absolute inset-0">
        <img 
            src={trail.images?.[activeImageIndex] || trail.imageUrl} 
          alt={trail.name} 
            className="w-full h-full object-cover"
        />
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
              trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {trail.difficulty}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800">
              {trail.distance}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800">
              {trail.duration}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white">{trail.name}</h1>
          <p className="text-xl text-gray-200">{trail.location}</p>
          
          <div className="flex items-center mt-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-white">{trail.rating?.toFixed(1) || "N/A"}</span>
              </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-300">{trail.reviewCount || 0} reviews</span>
            
            <div className="ml-auto">
              <button
                onClick={toggleSaveTrail}
                disabled={savingInProgress}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isSaved 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                {savingInProgress ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className={`-ml-1 mr-2 h-5 w-5 ${isSaved ? 'text-white' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                )}
                {isSaved ? 'Saved' : 'Save Trail'}
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Gallery Thumbnails */}
      {trail.images && trail.images.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {trail.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`flex-shrink-0 h-16 w-24 rounded-md overflow-hidden ${index === activeImageIndex ? 'ring-2 ring-green-600' : ''}`}
              >
                <img
                  src={image}
                  alt={`${trail.name} view ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Description and Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 whitespace-pre-line mb-6">{trail.description}</p>
              
              {trail.tags && trail.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {trail.tags.map((tag, idx) => (
                    <span key={idx} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Rest of the content sections */}
            {/* ... */}
          </div>
          
          {/* Right Column: Info Cards */}
          <div>
            {/* Trail Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trail Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium text-gray-900">{trail.distance}</span>
          </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Elevation Gain:</span>
                  <span className="font-medium text-gray-900">{trail.elevationGain}</span>
        </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route Type:</span>
                  <span className="font-medium text-gray-900">{trail.routeType || "Out & Back"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="font-medium text-gray-900">{trail.duration}</span>
                  </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className={`font-medium ${
                    trail.difficulty === 'Easy' ? 'text-green-600' : 
                    trail.difficulty === 'Moderate' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>{trail.difficulty}</span>
                </div>
              </div>
            </div>
            
            {/* More info cards */}
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailDetail; 