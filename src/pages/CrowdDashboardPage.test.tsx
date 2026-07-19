import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CrowdDashboardPage from './CrowdDashboardPage';

// Mock the hook to prevent data fetching during render
vi.mock('../shared/hooks/useCrowdData', () => ({
  useCrowdData: () => ({
    liveData: [],
    customData: [],
    activeData: [],
    setCustomData: vi.fn()
  })
}));

describe('CrowdDashboardPage', () => {
  it('renders without crashing (smoke test)', () => {
    const { container } = render(
      <CrowdDashboardPage language="en" />
    );
    expect(container).toBeDefined();
  });
});
