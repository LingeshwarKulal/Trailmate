import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Keep the sample data as a fallback
const sampleTrails = [
  {
    id: 1,
    name: 'Pine Ridge Trail',
    location: 'Mount Evergreen, California',
    difficulty: 'Moderate',
    distance: '5.2 miles',
    elevationGain: '850 ft',
    duration: '3-4 hours',
    rating: 4.7,
    reviewCount: 128,
    description: 'A beautiful trail winding through pine forests with panoramic mountain views.',
    tags: ['forest', 'views', 'wildlife'],
    imageUrl: 'https://images.unsplash.com/photo-1510227272981-87123e259b17?auto=format&fit=crop&q=80&w=870'
  },
  {
    id: 2,
    name: 'Coastal Bluff Loop',
    location: 'Pacific Coast, Oregon',
    difficulty: 'Easy',
    distance: '3.5 miles',
    elevationGain: '320 ft',
    duration: '1.5-2 hours',
    rating: 4.5,
    reviewCount: 96,
    description: 'Stunning coastal views with chances to spot marine wildlife. Perfect for families.',
    tags: ['coastal', 'views', 'family-friendly'],
    imageUrl: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?auto=format&fit=crop&q=80&w=870'
  },
  {
    id: 3,
    name: 'Eagle Peak Summit',
    location: 'Rocky Mountains, Colorado',
    difficulty: 'Hard',
    distance: '8.7 miles',
    elevationGain: '3200 ft',
    duration: '6-7 hours',
    rating: 4.9,
    reviewCount: 75,
    description: 'Challenging hike to the summit with breathtaking 360° views. Experienced hikers only.',
    tags: ['summit', 'views', 'challenging'],
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=870'
  },
  {
    id: 4,
    name: 'Desert Canyon Trail',
    location: 'Red Rock Canyon, Arizona',
    difficulty: 'Moderate',
    distance: '6.1 miles',
    elevationGain: '950 ft',
    duration: '3-4 hours',
    rating: 4.6,
    reviewCount: 89,
    description: 'Scenic trail through colorful sandstone formations and desert flora.',
    tags: ['desert', 'canyon', 'views'],
    imageUrl: 'https://images.unsplash.com/photo-1518623001395-125242310d0c?auto=format&fit=crop&q=80&w=870'
  },
  {
    id: 5,
    name: 'Lakeside Loop',
    location: 'Crystal Lake, Washington',
    difficulty: 'Easy',
    distance: '2.8 miles',
    elevationGain: '180 ft',
    duration: '1-1.5 hours',
    rating: 4.3,
    reviewCount: 112,
    description: 'Peaceful trail circling a pristine alpine lake with mountain backdrops.',
    tags: ['lake', 'family-friendly', 'scenic'],
    imageUrl: 'https://images.unsplash.com/photo-1580086319619-3ed498161c77?auto=format&fit=crop&q=80&w=870'
  },
  {
    id: 6,
    name: 'Wilderness Waterfall Route',
    location: 'Green Valley, Vermont',
    difficulty: 'Moderate',
    distance: '4.9 miles',
    elevationGain: '720 ft',
    duration: '2.5-3 hours',
    rating: 4.8,
    reviewCount: 67,
    description: 'Trail leading to a series of picturesque waterfalls through lush forests.',
    tags: ['waterfall', 'forest', 'scenic'],
    imageUrl: 'https://images.unsplash.com/photo-1560716082-39e8926a326f?auto=format&fit=crop&q=80&w=870'
  }
];

const TrailList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trails, setTrails] = useState([]);
  
  // Fetch trails from Firestore
  useEffect(() => {
    const fetchTrails = async () => {
      try {
        setLoading(true);
        
        // Create a reference to the trails collection
        const trailsRef = collection(db, "trails");
        
        // For now, we'll fetch all trails (we'll add more specific queries later)
        const trailsSnapshot = await getDocs(trailsRef);
        
        if (!trailsSnapshot.empty) {
          const trailsList = trailsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTrails(trailsList);
        } else {
          // If no trails in Firestore yet, use sample data
          console.log("No trails found in Firestore, using sample data");
          setTrails(sampleTrails);
        }
      } catch (err) {
        console.error("Error fetching trails:", err);
        setError("Failed to load trails. Using sample data instead.");
        setTrails(sampleTrails);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrails();
  }, []);
  
  // Filter the trails based on search term and filters
  const filteredTrails = trails.filter(trail => {
    // Search filter
    const matchesSearch = 
      (trail.name && trail.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (trail.location && trail.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trail.description && trail.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Difficulty filter
    const matchesDifficulty = difficultyFilter === 'All' || trail.difficulty === difficultyFilter;
    
    // Distance filter
    let matchesDistance = true;
    if (distanceFilter === 'Short') {
      matchesDistance = parseFloat(trail.distance) < 4;
    } else if (distanceFilter === 'Medium') {
      matchesDistance = parseFloat(trail.distance) >= 4 && parseFloat(trail.distance) < 7;
    } else if (distanceFilter === 'Long') {
      matchesDistance = parseFloat(trail.distance) >= 7;
    }
    
    return matchesSearch && matchesDifficulty && matchesDistance;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Trails
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find your next hiking adventure from our collection of scenic and thrilling trails.
          </p>
        </div>
        
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Trails
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, location or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Difficulty Filter */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            {/* Distance Filter */}
            <div>
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
                Distance
              </label>
              <select
                id="distance"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(e.target.value)}
              >
                <option value="All">All Distances</option>
                <option value="Short">Short (&lt; 4 miles)</option>
                <option value="Medium">Medium (4-7 miles)</option>
                <option value="Long">Long (&gt; 7 miles)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Loading and Error States */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">{filteredTrails.length}</span> trails found
          </p>
        </div>
        
        {/* No Results Message */}
        {!loading && filteredTrails.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No trails found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            <div className="mt-6">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setDifficultyFilter('All');
                  setDistanceFilter('All');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Trail Cards Grid */}
        {!loading && filteredTrails.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrails.map(trail => (
              <div key={trail.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
                <div className="h-48 relative">
                  <img 
                    src={trail.imageUrl || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=870'} 
                    alt={trail.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-xl font-bold text-white">{trail.name}</h3>
                    <p className="text-sm text-gray-200">{trail.location}</p>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                      trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {trail.difficulty}
                    </span>
                    <div className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-gray-700">{trail.rating?.toFixed(1) || "N/A"}</span>
                      <span className="mx-1 text-gray-400">·</span>
                      <span className="text-gray-600">{trail.reviewCount || 0} reviews</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>{trail.distance} · {trail.elevationGain} elevation gain</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{trail.duration}</span>
                    </div>
                  </div>
                  
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{trail.description}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex flex-wrap gap-1">
                      {trail.tags && trail.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Link 
                      to={`/trails/${trail.id}`}
                      className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      View Details
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

export default TrailList; 