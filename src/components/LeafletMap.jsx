import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix for Leaflet default marker icon issue in React
// See: https://github.com/PaulLeCam/react-leaflet/issues/453
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Helper component to set map view to fit all markers
const MapBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(marker => [marker.lat, marker.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, markers]);

  return null;
};

// Helper component to set view to a specific trail
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// Custom marker icons based on difficulty
const createMarkerIcon = (difficulty) => {
  let color;
  let letter;
  
  if (difficulty?.toLowerCase() === 'easy') {
    color = '#10B981'; // green
    letter = 'E';
  } else if (difficulty?.toLowerCase() === 'moderate') {
    color = '#F59E0B'; // yellow
    letter = 'M';
  } else {
    color = '#EF4444'; // red
    letter = 'H';
  }
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${letter}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const LeafletMap = ({ 
  markers = [],
  trailRoutes = null,
  selectedTrailId = null,
  showTrailPaths = true,
  onMarkerClick = () => {},
  style = { width: '100%', height: '600px' }
}) => {
  const [error, setError] = useState(null);
  
  // Get trail path coordinates from the trail routes data
  const getTrailPath = (trailId) => {
    if (!trailRoutes || !trailRoutes.features) return [];
    
    const trail = trailRoutes.features.find(feature => 
      feature.properties && feature.properties.name === markers.find(m => m.properties.id === trailId)?.properties.name
    );
    
    if (trail && trail.geometry && trail.geometry.coordinates) {
      // Leaflet expects coordinates as [lat, lng], but GeoJSON has [lng, lat]
      // So we need to swap them
      return trail.geometry.coordinates.map(coord => [coord[1], coord[0]]);
    }
    
    return [];
  };
  
  // Selected trail path
  const selectedTrailPath = selectedTrailId ? getTrailPath(selectedTrailId) : [];

  // Error handling
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
          </div>
        </div>
      </div>
    );
  }

  // Get the coordinates for the currently selected trail
  const focusPoint = markers.find(marker => marker.properties.id === selectedTrailId);
  
  try {
    return (
      <div style={style}>
        <MapContainer
          center={[37.7749, -122.4194]} // Default center (San Francisco)
          zoom={10}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          {/* Set bounds to show all markers */}
          {markers.length > 0 && <MapBounds markers={markers} />}
          
          {/* If a trail is selected, focus on it */}
          {focusPoint && (
            <ChangeView 
              center={[focusPoint.lat, focusPoint.lng]} 
              zoom={13} 
            />
          )}
          
          {/* OpenStreetMap tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Trail markers */}
          {markers.map((marker, index) => (
            <Marker 
              key={index}
              position={[marker.lat, marker.lng]}
              icon={createMarkerIcon(marker.properties.difficulty)}
              eventHandlers={{
                click: () => onMarkerClick(marker.properties.id)
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-medium text-gray-900">{marker.properties.name}</h3>
                  <p className="text-xs text-gray-600 capitalize">
                    {marker.properties.difficulty || 'Unknown'} difficulty
                  </p>
                  <Link 
                    to={`/trails/${marker.properties.id}`}
                    className="mt-2 block text-xs text-center px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Show selected trail path */}
          {selectedTrailId && selectedTrailPath.length > 0 && (
            <Polyline 
              positions={selectedTrailPath}
              pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.9 }}
            />
          )}
          
          {/* Show all trail paths if enabled */}
          {showTrailPaths && trailRoutes && trailRoutes.features && trailRoutes.features.map((trail, index) => {
            if (!trail.geometry || !trail.geometry.coordinates) return null;
            
            // Skip the selected trail as it's already shown with a different style
            if (selectedTrailId && trail.properties && 
                trail.properties.name === markers.find(m => m.properties.id === selectedTrailId)?.properties.name) {
              return null;
            }
            
            // Get path color based on difficulty
            let color = '#3B82F6'; // default blue
            if (trail.properties && trail.properties.difficulty) {
              if (trail.properties.difficulty === 'Easy') color = '#10B981';
              else if (trail.properties.difficulty === 'Moderate') color = '#F59E0B';
              else if (trail.properties.difficulty === 'Hard') color = '#EF4444';
            }
            
            // Convert GeoJSON coordinates to Leaflet format
            const positions = trail.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            return (
              <Polyline 
                key={index}
                positions={positions}
                pathOptions={{ color, weight: 4, opacity: 0.8 }}
              />
            );
          })}
        </MapContainer>
      </div>
    );
  } catch (err) {
    console.error("Error rendering map:", err);
    setError("Failed to render map. Please try again later.");
    return <div>Error loading map</div>;
  }
};

export default LeafletMap; 