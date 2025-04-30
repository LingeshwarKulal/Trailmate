import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getAllTrailRoutes, getTrailRoute } from '../utils/trailRoutes';

// Your Mapbox access token - in a real app, this should be in an environment variable
mapboxgl.accessToken = 'pk.eyJ1IjoidHJhaWxtYXRlYXBwIiwiYSI6ImNscXl0cnBucTJlcHgybG56YjBkczI0NGcifQ.zl5xM1kZdXUxvfk1VawtlQ';

const TrailMap = () => {
  const [mapFilter, setMapFilter] = useState('all');
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [showTrailPaths, setShowTrailPaths] = useState(true);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [viewport, setViewport] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 9
  });
  
  // Fetch trails from Firestore
  useEffect(() => {
    const fetchTrails = async () => {
      try {
        setLoading(true);
        
        // Create a reference to the trails collection
        const trailsRef = collection(db, "trails");
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

  // Initialize Mapbox map
  useEffect(() => {
    if (map.current) return; // Map already initialized
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v11', // Outdoors style works well for hiking trails
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'bottom-right'
    );

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Wait for map to load before adding sources and layers
    map.current.on('load', () => {
      // Add trail paths source
      map.current.addSource('trail-routes', {
        type: 'geojson',
        data: getAllTrailRoutes()
      });

      // Add trail path layer
      map.current.addLayer({
        id: 'trail-routes',
        type: 'line',
        source: 'trail-routes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': showTrailPaths ? 'visible' : 'none'
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'difficulty'],
            'Easy', '#10B981',
            'Moderate', '#F59E0B',
            'Hard', '#EF4444',
            '#3B82F6' // default color
          ],
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Add highlighted trail path
      map.current.addSource('selected-trail', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      map.current.addLayer({
        id: 'selected-trail',
        type: 'line',
        source: 'selected-trail',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6', // blue
          'line-width': 6,
          'line-opacity': 0.9
        }
      });
    });

    // Clean up on unmount
    return () => map.current.remove();
  }, []);

  // Update trail path visibility when toggled
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    try {
      const visibility = showTrailPaths ? 'visible' : 'none';
      map.current.setLayoutProperty('trail-routes', 'visibility', visibility);
    } catch (err) {
      console.error("Error updating trail path visibility:", err);
    }
  }, [showTrailPaths]);

  // Update selected trail highlight
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !selectedTrail) return;
    
    try {
      const trailRoute = getTrailRoute(selectedTrail);
      if (trailRoute) {
        map.current.getSource('selected-trail').setData(trailRoute);
      }
    } catch (err) {
      console.error("Error highlighting selected trail:", err);
    }
  }, [selectedTrail]);

  // Add markers whenever trails or filtered trails change
  useEffect(() => {
    if (!map.current || loading || !map.current.isStyleLoaded()) return;
    
    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    // Filter trails based on selected filter
    const filteredTrails = trails.filter(trail => {
      if (mapFilter === 'all') return true;
      if (mapFilter === 'easy' || mapFilter === 'moderate' || mapFilter === 'hard') {
        return trail.difficulty && trail.difficulty.toLowerCase() === mapFilter;
      }
      return trail.type === mapFilter;
    });
    
    // Create new markers
    filteredTrails.forEach(trail => {
      // Skip trails without coordinates
      if (!trail.trailhead || !trail.trailhead.coordinates) return;
      
      const [lat, lng] = trail.trailhead.coordinates;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '12px';
      el.style.color = 'white';
      el.style.cursor = 'pointer';
      
      // Set color based on difficulty
      if (trail.difficulty && trail.difficulty.toLowerCase() === 'easy') {
        el.style.backgroundColor = '#10B981'; // green-500
        el.innerText = 'E';
      } else if (trail.difficulty && trail.difficulty.toLowerCase() === 'moderate') {
        el.style.backgroundColor = '#F59E0B'; // yellow-500
        el.innerText = 'M';
      } else {
        el.style.backgroundColor = '#EF4444'; // red-500
        el.innerText = 'H';
      }
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-medium text-gray-900">${trail.name}</h3>
          <p class="text-xs text-gray-600 capitalize">${trail.difficulty || 'Unknown'} difficulty</p>
          <a href="/trails/${trail.id}" class="mt-2 block text-xs text-center px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
            View Details
          </a>
        </div>
      `);

      // Add click handler to highlight trail path
      el.addEventListener('click', () => {
        setSelectedTrail(trail.id);
      });
      
      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);
    });
    
    // If we have trails with coordinates, fit the map to show all markers
    const validTrails = filteredTrails.filter(trail => 
      trail.trailhead && trail.trailhead.coordinates
    );
    
    if (validTrails.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      validTrails.forEach(trail => {
        const [lat, lng] = trail.trailhead.coordinates;
        bounds.extend([lng, lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }
  }, [trails, mapFilter, loading]);

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
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mapbox Map */}
          <div 
            ref={mapContainer} 
            className="w-full h-[600px]" 
            style={{ position: 'relative' }}
          />
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md z-10 text-xs">
            <div className="font-medium mb-2">Map Legend</div>
            <div className="flex items-center mb-1">
              <div className="w-4 h-1 bg-green-500 mr-2"></div>
              <span>Easy Trail</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-4 h-1 bg-yellow-500 mr-2"></div>
              <span>Moderate Trail</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-red-500 mr-2"></div>
              <span>Hard Trail</span>
            </div>
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
                    onClick={() => {
                      setSelectedTrail(trail.id);
                      // If we have coordinates, pan to the trail
                      if (trail.trailhead && trail.trailhead.coordinates) {
                        const [lat, lng] = trail.trailhead.coordinates;
                        map.current.flyTo({
                          center: [lng, lat],
                          zoom: 13,
                          essential: true
                        });
                      }
                    }}
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