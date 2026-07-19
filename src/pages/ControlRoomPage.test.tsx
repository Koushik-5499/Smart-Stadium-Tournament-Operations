import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ControlRoomPage from './ControlRoomPage';

vi.mock('../shared/hooks/useIncidents', () => ({
  useIncidents: () => ({
    ranked: [],
    counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    isCritical: false,
    isAnalyzing: false,
    submitIncident: vi.fn()
  })
}));

describe('ControlRoomPage', () => {
  it('renders without crashing (smoke test)', () => {
    const mockUser = { uid: '1', email: 'staff@example.com' } as unknown as import('firebase/auth').User;
    const { container } = render(
      <ControlRoomPage language="en" user={mockUser} />
    );
    expect(container).toBeDefined();
  });
});
