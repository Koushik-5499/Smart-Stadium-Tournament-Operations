import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

vi.mock('../shared/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false })
}));

describe('HomePage', () => {
  it('renders without crashing (smoke test)', () => {
    const { container } = render(
      <BrowserRouter>
        <HomePage language="en" />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});
