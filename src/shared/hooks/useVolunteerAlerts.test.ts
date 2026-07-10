/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVolunteerAlerts } from './useVolunteerAlerts';

describe('useVolunteerAlerts', () => {
  it('initializes with no alerts for empty data', () => {
    const { result } = renderHook(() => useVolunteerAlerts([]));
    expect(result.current.alerts).toHaveLength(0);
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.fanLanguage).toBe('es');
  });
});
