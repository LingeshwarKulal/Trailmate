export const treks = [
  {
    id: 1,
    name: "Rajgad Fort Trek",
    location: [18.2508, 73.6877],
    elevation: "4,514 ft",
    difficulty: "Moderate",
    description: "Historic fort trek with panoramic views of the Sahyadri range. Perfect for history enthusiasts and photographers.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    duration: "6-7 hours",
    distance: "14 km",
    bestSeason: "October to February",
    startPoint: "Gunjavane Village",
    route: [
      [18.2508, 73.6877],
      [18.2518, 73.6887],
      [18.2528, 73.6897],
      // Add more coordinates for the route
    ]
  },
  {
    id: 2,
    name: "Kalsubai Peak Trek",
    location: [19.6012, 73.7062],
    elevation: "5,400 ft",
    difficulty: "Challenging",
    description: "Highest peak in Maharashtra offering breathtaking views. Features iron ladders and steep climbs.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    duration: "5-6 hours",
    distance: "8 km",
    bestSeason: "October to March",
    startPoint: "Bari Village",
    route: [
      [19.6012, 73.7062],
      [19.6022, 73.7072],
      [19.6032, 73.7082],
      // Add more coordinates for the route
    ]
  },
  {
    id: 3,
    name: "Harishchandragad Trek",
    location: [19.3867, 73.7769],
    elevation: "4,670 ft",
    difficulty: "Moderate to Challenging",
    description: "Ancient fort with unique rock formations and the famous Konkan Kada cliff.",
    image: "https://images.unsplash.com/photo-1455156218388-5e61b526818b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    duration: "2 days",
    distance: "16 km",
    bestSeason: "October to February",
    startPoint: "Pachnai Village",
    route: [
      [19.3867, 73.7769],
      [19.3877, 73.7779],
      [19.3887, 73.7789],
      // Add more coordinates for the route
    ]
  },
  {
    id: 4,
    name: "Torna Fort Trek",
    location: [18.2767, 73.6226],
    elevation: "4,603 ft",
    difficulty: "Moderate",
    description: "First fort captured by Shivaji Maharaj, offering stunning valley views.",
    image: "https://images.unsplash.com/photo-1587547111211-9d312df48a06?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    duration: "5-6 hours",
    distance: "10 km",
    bestSeason: "September to February",
    startPoint: "Velhe Village",
    route: [
      [18.2767, 73.6226],
      [18.2777, 73.6236],
      [18.2787, 73.6246],
      // Add more coordinates for the route
    ]
  },
  {
    id: 5,
    name: "Lohagad Fort Trek",
    location: [18.7082, 73.4747],
    elevation: "3,389 ft",
    difficulty: "Easy",
    description: "Popular trek near Lonavala with well-maintained steps and monsoon waterfalls.",
    image: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
    duration: "3-4 hours",
    distance: "7 km",
    bestSeason: "All year",
    startPoint: "Lohagad Village",
    route: [
      [18.7082, 73.4747],
      [18.7092, 73.4757],
      [18.7102, 73.4767],
      // Add more coordinates for the route
    ]
  }
];

export const difficultyColors = {
  "Easy": "bg-green-500",
  "Moderate": "bg-yellow-500",
  "Challenging": "bg-red-500",
  "Moderate to Challenging": "bg-orange-500"
}; 