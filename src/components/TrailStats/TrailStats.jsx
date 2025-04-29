import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function TrailStats() {
  const { trailId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  // Mock data for trail statistics
  const mockStats = {
    overview: {
      totalHikes: 1250,
      averageRating: 4.5,
      totalReviews: 342,
      completionRate: 0.92,
      averageDuration: '2h 15m',
      difficulty: 'Moderate'
    },
    popularity: {
      weekly: {
        visits: 156,
        reviews: 23,
        photos: 45
      },
      monthly: {
        visits: 589,
        reviews: 87,
        photos: 156
      },
      yearly: {
        visits: 1250,
        reviews: 342,
        photos: 589
      }
    },
    demographics: {
      ageGroups: [
        { age: '18-24', percentage: 15 },
        { age: '25-34', percentage: 35 },
        { age: '35-44', percentage: 25 },
        { age: '45-54', percentage: 15 },
        { age: '55+', percentage: 10 }
      ],
      experience: [
        { level: 'Beginner', percentage: 20 },
        { level: 'Intermediate', percentage: 45 },
        { level: 'Advanced', percentage: 35 }
      ]
    },
    seasonalData: {
      spring: { visits: 350, rating: 4.6 },
      summer: { visits: 450, rating: 4.4 },
      fall: { visits: 300, rating: 4.7 },
      winter: { visits: 150, rating: 4.3 }
    }
  };

  useEffect(() => {
    // Simulate API call to fetch statistics
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setError(null);
      } catch (err) {
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Trail Overview</h3>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-gray-600">Total Hikes</span>
              <span className="font-medium">{stats.overview.totalHikes}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Average Rating</span>
              <span className="font-medium">{stats.overview.averageRating}/5</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium">{(stats.overview.completionRate * 100).toFixed(1)}%</span>
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Activity</h3>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-gray-600">Average Duration</span>
              <span className="font-medium">{stats.overview.averageDuration}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Difficulty</span>
              <span className="font-medium">{stats.overview.difficulty}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Total Reviews</span>
              <span className="font-medium">{stats.overview.totalReviews}</span>
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Seasonal Performance</h3>
          <div className="space-y-2">
            {Object.entries(stats.seasonalData).map(([season, data]) => (
              <p key={season} className="flex justify-between">
                <span className="text-gray-600 capitalize">{season}</span>
                <span className="font-medium">
                  {data.visits} visits ({data.rating}/5)
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Popularity Trends */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Popularity Trends</h3>
          <div className="flex space-x-2">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeRange === range
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {stats.popularity[timeRange].visits}
            </p>
            <p className="text-sm text-gray-600">Visits</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {stats.popularity[timeRange].reviews}
            </p>
            <p className="text-sm text-gray-600">Reviews</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {stats.popularity[timeRange].photos}
            </p>
            <p className="text-sm text-gray-600">Photos</p>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Age Distribution</h3>
          <div className="space-y-2">
            {stats.demographics.ageGroups.map(({ age, percentage }) => (
              <div key={age} className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">{age}</span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Experience Level</h3>
          <div className="space-y-2">
            {stats.demographics.experience.map(({ level, percentage }) => (
              <div key={level} className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">{level}</span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 