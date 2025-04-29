import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GearRecommendations from '../components/GearRecommendations/GearRecommendations';

const Home = () => {
  const features = [
    {
      title: 'Discover Trails',
      description: 'Explore thousands of hiking trails with detailed information on difficulty, length, elevation, and user reviews.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      title: 'Plan Your Adventure',
      description: 'Create custom hiking itineraries, save routes, and organize your outdoor activities all in one place.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Gear Recommendations',
      description: 'Get personalized gear suggestions based on trail conditions, weather forecasts, and your hiking preferences.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const testimonials = [
    {
      content: "TrailMate completely transformed how I plan my hiking trips. The trail recommendations are spot-on, and the gear advice has saved me from making many mistakes!",
      author: "Alex Thompson",
      role: "Weekend Hiker",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      content: "As someone who hikes frequently, having all my trail information in one place is invaluable. The community features help me connect with fellow hikers too!",
      author: "Sarah Johnson",
      role: "Avid Mountaineer",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      content: "The trail difficulty ratings are accurate, and the weather integration helps me avoid unpleasant surprises. TrailMate is now essential for all my outdoor adventures.",
      author: "Michael Chen",
      role: "Trail Runner",
      image: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center md:max-w-3xl md:mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
            >
              Your Ultimate Hiking Companion
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-xl text-gray-600"
            >
              Discover trails, plan adventures, and connect with nature using the most comprehensive hiking platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/trails"
                className="btn-primary py-3 px-6 text-base font-medium shadow-md"
              >
                Explore Trails
              </Link>
              <Link
                to="/planner"
                className="btn-outline py-3 px-6 text-base font-medium shadow-sm"
              >
                Plan Your Hike
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 opacity-10">
          <svg
            width="400"
            height="400"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-green-600"
          >
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="currentColor" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M43.2203 0.813904C78.1016 1.64058 107.841 -3.26492 135.742 13.5014C164.313 30.6856 187.386 56.5302 196.191 88.2698C205.267 121.025 201.659 156.001 181.815 182.75C161.311 210.43 128.342 225.982 94.1636 229.68C62.0328 233.165 32.7782 219.896 8.83658 198.534C-14.4024 177.794 -25.8555 148.676 -25.285 118.691C-24.718 89.0239 -6.03888 63.4566 15.9056 41.8056C36.5551 21.4637 63.6397 14.7086 92.4973 4.16849C92.4973 4.16849 60.8022 0.395984 43.2203 0.813904Z"
              fill="url(#paint0_linear)"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 opacity-10">
          <svg
            width="400"
            height="400"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-green-600"
          >
            <defs>
              <linearGradient id="paint1_linear" x1="200" y1="200" x2="0" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="currentColor" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M156.78 199.186C121.898 198.359 92.1586 203.265 64.2577 186.499C35.6867 169.314 12.6139 143.47 3.80883 111.73C-5.26714 78.9752 -1.6591 43.9985 18.1853 17.25C38.6888 -10.4302 71.6577 -25.9822 105.836 -29.6796C137.967 -33.1647 167.222 -19.8962 191.163 1.46561C214.402 22.2056 225.856 51.3235 225.285 81.3086C224.718 110.976 206.039 136.543 184.094 158.194C163.445 178.536 136.36 185.291 107.503 195.831C107.503 195.831 139.198 199.604 156.78 199.186Z"
              fill="url(#paint1_linear)"
            />
          </svg>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need For Your Next Adventure
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We've built the most comprehensive platform for hikers and outdoor enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-start p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-3 rounded-lg bg-green-100 text-green-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trail Explorer Preview */}
      <section className="py-16 lg:py-24 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
                Find Your Perfect Trail
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Browse thousands of trails with detailed information on difficulty, distance, elevation gain, and user reviews. Filter by location, features, and more to find exactly what you're looking for.
              </p>
              <ul className="space-y-4">
                {[
                  'Interactive trail maps with GPS tracking',
                  'Real-time weather forecasts for trail conditions',
                  'User reviews and trail ratings',
                  'Save favorite trails for quick access'
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-center text-gray-600"
                  >
                    <svg className="h-5 w-5 text-green-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/trails"
                  className="btn-primary py-2.5 px-5 text-base font-medium shadow-md"
                >
                  Explore Trails
                </Link>
              </div>
            </div>
            <div className="relative rounded-2xl shadow-xl overflow-hidden lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Trail map interface" 
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center">
                  <div className="bg-green-600 rounded-full py-1 px-3 text-xs font-semibold">
                    Featured
                  </div>
                  <div className="ml-3 text-sm bg-white/20 backdrop-blur-sm rounded-full py-1 px-3">
                    4.8 ★ (124 reviews)
                  </div>
                </div>
                <h3 className="mt-3 text-xl font-bold">Eagle Creek to Tunnel Falls</h3>
                <p className="text-white/80 text-sm">Columbia River Gorge, Oregon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Hear From Our Hiking Community
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Discover why hikers love using TrailMate for their adventures.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={testimonial.image}
                      alt={testimonial.author}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-gray-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 italic">{testimonial.content}</p>
                  <div className="flex items-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < 5 ? "text-green-600" : "text-gray-300"}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-green-700 to-green-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63" stroke="white" strokeWidth="100" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Start Your Next Adventure?
            </h2>
            <p className="mt-6 text-xl text-green-100">
              Join thousands of hikers who've found their perfect trails with TrailMate.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-green-50 transition-colors"
              >
                Sign Up For Free
              </Link>
              <Link
                to="/trails"
                className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600/20 backdrop-blur-sm hover:bg-green-600/30 transition-colors"
              >
                Browse Trails
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GearRecommendations />
    </div>
  );
};

export default Home; 