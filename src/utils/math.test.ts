import { describe, expect, it } from 'vitest';
import { clamp, clamp01, roundToStep } from './math';

describe('clamp', () => {
  it('returns the value when inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to the minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('clamps to the maximum', () => {
    expect(clamp(12, 0, 10)).toBe(10);
  });
});

describe('clamp01', () => {
  it('clamps into [0, 1]', () => {
    expect(clamp01(-0.2)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1.4)).toBe(1);
  });
});

describe('roundToStep', () => {
  it('snaps to the nearest step', () => {
    expect(roundToStep(0.53, 0.1, 0, 1)).toBe(0.5);
    expect(roundToStep(0.56, 0.1, 0, 1)).toBe(0.6);
  });

  it('clamps to the range after snapping', () => {
    expect(roundToStep(2, 0.1, 0, 1)).toBe(1);
    expect(roundToStep(-1, 0.1, 0, 1)).toBe(0);
  });

  it('handles integer steps', () => {
    expect(roundToStep(1003, 1, 20, 20_000)).toBe(1003);
  });
});
