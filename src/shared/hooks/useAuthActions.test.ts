import { describe, it, expect, vi } from 'vitest';
import { useAuthActions } from './useAuthActions';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    signOut: vi.fn(),
  };
});

describe('useAuthActions', () => {
  it('calls login with email and password', async () => {
    const { login } = useAuthActions();
    await login('test@example.com', 'password123');
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it('calls googleLogin', async () => {
    const { googleLogin } = useAuthActions();
    await googleLogin();
    expect(signInWithPopup).toHaveBeenCalled();
  });

  it('calls logout', async () => {
    const { logout } = useAuthActions();
    await logout();
    expect(signOut).toHaveBeenCalled();
  });
});
