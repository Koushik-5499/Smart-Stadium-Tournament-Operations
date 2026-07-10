/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSustainability } from './useSustainability';

describe('useSustainability', () => {
  it('returns sustainability metrics on mount', () => {
    const { result } = renderHook(() => useSustainability());
    expect(result.current.susData).toBeDefined();
    expect(result.current.transportData).toBeDefined();
    expect(result.current.totals.waste).toBeGreaterThanOrEqual(0);
    expect(result.current.totals.carbon).toBeGreaterThanOrEqual(0);
  });
});
