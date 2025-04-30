import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useAuth(); // Get current user from auth context
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Shipping information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    
    // Billing information
    sameAsShipping: true,
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'United States',
    
    // Payment information
    paymentMethod: 'credit',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const [errors, setErrors] = useState({});

  // Redirect if cart is empty or user is not logged in
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      navigate('/gear');
    }
    
    // Wait a moment to check auth status before redirecting
    const checkAuthTimer = setTimeout(() => {
      // Check if user is logged in
      if (!user) {
        console.log('User not authenticated, redirecting to login');
        // Store the return URL in localStorage for better persistence
        localStorage.setItem('authReturnUrl', '/checkout');
        
        // Redirect to login page
        navigate('/login');
      }
    }, 1000); // Short delay to allow auth state to be restored
    
    return () => clearTimeout(checkAuthTimer);
  }, [cartItems, navigate, orderComplete, user]);

  // Populate email from user profile if available
  useEffect(() => {
    if (user && user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate based on current step
    if (step === 1) {
      // Shipping validation
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
    } else if (step === 2 && !formData.sameAsShipping) {
      // Billing validation (only if different from shipping)
      if (!formData.billingFirstName) newErrors.billingFirstName = 'First name is required';
      if (!formData.billingLastName) newErrors.billingLastName = 'Last name is required';
      if (!formData.billingAddress) newErrors.billingAddress = 'Address is required';
      if (!formData.billingCity) newErrors.billingCity = 'City is required';
      if (!formData.billingState) newErrors.billingState = 'State is required';
      if (!formData.billingPostalCode) newErrors.billingPostalCode = 'Postal code is required';
    } else if (step === 3) {
      // Payment validation
      if (formData.paymentMethod === 'credit') {
        if (!formData.cardName) newErrors.cardName = 'Name on card is required';
        if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
        else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) 
          newErrors.cardNumber = 'Card number must be 16 digits';
        if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiration date is required';
        else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) 
          newErrors.cardExpiry = 'Use format MM/YY';
        if (!formData.cardCvc) newErrors.cardCvc = 'CVC is required';
        else if (!/^\d{3,4}$/.test(formData.cardCvc)) 
          newErrors.cardCvc = 'CVC must be 3 or 4 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateForm()) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle back
  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Handle final submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Verify user is still authenticated before submitting
      if (!user) {
        throw new Error('User is not authenticated');
      }
      
      // Create order object
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        shipping: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        billing: formData.sameAsShipping ? null : {
          firstName: formData.billingFirstName,
          lastName: formData.billingLastName,
          address: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          postalCode: formData.billingPostalCode,
          country: formData.billingCountry
        },
        paymentMethod: formData.paymentMethod,
        subtotal: getCartTotal(),
        shipping: 9.99,
        tax: getCartTotal() * 0.07,
        total: getCartTotal() + 9.99 + getCartTotal() * 0.07,
        status: 'completed',
        createdAt: serverTimestamp()
      };
      
      // Save order to Firestore
      const orderRef = await addDoc(collection(db, "orders"), orderData);
      
      // Set order ID from Firestore
      setOrderId(orderRef.id);
      
      // Clear cart and show confirmation
      clearCart();
      setOrderComplete(true);
      
    } catch (error) {
      console.error('Error processing order:', error);
      
      // If error is authentication related, redirect to login
      if (error.message.includes('not authenticated')) {
        alert('Your session has expired. Please log in again.');
        localStorage.setItem('authReturnUrl', '/checkout');
        navigate('/login');
      } else {
        alert('There was an error processing your order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Order confirmation screen
  if (orderComplete) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg className="mx-auto h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Order Completed!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Thank you for your purchase. Your order has been confirmed.
              </p>
              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-500">ORDER NUMBER</p>
                <p className="text-lg font-bold text-gray-900">{orderId}</p>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-4">
                  A confirmation email has been sent to {formData.email}
                </p>
                <div className="flex space-x-4 justify-center">
                  <Link
                    to="/gear"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    to="/profile/orders"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    View Order History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
        </div>
        
        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex justify-center">
            <ol className="flex items-center w-full max-w-3xl">
              {['Shipping', 'Billing', 'Payment'].map((stepName, index) => {
                const stepNumber = index + 1;
                return (
                  <li key={stepName} className={`flex items-center ${index < 2 ? 'w-full' : ''}`}>
                    <div className="flex flex-col items-center">
                      <div 
                        className={`flex items-center justify-center h-10 w-10 rounded-full
                          ${stepNumber < step ? 'bg-green-600' : 
                            stepNumber === step ? 'bg-green-500' : 'bg-gray-300'} 
                          text-white`}
                      >
                        {stepNumber < step ? (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span>{stepNumber}</span>
                        )}
                      </div>
                      <span className={`text-sm font-medium mt-2 ${step === stepNumber ? 'text-gray-900' : 'text-gray-500'}`}>
                        {stepName}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className="w-full bg-gray-200 h-1 mx-2">
                        <div 
                          className="bg-green-600 h-1" 
                          style={{ width: step > stepNumber + 1 ? '100%' : step === stepNumber + 1 ? '50%' : '0%' }}
                        ></div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Form Section */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
              {/* Shipping Information - Step 1 */}
              {step === 1 && (
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <div className="mt-1">
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Street address
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State / Province
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="state"
                          id="state"
                          value={formData.state}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                        ZIP / Postal code
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="postalCode"
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <div className="mt-1">
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="shadow-sm block w-full sm:text-sm rounded-md p-2 border border-gray-300"
                        >
                          <option>United States</option>
                          <option>Canada</option>
                          <option>Mexico</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Information - Step 2 */}
              {step === 2 && (
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h2>
                  
                  <div className="mb-6">
                    <div className="flex items-center">
                      <input
                        id="sameAsShipping"
                        name="sameAsShipping"
                        type="checkbox"
                        checked={formData.sameAsShipping}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                      <label htmlFor="sameAsShipping" className="ml-2 block text-sm text-gray-900">
                        Same as shipping address
                      </label>
                    </div>
                  </div>
                  
                  {!formData.sameAsShipping && (
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="billingFirstName"
                            id="billingFirstName"
                            value={formData.billingFirstName}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.billingFirstName ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.billingFirstName && <p className="mt-1 text-sm text-red-600">{errors.billingFirstName}</p>}
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="billingLastName"
                            id="billingLastName"
                            value={formData.billingLastName}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.billingLastName ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.billingLastName && <p className="mt-1 text-sm text-red-600">{errors.billingLastName}</p>}
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
                          Street address
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="billingAddress"
                            id="billingAddress"
                            value={formData.billingAddress}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.billingAddress ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.billingAddress && <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="billingCity"
                            id="billingCity"
                            value={formData.billingCity}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.billingCity ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.billingCity && <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="billingState" className="block text-sm font-medium text-gray-700">
                          State / Province
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="billingState"
                            id="billingState"
                            value={formData.billingState}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.billingState ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.billingState && <p className="mt-1 text-sm text-red-600">{errors.billingState}</p>}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700">
                          ZIP / Postal code
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="billingPostalCode"
                            id="billingPostalCode"
                            value={formData.billingPostalCode}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.billingPostalCode ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.billingPostalCode && <p className="mt-1 text-sm text-red-600">{errors.billingPostalCode}</p>}
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700">
                          Country
                        </label>
                        <div className="mt-1">
                          <select
                            id="billingCountry"
                            name="billingCountry"
                            value={formData.billingCountry}
                            onChange={handleChange}
                            className="shadow-sm block w-full sm:text-sm rounded-md p-2 border border-gray-300"
                          >
                            <option>United States</option>
                            <option>Canada</option>
                            <option>Mexico</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Information - Step 3 */}
              {step === 3 && (
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                  
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="paymentMethodCredit"
                        name="paymentMethod"
                        type="radio"
                        value="credit"
                        checked={formData.paymentMethod === 'credit'}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 border-gray-300"
                      />
                      <label htmlFor="paymentMethodCredit" className="ml-3 block text-sm font-medium text-gray-700">
                        Credit / Debit Card
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="paymentMethodPaypal"
                        name="paymentMethod"
                        type="radio"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 border-gray-300"
                      />
                      <label htmlFor="paymentMethodPaypal" className="ml-3 block text-sm font-medium text-gray-700">
                        PayPal
                      </label>
                    </div>
                  </div>
                  
                  {formData.paymentMethod === 'credit' && (
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                          Name on card
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="cardName"
                            id="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.cardName && <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>}
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                          Card number
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="cardNumber"
                            id="cardNumber"
                            placeholder="XXXX XXXX XXXX XXXX"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                          Expiration date (MM/YY)
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="cardExpiry"
                            id="cardExpiry"
                            placeholder="MM/YY"
                            value={formData.cardExpiry}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.cardExpiry && <p className="mt-1 text-sm text-red-600">{errors.cardExpiry}</p>}
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700">
                          CVC
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="cardCvc"
                            id="cardCvc"
                            placeholder="XXX"
                            value={formData.cardCvc}
                            onChange={handleChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.cardCvc ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.cardCvc && <p className="mt-1 text-sm text-red-600">{errors.cardCvc}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.paymentMethod === 'paypal' && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-md text-blue-800">
                      <p>You will be redirected to PayPal to complete your payment after reviewing your order.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isProcessing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
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
                            <p className="text-gray-500">Qty {item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <p>Subtotal</p>
                    <p>${getCartTotal().toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <p>Shipping</p>
                    <p>$9.99</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <p>Tax</p>
                    <p>${(getCartTotal() * 0.07).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>${(getCartTotal() + 9.99 + getCartTotal() * 0.07).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 