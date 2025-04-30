import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Shopping Cart Component
const ShoppingCart = () => {
  const { cartItems, cartOpen, setCartOpen, removeFromCart, updateQuantity, getCartTotal } = useCart();
  
  if (!cartOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Shopping Cart</h2>
          <button 
            onClick={() => setCartOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li key={item.id} className="py-4 flex">
                    <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-gray-500 hover:text-gray-700"
                            disabled={item.quantity <= 1}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="mx-2 text-gray-700">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex">
                          <button 
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="font-medium text-red-600 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="border-t border-gray-200 py-4 mt-4">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Subtotal</p>
                  <p>${getCartTotal().toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Checkout
                  </Link>
                </div>
                <div className="mt-4 flex justify-center text-sm text-center text-gray-500">
                  <p>
                    or{' '}
                    <button
                      type="button"
                      className="text-green-600 font-medium hover:text-green-500"
                      onClick={() => setCartOpen(false)}
                    >
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Cart Button Component
const CartButton = () => {
  const { getCartCount, setCartOpen } = useCart();
  const itemCount = getCartCount();
  
  return (
    <button
      className="relative p-2 text-gray-600 hover:text-gray-900"
      onClick={() => setCartOpen(true)}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {itemCount}
        </span>
      )}
    </button>
  );
};

const GearRecommendations = () => {
  const [gearItems, setGearItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchGearItems = async () => {
      try {
        setLoading(true);
        
        // Attempt to fetch gear from Firestore
        const gearRef = collection(db, "gear");
        const gearSnapshot = await getDocs(gearRef);
        
        if (!gearSnapshot.empty) {
          const gearList = gearSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setGearItems(gearList);
        } else {
          // If no gear items in Firestore, use sample data
          setGearItems(sampleGearItems);
        }
      } catch (err) {
        console.error("Error fetching gear items:", err);
        setError("Failed to load gear recommendations. Using sample data instead.");
        setGearItems(sampleGearItems);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGearItems();
  }, []);

  // Filter gear items based on selected category
  const filteredGearItems = filter === 'all' 
    ? gearItems 
    : gearItems.filter(item => item.category === filter);

  // Function to handle opening the product modal
  const openProductModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Handle adding item to cart from modal
  const handleAddToCart = (item) => {
    addToCart(item);
    setShowModal(false);
    setSelectedItem(null);
  };

  // Product Detail Modal Component
  const ProductDetailModal = () => {
    if (!selectedItem) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button 
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2 h-64 md:h-auto">
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.name}
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Product Details */}
            <div className="p-6 md:w-1/2">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {selectedItem.category}
                </span>
              </div>
              
              <div className="mb-4 flex items-center">
                <div className="flex items-center">
                  {Array(5).fill(0).map((_, i) => (
                    <svg 
                      key={i}
                      className={`h-5 w-5 ${i < selectedItem.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({selectedItem.reviewCount} reviews)</span>
                </div>
                <div className="ml-auto text-xl font-bold text-green-600">${selectedItem.price}</div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">Features:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                  {selectedItem.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                
                <div className="mt-8 mb-2">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                  <select
                    id="quantity"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                    defaultValue="1"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button 
                    onClick={closeModal} 
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleAddToCart(selectedItem)}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hiking Gear Recommendations</h1>
            <p className="text-gray-600">Essential equipment for your hiking adventures</p>
          </div>
          <div>
            <CartButton />
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="gearFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                id="gearFilter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Gear</option>
                <option value="footwear">Footwear</option>
                <option value="clothing">Clothing</option>
                <option value="navigation">Navigation</option>
                <option value="hydration">Hydration</option>
                <option value="backpacks">Backpacks</option>
                <option value="shelter">Shelter</option>
                <option value="safety">Safety</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Gear Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {filteredGearItems.length === 0 ? (
              <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No gear items found</h3>
                <p className="mt-1 text-sm text-gray-500">No gear items match your current filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGearItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.category}
                        </span>
                      </div>
                      <div className="mb-3 flex items-center">
                        <div className="flex items-center">
                          {Array(5).fill(0).map((_, i) => (
                            <svg 
                              key={i}
                              className={`h-5 w-5 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({item.reviewCount})</span>
                        </div>
                        <div className="ml-auto text-lg font-bold text-green-600">${item.price}</div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Key Features:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {item.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="line-clamp-1">{feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={() => openProductModal(item)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => addToCart(item)}
                          className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                          title="Add to cart"
                        >
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Recommended Gear Sets Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Gear Sets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src="https://images.pexels.com/photos/6814247/pexels-photo-6814247.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                    alt="Day Hiker Essentials" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Day Hiker Essentials</h3>
                  <p className="text-gray-600 mb-4">Everything you need for short treks and day hikes. Lightweight and practical gear for casual hikers.</p>
                  <ul className="text-sm text-gray-600 mb-4">
                    <li className="flex items-center mb-1">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      20L Day Backpack
                    </li>
                    <li className="flex items-center mb-1">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Water Bottle (1L)
                    </li>
                    <li className="flex items-center mb-1">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Trail Runners
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      First Aid Kit (Basic)
                    </li>
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">$120 - $180</span>
                    <button
                      onClick={() => {
                        // Find items in this bundle
                        const backpack = gearItems.find(item => item.category === 'backpacks');
                        const bottle = gearItems.find(item => item.category === 'hydration');
                        const shoes = gearItems.find(item => item.category === 'footwear');
                        
                        // Add them to cart
                        if (backpack) addToCart(backpack);
                        if (bottle) addToCart(bottle);
                        if (shoes) addToCart(shoes);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Add Bundle to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src="https://images.pexels.com/photos/2526025/pexels-photo-2526025.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                    alt="Overnight Trek Package" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Overnight Trek Package</h3>
                  <p className="text-gray-600 mb-4">Complete setup for 1-2 night adventures. Balances comfort with packability for weekend explorers.</p>
                  <ul className="text-sm text-gray-600 mb-4">
                    <li className="flex items-center mb-1">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      45L Backpack
                    </li>
                    <li className="flex items-center mb-1">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      2-Person Tent
                    </li>
                    <li className="flex items-center mb-1">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Sleeping Bag (20°F)
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Water Filter
                    </li>
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">$350 - $500</span>
                    <button
                      onClick={() => {
                        // Find items in this bundle
                        const backpack = gearItems.find(item => item.category === 'backpacks');
                        const stove = gearItems.find(item => item.category === 'shelter');
                        const filter = gearItems.find(item => item.category === 'safety' && item.name.includes('Filter'));
                        
                        // Add them to cart
                        if (backpack) addToCart(backpack);
                        if (stove) addToCart(stove);
                        if (filter) addToCart(filter);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Add Bundle to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Modal */}
        {showModal && <ProductDetailModal />}
        
        {/* Shopping Cart */}
        <ShoppingCart />
      </div>
    </div>
  );
};

// Sample gear items data
const sampleGearItems = [
  {
    id: '1',
    name: 'TrailRunner X3 Hiking Boots',
    category: 'footwear',
    description: 'Durable, waterproof hiking boots with excellent ankle support and grip. Perfect for rough terrain and all-day comfort on the trail.',
    price: 149.99,
    rating: 4,
    reviewCount: 128,
    imageUrl: 'https://images.pexels.com/photos/6945069/pexels-photo-6945069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    purchaseUrl: '#',
    features: [
      'Waterproof Gore-Tex membrane',
      'Vibram outsole for superior traction',
      'Cushioned EVA midsole',
      'Reinforced toe cap for protection'
    ]
  },
  {
    id: '2',
    name: 'HydroFlask 32oz Water Bottle',
    category: 'hydration',
    description: 'Double-walled vacuum insulated stainless steel water bottle that keeps beverages cold for 24 hours or hot for 12 hours.',
    price: 39.95,
    rating: 5,
    reviewCount: 243,
    imageUrl: 'https://images.pexels.com/photos/4397809/pexels-photo-4397809.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    purchaseUrl: '#',
    features: [
      'Double-wall vacuum insulation',
      'BPA-free and phthalate-free',
      'Durable powder coat finish',
      'Wide mouth for easy filling and cleaning'
    ]
  },
  {
    id: '3',
    name: 'Osprey Talon 22 Backpack',
    category: 'backpacks',
    description: 'Lightweight, versatile daypack with excellent organization and comfort features. Ideal for day hikes and light overnight trips.',
    price: 120.00,
    rating: 5,
    reviewCount: 189,
    imageUrl: 'https://images.pexels.com/photos/2510529/pexels-photo-2510529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    purchaseUrl: '#',
    features: [
      'Integrated hydration sleeve',
      'AirScape back panel for ventilation',
      'Trekking pole attachment',
      'Multiple compartments for organization'
    ]
  },
  {
    id: '4',
    name: 'Patagonia Nano Puff Jacket',
    category: 'clothing',
    description: 'Lightweight, water-resistant insulated jacket that provides excellent warmth without bulk. Packs down into its own pocket.',
    price: 199.00,
    rating: 4,
    reviewCount: 156,
    imageUrl: 'https://images.pexels.com/photos/1230679/pexels-photo-1230679.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    purchaseUrl: '#',
    features: [
      '60g PrimaLoft Gold Insulation',
      'Windproof and water-resistant shell',
      'Recycled polyester ripstop fabric',
      'Stuffs into internal chest pocket'
    ]
  },
  {
    id: '5',
    name: 'Garmin GPSMAP 66i',
    category: 'navigation',
    description: 'Advanced handheld GPS device with satellite communication capabilities. Navigate confidently and stay connected even in remote areas.',
    price: 599.99,
    rating: 4,
    reviewCount: 72,
    imageUrl: 'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    purchaseUrl: '#',
    features: [
      'Inreach satellite communication',
      'Preloaded topographic maps',
      '16GB internal memory',
      'Up to 35 hours of battery life'
    ]
  },
  {
    id: '6',
    name: 'Black Diamond Spot 350 Headlamp',
    category: 'safety',
    description: 'Powerful, waterproof headlamp with multiple lighting modes. Essential for night hiking, camp setup, and emergency situations.',
    price: 39.95,
    rating: 4,
    reviewCount: 112,
    imageUrl: 'https://images.pexels.com/photos/9159420/pexels-photo-9159420.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    purchaseUrl: '#',
    features: [
      '350 lumens of adjustable light',
      'Red night vision mode',
      'IPX8 waterproof rating',
      'Brightness memory'
    ]
  },
  {
    id: '7',
    name: 'MSR PocketRocket 2 Stove',
    category: 'shelter',
    description: 'Ultralight and compact camping stove that boils water in under 3.5 minutes. Perfect for backpacking and minimalist camping.',
    price: 44.95,
    rating: 5,
    reviewCount: 98,
    imageUrl: 'https://images.pexels.com/photos/6271625/pexels-photo-6271625.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    purchaseUrl: '#',
    features: [
      'Weighs only 2.6 oz (73g)',
      'Boils 1 liter of water in 3.5 minutes',
      'Adjustable flame control',
      'Compatible with most screw-top canisters'
    ]
  },
  {
    id: '8',
    name: 'Smartwool Merino Hiking Socks',
    category: 'clothing',
    description: 'Premium merino wool socks that regulate temperature, wick moisture, and prevent blisters during long hikes.',
    price: 22.95,
    rating: 5,
    reviewCount: 215,
    imageUrl: 'https://images.pexels.com/photos/6937505/pexels-photo-6937505.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    purchaseUrl: '#',
    features: [
      'Merino wool blend for odor resistance',
      'Medium cushioning for comfort',
      'Flat knit toe seam prevents blisters',
      'Elastic arch brace for support'
    ]
  },
  {
    id: '9',
    name: 'Lifestraw Personal Water Filter',
    category: 'safety',
    description: 'Compact emergency water filter that removes 99.999% of bacteria, parasites, and microplastics. A must-have for backcountry safety.',
    price: 19.95,
    rating: 4,
    reviewCount: 328,
    imageUrl: 'https://images.pexels.com/photos/7421264/pexels-photo-7421264.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    purchaseUrl: '#',
    features: [
      'Filters up to 1,000 gallons (4,000L)',
      'Removes 99.999% of waterborne bacteria',
      'No batteries or moving parts',
      'Compact and lightweight (2oz)'
    ]
  }
];

export default GearRecommendations; 