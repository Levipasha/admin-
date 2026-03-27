// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.authDomain) &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.appId);

let app = null;
let analytics = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

// Export Firebase services
export { app, analytics, auth, googleProvider };

// Export auth functions
export const signInWithGoogle = () => {
  if (!isFirebaseConfigured) {
    throw new Error('Admin Firebase is not configured. Add Firebase env vars to admin/.env to enable login.');
  }
  return signInWithPopup(auth, googleProvider);
};

export const logoutFirebase = () => {
  if (!isFirebaseConfigured) return Promise.resolve();
  return signOut(auth);
};

// Get current user
export const getCurrentUser = () => new Promise((resolve, reject) => {
  if (!isFirebaseConfigured) return resolve(null);
  const unsubscribe = auth.onAuthStateChanged(user => {
    unsubscribe();
    resolve(user);
  }, reject);
});

// Get ID token
export const getIdToken = () => {
  if (!isFirebaseConfigured) return Promise.resolve(null);
  return auth.currentUser?.getIdToken();
};
