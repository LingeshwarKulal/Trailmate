import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mapStyles = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  outdoors: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
};

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color) => new L.Icon({
  iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' class='marker-pin'%3E%3Cpath fill='${encodeURIComponent(color)}' d='M16 2C10.477 2 6 6.477 6 12c0 5.523 10 18 10 18s10-12.477 10-18c0-5.523-4.477-10-10-10z'/%3E%3Ccircle cx='16' cy='12' r='3' fill='white'/%3E%3C/svg%3E`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapController = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);

  return null;
};

const TrekMap = ({ trekData, mapStyle = 'outdoors' }) => {
  const [activeMarker, setActiveMarker] = useState(null);

  const bounds = L.latLngBounds([
    ...trekData.route,
    ...trekData.checkpoints.map(cp => cp.coordinates),
    ...trekData.campingZones.map(cz => cz.coordinates),
    ...trekData.riskAreas.map(ra => ra.coordinates),
    ...trekData.highlights.map(h => h.coordinates),
  ]);

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
        center={trekData.route[0]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url={mapStyles[mapStyle]}
          attribution={getAttribution()}
        />
        <MapController bounds={bounds} />
        <ZoomControl position="bottomright" />

        {/* Trek Route */}
        <Polyline
          positions={trekData.route}
          pathOptions={{ color: '#3B82F6', weight: 4 }}
        />

        {/* Start and End Markers */}
        <Marker
          position={trekData.route[0]}
          icon={createCustomIcon('#22C55E')}
        >
          <Popup className="custom-popup">
            <div className="font-semibold">Start Point</div>
            <div className="text-sm text-gray-600">{trekData.startPoint}</div>
          </Popup>
        </Marker>
        <Marker
          position={trekData.route[trekData.route.length - 1]}
          icon={createCustomIcon('#EF4444')}
        >
          <Popup className="custom-popup">
            <div className="font-semibold">End Point</div>
            <div className="text-sm text-gray-600">Trek Completion</div>
          </Popup>
        </Marker>

        {/* Checkpoints */}
        {trekData.checkpoints.map((checkpoint, index) => (
          <Marker
            key={`checkpoint-${index}`}
            position={checkpoint.coordinates}
            icon={createCustomIcon('#3B82F6')}
            eventHandlers={{
              click: () => setActiveMarker({ type: 'checkpoint', data: checkpoint })
            }}
          >
            <Popup className="custom-popup">
              <div className="font-semibold">{checkpoint.name}</div>
              <div className="text-sm text-gray-600">
                <div>Elevation: {checkpoint.elevation}m</div>
                <div>Distance: {checkpoint.distance}km</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Camping Zones */}
        {trekData.campingZones.map((camp, index) => (
          <Marker
            key={`camp-${index}`}
            position={camp.coordinates}
            icon={createCustomIcon('#F97316')}
            eventHandlers={{
              click: () => setActiveMarker({ type: 'camp', data: camp })
            }}
          >
            <Popup className="custom-popup">
              <div className="font-semibold">{camp.name}</div>
              <div className="text-sm text-gray-600">
                <div>Elevation: {camp.elevation}m</div>
                <div>Water Source: {camp.waterSource}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Risk Areas */}
        {trekData.riskAreas.map((risk, index) => (
          <Marker
            key={`risk-${index}`}
            position={risk.coordinates}
            icon={createCustomIcon('#DC2626')}
            eventHandlers={{
              click: () => setActiveMarker({ type: 'risk', data: risk })
            }}
          >
            <Popup className="custom-popup">
              <div className="font-semibold">{risk.name}</div>
              <div className="text-sm text-gray-600">{risk.description}</div>
            </Popup>
          </Marker>
        ))}

        {/* Highlights */}
        {trekData.highlights.map((highlight, index) => (
          <Marker
            key={`highlight-${index}`}
            position={highlight.coordinates}
            icon={createCustomIcon('#A855F7')}
            eventHandlers={{
              click: () => setActiveMarker({ type: 'highlight', data: highlight })
            }}
          >
            <Popup className="custom-popup">
              <div className="font-semibold">{highlight.name}</div>
              <div className="text-sm text-gray-600">{highlight.description}</div>
            </Popup>
          </Marker>
        ))}

        {/* Map Style Controls */}
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
      </MapContainer>

      {/* Active Marker Info Panel */}
      {activeMarker && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 shadow-lg border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">
                {activeMarker.data.name}
              </h3>
              <button
                onClick={() => setActiveMarker(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="prose prose-sm">
              {activeMarker.type === 'checkpoint' && (
                <>
                  <p>
                    <span className="font-medium">Elevation:</span> {activeMarker.data.elevation}m
                    <span className="mx-2">•</span>
                    <span className="font-medium">Distance:</span> {activeMarker.data.distance}km
                    <span className="mx-2">•</span>
                    <span className="font-medium">Time:</span> {activeMarker.data.time}
                  </p>
                  <p className="text-gray-600">{activeMarker.data.description}</p>
                </>
              )}
              {activeMarker.type === 'camp' && (
                <>
                  <p>
                    <span className="font-medium">Elevation:</span> {activeMarker.data.elevation}m
                    <span className="mx-2">•</span>
                    <span className="font-medium">Water Source:</span> {activeMarker.data.waterSource}
                  </p>
                  <p className="text-gray-600">{activeMarker.data.description}</p>
                </>
              )}
              {activeMarker.type === 'risk' && (
                <>
                  <p className="text-red-600 font-medium">Warning Area</p>
                  <p className="text-gray-600">{activeMarker.data.description}</p>
                  <p className="text-gray-600">{activeMarker.data.advice}</p>
                </>
              )}
              {activeMarker.type === 'highlight' && (
                <>
                  <p className="text-purple-600 font-medium">Point of Interest</p>
                  <p className="text-gray-600">{activeMarker.data.description}</p>
                  <p className="text-gray-500">Best time to visit: {activeMarker.data.bestTime}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrekMap; 