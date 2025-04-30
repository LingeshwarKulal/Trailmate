import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getAllTrailRoutes, getTrailRoute } from '../utils/trailRoutes';
import PigeonMap from '../components/PigeonMap';

const TrailMap = () => {
  const [mapFilter, setMapFilter] = useState('all');
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [showTrailPaths, setShowTrailPaths] = useState(true);
  
  // Fetch trails from Firestore
  useEffect(() => {
    const fetchTrails = async () => {
      try {
        setLoading(true);
        
        // Create a reference to the trails collection - correct case is "Trails" with capital T
        const trailsRef = collection(db, "Trails");
        const trailsSnapshot = await getDocs(trailsRef);
        
        if (!trailsSnapshot.empty) {
          const trailsList = trailsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTrails(trailsList);
        } else {
          // If no trails in Firestore yet, use sample data
          setTrails(sampleTrailLocations);
        }
      } catch (err) {
        console.error("Error fetching trails:", err);
        setError("Failed to load trails. Using sample data instead.");
        setTrails(sampleTrailLocations);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrails();
  }, []);

  // Function to handle marker clicks
  const handleMarkerClick = (trailId) => {
    setSelectedTrail(trailId);
  };

  // Filter trails based on selected filter
  const filteredTrails = trails.filter(trail => {
    if (mapFilter === 'all') return true;
    if (mapFilter === 'easy' || mapFilter === 'moderate' || mapFilter === 'hard') {
      return trail.difficulty && trail.difficulty.toLowerCase() === mapFilter;
    }
    return trail.type === mapFilter;
  });

  // Process trails data for the map component
  const mapMarkers = filteredTrails.map(trail => {
    let lat, lng;
    
    // Extract coordinates based on data structure
    if (trail.trailhead && trail.trailhead.coordinates) {
      [lat, lng] = trail.trailhead.coordinates;
    } else if (Array.isArray(trail.coordinates)) {
      [lat, lng] = trail.coordinates;
    } else if (trail.coordinates && trail.coordinates.lat !== undefined && trail.coordinates.lng !== undefined) {
      lat = trail.coordinates.lat;
      lng = trail.coordinates.lng;
    }
    
    // Only include valid markers
    if (!lat || !lng) return null;
    
    return {
      lat, 
      lng,
      properties: {
        id: trail.id,
        name: trail.name,
        difficulty: trail.difficulty,
        type: trail.type
      }
    };
  }).filter(Boolean); // Remove null entries

  // Sample trail locations for fallback
  const sampleTrailLocations = [
    { 
      id: '1', 
      name: 'Pine Ridge Trail', 
      trailhead: { coordinates: [37.7749, -122.4194] }, 
      type: 'hiking', 
      difficulty: 'Moderate' 
    },
    { 
      id: '2', 
      name: 'Coastal Bluff Loop', 
      trailhead: { coordinates: [37.8199, -122.4783] }, 
      type: 'hiking', 
      difficulty: 'Easy' 
    },
    { 
      id: '3', 
      name: 'Eagle Peak Summit', 
      trailhead: { coordinates: [37.8044, -122.2711] }, 
      type: 'hiking', 
      difficulty: 'Hard' 
    },
    { 
      id: '4', 
      name: 'Lakeside Loop', 
      trailhead: { coordinates: [37.7273, -122.1568] }, 
      type: 'hiking', 
      difficulty: 'Easy' 
    },
    { 
      id: '5', 
      name: 'Mountain Bike Trail', 
      trailhead: { coordinates: [37.7435, -122.4314] }, 
      type: 'biking', 
      difficulty: 'Moderate' 
    },
    { 
      id: '6', 
      name: 'Redwood Nature Trail', 
      trailhead: { coordinates: [37.7601, -122.4477] }, 
      type: 'hiking', 
      difficulty: 'Easy' 
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Trail Map</h1>
          <p className="text-gray-600">Explore trails by location and discover new hiking adventures</p>
        </div>
        
        {/* Map Controls */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="mapFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter Trails
              </label>
              <select
                id="mapFilter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={mapFilter}
                onChange={(e) => setMapFilter(e.target.value)}
              >
                <option value="all">All Trails</option>
                <option value="easy">Easy Difficulty</option>
                <option value="moderate">Moderate Difficulty</option>
                <option value="hard">Hard Difficulty</option>
                <option value="hiking">Hiking Trails</option>
                <option value="biking">Biking Trails</option>
                <option value="walking">Walking Paths</option>
              </select>
            </div>
            
            <div className="flex items-center ml-4">
              <input
                id="showTrailPaths"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                checked={showTrailPaths}
                onChange={() => setShowTrailPaths(!showTrailPaths)}
              />
              <label htmlFor="showTrailPaths" className="ml-2 block text-sm text-gray-700">
                Show Trail Paths
              </label>
            </div>
            
            <div className="flex gap-4 items-center ml-auto">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm text-gray-600">Easy</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                <span className="text-sm text-gray-600">Moderate</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span className="text-sm text-gray-600">Hard</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 relative">
          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 z-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}
          
          {/* Map Component */}
          <div className="w-full h-[600px]">
            <PigeonMap 
              markers={mapMarkers}
              trailRoutes={getAllTrailRoutes()}
              selectedTrailId={selectedTrail}
              showTrailPaths={showTrailPaths}
              onMarkerClick={handleMarkerClick}
              style={{ width: '100%', height: '600px' }}
            />
          </div>
        </div>
        
        {/* Nearby Trails Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Trails</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trails.slice(0, 3).map(trail => (
                  <div 
                    key={trail.id} 
                    className={`border rounded-lg overflow-hidden flex cursor-pointer transition-colors duration-200 ${
                      selectedTrail === trail.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedTrail(trail.id)}
                  >
                    <div className={`w-2 ${
                      trail.difficulty?.toLowerCase() === 'easy' ? 'bg-green-500' : 
                      trail.difficulty?.toLowerCase() === 'moderate' ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}></div>
                    <div className="p-4 flex-1">
                      <h3 className="font-medium text-gray-900">{trail.name}</h3>
                      <p className="text-sm text-gray-600 capitalize mb-2">{trail.type || 'Hiking'} Trail • {trail.difficulty || 'Unknown'}</p>
                      <Link 
                        to={`/trails/${trail.id}`}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  to="/trails" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  View All Trails
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailMap;