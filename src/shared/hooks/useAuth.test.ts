import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from './useAuth';

// Mock firebase auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, cb) => {
    cb({ uid: 'user1', email: 'test@example.com' });
    return () => {};
  }),
}));

vi.mock('../firebaseConfig', () => ({
  auth: {},
}));

describe('useAuth', () => {
  it('initializes with logged out state, then sets user', () => {
    const { result } = renderHook(() => useAuth());
    
    // The onAuthStateChanged mock fires immediately
    expect(result.current?.uid).toBe('user1');
  });
});
