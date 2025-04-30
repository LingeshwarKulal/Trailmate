import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox token - This is a temporary token
// In production, you should use your own token from https://account.mapbox.com/
mapboxgl.accessToken = 'pk.eyJ1IjoibWljaGFlbGpiYXJyb25lIiwiYSI6ImNscTl6eXkwZTB5OTIybG1ueXcyZmx3MjQifQ.GyC9WOL5HnZbROuzuui2pA';

console.log("MapComponent initialized with token:", mapboxgl.accessToken);

const MapComponent = ({ 
  initialCenter = [-122.4194, 37.7749],
  initialZoom = 9,
  markers = [],
  trailRoutes = null,
  selectedTrailId = null,
  showTrailPaths = true,
  onMarkerClick = () => {},
  onError = () => {},
  style = { width: '100%', height: '600px' }
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check if mapboxgl is supported in this browser
    if (!mapboxgl.supported()) {
      setError("Mapbox GL is not supported by your browser");
      onError("Mapbox GL is not supported by your browser");
      return;
    }

    try {
      console.log("Initializing map with center:", initialCenter);
      
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: initialCenter,
        zoom: initialZoom,
        transformRequest: (url, resourceType) => {
          console.log(`Resource request: ${resourceType} - ${url}`);
          return { url };
        }
      });

      // Setup map controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true
        }),
        'bottom-right'
      );
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      // Handle map load event
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);

        // Add trail routes if available
        if (trailRoutes) {
          try {
            // Add source for all trail paths
            map.current.addSource('trail-routes', {
              type: 'geojson',
              data: trailRoutes
            });

            // Add layer for all trail paths
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

            // Add highlighted trail path source and layer
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
          } catch (err) {
            console.error("Error adding trail routes:", err);
          }
        }
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        const errorMessage = e.error ? e.error.message : 'Unknown error';
        setError(`Map error: ${errorMessage}`);
        onError(errorMessage); // Notify parent component
      });

    } catch (err) {
      console.error('Error initializing Mapbox map:', err);
      setError(`Could not initialize map: ${err.message}`);
      onError(err.message); // Notify parent component
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialCenter, initialZoom, onError]);

  // Add/update markers when map is loaded and markers prop changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach(marker => {
      const { lat, lng, properties } = marker;
      if (!lat || !lng) return;

      // Create HTML element for marker
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
      if (properties.difficulty?.toLowerCase() === 'easy') {
        el.style.backgroundColor = '#10B981'; // green
        el.innerText = 'E';
      } else if (properties.difficulty?.toLowerCase() === 'moderate') {
        el.style.backgroundColor = '#F59E0B'; // yellow
        el.innerText = 'M';
      } else {
        el.style.backgroundColor = '#EF4444'; // red
        el.innerText = 'H';
      }

      // Create popup content
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-medium text-gray-900">${properties.name}</h3>
          <p class="text-xs text-gray-600 capitalize">${properties.difficulty || 'Unknown'} difficulty</p>
          <a href="/trails/${properties.id}" class="mt-2 block text-xs text-center px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
            View Details
          </a>
        </div>
      `);

      // Add click handler
      el.addEventListener('click', () => {
        onMarkerClick(properties.id);
      });

      // Create and add the marker
      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      // Store for later cleanup
      markersRef.current.push(mapboxMarker);
    });

    // If we have markers, fit the map to show all of them
    if (markers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach(marker => {
        if (marker.lat && marker.lng) {
          bounds.extend([marker.lng, marker.lat]);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12
        });
      }
    }
  }, [markers, mapLoaded, onMarkerClick]);

  // Update trail paths visibility
  useEffect(() => {
    if (!mapLoaded || !map.current || !map.current.getLayer('trail-routes')) return;
    
    try {
      const visibility = showTrailPaths ? 'visible' : 'none';
      map.current.setLayoutProperty('trail-routes', 'visibility', visibility);
    } catch (err) {
      console.error("Error updating trail path visibility:", err);
    }
  }, [showTrailPaths, mapLoaded]);

  // Update selected trail
  useEffect(() => {
    if (!mapLoaded || !map.current || !map.current.getSource('selected-trail') || !selectedTrailId) return;
    
    // Find the selected trail data from markers
    const selectedMarker = markers.find(m => m.properties.id === selectedTrailId);
    if (selectedMarker && selectedMarker.route) {
      map.current.getSource('selected-trail').setData(selectedMarker.route);
    }
  }, [selectedTrailId, markers, mapLoaded]);

  // Render a fallback with instructions on how to get a Mapbox token if we encounter errors
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-sm text-gray-700 mt-2">
              If you're seeing token errors, you need a valid Mapbox access token:
            </p>
            <ol className="list-decimal pl-5 mt-1 text-sm text-gray-700">
              <li>Create an account at <a href="https://account.mapbox.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Mapbox</a></li>
              <li>Create a new token with the "styles:read" and "styles:tiles" scopes</li>
              <li>Replace the token in src/components/MapComponent.jsx</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!mapLoaded && (
        <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}
      <div ref={mapContainer} style={style} />
    </div>
  );
};

export default MapComponent; 