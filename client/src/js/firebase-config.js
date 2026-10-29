/**
 * Firebase Configuration for Vercel Hosting & Google Authentication
 * 
 * To enable Google Sign-In on Vercel:
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Create or select a project
 * 3. In "Authentication" > "Sign-in method", enable "Google"
 * 4. In "Authentication" > "Settings" > "Authorized domains", add your Vercel domain (e.g. your-app.vercel.app)
 * 5. Go to Project Settings > General > "Your apps" > Add Web App
 * 6. Either populate this object or configure VITE_FIREBASE_* environment variables in Vercel.
 */

export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

