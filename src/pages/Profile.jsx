import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/firebaseConfig';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  
  // User profile data
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    memberSince: '',
    profileImage: '',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=870',
    socialLinks: {
      instagram: '',
      twitter: '',
      facebook: ''
    }
  });

  // User hiking stats
  const [hikingStats, setHikingStats] = useState({
    totalHikes: 0,
    totalDistance: 0,
    totalElevation: 0,
    trailsCompleted: 0,
    badges: [
      { name: 'Mountain Goat', description: 'Completed 5 mountain summit trails', icon: '🏔️' },
      { name: 'Early Bird', description: 'Completed 10 sunrise hikes', icon: '🌅' },
      { name: 'Trail Blazer', description: 'Hiked over 300 miles', icon: '👣' },
      { name: 'Explorer', description: 'Visited 20 different parks', icon: '🧭' }
    ],
    recentActivities: []
  });

  // Saved and favorite trails
  const [savedTrails, setSavedTrails] = useState([]);

  // Settings state
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editableUserData, setEditableUserData] = useState({...userData});

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Format the timestamp for member since date
          const memberSinceDate = userData.createdAt ? 
            new Date(userData.createdAt.toDate()).toLocaleString('default', { month: 'long', year: 'numeric' }) : 
            'N/A';
          
          setUserData({
            name: userData.name || user.displayName || 'Trail User',
            email: userData.email || user.email || '',
            location: userData.location || 'Location not set',
            bio: userData.bio || 'No bio yet',
            memberSince: memberSinceDate,
            profileImage: userData.photoURL || user.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            coverImage: userData.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=870',
            socialLinks: userData.socialLinks || {
              instagram: '',
              twitter: '',
              facebook: ''
            }
          });
          
          // Set editable data to match fetched data
          setEditableUserData({
            name: userData.name || user.displayName || 'Trail User',
            email: userData.email || user.email || '',
            location: userData.location || 'Location not set',
            bio: userData.bio || 'No bio yet',
            memberSince: memberSinceDate,
            profileImage: userData.photoURL || user.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            coverImage: userData.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=870',
            socialLinks: userData.socialLinks || {
              instagram: '',
              twitter: '',
              facebook: ''
            }
          });
          
          // Fetch user's saved trails if available
          if (userData.savedTrails && userData.savedTrails.length > 0) {
            setSavedTrails(userData.savedTrails);
          }
          
          // Fetch user's hiking stats if available
          if (userData.hikingStats) {
            setHikingStats(prevStats => ({
              ...prevStats,
              ...userData.hikingStats,
              // Keep default badges if none are available
              badges: userData.hikingStats.badges || prevStats.badges,
              // Keep empty activities array if none are available
              recentActivities: userData.hikingStats.recentActivities || []
            }));
          }
        } else {
          console.log("No user document found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  // Toggle favorite status for a trail
  const toggleFavorite = (trailId) => {
    setSavedTrails(savedTrails.map(trail => 
      trail.id === trailId ? {...trail, isFavorite: !trail.isFavorite} : trail
    ));
  };

  // Remove trail from saved list
  const removeTrail = (trailId) => {
    setSavedTrails(savedTrails.filter(trail => trail.id !== trailId));
  };

  // Handle form submission for profile edit
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to update your profile");
      return;
    }
    
    try {
      setLoading(true);
      
      // Update Firestore document
      const userDocRef = doc(db, "users", user.uid);
      
      await updateDoc(userDocRef, {
        name: editableUserData.name,
        email: editableUserData.email,
        location: editableUserData.location,
        bio: editableUserData.bio,
        socialLinks: editableUserData.socialLinks,
        // Don't update fields that should be managed elsewhere
        // such as createdAt, lastLogin, etc.
      });
      
      // Update local state
      setUserData(editableUserData);
      setIsEditing(false);
      
      // Show success message (optional)
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes in edit mode
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditableUserData({
        ...editableUserData,
        [parent]: {
          ...editableUserData[parent],
          [child]: value
        }
      });
    } else {
      setEditableUserData({
        ...editableUserData,
        [name]: value
      });
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!user) {
      setError("You must be logged in to upload a photo");
      return;
    }

    // Validate file type
    if (!file.type.match('image.*')) {
      setError("Please select an image file");
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      // Update Firestore document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        photoURL: photoURL
      });
      
      // Update local state
      setUserData(prevData => ({
        ...prevData,
        profileImage: photoURL
      }));
      
      setEditableUserData(prevData => ({
        ...prevData,
        profileImage: photoURL
      }));
      
      // Show success message
      alert("Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const renderProfileContent = () => {
    if (isEditing) {
      return (
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-4">
                <img
                  src={editableUserData.profileImage}
                  alt={editableUserData.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow hover:bg-green-700"
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">Click the camera icon to upload a new photo</p>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editableUserData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editableUserData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={editableUserData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={editableUserData.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <p className="block text-sm font-medium text-gray-700">Social Links</p>
              
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Instagram:</span>
                <input
                  type="text"
                  name="socialLinks.instagram"
                  value={editableUserData.socialLinks.instagram}
                  onChange={handleInputChange}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Twitter:</span>
                <input
                  type="text"
                  name="socialLinks.twitter"
                  value={editableUserData.socialLinks.twitter}
                  onChange={handleInputChange}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Facebook:</span>
                <input
                  type="text"
                  name="socialLinks.facebook"
                  value={editableUserData.socialLinks.facebook}
                  onChange={handleInputChange}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditableUserData({...userData});
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Profile details and contact information.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.email}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.location}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Member since</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.memberSince}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Bio</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.bio}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Social Profiles</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Connect with me on social media.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {userData.socialLinks.instagram && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Instagram</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a 
                      href={`https://instagram.com/${userData.socialLinks.instagram}`} 
                      className="text-green-600 hover:text-green-700"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      @{userData.socialLinks.instagram}
                    </a>
                  </dd>
                </div>
              )}
              
              {userData.socialLinks.twitter && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Twitter</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a 
                      href={`https://twitter.com/${userData.socialLinks.twitter}`} 
                      className="text-green-600 hover:text-green-700"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      @{userData.socialLinks.twitter}
                    </a>
                  </dd>
                </div>
              )}
              
              {userData.socialLinks.facebook && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Facebook</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a 
                      href={`https://facebook.com/${userData.socialLinks.facebook}`} 
                      className="text-green-600 hover:text-green-700"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {userData.socialLinks.facebook}
                    </a>
                  </dd>
                </div>
              )}
              
              {!userData.socialLinks.instagram && !userData.socialLinks.twitter && !userData.socialLinks.facebook && (
                <div className="px-4 py-5">
                  <p className="text-sm text-gray-500 italic">No social profiles linked yet.</p>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    );
  };

  const renderStatsContent = () => {
    return (
      <div className="space-y-8">
        {/* Main Stats */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hiking Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Total Hikes</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{hikingStats.totalHikes}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Distance</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{hikingStats.totalDistance} <span className="text-lg">mi</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Elevation Gain</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{hikingStats.totalElevation.toLocaleString()} <span className="text-lg">ft</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Trails Completed</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{hikingStats.trailsCompleted}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Badges */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {hikingStats.badges.map((badge, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h4 className="font-medium text-gray-900 mb-1">{badge.name}</h4>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trail</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hikingStats.recentActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.trail}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.distance}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.photos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSavedTrailsContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Saved Trails</h3>
          <div className="flex space-x-2">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              All Trails ({savedTrails.length})
            </button>
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Favorites ({savedTrails.filter(t => t.isFavorite).length})
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedTrails.map((trail) => (
            <div key={trail.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
              <div className="h-48 relative">
                <img src={trail.imageUrl} alt={trail.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => toggleFavorite(trail.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  {trail.isFavorite ? (
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{trail.name}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                    trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {trail.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{trail.location}</p>
                <div className="mt-auto flex justify-between items-center">
                  <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                    View Details
                  </button>
                  <button
                    onClick={() => removeTrail(trail.id)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header with Cover Image and Profile Picture */}
      <div className="relative mb-8">
        <div className="h-64 overflow-hidden rounded-lg">
          <img 
            src={userData.coverImage} 
            alt="Cover" 
            className="w-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <div className="relative">
            <img 
              src={userData.profileImage} 
              alt={userData.name} 
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
            />
          </div>
        </div>
        <div className="absolute bottom-4 right-8">
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="ml-8 mt-16">
        <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
        <p className="text-gray-600">{userData.location}</p>
        <p className="text-sm text-gray-500 mt-1">Member since {userData.memberSince}</p>
      </div>

      {/* Profile Navigation */}
      <div className="border-b border-gray-200 mt-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSection('profile')}
            className={`pb-4 px-1 ${
              activeSection === 'profile'
                ? 'border-b-2 border-green-600 text-green-600 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveSection('stats')}
            className={`pb-4 px-1 ${
              activeSection === 'stats'
                ? 'border-b-2 border-green-600 text-green-600 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveSection('saved')}
            className={`pb-4 px-1 ${
              activeSection === 'saved'
                ? 'border-b-2 border-green-600 text-green-600 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Saved Trails
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`pb-4 px-1 ${
              activeSection === 'settings'
                ? 'border-b-2 border-green-600 text-green-600 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button 
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please login to view your profile</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to access your profile information.</p>
            <a href="/login" className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors">
              Go to Login
            </a>
          </div>
        ) : (
          <>
            {activeSection === 'profile' && renderProfileContent()}
            {activeSection === 'stats' && renderStatsContent()}
            {activeSection === 'saved' && renderSavedTrailsContent()}
            {activeSection === 'settings' && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-900">Account Settings</h3>
                <p className="text-gray-600 mt-2">Coming soon...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile; 