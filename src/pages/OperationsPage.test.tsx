import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OperationsPage from './OperationsPage';

vi.mock('../shared/hooks/useIncidents', () => ({
  useIncidents: () => ({ incidents: [] })
}));
vi.mock('../shared/hooks/useCrowdData', () => ({
  useCrowdData: () => ({ zones: [] })
}));
vi.mock('../shared/hooks/useVolunteerAlerts', () => ({
  useVolunteerAlerts: () => ({ alerts: [], generate: vi.fn(), loading: false })
}));

describe('OperationsPage', () => {
  it('renders without crashing (smoke test)', () => {
    const mockUser = { uid: '1' } as unknown as import('firebase/auth').User;
    const { container } = render(
      <OperationsPage language="en" user={mockUser} />
    );
    expect(container).toBeDefined();
  });
});
