import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

// For debugging
const DEBUG = true;
const debugLog = (...args) => {
  if (DEBUG) {
    console.log('[AuthContext]', ...args);
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Register with email and password
  async function register(email, password, name) {
    debugLog('Registering user:', email);
    setAuthError(null);
    
    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      debugLog('User created successfully:', userCredential.user.uid);
      
      try {
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: name
        });
        debugLog('User profile updated with name:', name);
        
        // Create user document in Firestore
        try {
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name,
            email,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            role: 'user', // Default role
            uid: userCredential.user.uid // Store UID for reference
          });
          debugLog('User document created in Firestore');
        } catch (firestoreError) {
          console.error("Error creating Firestore user document:", firestoreError);
          // Continue registration process even if Firestore fails
        }
      } catch (profileError) {
        // Log but don't throw profile/Firestore errors - still allow registration to succeed
        console.error("Error updating profile:", profileError);
      }

      // Force update the user state
      setUser(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      console.error("Registration error:", error);
      setAuthError(error);
      throw error;
    }
  }

  // Login with email and password
  async function login(email, password) {
    debugLog('Logging in user:', email);
    setAuthError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      debugLog('Login successful for user:', userCredential.user.uid);
      
      // Update last login
      try {
        const userRef = doc(db, "users", userCredential.user.uid);
        
        // First check if the user document exists
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Update existing document
          await setDoc(userRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
          debugLog('Updated lastLogin in Firestore');
        } else {
          // Create new user document if it doesn't exist
          await setDoc(userRef, {
            email: userCredential.user.email,
            name: userCredential.user.displayName || email.split('@')[0],
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            role: 'user',
            uid: userCredential.user.uid
          });
          debugLog('Created new user document for existing auth user');
        }
      } catch (firestoreError) {
        // Log but don't throw Firestore errors - still allow login to succeed
        console.error("Error updating last login time:", firestoreError);
      }
      
      // Force update the user state
      setUser(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error);
      throw error;
    }
  }

  // Logout
  async function logout() {
    debugLog('Logging out user');
    setAuthError(null);
    
    try {
      await signOut(auth);
      debugLog('User logged out successfully');
      
      // Force update user state
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError(error);
      throw error;
    }
  }

  // Reset password
  async function resetPassword(email) {
    debugLog('Sending password reset email to:', email);
    setAuthError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      debugLog('Password reset email sent successfully');
    } catch (error) {
      console.error("Password reset error:", error);
      setAuthError(error);
      throw error;
    }
  }

  // Google sign-in
  async function googleSignIn() {
    debugLog('Attempting Google sign-in');
    setAuthError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      debugLog('Google sign-in successful for user:', userCredential.user.uid);
      
      try {
        // Check if this is a new user
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (!userDoc.exists()) {
          // Create user document for new Google users
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: userCredential.user.displayName,
            email: userCredential.user.email,
            photoURL: userCredential.user.photoURL,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            authProvider: "google",
            role: 'user',
            uid: userCredential.user.uid
          });
          debugLog('Created new user document for Google sign-in');
        } else {
          // Update last login time
          await setDoc(doc(db, "users", userCredential.user.uid), {
            lastLogin: serverTimestamp()
          }, { merge: true });
          debugLog('Updated lastLogin for Google sign-in');
        }
      } catch (firestoreError) {
        // Log but don't throw Firestore errors - still allow sign-in to succeed
        console.error("Error with Firestore during Google sign-in:", firestoreError);
      }
      
      // Force update the user state
      setUser(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      setAuthError(error);
      throw error;
    }
  }

  // Facebook sign-in
  async function facebookSignIn() {
    debugLog('Attempting Facebook sign-in');
    setAuthError(null);
    
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      debugLog('Facebook sign-in successful for user:', userCredential.user.uid);
      
      try {
        // Check if this is a new user
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (!userDoc.exists()) {
          // Create user document for new Facebook users
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: userCredential.user.displayName,
            email: userCredential.user.email,
            photoURL: userCredential.user.photoURL,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            authProvider: "facebook",
            role: 'user',
            uid: userCredential.user.uid
          });
          debugLog('Created new user document for Facebook sign-in');
        } else {
          // Update last login time
          await setDoc(doc(db, "users", userCredential.user.uid), {
            lastLogin: serverTimestamp()
          }, { merge: true });
          debugLog('Updated lastLogin for Facebook sign-in');
        }
      } catch (firestoreError) {
        // Log but don't throw Firestore errors - still allow sign-in to succeed
        console.error("Error with Firestore during Facebook sign-in:", firestoreError);
      }
      
      // Force update the user state
      setUser(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      console.error("Facebook sign-in error:", error);
      setAuthError(error);
      throw error;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    debugLog('Setting up auth state change listener');
    let unsubscribe;
    
    try {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        debugLog('Auth state changed:', currentUser ? `User ${currentUser.uid} logged in` : 'User logged out');
        setUser(currentUser);
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      setLoading(false);
    }

    return () => {
      debugLog('Cleaning up auth state change listener');
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Additional debug effect to monitor user state changes
  useEffect(() => {
    debugLog('User state updated:', user ? `User ID: ${user.uid}` : 'No user');
  }, [user]);

  const value = {
    user,
    loading,
    authError,
    register,
    login,
    logout,
    resetPassword,
    googleSignIn,
    facebookSignIn,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 