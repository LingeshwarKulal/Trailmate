// This file contains GeoJSON data for trail routes
// In a production app, this would come from a backend API or database

// Sample GeoJSON data for some of our trails
const trailRoutes = {
  // Pine Ridge Trail
  "1": {
    type: "Feature",
    properties: {
      name: "Pine Ridge Trail",
      difficulty: "Moderate"
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.4194, 37.7749], // Starting point
        [-122.4184, 37.7752],
        [-122.4174, 37.7762],
        [-122.4154, 37.7772],
        [-122.4134, 37.7782],
        [-122.4114, 37.7792],
        [-122.4094, 37.7802],
        [-122.4074, 37.7812], // End point
      ]
    }
  },
  
  // Coastal Bluff Loop
  "2": {
    type: "Feature",
    properties: {
      name: "Coastal Bluff Loop",
      difficulty: "Easy"
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.6750, 45.5051], // Starting point
        [-122.6740, 45.5055],
        [-122.6730, 45.5060],
        [-122.6720, 45.5065],
        [-122.6710, 45.5070],
        [-122.6700, 45.5075],
        [-122.6710, 45.5080],
        [-122.6720, 45.5085],
        [-122.6730, 45.5090],
        [-122.6740, 45.5085],
        [-122.6750, 45.5080],
        [-122.6750, 45.5051], // End point (loop)
      ]
    }
  },
  
  // Eagle Peak Summit
  "3": {
    type: "Feature",
    properties: {
      name: "Eagle Peak Summit",
      difficulty: "Hard"
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [-104.9903, 39.7392], // Starting point
        [-104.9893, 39.7395],
        [-104.9883, 39.7400],
        [-104.9873, 39.7405],
        [-104.9863, 39.7410],
        [-104.9853, 39.7415],
        [-104.9843, 39.7420],
        [-104.9833, 39.7425],
        [-104.9823, 39.7430],
        [-104.9813, 39.7435], // Summit
      ]
    }
  },
  
  // Desert Canyon Trail
  "4": {
    type: "Feature",
    properties: {
      name: "Desert Canyon Trail",
      difficulty: "Moderate"
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [-112.0740, 33.4484], // Starting point
        [-112.0730, 33.4488],
        [-112.0720, 33.4492],
        [-112.0710, 33.4496],
        [-112.0700, 33.4500],
        [-112.0690, 33.4504],
        [-112.0680, 33.4508],
        [-112.0670, 33.4512], // End point
      ]
    }
  }
};

// Function to get a trail route by ID
export const getTrailRoute = (trailId) => {
  return trailRoutes[trailId] || null;
};

// Function to get all trail routes
export const getAllTrailRoutes = () => {
  return {
    type: "FeatureCollection",
    features: Object.values(trailRoutes)
  };
};

export default trailRoutes; 