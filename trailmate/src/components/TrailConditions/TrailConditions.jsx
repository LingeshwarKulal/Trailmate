import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function TrailConditions() {
  const { trailId } = useParams();
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for trail conditions
  const mockConditions = {
    status: {
      isOpen: true,
      lastUpdated: '2024-03-20T10:30:00Z',
      alerts: [
        {
          type: 'warning',
          message: 'Trail is muddy due to recent rainfall'
        }
      ]
    },
    weather: {
      current: {
        temperature: 72,
        condition: 'Partly Cloudy',
        humidity: 45,
        windSpeed: 8,
        precipitation: 0
      },
      forecast: [
        {
          date: '2024-03-20',
          high: 75,
          low: 58,
          condition: 'Sunny'
        },
        {
          date: '2024-03-21',
          high: 78,
          low: 60,
          condition: 'Partly Cloudy'
        },
        {
          date: '2024-03-22',
          high: 72,
          low: 55,
          condition: 'Cloudy'
        }
      ]
    },
    trailConditions: {
      surface: 'Dirt',
      obstacles: ['Fallen tree', 'Muddy patches'],
      waterCrossings: 2,
      snowCover: 0,
      difficulty: 'Moderate'
    },
    accessibility: {
      parking: 'Available',
      restrooms: 'Available',
      waterSources: 3,
      cellService: 'Good'
    }
  };

  useEffect(() => {
    // Simulate API call to fetch conditions
    const fetchConditions = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConditions(mockConditions);
        setError(null);
      } catch (err) {
        setError('Failed to load trail conditions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchConditions();
  }, [trailId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Trail Status */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Trail Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${
            conditions.status.isOpen
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {conditions.status.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Last updated: {new Date(conditions.status.lastUpdated).toLocaleString()}
        </p>
        {conditions.status.alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-3 rounded-md mb-2 ${
              alert.type === 'warning'
                ? 'bg-yellow-50 text-yellow-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {alert.message}
          </div>
        ))}
      </div>

      {/* Current Weather */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Weather</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">
              {conditions.weather.current.temperature}°F
            </p>
            <p className="text-sm text-gray-600">{conditions.weather.current.condition}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {conditions.weather.current.humidity}%
            </p>
            <p className="text-sm text-gray-600">Humidity</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {conditions.weather.current.windSpeed} mph
            </p>
            <p className="text-sm text-gray-600">Wind Speed</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {conditions.weather.current.precipitation} in
            </p>
            <p className="text-sm text-gray-600">Precipitation</p>
          </div>
        </div>
      </div>

      {/* Weather Forecast */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">3-Day Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {conditions.weather.forecast.map((day, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <p className="text-2xl font-bold text-gray-900">{day.high}°</p>
              <p className="text-sm text-gray-600">{day.low}°</p>
              <p className="text-sm text-gray-600">{day.condition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trail Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trail Conditions</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Surface</p>
              <p className="font-medium">{conditions.trailConditions.surface}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Obstacles</p>
              <ul className="list-disc list-inside">
                {conditions.trailConditions.obstacles.map((obstacle, index) => (
                  <li key={index} className="text-gray-700">{obstacle}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-600">Water Crossings</p>
              <p className="font-medium">{conditions.trailConditions.waterCrossings}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Snow Cover</p>
              <p className="font-medium">{conditions.trailConditions.snowCover} inches</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Parking</p>
              <p className="font-medium">{conditions.accessibility.parking}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Restrooms</p>
              <p className="font-medium">{conditions.accessibility.restrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Water Sources</p>
              <p className="font-medium">{conditions.accessibility.waterSources}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cell Service</p>
              <p className="font-medium">{conditions.accessibility.cellService}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 