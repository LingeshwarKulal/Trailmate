import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

const TrailsDatabase = () => {
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Form state for adding a new trail
  const [newTrail, setNewTrail] = useState({
    name: '',
    description: '',
    difficulty: 'moderate',
    length: 0,
    location: '',
    imageUrls: '',
    coordinates: { lat: 0, lng: 0 },
    ratings: ''
  });

  // Fetch all trails when component mounts
  useEffect(() => {
    fetchTrails();
  }, []);

  // Function to fetch all trails from Firestore
  const fetchTrails = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "Trails"));
      const trailList = [];
      
      querySnapshot.forEach((doc) => {
        trailList.push({ id: doc.id, ...doc.data() });
      });
      
      setTrails(trailList);
      setError(null);
    } catch (err) {
      console.error("Error fetching trails:", err);
      setError("Failed to load trails. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new trail to Firestore
  const addTrail = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to add a trail.");
      return;
    }
    
    // Basic validation
    if (!newTrail.name || !newTrail.description) {
      setError("Please provide at least a name and description.");
      return;
    }
    
    try {
      setLoading(true);
      
      // Add timestamp and user info to the trail data
      const trailData = {
        ...newTrail,
        createdAt: new Date(),
        createdBy: user.uid,
        creatorName: user.displayName || 'Anonymous',
        creatorEmail: user.email,
      };
      
      // Convert imageUrls from string to array if provided
      if (newTrail.imageUrls && typeof newTrail.imageUrls === 'string') {
        trailData.imageUrls = newTrail.imageUrls.split(',').map(url => url.trim());
      }
      
      // Add the document to Firestore
      const docRef = await addDoc(collection(db, "Trails"), trailData);
      
      // Update the local state with the new trail
      setTrails([...trails, { id: docRef.id, ...trailData }]);
      
      // Reset the form
      setNewTrail({
        name: '',
        description: '',
        difficulty: 'moderate',
        length: 0,
        location: '',
        imageUrls: '',
        coordinates: { lat: 0, lng: 0 },
        ratings: ''
      });
      
      setError(null);
    } catch (err) {
      console.error("Error adding trail:", err);
      setError("Failed to add trail. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a trail
  const deleteTrail = async (id) => {
    if (!user) {
      setError("You must be logged in to delete a trail.");
      return;
    }
    
    try {
      // Check if user is the creator or admin
      const trailDoc = await getDoc(doc(db, "Trails", id));
      const trailData = trailDoc.data();
      
      if (trailData.createdBy !== user.uid) {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        if (!userData || userData.role !== 'admin') {
          setError("You don't have permission to delete this trail.");
          return;
        }
      }
      
      if (window.confirm("Are you sure you want to delete this trail?")) {
        setLoading(true);
        await deleteDoc(doc(db, "Trails", id));
        
        // Update local state
        setTrails(trails.filter(trail => trail.id !== id));
        setError(null);
      }
    } catch (err) {
      console.error("Error deleting trail:", err);
      setError("Failed to delete trail. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      setNewTrail({
        ...newTrail,
        coordinates: {
          ...newTrail.coordinates,
          [name]: parseFloat(value) || 0
        }
      });
    } else if (name === 'length') {
      setNewTrail({
        ...newTrail,
        [name]: parseFloat(value) || 0
      });
    } else {
      setNewTrail({
        ...newTrail,
        [name]: value
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trail Management</h1>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Add Trail Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-cyan-400">Add New Trail</h2>
        
        {!user ? (
          <div className="text-amber-400 mb-4">Please log in to add a new trail.</div>
        ) : (
          <form onSubmit={addTrail}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 mb-2">Trail Name</label>
                <input
                  type="text"
                  name="name"
                  value={newTrail.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  placeholder="Trail name"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Difficulty</label>
                <select
                  name="difficulty"
                  value={newTrail.difficulty}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Length (km)</label>
                <input
                  type="number"
                  name="length"
                  value={newTrail.length}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  placeholder="Trail length"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newTrail.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  placeholder="Trail location"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-2">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  name="imageUrls"
                  value={newTrail.imageUrls}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  placeholder="URL to trail images, separate multiple with commas"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Coordinates (Latitude)</label>
                <input
                  type="number"
                  name="lat"
                  value={newTrail.coordinates.lat}
                  onChange={handleInputChange}
                  step="0.000001"
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  placeholder="Latitude (e.g. 37.7749)"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Coordinates (Longitude)</label>
                <input
                  type="number"
                  name="lng"
                  value={newTrail.coordinates.lng}
                  onChange={handleInputChange}
                  step="0.000001"
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  placeholder="Longitude (e.g. -122.4194)"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-2">Initial Rating (optional)</label>
                <input
                  type="text"
                  name="ratings"
                  value={newTrail.ratings}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  placeholder="Initial ratings (e.g. 4.5)"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={newTrail.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  rows="3"
                  placeholder="Trail description"
                ></textarea>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded transition duration-300"
            >
              {loading ? 'Adding...' : 'Add Trail'}
            </button>
          </form>
        )}
      </div>
      
      {/* Trails List */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-cyan-400">Trail List</h2>
        
        {loading && <p className="text-gray-300">Loading trails...</p>}
        
        {!loading && trails.length === 0 && (
          <p className="text-gray-300">No trails found. Add your first trail above!</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trails.map(trail => (
            <div key={trail.id} className="border border-gray-600 rounded-lg overflow-hidden bg-gray-700">
              {trail.imageUrls && (
                <img
                  src={Array.isArray(trail.imageUrls) ? trail.imageUrls[0] : trail.imageUrls}
                  alt={trail.name}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-cyan-400">{trail.name}</h3>
                <div className="flex items-center text-sm text-gray-300 mt-1 mb-2">
                  <span className="mr-3">Difficulty: {trail.difficulty}</span>
                  {trail.length !== undefined && <span>{trail.length} km</span>}
                </div>
                
                {trail.location && (
                  <p className="text-sm text-gray-400 mb-2">
                    Location: {trail.location}
                  </p>
                )}
                
                {trail.coordinates && (
                  <p className="text-sm text-gray-400 mb-2">
                    Coordinates: {trail.coordinates.lat}° N, {trail.coordinates.lng}° E
                  </p>
                )}
                
                {trail.ratings && (
                  <p className="text-sm text-gray-400 mb-2">
                    Rating: {trail.ratings}
                  </p>
                )}
                
                {trail.creatorName && (
                  <p className="text-xs text-gray-500 mb-2">
                    Added by: {trail.creatorName}
                  </p>
                )}
                
                <p className="text-gray-300 text-sm mb-3">
                  {trail.description?.substring(0, 100)}
                  {trail.description?.length > 100 ? '...' : ''}
                </p>
                
                {user && (user.uid === trail.createdBy || user.email === trail.creatorEmail) && (
                  <button
                    onClick={() => deleteTrail(trail.id)}
                    className="text-red-400 hover:text-red-300 text-sm transition duration-300"
                  >
                    Delete Trail
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrailsDatabase; 