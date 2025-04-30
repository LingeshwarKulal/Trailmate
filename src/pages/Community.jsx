import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Sample forum posts data
const forumPosts = [
  {
    id: 1,
    title: 'Best trails for beginners in California?',
    author: {
      name: 'Alex Thompson',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      level: 'Explorer'
    },
    date: '2 days ago',
    content: 'Hi everyone! I\'m new to hiking and looking for some beginner-friendly trails in the California area. Any recommendations for scenic trails that aren\'t too challenging?',
    replies: 12,
    likes: 24,
    tags: ['beginner', 'california', 'recommendations']
  },
  {
    id: 2,
    title: 'Essential gear for winter hiking?',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      level: 'Trail Master'
    },
    date: '5 days ago',
    content: 'Planning my first winter hiking trip next month. Can anyone recommend essential gear I should invest in? I already have good boots and a backpack, but not sure what else I\'ll need.',
    replies: 28,
    likes: 42,
    tags: ['gear', 'winter hiking', 'equipment']
  },
  {
    id: 3,
    title: 'Trip Report: Mount Rainier Summit',
    author: {
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      level: 'Peak Bagger'
    },
    date: '1 week ago',
    content: 'Just completed my ascent of Mount Rainier! Here\'s a detailed trip report including trail conditions, weather, and some amazing photos from the summit...',
    replies: 16,
    likes: 35,
    tags: ['trip report', 'mount rainier', 'summit']
  },
  {
    id: 4,
    title: 'Looking for hiking partners in Portland area',
    author: {
      name: 'Emily Davis',
      avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
      level: 'Hiker'
    },
    date: '3 days ago',
    content: 'Hi Portland hikers! I recently moved to the area and looking for some hiking buddies to explore trails together. I\'m available most weekends and prefer moderate to challenging hikes.',
    replies: 8,
    likes: 12,
    tags: ['hiking partners', 'portland', 'group hikes']
  }
];

// Sample community events
const events = [
  {
    id: 1,
    title: 'Trail Cleanup Day',
    date: 'Nov 15, 2023',
    location: 'Eagle Creek Trail, Oregon',
    participants: 18,
    image: 'https://images.unsplash.com/photo-1527261636912-39e4dce70fbd?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 2,
    title: 'Beginner\'s Hiking Workshop',
    date: 'Nov 22, 2023',
    location: 'Forest Park, Portland',
    participants: 24,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=500'
  }
];

// Sample active members
const activeMembers = [
  { id: 1, name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', posts: 42 },
  { id: 2, name: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', posts: 38 },
  { id: 3, name: 'Alex Thompson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', posts: 27 },
  { id: 4, name: 'Emily Davis', avatar: 'https://randomuser.me/api/portraits/women/15.jpg', posts: 24 }
];

const Community = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch forum posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const postsQuery = query(
          collection(db, 'forumPosts'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(postsQuery);
        const postsList = [];
        
        querySnapshot.forEach((doc) => {
          postsList.push({
            id: doc.id,
            ...doc.data(),
            // Format date for display if it's a timestamp
            date: doc.data().createdAt ? formatDate(doc.data().createdAt) : 'Just now'
          });
        });
        
        setPosts(postsList);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  // Format date from timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    if (timestamp.toDate) {
      // Convert Firestore timestamp to JS Date
      const date = timestamp.toDate();
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Today - show hours
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks ago`;
      } else {
        return new Intl.DateTimeFormat('en-US', { 
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date);
      }
    }
    
    return timestamp;
  };

  // Filter posts based on search term and active tab
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by tab if needed
    if (activeTab === 'all' || activeTab === 'discussions') {
      return matchesSearch;
    } else if (activeTab === 'trip-reports') {
      return matchesSearch && post.tags?.includes('trip report');
    } else if (activeTab === 'gear-talk') {
      return matchesSearch && (post.tags?.includes('gear') || post.tags?.includes('equipment'));
    }
    
    return matchesSearch;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }
    
    // Basic validation
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setError("Please provide a title and content for your post.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Process tags into an array
      const tagArray = newPost.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
      
      // Prepare post data
      const postData = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        tags: tagArray,
        author: {
          name: user.displayName || 'Anonymous User',
          avatar: user.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
          level: 'Hiker', // Default level for new users
          uid: user.uid
        },
        createdAt: serverTimestamp(),
        replies: 0,
        likes: 0
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, "forumPosts"), postData);
      
      // Add to local state with formatted date for immediate display
      setPosts([
        {
          id: docRef.id,
          ...postData,
          date: 'Just now',
          createdAt: new Date() // Temporary local date until we refresh
        },
        ...posts
      ]);
      
      // Reset form and close modal
      setNewPost({
        title: '',
        content: '',
        tags: ''
      });
      setShowCreateModal(false);
      
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TrailMate Community</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Connect with fellow hikers, share your experiences, and join local events. 
            Our community is here to help you make the most of your outdoor adventures.
          </p>
        </div>

        {/* Search and Create Post */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="md:w-2/3">
            <input
              type="text"
              placeholder="Search discussions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="md:w-1/3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            onClick={() => setShowCreateModal(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Post
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Forum Posts */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'discussions'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('discussions')}
                >
                  Discussions
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'trip-reports'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('trip-reports')}
                >
                  Trip Reports
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'gear-talk'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('gear-talk')}
                >
                  Gear Talk
                </button>
              </nav>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <>
                  {filteredPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <img
                          src={post.author?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                          alt={post.author?.name || 'Anonymous'}
                          className="w-12 h-12 rounded-full mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <Link to={`/community/post/${post.id}`} className="hover:text-green-600">
                              {post.title}
                            </Link>
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <span className="font-medium text-gray-900">{post.author?.name || 'Anonymous'}</span>
                            <span className="mx-2">•</span>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                              {post.author?.level || 'Hiker'}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{post.date}</span>
                          </div>
                          <p className="text-gray-700 mb-4 line-clamp-2">{post.content}</p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="flex items-center mr-4">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {post.replies || 0} replies
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              {post.likes || 0} likes
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* No Results Message */}
                  {filteredPosts.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No discussions found</h3>
                      <p className="mt-1 text-gray-500">Try different search terms or create a new post.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Upcoming Events
              </h3>
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-32 object-cover" />
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {event.date}
                        </div>
                        <div className="flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {event.location}
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {event.participants} participants
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/events" className="mt-4 block text-center text-sm text-green-600 hover:text-green-800 font-medium">
                View All Events →
              </Link>
            </div>

            {/* Active Members */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Active Members
              </h3>
              <div className="divide-y divide-gray-200">
                {activeMembers.map(member => (
                  <div key={member.id} className="flex items-center py-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.posts} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Join Community CTA */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-sm p-6 text-white">
              <h3 className="text-lg font-medium mb-2">Join Our Community</h3>
              <p className="text-green-100 mb-4">
                Connect with fellow hikers, share your experiences, and get advice from experienced trail enthusiasts.
              </p>
              <button className="w-full bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                Sign Up Now
              </button>
            </div>
          </div>
        </div>

        {/* Create New Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Create New Post</h3>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                {!user ? (
                  <div className="text-center py-6">
                    <p className="mb-4 text-gray-700">You need to sign in to create a post.</p>
                    <Link 
                      to="/login" 
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleCreatePost}>
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={newPost.title}
                        onChange={handleInputChange}
                        placeholder="Give your post a descriptive title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content *
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        value={newPost.content}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder="Share your question, experience or thoughts..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={newPost.tags}
                        onChange={handleInputChange}
                        placeholder="beginner, gear, california, recommendations"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Add relevant tags to help others find your post
                      </p>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                          isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? 'Posting...' : 'Create Post'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;