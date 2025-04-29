// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

console.log("Firebase config script started");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMmXCaaBWtpn-vjJQAIFVgzht58pZmc28",
  authDomain: "trailmate1-1b01c.firebaseapp.com",
  projectId: "trailmate1-1b01c",
  storageBucket: "trailmate1-1b01c.firebasestorage.app",
  messagingSenderId: "517616621455",
  appId: "1:517616621455:web:1d20a9f52478d2e03a5dfa",
  measurementId: "G-0E09GEH7QS"
};

// Define as variables first with empty default values
let app;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

// Create a promise with a timeout to handle initialization
const initializeFirebaseWithTimeout = async (timeoutMs = 10000) => {
  let timeoutId;
  
  try {
    const initPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('Initializing Firebase app');
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized successfully');

        // Initialize Firebase services
        auth = getAuth(app);
        console.log('Firebase auth initialized');
        
        db = getFirestore(app);
        console.log('Firebase Firestore initialized');
        
        storage = getStorage(app);
        console.log('Firebase Storage initialized');
        
        // Initialize analytics if browser supports it
        const analyticsSupported = await isSupported();
        if (analyticsSupported) {
          analytics = getAnalytics(app);
          console.log('Firebase Analytics initialized');
        } else {
          console.log('Firebase Analytics is not supported in this environment');
          analytics = null;
        }
        
        // Enable local emulators in development if needed
        if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
          try {
            console.log('Connecting to Firebase emulators');
            connectAuthEmulator(auth, 'http://localhost:9099');
            connectFirestoreEmulator(db, 'localhost', 8080);
            connectStorageEmulator(storage, 'localhost', 9199);
            console.log('Connected to Firebase emulators successfully');
          } catch (emulatorError) {
            console.error('Error connecting to Firebase emulators:', emulatorError);
            // Continue even if emulators fail
          }
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Firebase initialization timed out'));
      }, timeoutMs);
    });
    
    // Race the initialization against the timeout
    await Promise.race([initPromise, timeoutPromise]);
    
    // If we get here, initialization succeeded before timeout
    if (timeoutId) clearTimeout(timeoutId);
    
    console.log('Firebase initialization completed successfully');
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
    
    // Clean up timeout if it was initialization that failed, not the timeout
    if (timeoutId) clearTimeout(timeoutId);
    
    // Setup fallback values for services
    if (!auth) auth = { currentUser: null, onAuthStateChanged: () => () => {} };
    if (!db) db = {};
    if (!storage) storage = {};
    if (!analytics) analytics = null;
    
    // Re-throw for consumer handling if needed
    throw error;
  }
};

// Initialize immediately but don't wait for it
initializeFirebaseWithTimeout().catch(error => {
  console.error('Firebase initialization error (caught at top level):', error);
});

// Export the services regardless of initialization status
// If initialization fails, these will be the fallback values
export { app, auth, db, storage, analytics };