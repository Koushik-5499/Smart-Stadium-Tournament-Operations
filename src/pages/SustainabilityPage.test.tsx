import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SustainabilityPage from './SustainabilityPage';

vi.mock('../shared/hooks/useSustainability', () => ({
  useSustainability: () => ({
    susData: [],
    transportData: [],
    insights: null,
    isLoadingInsights: false,
    handleGetInsights: vi.fn(),
    totals: { waste: 0, recycled: 0, carbon: 0, energy: 0 }
  })
}));

describe('SustainabilityPage', () => {
  it('renders without crashing (smoke test)', () => {
    const { container } = render(
      <SustainabilityPage language="en" />
    );
    expect(container).toBeDefined();
  });
});
