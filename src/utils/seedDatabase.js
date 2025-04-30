import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Sample trail data
const sampleTrails = [
  {
    name: 'Pine Ridge Trail',
    location: 'Mount Evergreen, California',
    difficulty: 'Moderate',
    distance: '5.2 miles',
    elevationGain: '850 ft',
    duration: '3-4 hours',
    rating: 4.7,
    reviewCount: 128,
    description: 'A beautiful trail winding through pine forests with panoramic mountain views. The trail offers diverse scenery from dense forest sections to open vistas overlooking the valley below. Wildlife sightings are common, including deer and various bird species. The path is well-maintained with clear markers throughout.',
    trailhead: {
      coordinates: [37.7749, -122.4194],
      address: '1234 Forest Road, Evergreen, CA 95123',
      parking: 'Limited parking available at trailhead. Arrive early on weekends.',
      facilities: ['Restrooms', 'Information Board', 'Picnic Area']
    },
    bestSeasons: ['Spring', 'Fall'],
    tags: ['forest', 'views', 'wildlife', 'family-friendly', 'photography'],
    images: [
      'https://images.unsplash.com/photo-1510227272981-87123e259b17?auto=format&fit=crop&q=80&w=870',
      'https://images.unsplash.com/photo-1576176539998-0237d4b6a3cc?auto=format&fit=crop&q=80&w=774',
      'https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&q=80&w=774'
    ],
    reviews: [
      {
        id: 101,
        user: 'HikingEnthusiast',
        date: '2023-09-15',
        rating: 5,
        comment: 'Absolutely beautiful trail with diverse scenery. The viewpoints are spectacular!'
      },
      {
        id: 102,
        user: 'MountainLover',
        date: '2023-08-22',
        rating: 4,
        comment: 'Great trail, but a bit crowded on weekends. Try to go on weekdays if possible.'
      }
    ],
    tips: [
      'Bring plenty of water, especially during summer months',
      'Some sections can be muddy after rain',
      'Cell service is spotty - download offline maps'
    ],
    nearbyTrails: [2, 5]
  },
  {
    name: 'Coastal Bluff Loop',
    location: 'Pacific Coast, Oregon',
    difficulty: 'Easy',
    distance: '3.5 miles',
    elevationGain: '320 ft',
    duration: '1.5-2 hours',
    rating: 4.5,
    reviewCount: 96,
    description: 'Stunning coastal views with chances to spot marine wildlife. Perfect for families. This loop trail follows the dramatic coastline with sections through coastal forest and open headlands. The path is well-maintained and relatively flat, making it accessible for most fitness levels.',
    trailhead: {
      coordinates: [45.5051, -122.6750],
      address: '567 Coastal Highway, Pacific City, OR 97135',
      parking: 'Large parking lot available with restroom facilities',
      facilities: ['Restrooms', 'Information Board', 'Picnic Area', 'Visitor Center']
    },
    bestSeasons: ['Spring', 'Summer', 'Fall'],
    tags: ['coastal', 'views', 'family-friendly', 'wildlife', 'photography'],
    images: [
      'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?auto=format&fit=crop&q=80&w=870',
      'https://images.unsplash.com/photo-1580086319619-3ed498161c77?auto=format&fit=crop&q=80&w=870',
      'https://images.unsplash.com/photo-1543039625-14fde9c4e2e6?auto=format&fit=crop&q=80&w=774'
    ],
    reviews: [
      {
        id: 201,
        user: 'OceanLover',
        date: '2023-07-12',
        rating: 5,
        comment: 'Beautiful trail with amazing ocean views. We saw seals and even a whale in the distance!'
      },
      {
        id: 202,
        user: 'FamilyHiker',
        date: '2023-08-05',
        rating: 4,
        comment: 'Excellent trail for families with kids. Not too difficult and plenty of interesting things to see.'
      }
    ],
    tips: [
      'Watch for high tide schedules as some parts may be inaccessible',
      'Can be windy - bring a windbreaker even on sunny days',
      'Binoculars recommended for wildlife viewing'
    ],
    nearbyTrails: [1, 3]
  },
  {
    name: 'Eagle Peak Summit',
    location: 'Rocky Mountains, Colorado',
    difficulty: 'Hard',
    distance: '8.7 miles',
    elevationGain: '3200 ft',
    duration: '6-7 hours',
    rating: 4.9,
    reviewCount: 75,
    description: 'Challenging hike to the summit with breathtaking 360° views. Experienced hikers only. This trail features a steady climb through alpine forest before emerging above the tree line for the final ascent to the summit. Technical sections with some scrambling required near the peak.',
    trailhead: {
      coordinates: [39.7392, -104.9903],
      address: '8901 Mountain Pass Road, Eagleville, CO 80498',
      parking: 'Small lot that fills early. Arrive before 7am on weekends.',
      facilities: ['Vault Toilets', 'Trail Register']
    },
    bestSeasons: ['Summer'],
    tags: ['summit', 'views', 'challenging', 'alpine', 'photography'],
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=870',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=1170',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1170'
    ],
    reviews: [
      {
        id: 301,
        user: 'PeakBagger',
        date: '2023-07-29',
        rating: 5,
        comment: 'One of the most rewarding hikes in the area. The views from the summit are absolutely worth the effort!'
      },
      {
        id: 302,
        user: 'AdventureSeeker',
        date: '2023-08-15',
        rating: 5,
        comment: 'Challenging but incredible hike. Start early to avoid afternoon thunderstorms. The last mile is tough but keep going!'
      }
    ],
    tips: [
      'Start early to avoid afternoon thunderstorms',
      'Bring at least 3 liters of water per person',
      'Trekking poles recommended for the descent',
      'Layer clothing as temperatures vary significantly'
    ],
    nearbyTrails: [4, 6]
  },
  {
    name: 'Desert Canyon Trail',
    location: 'Red Rock Canyon, Arizona',
    difficulty: 'Moderate',
    distance: '6.1 miles',
    elevationGain: '950 ft',
    duration: '3-4 hours',
    rating: 4.6,
    reviewCount: 89,
    description: 'Scenic trail through colorful sandstone formations and desert flora. This trail winds through a dramatic desert landscape with towering rock formations, ancient petroglyphs, and diverse desert vegetation including cacti and wildflowers in spring.',
    trailhead: {
      coordinates: [33.4484, -112.0740],
      address: '2345 Canyon View Drive, Sedona, AZ 86336',
      parking: 'Large parking area with day-use fee ($10)',
      facilities: ['Restrooms', 'Water Station', 'Interpretive Signs']
    },
    bestSeasons: ['Fall', 'Winter', 'Spring'],
    tags: ['desert', 'canyon', 'views', 'geology', 'photography'],
    images: [
      'https://images.unsplash.com/photo-1518623001395-125242310d0c?auto=format&fit=crop&q=80&w=870',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1121',
      'https://images.unsplash.com/photo-1588392382834-a891154bca4d?auto=format&fit=crop&q=80&w=1170'
    ],
    reviews: [
      {
        id: 401,
        user: 'DesertExplorer',
        date: '2023-04-10',
        rating: 5,
        comment: 'The colors in the rock formations are incredible, especially in the late afternoon sunlight.'
      },
      {
        id: 402,
        user: 'CanyonHiker',
        date: '2023-03-22',
        rating: 4,
        comment: 'Beautiful trail but very hot even in spring. Bring plenty of water and sun protection.'
      }
    ],
    tips: [
      'Avoid summer months due to extreme heat',
      'Start early in the morning for best lighting and temperatures',
      'Bring at least 2 liters of water per person',
      'Watch for rattlesnakes in warmer months'
    ],
    nearbyTrails: [3, 5]
  },
  {
    name: 'Lakeside Loop',
    location: 'Crystal Lake, Washington',
    difficulty: 'Easy',
    distance: '2.8 miles',
    elevationGain: '180 ft',
    duration: '1-1.5 hours',
    rating: 4.3,
    reviewCount: 112,
    description: 'Peaceful trail circling a pristine alpine lake with mountain backdrops. This family-friendly loop offers constant views of the clear blue waters and surrounding peaks. Multiple access points to the shoreline for swimming or picnicking in summer.',
    trailhead: {
      coordinates: [47.6062, -122.3321],
      address: '789 Lake Access Road, Crystal Falls, WA 98765',
      parking: 'Two parking lots available. Northwest lot is less crowded.',
      facilities: ['Restrooms', 'Picnic Tables', 'Swimming Area', 'Boat Launch']
    },
    bestSeasons: ['Spring', 'Summer', 'Fall'],
    tags: ['lake', 'family-friendly', 'scenic', 'swimming', 'picnicking'],
    images: [
      'https://images.unsplash.com/photo-1580086319619-3ed498161c77?auto=format&fit=crop&q=80&w=870',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1170',
      'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&q=80&w=687&h=1031'
    ],
    reviews: [
      {
        id: 501,
        user: 'NatureParent',
        date: '2023-06-18',
        rating: 5,
        comment: 'Perfect trail for families with young children. Our kids loved stopping at the beaches along the way.'
      },
      {
        id: 502,
        user: 'WeekendWanderer',
        date: '2023-07-04',
        rating: 3,
        comment: 'Beautiful lake but very crowded on summer weekends. Go on weekdays if possible.'
      }
    ],
    tips: [
      'Very popular on summer weekends - go early or on weekdays',
      'Swimming areas on the east side have the best beaches',
      'Kid-friendly with minimal elevation change',
      'Picnic areas often fill up by noon on nice days'
    ],
    nearbyTrails: [1, 6]
  },
  {
    name: 'Wilderness Waterfall Route',
    location: 'Green Valley, Vermont',
    difficulty: 'Moderate',
    distance: '4.9 miles',
    elevationGain: '720 ft',
    duration: '2.5-3 hours',
    rating: 4.8,
    reviewCount: 67,
    description: 'Trail leading to a series of picturesque waterfalls through lush forests. This out-and-back trail follows a stream uphill through dense hardwood forest, passing three distinct waterfalls. The final waterfall features a 60-foot cascade into a emerald pool.',
    trailhead: {
      coordinates: [44.4759, -73.2121],
      address: '456 Forest Service Road, Green Valley, VT 05452',
      parking: 'Small gravel lot with space for about 15 cars',
      facilities: ['Trail Register', 'Interpretive Signs']
    },
    bestSeasons: ['Spring', 'Summer', 'Fall'],
    tags: ['waterfall', 'forest', 'scenic', 'photography', 'stream'],
    images: [
      'https://images.unsplash.com/photo-1560716082-39e8926a326f?auto=format&fit=crop&q=80&w=870',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1170',
      'https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&q=80&w=687'
    ],
    reviews: [
      {
        id: 601,
        user: 'WaterfallChaser',
        date: '2023-05-28',
        rating: 5,
        comment: 'The series of waterfalls are spectacular, especially after rain. The final falls are breathtaking!'
      },
      {
        id: 602,
        user: 'ForestBather',
        date: '2023-06-14',
        rating: 5,
        comment: 'Beautiful, peaceful trail. The sound of rushing water accompanies you the whole way. Magical experience.'
      }
    ],
    tips: [
      'Trail can be slippery when wet - proper footwear recommended',
      'Best waterfall flow in spring or after heavy rain',
      'Several stream crossings may require getting feet wet during high water',
      'Bugs can be intense in summer - bring repellent'
    ],
    nearbyTrails: [2, 5]
  }
];

/**
 * Seeds the database with sample trail data if no trails exist yet
 */
export const seedTrailsCollection = async () => {
  try {
    // Check if trails already exist
    const trailsRef = collection(db, "trails");
    const trailsSnapshot = await getDocs(trailsRef);
    
    if (trailsSnapshot.empty) {
      console.log("No existing trails found. Seeding database...");
      
      // Add each trail to the collection
      for (const trail of sampleTrails) {
        await addDoc(collection(db, "trails"), trail);
        console.log(`Added trail: ${trail.name}`);
      }
      
      console.log("Database seeding completed successfully!");
      return { success: true, message: "Database seeded with sample trails" };
    } else {
      console.log("Trails already exist in the database. Skipping seed operation.");
      return { success: false, message: "Trails already exist in the database" };
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, message: `Error: ${error.message}` };
  }
};

// Function to check if a trail with the same name already exists
export const checkTrailExists = async (trailName) => {
  try {
    const trailsRef = collection(db, "trails");
    const q = query(trailsRef, where("name", "==", trailName));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if trail exists:", error);
    return false;
  }
};

// Export the sample data for use elsewhere
export const getSampleTrailData = () => sampleTrails; 