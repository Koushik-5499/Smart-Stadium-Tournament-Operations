import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCrowdData } from './useCrowdData';

describe('useCrowdData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('provides initial crowd data and updates on interval', () => {
    const { result } = renderHook(() => useCrowdData());

    expect(result.current.liveData.length).toBeGreaterThan(0);
    const initialTimestamp = result.current.liveData[0].timestamp;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.liveData[0].timestamp).toBeGreaterThan(initialTimestamp);
  });
});
