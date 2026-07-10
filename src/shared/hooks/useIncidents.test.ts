/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIncidents } from './useIncidents';

describe('useIncidents', () => {
  it('returns initial counts and ranked incidents', () => {
    const { result } = renderHook(() => useIncidents(null));
    expect(result.current.ranked.length).toBeGreaterThan(0);
    expect(typeof result.current.isCritical).toBe('boolean');
    expect(result.current.isAnalyzing).toBe(false);
  });
});
