import { describe, expect, it } from 'vitest';
import { generateImpulseResponse, makeDistortionCurve } from './dsp';
import { createMockAudioContext } from '../test/audioMocks';

describe('makeDistortionCurve', () => {
  it('returns a curve of the requested length', () => {
    expect(makeDistortionCurve(0.5, 256)).toHaveLength(256);
  });

  it('is a linear (unity-gain) curve when drive is zero', () => {
    const curve = makeDistortionCurve(0, 64);
    for (let i = 0; i < curve.length; i += 1) {
      const x = (i * 2) / (curve.length - 1) - 1;
      expect(curve[i]).toBeCloseTo(x, 5);
    }
  });

  it('keeps output within [-1, 1] at high drive', () => {
    const curve = makeDistortionCurve(1, 128);
    for (const sample of curve) {
      expect(sample).toBeGreaterThanOrEqual(-1);
      expect(sample).toBeLessThanOrEqual(1);
    }
  });

  it('clips out-of-range drive amounts', () => {
    expect(makeDistortionCurve(1.5, 32)).toEqual(makeDistortionCurve(1, 32));
    expect(makeDistortionCurve(-1, 32)).toEqual(makeDistortionCurve(0, 32));
  });
});

describe('generateImpulseResponse', () => {
  it('creates a stereo buffer with the expected length', () => {
    const context = createMockAudioContext() as unknown as BaseAudioContext;
    const impulse = generateImpulseResponse(context, 2, 2);
    expect(impulse.length).toBe(Math.floor(44_100 * 2));
    expect(impulse.numberOfChannels).toBe(2);
  });
});
