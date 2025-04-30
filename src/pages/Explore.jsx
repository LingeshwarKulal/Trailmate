import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Explore = () => {
  const [activeRegion, setActiveRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for regions
  const regions = [
    { id: 'all', name: 'All Regions' },
    { id: 'west', name: 'West Coast', count: 245 },
    { id: 'southwest', name: 'Southwest', count: 187 },
    { id: 'midwest', name: 'Midwest', count: 134 },
    { id: 'northeast', name: 'Northeast', count: 156 },
    { id: 'southeast', name: 'Southeast', count: 122 },
  ];

  // Sample data for popular destinations
  const popularDestinations = [
    {
      id: 1,
      name: 'Yosemite National Park',
      region: 'west',
      state: 'California',
      trailCount: 37,
      featuredTrail: 'Half Dome',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 2,
      name: 'Zion National Park',
      region: 'southwest',
      state: 'Utah',
      trailCount: 29,
      featuredTrail: 'Angels Landing',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1533953263536-c12eabe1f0ce?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 3,
      name: 'Great Smoky Mountains',
      region: 'southeast',
      state: 'Tennessee/North Carolina',
      trailCount: 42,
      featuredTrail: 'Alum Cave Trail',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1517768692594-a36c7d3931a1?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 4,
      name: 'Acadia National Park',
      region: 'northeast',
      state: 'Maine',
      trailCount: 26,
      featuredTrail: 'Precipice Trail',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 5,
      name: 'Rocky Mountain National Park',
      region: 'west',
      state: 'Colorado',
      trailCount: 33,
      featuredTrail: 'Sky Pond',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 6,
      name: 'Grand Canyon National Park',
      region: 'southwest',
      state: 'Arizona',
      trailCount: 24,
      featuredTrail: 'Bright Angel Trail',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&q=80&w=600',
    },
  ];

  // Sample data for curated collections
  const collections = [
    {
      id: 1,
      title: 'Stunning Waterfall Hikes',
      description: 'Discover trails featuring beautiful cascades and waterfalls.',
      image: 'https://images.unsplash.com/photo-1554629947-334ff61d85dc?auto=format&fit=crop&q=80&w=400',
      count: 18,
    },
    {
      id: 2,
      title: 'Family-Friendly Adventures',
      description: 'Perfect trails for hikers of all ages and abilities.',
      image: 'https://images.unsplash.com/photo-1445307806294-bff7f67ff225?auto=format&fit=crop&q=80&w=400',
      count: 24,
    },
    {
      id: 3,
      title: 'Summit Challenges',
      description: 'Challenging hikes to mountain peaks with rewarding views.',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400',
      count: 15,
    },
  ];

  // Filter destinations based on region and search query
  const filteredDestinations = popularDestinations.filter(destination => {
    const matchesRegion = activeRegion === 'all' || destination.region === activeRegion;
    const matchesSearch = 
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.featuredTrail.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mb-10">
          <img 
            src="https://images.unsplash.com/photo-1465311530779-5241f5a29892?auto=format&fit=crop&q=80&w=1800"
            alt="Mountains and forest landscape"
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/70 to-transparent flex items-center">
            <div className="px-6 sm:px-10 max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Explore Wilderness</h1>
              <p className="text-white/90 text-lg mb-6">Discover trails and destinations across the country.</p>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for parks, regions, or trails..."
                  className="w-full py-3 px-4 pr-10 rounded-lg shadow-md text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Region Selector */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Explore by Region</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {regions.map(region => (
              <button
                key={region.id}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                  activeRegion === region.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'
                }`}
                onClick={() => setActiveRegion(region.id)}
              >
                {region.name}
                {region.count && <span className="ml-1 text-xs opacity-80">({region.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive US Map (placeholder) */}
        <div className="mb-12 p-6 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">United States Trails</h2>
          <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-green-50/50 rounded-lg overflow-hidden border border-gray-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://cdn.pixabay.com/photo/2020/01/15/11/41/usa-4767306_1280.jpg"
                alt="US Map Outline"
                className="w-full h-full object-contain opacity-30"
              />
              <div className="absolute inset-0">
                {/* West Coast marker */}
                <button
                  className={`absolute top-[40%] left-[15%] w-4 h-4 rounded-full ${
                    activeRegion === 'west' || activeRegion === 'all' ? 'bg-green-600' : 'bg-gray-400'
                  }`}
                  onClick={() => setActiveRegion('west')}
                >
                  <span className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                    West Coast
                  </span>
                </button>
                
                {/* Southwest marker */}
                <button
                  className={`absolute top-[60%] left-[25%] w-4 h-4 rounded-full ${
                    activeRegion === 'southwest' || activeRegion === 'all' ? 'bg-green-600' : 'bg-gray-400'
                  }`}
                  onClick={() => setActiveRegion('southwest')}
                >
                  <span className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                    Southwest
                  </span>
                </button>
                
                {/* Midwest marker */}
                <button
                  className={`absolute top-[40%] left-[50%] w-4 h-4 rounded-full ${
                    activeRegion === 'midwest' || activeRegion === 'all' ? 'bg-green-600' : 'bg-gray-400'
                  }`}
                  onClick={() => setActiveRegion('midwest')}
                >
                  <span className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                    Midwest
                  </span>
                </button>
                
                {/* Northeast marker */}
                <button
                  className={`absolute top-[30%] left-[75%] w-4 h-4 rounded-full ${
                    activeRegion === 'northeast' || activeRegion === 'all' ? 'bg-green-600' : 'bg-gray-400'
                  }`}
                  onClick={() => setActiveRegion('northeast')}
                >
                  <span className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                    Northeast
                  </span>
                </button>
                
                {/* Southeast marker */}
                <button
                  className={`absolute top-[60%] left-[70%] w-4 h-4 rounded-full ${
                    activeRegion === 'southeast' || activeRegion === 'all' ? 'bg-green-600' : 'bg-gray-400'
                  }`}
                  onClick={() => setActiveRegion('southeast')}
                >
                  <span className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                    Southeast
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Popular Destinations</h2>
            <Link to="/trails" className="text-green-600 hover:text-green-800 text-sm font-medium">
              View all destinations →
            </Link>
          </div>
          
          {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map(destination => (
                <div key={destination.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 relative">
                    <img 
                      src={destination.image} 
                      alt={destination.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="text-white font-bold text-lg">{destination.name}</h3>
                          <p className="text-white/90 text-sm">{destination.state}</p>
                        </div>
                        <div className="flex items-center bg-white/20 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-full">
                          <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {destination.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-600">{destination.trailCount} Trails Available</p>
                        <p className="text-sm font-medium">Featured: {destination.featuredTrail}</p>
                      </div>
                    </div>
                    <Link 
                      to={`/trails?destination=${destination.id}`}
                      className="w-full block text-center py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Explore Trails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0h4M5 19h14" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No destinations found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search or explore a different region.</p>
            </div>
          )}
        </div>

        {/* Curated Collections */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Curated Trail Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div key={collection.id} className="relative group overflow-hidden rounded-xl">
                <img 
                  src={collection.image} 
                  alt={collection.title} 
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl mb-1">{collection.title}</h3>
                  <p className="text-white/80 text-sm mb-3">{collection.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-xs">{collection.count} trails</span>
                    <Link 
                      to={`/trails?collection=${collection.id}`}
                      className="text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm text-xs font-medium py-1 px-3 rounded-full transition-colors"
                    >
                      View Collection
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore; 