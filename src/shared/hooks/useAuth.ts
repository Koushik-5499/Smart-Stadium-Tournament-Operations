/**
 * Custom hook for Firebase authentication state.
 *
 * Encapsulates the Firebase auth listener so that UI components
 * depend on an abstraction (this hook) rather than the Firebase SDK
 * directly — adhering to Dependency Inversion.
 *
 * @module shared/hooks/useAuth
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebaseConfig';

/**
 * Subscribes to Firebase auth state changes and returns the current user.
 *
 * @returns The currently authenticated Firebase User, or null
 */
export function useAuth(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  return user;
}
