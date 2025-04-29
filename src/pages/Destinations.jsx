import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const destinations = {
  travel: [
    {
      id: 1,
      name: 'Mahabaleshwar',
      type: 'Hill Station',
      bestSeason: 'All year (especially winter & monsoon)',
      description: 'Mahabaleshwar is a scenic hill station located in the Western Ghats, known for its cool climate, lush green forests, strawberry farms, and panoramic viewpoints like Arthur\'s Seat, Wilson Point, and Elephant\'s Head Point.',
      recommendedGear: ['Light jacket', 'Walking shoes', 'Umbrella (monsoon)', 'Camera'],
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      name: 'Lonavala & Khandala',
      type: 'Twin Hill Stations',
      bestSeason: 'Monsoon & post-monsoon',
      description: 'Lonavala and Khandala are quick getaways near Mumbai and Pune, famous for their waterfalls, green valleys, and trekking trails. Must-visit spots include Bhushi Dam, Tiger\'s Leap, Rajmachi Fort, and Lohagad Fort.',
      recommendedGear: ['Rainwear (monsoon)', 'Hiking shoes', 'Snacks', 'Camera'],
      imageUrl: 'https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      name: 'Alibaug',
      type: 'Coastal Town',
      bestSeason: 'Winter (Oct–Feb)',
      description: 'Alibaug is a coastal retreat offering clean beaches, sea forts, and laid-back vibes. It\'s ideal for short beach vacations and water sports like jet skiing and banana boat rides.',
      recommendedGear: ['Sunscreen', 'Flip-flops', 'Beachwear', 'Sunglasses'],
      imageUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&q=80&w=800'
    }
  ],
  trekking: [
    {
      id: 1,
      name: 'Rajmachi Fort',
      difficulty: 'Easy to Moderate',
      bestSeason: 'Monsoon (June to September)',
      location: 'Near Lonavala',
      description: 'A scenic trek through waterfalls, lush greenery, and rustic villages. The trail leads to twin forts – Shrivardhan and Manaranjan. It\'s beginner-friendly and has beautiful views of the Sahyadri range.',
      recommendedGear: ['Raincoat', 'Good grip shoes', 'Dry snacks', 'Torch'],
      imageUrl: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      name: 'Harishchandragad',
      difficulty: 'Moderate to Difficult',
      bestSeason: 'October to February',
      location: 'Ahmednagar district',
      description: 'A thrilling trek for seasoned hikers. Known for the massive Konkan Kada (a vertical cliff offering valley views), ancient caves, and temples. The trail is challenging and rewarding.',
      recommendedGear: ['Trekking pole', 'Warm clothing (nights)', 'High-ankle shoes', 'First aid'],
      imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      name: 'Kalsubai Peak',
      difficulty: 'Moderate',
      bestSeason: 'September to February',
      location: 'Ahmednagar-Nashik border',
      description: 'At 5,400 feet, it\'s the highest peak in Maharashtra. It offers sunrise treks and panoramic views of the Sahyadris. Metal ladders are installed for steep sections, making it safe even for newcomers.',
      recommendedGear: ['Layered clothing', 'Water bottle', 'Headlamp (for early hikes)', 'Energy bars'],
      imageUrl: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&q=80&w=800'
    }
  ]
};

export default function Destinations() {
  const [activeTab, setActiveTab] = useState('travel');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 to-teal-950">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Explore Maharashtra's Finest Destinations
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Discover breathtaking locations perfect for your next adventure, from serene hill stations to challenging trek routes.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-4 mb-12">
          <button
            onClick={() => setActiveTab('travel')}
            className={activeTab === 'travel'
              ? 'px-6 py-3 rounded-lg font-medium transition duration-200 bg-emerald-600 text-white'
              : 'px-6 py-3 rounded-lg font-medium transition duration-200 bg-white/10 text-emerald-100 hover:bg-white/20'}
          >
            Travel Destinations
          </button>
          <button
            onClick={() => setActiveTab('trekking')}
            className={activeTab === 'trekking'
              ? 'px-6 py-3 rounded-lg font-medium transition duration-200 bg-emerald-600 text-white'
              : 'px-6 py-3 rounded-lg font-medium transition duration-200 bg-white/10 text-emerald-100 hover:bg-white/20'}
          >
            Trekking Spots
          </button>
        </div>

        {/* Destination Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations[activeTab].map((destination) => (
            <div
              key={destination.id}
              className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:border-emerald-500/50 transition duration-300"
            >
              <div className="relative h-48">
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{destination.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-medium text-white">
                      {activeTab === 'travel' ? destination.type : destination.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-xs font-medium text-emerald-100">
                      {destination.bestSeason}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-emerald-100 mb-4 line-clamp-3">
                  {destination.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-emerald-400 mb-2">
                      {activeTab === 'trekking' && 'Location'}
                    </h4>
                    {activeTab === 'trekking' && (
                      <p className="text-emerald-100 text-sm mb-4">{destination.location}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-emerald-400 mb-2">
                      Recommended Gear
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {destination.recommendedGear.map((gear, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-100"
                        >
                          {gear}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to={`/planner?destination=${encodeURIComponent(destination.name)}`}
                    className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-center"
                  >
                    Plan Your Trip
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 