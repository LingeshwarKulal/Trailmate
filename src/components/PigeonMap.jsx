import React, { useState, useEffect } from 'react';
import { Map, Marker, ZoomControl, Overlay } from 'pigeon-maps';
import { Link } from 'react-router-dom';

// Custom markers for different difficulties
const DifficultyMarker = ({ left, top, difficulty, onClick, children }) => {
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

  return (
    <div
      style={{ 
        position: 'absolute',
        left: left - 12,
        top: top - 12,
        width: '24px',
        height: '24px',
        background: color,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {letter}
      {children}
    </div>
  );
};

const PigeonMap = ({ 
  markers = [],
  trailRoutes = null,
  selectedTrailId = null,
  showTrailPaths = true,
  onMarkerClick = () => {},
  style = { width: '100%', height: '600px' }
}) => {
  const [center, setCenter] = useState([37.7749, -122.4194]); // Default San Francisco
  const [zoom, setZoom] = useState(10);
  const [showPopup, setShowPopup] = useState(null);
  const [paths, setPaths] = useState([]);

  // Find bounds to fit all markers
  const calculateBounds = () => {
    if (!markers || markers.length === 0) return null;

    let minLat = Number.MAX_VALUE;
    let maxLat = Number.MIN_VALUE;
    let minLng = Number.MAX_VALUE;
    let maxLng = Number.MIN_VALUE;

    markers.forEach(marker => {
      minLat = Math.min(minLat, marker.lat);
      maxLat = Math.max(maxLat, marker.lat);
      minLng = Math.min(minLng, marker.lng);
      maxLng = Math.max(maxLng, marker.lng);
    });

    return {
      ne: [maxLat, maxLng],
      sw: [minLat, minLng]
    };
  };

  // Handle marker click
  const handleMarkerClick = (markerId) => {
    onMarkerClick(markerId);
    const marker = markers.find(m => m.properties.id === markerId);
    if (marker) {
      setCenter([marker.lat, marker.lng]);
      setZoom(13);
    }
    setShowPopup(markerId);
  };

  // Process trail routes data for rendering
  useEffect(() => {
    if (!trailRoutes || !trailRoutes.features || !showTrailPaths) {
      setPaths([]);
      return;
    }

    const processedPaths = trailRoutes.features.map(trail => {
      if (!trail.geometry || !trail.geometry.coordinates) return null;
      
      // Convert GeoJSON coordinates [lng, lat] to [lat, lng] for Pigeon Maps
      const coordinates = trail.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      
      // Determine color based on difficulty
      let color = '#3B82F6'; // default blue
      if (trail.properties && trail.properties.difficulty) {
        if (trail.properties.difficulty === 'Easy') color = '#10B981'; // green
        else if (trail.properties.difficulty === 'Moderate') color = '#F59E0B'; // yellow
        else if (trail.properties.difficulty === 'Hard') color = '#EF4444'; // red
      }
      
      // Determine if this is the selected trail
      const isSelected = selectedTrailId && 
        markers.find(m => m.properties.id === selectedTrailId)?.properties.name === trail.properties?.name;
      
      return {
        id: trail.properties?.name || `trail-${Math.random().toString(36).substr(2, 9)}`,
        coordinates,
        color,
        width: isSelected ? 6 : 4,
        opacity: isSelected ? 0.9 : 0.7,
        isSelected
      };
    }).filter(Boolean);
    
    setPaths(processedPaths);
  }, [trailRoutes, showTrailPaths, selectedTrailId, markers]);

  // Focus on selected trail
  useEffect(() => {
    if (selectedTrailId) {
      const selected = markers.find(m => m.properties.id === selectedTrailId);
      if (selected) {
        setCenter([selected.lat, selected.lng]);
        setZoom(13);
      }
    }
  }, [selectedTrailId, markers]);

  // Helper to convert lat/lng to pixels for SVG drawing
  const latLngToPixel = (latLng) => {
    const TILE_SIZE = 256;
    const scale = Math.pow(2, zoom);
    
    const worldCoordCenter = projectMercator(center[0], center[1]);
    const worldCoordPoint = projectMercator(latLng[0], latLng[1]);
    
    const pixelCoordCenter = worldCoordCenter.map(coord => coord * scale * TILE_SIZE);
    const pixelCoordPoint = worldCoordPoint.map(coord => coord * scale * TILE_SIZE);
    
    const centerPixelX = style.width / 2;
    const centerPixelY = style.height / 2;
    
    const x = centerPixelX + (pixelCoordPoint[0] - pixelCoordCenter[0]);
    const y = centerPixelY + (pixelCoordPoint[1] - pixelCoordCenter[1]);
    
    return { x, y };
  };

  // Mercator projection
  const projectMercator = (lat, lng) => {
    const x = (lng + 180) / 360;
    const y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2;
    return [x, y];
  };

  // Fit map to show all markers
  useEffect(() => {
    const bounds = calculateBounds();
    if (bounds) {
      // Simple approach for setting center
      const centerLat = (bounds.ne[0] + bounds.sw[0]) / 2;
      const centerLng = (bounds.ne[1] + bounds.sw[1]) / 2;
      setCenter([centerLat, centerLng]);
      
      // Determine an appropriate zoom level
      setZoom(9);
    }
  }, [markers]);

  return (
    <div style={style} className="relative">
      <Map
        center={center}
        zoom={zoom}
        onBoundsChanged={({ center, zoom }) => {
          setCenter(center);
          setZoom(zoom);
        }}
        width={style.width}
        height={style.height}
        minZoom={3}
        maxZoom={18}
        attribution="© OpenStreetMap contributors"
      >
        <ZoomControl />
        
        {/* Render trail paths */}
        {showTrailPaths && paths.map((path, pathIndex) => (
          <Overlay 
            key={`path-${pathIndex}`}
            anchor={[0, 0]} 
            offset={[0, 0]}
          >
            <svg width={style.width} height={style.height} style={{position: 'absolute', top: 0, left: 0, pointerEvents: 'none'}}>
              <polyline
                points={path.coordinates.map(latLng => {
                  const { x, y } = latLngToPixel(latLng);
                  return `${x},${y}`;
                }).join(' ')}
                stroke={path.color}
                strokeWidth={path.width}
                fill="none"
                strokeOpacity={path.opacity}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Overlay>
        ))}
        
        {/* Render markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            width={0}
            anchor={[marker.lat, marker.lng]}
            payload={marker.properties.id}
            onClick={({ payload }) => handleMarkerClick(payload)}
          >
            <DifficultyMarker
              difficulty={marker.properties.difficulty}
              left={0}
              top={0}
            />
            
            {showPopup === marker.properties.id && (
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  top: -12,
                  background: 'white',
                  padding: '8px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 10,
                  minWidth: '150px',
                }}
              >
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
                  <div 
                    style={{position: 'absolute', top: '4px', right: '4px', cursor: 'pointer'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPopup(null);
                    }}
                  >
                    ✕
                  </div>
                </div>
              </div>
            )}
          </Marker>
        ))}
      </Map>
      
      {/* Enhanced Trail Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md z-10 text-xs">
        <div className="font-medium mb-2 text-gray-800">Trail Map Legend</div>
        
        {/* Difficulty Levels */}
        <div className="mb-2">
          <div className="text-xs font-medium text-gray-700 mb-1">Difficulty Level:</div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>Easy Trail</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span>Moderate Trail</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span>Hard Trail</span>
          </div>
        </div>
        
        {/* Path Line Examples */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Trail Paths:</div>
          <div className="flex items-center mb-1">
            <div className="w-8 h-1 bg-green-500 mr-2"></div>
            <span>Easy Trail Path</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-8 h-1 bg-yellow-500 mr-2"></div>
            <span>Moderate Trail Path</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-8 h-1 bg-red-500 mr-2"></div>
            <span>Hard Trail Path</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-2 bg-blue-500 mr-2"></div>
            <span>Selected Trail</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PigeonMap; 