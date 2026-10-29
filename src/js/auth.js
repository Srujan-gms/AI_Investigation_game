import { FIREBASE_CONFIG } from './firebase-config.js';
import { api } from './api.js';

let firebaseApp = null;
let firebaseAuth = null;
let googleProvider = null;
let authStateListener = null;

/**
 * Check if running in a local environment where auth is bypassed
 */
export function isLocalhost() {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '' || host.endsWith('.local');
}

/**
 * Get active Firebase configuration from environment or config file
 */
export function getActiveFirebaseConfig() {
  // 1. Check Vite environment variables (Standard for Vercel deployment)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
    }
  } catch {}

  // 2. Check static firebase-config.js
  if (FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.length > 5) {
    return FIREBASE_CONFIG;
  }

  // 3. Check window global
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__ && window.__FIREBASE_CONFIG__.apiKey) {
    return window.__FIREBASE_CONFIG__;
  }

  return null;
}

/**
 * Initialize Firebase App and Auth using official Google ESM modules
 */
export async function initFirebaseClient() {
  const config = getActiveFirebaseConfig();
  if (!config || !config.apiKey) {
    return null;
  }

  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    const { getAuth, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');

    const apps = getApps();
    firebaseApp = apps.length > 0 ? getApp() : initializeApp(config);
    firebaseAuth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    return firebaseAuth;
  } catch (err) {
    console.warn('[Firebase Auth] Failed to initialize Firebase SDK:', err.message);
    return null;
  }
}

/**
 * Initialize Detective Auth Service
 * - On Localhost: Bypasses auth completely, authenticates local detective immediately
 * - On Vercel / Production: Uses Firebase Google Auth if configured, or provides Guest Detective mode
 */
export async function setupAuth(onUserChange) {
  // If running locally, bypass authentication completely as requested
  if (isLocalhost()) {
    const localUser = {
      uid: 'user_detective_local',
      username: 'Detective Vance',
      email: 'detective.vance@agency.noir',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      badgeId: 'DET-8420-LOCAL',
      rank: 'Lead Homicide Investigator',
      isLocalhost: true,
      authProvider: 'localhost',
      solvedCases: []
    };

    // Attempt to fetch saved local stats from backend
    try {
      const res = await api.getMe('user_detective_local');
      if (res && res.user) {
        localUser.solvedCases = res.user.solvedCases || [];
      }
    } catch {}

    if (onUserChange) onUserChange(localUser);
    return localUser;
  }

  // Production / Vercel Environment:
  const auth = await initFirebaseClient();

  if (!auth) {
    // Firebase not yet configured on this Vercel deployment: provide Guest Detective mode
    const guestUser = {
      uid: 'guest_detective_' + (localStorage.getItem('guest_id') || Math.random().toString(36).substring(2, 8)),
      username: 'Guest Detective',
      email: 'guest@mysteryroom.app',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      badgeId: 'DET-GUEST',
      rank: 'Guest Investigator',
      isLocalhost: false,
      isGuest: true,
      authProvider: 'guest',
      solvedCases: []
    };
    if (!localStorage.getItem('guest_id')) {
      localStorage.setItem('guest_id', guestUser.uid);
    }
    if (onUserChange) onUserChange(guestUser);
    return guestUser;
  }

  // Subscribe to Firebase Auth state
  try {
    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    if (authStateListener) authStateListener();

    authStateListener = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const detectiveUser = {
          uid: fbUser.uid,
          username: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          badgeId: 'DET-' + fbUser.uid.slice(0, 6).toUpperCase(),
          rank: 'Verified Inspector',
          isLocalhost: false,
          isGuest: false,
          authProvider: 'google',
          solvedCases: []
        };

        // Sync with backend API
        try {
          const syncRes = await api.syncUser({
            uid: fbUser.uid,
            displayName: detectiveUser.username,
            email: fbUser.email,
            photoURL: detectiveUser.avatar,
            authProvider: 'google'
          });
          if (syncRes && syncRes.user) {
            detectiveUser.solvedCases = syncRes.user.solvedCases || [];
          }
        } catch (e) {
          console.warn('[Auth Sync Warning]', e.message);
        }

        if (onUserChange) onUserChange(detectiveUser);
      } else {
        // Logged out: fallback to Guest mode
        const guestUser = {
          uid: 'guest_detective_' + (localStorage.getItem('guest_id') || '01'),
          username: 'Guest Detective',
          email: 'guest@mysteryroom.app',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          badgeId: 'DET-GUEST',
          rank: 'Guest Investigator',
          isLocalhost: false,
          isGuest: true,
          authProvider: 'guest',
          solvedCases: []
        };
        if (onUserChange) onUserChange(guestUser);
      }
    });
  } catch (err) {
    console.error('[Firebase onAuthStateChanged Error]', err);
  }
}

/**
 * Trigger Google Sign-In Popup
 */
export async function signInWithGoogle() {
  if (isLocalhost()) {
    return {
      success: true,
      message: 'Localhost mode: Authentication is already bypassed.'
    };
  }

  let auth = firebaseAuth;
  if (!auth) {
    auth = await initFirebaseClient();
  }

  if (!auth) {
    throw new Error('Firebase configuration missing. Please add your Firebase keys in Account Settings.');
  }

  const { signInWithPopup, signInWithRedirect } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    if (error.code === 'auth/popup-blocked') {
      console.warn('Popup blocked, attempting redirect...');
      await signInWithRedirect(auth, googleProvider);
      return { success: true, pendingRedirect: true };
    }
    throw error;
  }
}

/**
 * Sign Out from Firebase
 */
export async function signOutUser() {
  if (firebaseAuth) {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    await signOut(firebaseAuth);
  }
  await api.logout().catch(() => {});
}

