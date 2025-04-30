import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indexUrl, setIndexUrl] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        // Check if user is available
        if (!user || !user.uid) {
          console.log('User not authenticated, redirecting to login');
          localStorage.setItem('authReturnUrl', '/profile/orders');
          navigate('/login');
          return;
        }
        
        setLoading(true);
        
        try {
          // First try with compound query (requires index)
          const ordersQuery = query(
            collection(db, "orders"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          
          const ordersSnapshot = await getDocs(ordersQuery);
          
          if (!ordersSnapshot.empty) {
            const ordersData = ordersSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Convert Firestore timestamp to JS Date
              createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
            }));
            
            setOrders(ordersData);
          } else {
            // Set empty orders array if no orders found
            setOrders([]);
          }
        } catch (indexError) {
          // Check if it's a missing index error
          if (indexError.message && indexError.message.includes("index")) {
            console.warn("Missing index for compound query, falling back to simple query");
            
            // Extract the index URL from the error message if available
            const urlMatch = indexError.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
            if (urlMatch) {
              setIndexUrl(urlMatch[0]);
            }
            
            // Fallback: use simple query without orderBy and sort client-side
            const simpleQuery = query(
              collection(db, "orders"),
              where("userId", "==", user.uid)
            );
            
            const simpleSnapshot = await getDocs(simpleQuery);
            
            if (!simpleSnapshot.empty) {
              let ordersData = simpleSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamp to JS Date
                createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
              }));
              
              // Sort client-side by createdAt (newest first)
              ordersData.sort((a, b) => b.createdAt - a.createdAt);
              
              setOrders(ordersData);
            } else {
              setOrders([]);
            }
          } else {
            // Re-throw if it's not an index error
            throw indexError;
          }
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
        setError("Failed to load order history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderHistory();
  }, [user, navigate]);

  // Handler to view order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Modal for viewing order details
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Modal header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">
              Order Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Modal content */}
          <div className="px-6 py-4">
            {/* Order summary */}
            <div className="mb-6 bg-gray-50 rounded-md p-4">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {order.status || 'Completed'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium text-gray-900">${order.total ? order.total.toFixed(2) : '0.00'}</p>
                </div>
              </div>
            </div>
            
            {/* Order items */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Items</h4>
              <div className="border-t border-gray-200">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex py-4 border-b border-gray-200">
                    {item.imageUrl && (
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover object-center" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.options && Object.entries(item.options).map(([key, value]) => (
                        <p key={key} className="mt-1 text-xs text-gray-500">{key}: {value}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Shipping details */}
            {order.shipping && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h4>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="font-medium">{order.shipping.firstName} {order.shipping.lastName}</p>
                  <p>{order.shipping.address}</p>
                  <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}</p>
                  <p>{order.shipping.country}</p>
                </div>
              </div>
            )}
            
            {/* Billing details */}
            {order.billing && !order.sameAsShipping && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h4>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="font-medium">{order.billing.firstName} {order.billing.lastName}</p>
                  <p>{order.billing.address}</p>
                  <p>{order.billing.city}, {order.billing.state} {order.billing.postalCode}</p>
                  <p>{order.billing.country}</p>
                </div>
              </div>
            )}
            
            {/* Payment details */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h4>
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex justify-between text-sm mb-2">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-900">${order.subtotal ? order.subtotal.toFixed(2) : '0.00'}</p>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <p className="text-gray-600">Shipping</p>
                  <p className="text-gray-900">${order.shipping && typeof order.shipping === 'number' ? order.shipping.toFixed(2) : '9.99'}</p>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <p className="text-gray-600">Tax</p>
                  <p className="text-gray-900">${order.tax ? order.tax.toFixed(2) : '0.00'}</p>
                </div>
                <div className="flex justify-between text-base font-medium">
                  <p className="text-gray-900">Total</p>
                  <p className="text-gray-900">${order.total ? order.total.toFixed(2) : '0.00'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal footer */}
          <div className="px-6 py-3 bg-gray-50 text-right">
            <button
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Order History</h1>
          <p className="mt-2 text-gray-600">View and track your previous orders</p>
        </div>
        
        {indexUrl && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  For optimal performance, this application requires a Firestore index.
                  {' '}
                  <a href={indexUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                    Click here
                  </a>
                  {' '}
                  to create it (Admin access required).
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {loading ? (
            <div className="flex justify-center my-12">
              <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-red-800">{error}</h3>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-gray-500">You haven't placed any orders yet.</p>
              <div className="mt-6">
                <a
                  href="/gear"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Start Shopping
                </a>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col">
                          {order.items && order.items.map((item, index) => (
                            <div key={index} className="flex items-center mb-1 last:mb-0">
                              <span className="font-medium">{item.quantity}x</span>
                              <span className="ml-2">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${order.total ? order.total.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {order.status || 'Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Render modal when an order is selected */}
      {showModal && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => {
            setShowModal(false);
            setSelectedOrder(null);
          }} 
        />
      )}
    </div>
  );
};

export default OrderHistory; 