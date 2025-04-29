import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TrekMap from '../components/TrekMap';
import sampleTrek from '../data/sampleTrek';

const TrekDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  // In a real app, you would fetch the trek data based on the ID
  // For now, we'll use our sample data
  const trek = sampleTrek;
  
  // Calculate the center of the map based on the route
  const center = {
    lat: trek.route[Math.floor(trek.route.length / 2)].lat,
    lng: trek.route[Math.floor(trek.route.length / 2)].lng
  };
  
  // Handle marker selection
  const handleMarkerSelect = (marker) => {
    setSelectedMarker(marker);
  };
  
  // Render the overview tab content
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Trek Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-4">{trek.description}</p>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-500 w-32">Difficulty:</span>
                <span className="font-medium capitalize">{trek.difficulty}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-32">Duration:</span>
                <span className="font-medium">{trek.duration}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-32">Distance:</span>
                <span className="font-medium">{trek.distance}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-32">Elevation Gain:</span>
                <span className="font-medium">{trek.elevation.gain}m</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-32">Best Time:</span>
                <span className="font-medium">{trek.bestTimeToVisit}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Starting Point</h4>
            <p className="text-gray-600 mb-4">{trek.startPointDescription}</p>
            <h4 className="font-medium text-gray-800 mb-2">Directions</h4>
            <p className="text-gray-600 mb-4">{trek.directions}</p>
            <h4 className="font-medium text-gray-800 mb-2">Parking</h4>
            <p className="text-gray-600">{trek.parkingInfo}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Required Gear</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          {trek.requiredGear.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Safety Tips</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          {trek.safetyTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
  
  // Render the checkpoints tab content
  const renderCheckpoints = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Trek Checkpoints</h3>
        <div className="space-y-4">
          {trek.checkpoints.map((checkpoint, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">{checkpoint.name}</h4>
                  <p className="text-gray-600 mt-1">{checkpoint.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Distance: {checkpoint.distance}</div>
                  <div className="text-sm text-gray-500">Time: {checkpoint.time}</div>
                  <div className="text-sm text-gray-500">Elevation: {checkpoint.elevation}m</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Render the highlights tab content
  const renderHighlights = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Points of Interest</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trek.highlights.map((highlight, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800">{highlight.name}</h4>
              <p className="text-gray-600 mt-1">{highlight.description}</p>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-sm text-gray-500">Type: {highlight.type}</span>
                <span className="text-sm text-gray-500">Best Time: {highlight.bestTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Render the risk areas tab content
  const renderRiskAreas = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Risk Areas</h3>
        <div className="space-y-4">
          {trek.riskAreas.map((area, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">{area.name}</h4>
                  <p className="text-gray-600 mt-1">{area.description}</p>
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Advice:</span> {area.advice}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    area.risk === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {area.risk} Risk
                  </div>
                  <div className="text-sm text-gray-500 mt-2">Elevation: {area.elevation}m</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{trek.name}</h1>
        <div className="mt-2 flex items-center space-x-4">
          <span className="text-gray-500">{trek.distance}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{trek.duration}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 capitalize">{trek.difficulty}</span>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="h-96 rounded-lg overflow-hidden shadow-lg">
          <TrekMap
            trekData={trek}
            center={center}
            zoom={13}
            height="100%"
            onMarkerSelect={handleMarkerSelect}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'checkpoints', 'highlights', 'risk areas'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="mb-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'checkpoints' && renderCheckpoints()}
        {activeTab === 'highlights' && renderHighlights()}
        {activeTab === 'risk areas' && renderRiskAreas()}
      </div>
      
      {selectedMarker && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out">
          <div className="container mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800">{selectedMarker.name}</h3>
                <p className="text-gray-600 mt-1">{selectedMarker.description}</p>
                {selectedMarker.elevation && (
                  <p className="text-sm text-gray-500 mt-1">Elevation: {selectedMarker.elevation}m</p>
                )}
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrekDetail; 