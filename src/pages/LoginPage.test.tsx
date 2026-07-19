import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

vi.mock('../shared/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false })
}));

describe('LoginPage', () => {
  it('renders without crashing (smoke test)', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage language="en" />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});
