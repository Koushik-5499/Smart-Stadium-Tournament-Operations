/**
 * Firebase configuration and initialization.
 *
 * Loads all Firebase config from environment variables (VITE_ prefix for Vite).
 * Never hardcodes API keys or secrets.
 *
 * @module shared/firebaseConfig
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase configuration object populated from environment variables.
 * All values use Vite's import.meta.env to access VITE_ prefixed vars.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** Singleton Firebase app instance. */
export const app: FirebaseApp = initializeApp(firebaseConfig);

/** Singleton Firebase Auth instance. */
export const auth: Auth = getAuth(app);

/** Singleton Firestore database instance. */
export const db: Firestore = getFirestore(app);
