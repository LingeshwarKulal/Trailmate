import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const TrailPlanner = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const preselectedDestination = searchParams.get('destination');

  const [planName, setPlanName] = useState(preselectedDestination ? `Trip to ${preselectedDestination}` : '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTrails, setSelectedTrails] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [gearRecommendations, setGearRecommendations] = useState([]);
  const [packingItems, setPackingItems] = useState({
    essentials: [
      { id: 1, name: 'Backpack', checked: true },
      { id: 2, name: 'Hiking boots', checked: true },
      { id: 3, name: 'Water bottle', checked: true },
      { id: 4, name: 'First aid kit', checked: false },
      { id: 5, name: 'Map & compass', checked: false }
    ],
    clothing: [
      { id: 6, name: 'Moisture-wicking shirts', checked: false },
      { id: 7, name: 'Hiking pants', checked: false },
      { id: 8, name: 'Rain jacket', checked: false },
      { id: 9, name: 'Hat', checked: false },
      { id: 10, name: 'Extra socks', checked: false }
    ],
    camping: [
      { id: 11, name: 'Tent', checked: false },
      { id: 12, name: 'Sleeping bag', checked: false },
      { id: 13, name: 'Sleeping pad', checked: false },
      { id: 14, name: 'Cooking supplies', checked: false },
      { id: 15, name: 'Headlamp', checked: false }
    ]
  });

  // Sample trail data for selection
  const availableTrails = [
    {
      id: 1,
      name: 'Pine Ridge Trail',
      location: 'Mount Evergreen',
      difficulty: 'Moderate',
      distance: '5.2 miles',
      duration: '3-4 hours',
      elevation: '850 ft',
      imageUrl: 'https://images.unsplash.com/photo-1510227272981-87123e259b17?auto=format&fit=crop&q=80&w=870'
    },
    {
      id: 2,
      name: 'Coastal Bluff Loop',
      location: 'Pacific Coast',
      difficulty: 'Easy',
      distance: '3.5 miles',
      duration: '1.5-2 hours',
      elevation: '320 ft',
      imageUrl: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?auto=format&fit=crop&q=80&w=870'
    },
    {
      id: 3,
      name: 'Eagle Peak Summit',
      location: 'Rocky Mountains',
      difficulty: 'Hard',
      distance: '8.7 miles',
      duration: '6-7 hours',
      elevation: '3200 ft',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=870'
    },
    {
      id: 4,
      name: 'Desert Canyon Trail',
      location: 'Red Rock Canyon',
      difficulty: 'Moderate',
      distance: '6.1 miles',
      duration: '3-4 hours',
      elevation: '950 ft',
      imageUrl: 'https://images.unsplash.com/photo-1518623001395-125242310d0c?auto=format&fit=crop&q=80&w=870'
    }
  ];

  // Handle adding a trail to the itinerary
  const addTrail = (trail) => {
    if (!selectedTrails.some(t => t.id === trail.id)) {
      setSelectedTrails([...selectedTrails, { ...trail, date: '' }]);
    }
  };

  // Handle removing a trail from the itinerary
  const removeTrail = (id) => {
    setSelectedTrails(selectedTrails.filter(trail => trail.id !== id));
  };

  // Handle updating a trail's planned date
  const updateTrailDate = (id, date) => {
    setSelectedTrails(
      selectedTrails.map(trail => 
        trail.id === id ? { ...trail, date } : trail
      )
    );
  };

  // Toggle packing item checked status
  const togglePackingItem = (category, id) => {
    setPackingItems({
      ...packingItems,
      [category]: packingItems[category].map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    });
  };

  // Add a custom packing item
  const addCustomItem = (category, name) => {
    if (name.trim() === '') return;
    
    const newId = Math.max(...packingItems[category].map(item => item.id), 0) + 1;
    setPackingItems({
      ...packingItems,
      [category]: [...packingItems[category], { id: newId, name, checked: false }]
    });
    
    // Clear the input field (assuming you'd have a state for this)
    setCustomItemText('');
  };

  // State for custom item input
  const [customItemText, setCustomItemText] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState('essentials');

  // Progress to next step
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  // Go back to previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Calculate trip statistics
  const calculateStats = () => {
    const totalDistance = selectedTrails.reduce(
      (sum, trail) => sum + parseFloat(trail.distance), 
      0
    ).toFixed(1);
    
    const totalDuration = selectedTrails.reduce(
      (sum, trail) => {
        const [min, max] = trail.duration.split('-').map(d => parseFloat(d));
        return sum + (min + max) / 2;
      }, 
      0
    ).toFixed(1);
    
    const totalElevation = selectedTrails.reduce(
      (sum, trail) => sum + parseInt(trail.elevation), 
      0
    );
    
    return { totalDistance, totalDuration, totalElevation };
  };

  const { totalDistance, totalDuration, totalElevation } = calculateStats();

  // Generate gear recommendations based on selected trails
  const generateGearRecommendations = () => {
    // Base recommendations that everyone needs
    const baseRecommendations = [
      { id: 'base1', name: 'Hiking Backpack', category: 'essentials', importance: 'high', reason: 'Required for carrying all your gear' },
      { id: 'base2', name: 'Water Bottle', category: 'hydration', importance: 'high', reason: 'Essential for staying hydrated' },
      { id: 'base3', name: 'Trail Map', category: 'navigation', importance: 'high', reason: 'Important for navigation' },
    ];
    
    let recommendations = [...baseRecommendations];
    
    // Check if any difficult trails are selected
    const hasDifficultTrails = selectedTrails.some(trail => trail.difficulty === 'Hard');
    
    // Check if any long trails are selected (more than 6 miles)
    const hasLongTrails = selectedTrails.some(trail => parseFloat(trail.distance) > 6);
    
    // Check if high elevation trails are selected
    const hasHighElevation = selectedTrails.some(trail => parseInt(trail.elevation) > 2000);
    
    // Calculate trip duration in days
    let tripDuration = 1;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      tripDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Add recommendations based on trail attributes
    if (hasDifficultTrails) {
      recommendations.push(
        { id: 'diff1', name: 'Trekking Poles', category: 'equipment', importance: 'medium', reason: 'Recommended for difficult trails with steep sections' },
        { id: 'diff2', name: 'Ankle Support Hiking Boots', category: 'footwear', importance: 'high', reason: 'Essential for difficult terrain' }
      );
    }
    
    if (hasLongTrails) {
      recommendations.push(
        { id: 'long1', name: 'Hydration Bladder (2L)', category: 'hydration', importance: 'high', reason: 'Recommended for longer hikes' },
        { id: 'long2', name: 'Energy Bars/Snacks', category: 'food', importance: 'medium', reason: 'Essential for maintaining energy on long hikes' }
      );
    }
    
    if (hasHighElevation) {
      recommendations.push(
        { id: 'elev1', name: 'Sun Protection (Hat, Sunglasses)', category: 'clothing', importance: 'high', reason: 'Important at high elevations where UV exposure is greater' },
        { id: 'elev2', name: 'Insulating Layer', category: 'clothing', importance: 'medium', reason: 'Temperatures can drop at higher elevations' }
      );
    }
    
    // Add overnight gear if trip is multiple days
    if (tripDuration > 1) {
      recommendations.push(
        { id: 'camp1', name: 'Tent', category: 'shelter', importance: 'high', reason: 'Essential for overnight trips' },
        { id: 'camp2', name: 'Sleeping Bag', category: 'shelter', importance: 'high', reason: 'Essential for overnight trips' },
        { id: 'camp3', name: 'Cooking Equipment', category: 'food', importance: 'medium', reason: 'Needed for preparing meals' }
      );
    }
    
    setGearRecommendations(recommendations);
  };

  // Complete the planner and show recommendations
  const completePlanner = () => {
    generateGearRecommendations();
    setIsComplete(true);
  };

  // Render different steps of the planner
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Name
                </label>
                <input
                  type="text"
                  id="planName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Give your trip a name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={!planName || !startDate}
                >
                  Next: Select Trails
                </button>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Select Trails</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Trails */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Available Trails</h3>
                <div className="space-y-4">
                  {availableTrails.map(trail => (
                    <div key={trail.id} className="border border-gray-200 rounded-lg overflow-hidden flex">
                      <div className="w-24 h-24">
                        <img
                          src={trail.imageUrl}
                          alt={trail.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-900">{trail.name}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                            trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {trail.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{trail.location}</p>
                        <div className="flex text-xs text-gray-500 mb-3">
                          <span className="mr-3">{trail.distance}</span>
                          <span className="mr-3">{trail.duration}</span>
                          <span>{trail.elevation} elevation</span>
                        </div>
                        <button
                          onClick={() => addTrail(trail)}
                          className="text-sm text-green-600 hover:text-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={selectedTrails.some(t => t.id === trail.id)}
                        >
                          {selectedTrails.some(t => t.id === trail.id) ? 'Added to Itinerary' : 'Add to Itinerary'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Selected Trails */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Itinerary</h3>
                {selectedTrails.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No trails selected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add trails from the list to create your itinerary.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTrails.map(trail => (
                      <div key={trail.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{trail.name}</h4>
                          <button
                            onClick={() => removeTrail(trail.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{trail.location}</p>
                        <div className="mb-3">
                          <label htmlFor={`trail-date-${trail.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Planned Date
                          </label>
                          <input
                            type="date"
                            id={`trail-date-${trail.id}`}
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            value={trail.date}
                            onChange={(e) => updateTrailDate(trail.id, e.target.value)}
                            min={startDate}
                            max={endDate}
                          />
                        </div>
                        <div className="flex text-xs text-gray-500">
                          <span className="mr-3">{trail.distance}</span>
                          <span className="mr-3">{trail.duration}</span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Trip Summary</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Total Distance</p>
                          <p className="font-medium">{totalDistance} miles</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Estimated Duration</p>
                          <p className="font-medium">{totalDuration} hours</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Elevation</p>
                          <p className="font-medium">{totalElevation} ft</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={selectedTrails.length === 0}
              >
                Next: Packing List
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Packing List</h2>
            
            <div className="space-y-8">
              {Object.keys(packingItems).map(category => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">{category}</h3>
                  <ul className="space-y-2">
                    {packingItems[category].map(item => (
                      <li key={item.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`item-${item.id}`}
                          checked={item.checked}
                          onChange={() => togglePackingItem(category, item.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className={`ml-3 text-sm ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                        >
                          {item.name}
                        </label>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-3 flex">
                    <div className="relative rounded-md shadow-sm flex-1 mr-2">
                      <input
                        type="text"
                        placeholder="Add custom item..."
                        className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        value={customItemCategory === category ? customItemText : ''}
                        onChange={(e) => {
                          setCustomItemText(e.target.value);
                          setCustomItemCategory(category);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && customItemCategory === category) {
                            addCustomItem(category, customItemText);
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => addCustomItem(category, customItemText)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={completePlanner}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Complete & Get Gear Recommendations
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Add recommendations section that shows after form completion
  const renderGearRecommendations = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recommended Gear</h2>
          <p className="text-sm text-gray-600">Based on your selected trails and trip details</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trip Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Trails</p>
              <p className="font-medium">{selectedTrails.length} selected</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Distance</p>
              <p className="font-medium">{totalDistance} miles</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trip Duration</p>
              <p className="font-medium">
                {startDate && endDate ? (
                  `${Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} days`
                ) : (
                  'Not specified'
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* High Priority Gear */}
          <div>
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Essential Gear
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gearRecommendations
                .filter(item => item.importance === 'high')
                .map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Essential
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{item.reason}</p>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Medium Priority Gear */}
          <div>
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Recommended Gear
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gearRecommendations
                .filter(item => item.importance === 'medium')
                .map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{item.reason}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setIsComplete(false)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Edit Trip
          </button>
          <a
            href="/gear"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
          >
            <span>Shop Recommended Gear</span>
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Trail Trip Planner</h1>
        
        {!isComplete ? (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center">
                <div className="flex items-center relative">
                  <div className={`rounded-full transition duration-500 ease-in-out h-10 w-10 flex items-center justify-center ${
                    currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300'
                  }`}>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 ml-2">Trip Details</div>
                </div>
                <div className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                  currentStep >= 2 ? 'border-green-600' : 'border-gray-300'
                }`}></div>
                <div className="flex items-center relative">
                  <div className={`rounded-full transition duration-500 ease-in-out h-10 w-10 flex items-center justify-center ${
                    currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300'
                  }`}>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 ml-2">Select Trails</div>
                </div>
                <div className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                  currentStep >= 3 ? 'border-green-600' : 'border-gray-300'
                }`}></div>
                <div className="flex items-center relative">
                  <div className={`rounded-full transition duration-500 ease-in-out h-10 w-10 flex items-center justify-center ${
                    currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300'
                  }`}>
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 ml-2">Packing List</div>
                </div>
              </div>
            </div>
            
            {/* Step Content */}
            {renderStep()}
          </>
        ) : (
          renderGearRecommendations()
        )}
      </div>
    </div>
  );
};

export default TrailPlanner; 