import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { treks, difficultyColors } from '../data/treks';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="background-color: ${color};" class="marker-pin"></div>
      <i class="material-icons"></i>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
};

const LocationMarker = ({ onLocationFound }) => {
  const map = useMapEvents({
    locationfound(e) {
      onLocationFound(e.latlng);
      map.flyTo(e.latlng, 13);
    },
    locationerror(e) {
      console.error("Location error:", e.message);
      alert("Location access denied. Please enable location services and refresh the page.");
    }
  });

  return null;
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  return null;
};

const ExploreMap = ({ center = [18.5204, 73.8567], zoom = 13, style = 'outdoors' }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [nearbyTrails, setNearbyTrails] = useState([]);
  const [mapStyle, setMapStyle] = useState(style);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filteredTreks, setFilteredTreks] = useState(treks);
  const searchRef = useRef(null);
  const mapRef = useRef(null);

  const mapStyles = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    outdoors: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  useEffect(() => {
    // Check if we're running locally
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      console.log('Running on localhost - geolocation might require special handling');
    }
  }, []);

  const handleLocationEnable = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      // First check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser.");
      }

      // Direct getCurrentPosition call with error handling
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location received:', position);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(location);
          setLocationError(null);
          updateNearbyTrails(location);

          // Get map instance and fly to location
          const mapInstance = document.querySelector('.leaflet-container')?._leaflet_map;
          if (mapInstance) {
            mapInstance.flyTo([location.lat, location.lng], 13);
          }
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = '';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable. Please check your device settings.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage = "An unknown error occurred getting your location.";
          }
          
          setLocationError(errorMessage);
          alert(errorMessage);
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Location error:", error);
      setLocationError(error.message);
      setIsLocating(false);
      alert(error.message);
    }
  };

  const updateNearbyTrails = (location) => {
    const nearbyTreks = treks.map(trek => ({
      ...trek,
      distance: calculateDistance(location, { lat: trek.location[0], lng: trek.location[1] })
    })).filter(trek => trek.distance <= 100)
      .sort((a, b) => a.distance - b.distance);
    
    setNearbyTrails(nearbyTreks);
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredTreks(treks);
      return;
    }
    
    const filtered = treks.filter(trek => 
      trek.name.toLowerCase().includes(query.toLowerCase()) ||
      trek.description.toLowerCase().includes(query.toLowerCase()) ||
      trek.difficulty.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTreks(filtered);
  };

  const getAttribution = () => {
    switch (mapStyle) {
      case 'streets':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      case 'satellite':
        return 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'outdoors':
        return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      default:
        return '';
    }
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url={mapStyles[mapStyle]}
          attribution={getAttribution()}
        />
        <MapController center={userLocation ? [userLocation.lat, userLocation.lng] : center} zoom={zoom} />
        <ZoomControl position="bottomright" />
        
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md">
          <div className="p-2 space-y-2">
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                mapStyle === 'streets' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                mapStyle === 'satellite' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('outdoors')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                mapStyle === 'outdoors' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Outdoors
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search for treks by name, difficulty, or description..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full px-4 py-2 rounded-lg shadow-lg bg-white/90 backdrop-blur-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {isSearchFocused && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto">
                  {filteredTreks.map(trek => (
                    <button
                      key={trek.id}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-0"
                      onClick={() => {
                        setSelectedTrek(trek);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{trek.name}</div>
                          <div className="text-sm text-gray-600">
                            {trek.distance && `${trek.distance} km • `}
                            Elevation: {trek.elevation}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${difficultyColors[trek.difficulty]}`}>
                          {trek.difficulty}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nearby Trails Tab */}
        {userLocation && nearbyTrails.length > 0 && (
          <div className="absolute top-20 right-4 z-10 w-72">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
              <h3 className="font-bold text-lg mb-3">Nearby Trails</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {nearbyTrails.map(trek => (
                  <button
                    key={trek.id}
                    className="w-full p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    onClick={() => {
                      setSelectedTrek(trek);
                    }}
                  >
                    <div className="font-medium">{trek.name}</div>
                    <div className="text-sm text-gray-600">
                      {Math.round(trek.distance)} km away • {trek.duration}
                    </div>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full text-white ${difficultyColors[trek.difficulty]}`}>
                      {trek.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enable Location Button */}
        {!userLocation && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
            <button
              onClick={handleLocationEnable}
              disabled={isLocating}
              className={`px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isLocating ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <svg className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isLocating ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </>
                )}
              </svg>
              {isLocating ? 'Getting Location...' : locationError ? 'Try Again' : 'Enable Location'}
            </button>
            {locationError && (
              <div className="mt-2 px-4 py-2 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">
                  {locationError}
                </p>
                <p className="text-xs text-red-500 text-center mt-1">
                  Note: Location services may require HTTPS or proper browser settings
                </p>
              </div>
            )}
          </div>
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createCustomIcon('#3B82F6')}
          >
            <Popup>
              <div className="font-semibold">Your Location</div>
              <div className="text-sm text-gray-600">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Trek Markers */}
        {filteredTreks.map(trek => (
          <React.Fragment key={trek.id}>
            <Marker
              position={trek.location}
              icon={createCustomIcon(trek.difficulty === 'Easy' ? '#22C55E' : 
                                  trek.difficulty === 'Moderate' ? '#EAB308' : 
                                  trek.difficulty === 'Challenging' ? '#EF4444' : '#F97316')}
              eventHandlers={{
                click: () => setSelectedTrek(trek),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{trek.name}</h3>
                  <p className="text-sm text-gray-600">
                    Elevation: {trek.elevation}<br />
                    Duration: {trek.duration}<br />
                    Distance: {trek.distance}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full text-white ${difficultyColors[trek.difficulty]}`}>
                    {trek.difficulty}
                  </span>
                </div>
              </Popup>
            </Marker>
            {trek.route && (
              <Polyline
                positions={trek.route}
                color={trek.difficulty === 'Easy' ? '#22C55E' : 
                       trek.difficulty === 'Moderate' ? '#EAB308' : 
                       trek.difficulty === 'Challenging' ? '#EF4444' : '#F97316'}
                weight={3}
                opacity={0.7}
              />
            )}
          </React.Fragment>
        ))}

        <LocationMarker onLocationFound={setUserLocation} />
      </MapContainer>

      {/* Selected Trek Card */}
      <AnimatePresence>
        {selectedTrek && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 z-10"
          >
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedTrek.name}</h2>
                      <span className={`px-2 py-1 text-xs rounded-full text-white ${difficultyColors[selectedTrek.difficulty]}`}>
                        {selectedTrek.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Elevation: {selectedTrek.elevation} • 
                      Duration: {selectedTrek.duration} •
                      Distance: {selectedTrek.distance}
                    </p>
                    <p className="mt-2 text-sm">{selectedTrek.description}</p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Best Season: {selectedTrek.bestSeason}</p>
                      <p>Start Point: {selectedTrek.startPoint}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTrek(null)}
                    className="text-gray-500 hover:text-gray-700 ml-4"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button className="px-4 py-2 text-green-600 hover:text-green-700 transition-colors">
                    Save to Favorites
                  </button>
                  <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Explore Trek
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -15px 0 0 -15px;
        }

        .marker-pin::after {
          content: '';
          width: 24px;
          height: 24px;
          margin: 3px 0 0 3px;
          background: #fff;
          position: absolute;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default ExploreMap; 