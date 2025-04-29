// Sample trek data for the TrekMap component
const sampleTrek = {
  id: 'trek-001',
  name: 'Mountain Valley Trek',
  difficulty: 'moderate',
  duration: '3 days',
  distance: '24 km',
  elevation: {
    min: 1200,
    max: 2800,
    gain: 1600
  },
  description: 'A beautiful trek through the mountain valley with stunning views of the surrounding peaks.',
  startPointDescription: 'The trek begins at the Mountain Valley Base Camp, which is accessible by road.',
  parkingInfo: 'Free parking available at the base camp.',
  directions: 'Follow the main road to the base camp. The trek starts from the information center.',
  
  // Route coordinates (latitude, longitude)
  route: [
    { lat: 19.0760, lng: 72.8777 }, // Start point
    { lat: 19.0860, lng: 72.8877 },
    { lat: 19.0960, lng: 72.8977 },
    { lat: 19.1060, lng: 72.9077 },
    { lat: 19.1160, lng: 72.9177 },
    { lat: 19.1260, lng: 72.9277 },
    { lat: 19.1360, lng: 72.9377 },
    { lat: 19.1460, lng: 72.9477 },
    { lat: 19.1560, lng: 72.9577 },
    { lat: 19.1660, lng: 72.9677 }, // End point
  ],
  
  // Checkpoints along the route
  checkpoints: [
    {
      name: 'First Viewpoint',
      lat: 19.0960,
      lng: 72.8977,
      elevation: 1500,
      distance: '5 km',
      time: '2 hours',
      description: 'First major viewpoint with panoramic views of the valley.'
    },
    {
      name: 'River Crossing',
      lat: 19.1160,
      lng: 72.9177,
      elevation: 1300,
      distance: '10 km',
      time: '4 hours',
      description: 'Cross the mountain river using the wooden bridge.'
    },
    {
      name: 'Summit Approach',
      lat: 19.1460,
      lng: 72.9477,
      elevation: 2500,
      distance: '20 km',
      time: '8 hours',
      description: 'The final approach to the summit, with steep sections.'
    }
  ],
  
  // Camping zones
  campingZones: [
    {
      name: 'Valley Camp',
      lat: 19.1060,
      lng: 72.9077,
      elevation: 1400,
      description: 'A flat area with good water sources and fire pits.',
      waterSource: 'Stream nearby'
    },
    {
      name: 'Mountain Camp',
      lat: 19.1360,
      lng: 72.9377,
      elevation: 2200,
      description: 'Sheltered camping area with wind protection.',
      waterSource: 'Spring 100m away'
    }
  ],
  
  // Risk areas
  riskAreas: [
    {
      name: 'Rocky Section',
      lat: 19.1260,
      lng: 72.9277,
      elevation: 1800,
      description: 'Loose rocks and steep terrain.',
      risk: 'High',
      advice: 'Use trekking poles and proceed with caution.'
    },
    {
      name: 'Weather Zone',
      lat: 19.1560,
      lng: 72.9577,
      elevation: 2600,
      description: 'Area prone to sudden weather changes.',
      risk: 'Medium',
      advice: 'Check weather forecast and be prepared for rain.'
    }
  ],
  
  // Highlights and points of interest
  highlights: [
    {
      name: 'Waterfall',
      lat: 19.1160,
      lng: 72.9177,
      type: 'Natural Feature',
      bestTime: 'Morning',
      description: 'Beautiful 30m waterfall with a swimming pool.'
    },
    {
      name: 'Ancient Ruins',
      lat: 19.1360,
      lng: 72.9377,
      type: 'Historical',
      bestTime: 'Afternoon',
      description: 'Remains of an old mountain settlement.'
    },
    {
      name: 'Sunset Point',
      lat: 19.1460,
      lng: 72.9477,
      type: 'Viewpoint',
      bestTime: 'Evening',
      description: 'Spectacular sunset views over the valley.'
    }
  ],
  
  // Required gear
  requiredGear: [
    'Trekking boots',
    'Backpack (40-50L)',
    'Tent',
    'Sleeping bag',
    'Water bottles (2L)',
    'First aid kit',
    'Headlamp',
    'Trekking poles',
    'Rain jacket',
    'Food for 3 days'
  ],
  
  // Safety tips
  safetyTips: [
    'Always trek in groups of at least 2 people',
    'Carry sufficient water and food',
    'Check weather forecast before starting',
    'Inform local authorities about your trek',
    'Follow marked trails only',
    'Carry a first aid kit and know how to use it',
    'Be aware of altitude sickness symptoms'
  ]
};

export default sampleTrek; 