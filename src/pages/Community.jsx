import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

  // Filter posts based on search term
  const filteredPosts = forumPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <button className="md:w-1/3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
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
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        <Link to={`/community/post/${post.id}`} className="hover:text-green-600">
                          {post.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="font-medium text-gray-900">{post.author.name}</span>
                        <span className="mx-2">•</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          {post.author.level}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{post.date}</span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{post.content}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
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
                          {post.replies} replies
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
                          {post.likes} likes
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
      </div>
    </div>
  );
};

export default Community;