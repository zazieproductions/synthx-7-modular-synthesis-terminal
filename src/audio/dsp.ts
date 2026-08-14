/**
 * Pure DSP helpers: no React, no audio nodes, just deterministic math.
 *
 * Keeping these functions side-effect free makes them trivially unit-testable
 * (see `src/audio/dsp.test.ts`).
 */
import { clamp01 } from '../utils/math';

/**
 * Build a waveshaper curve for soft-clipping distortion.
 *
 * Uses a normalised tanh curve so that a drive amount of `0` yields a pure
 * linear (unity-gain) curve — there is no amplitude drop when distortion is
 * disengaged — and higher amounts approach a soft-clipping limiter.
 */
export function makeDistortionCurve(amount: number, sampleCount = 1024): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(sampleCount);
  const drive = clamp01(amount) * 40;

  for (let i = 0; i < sampleCount; i += 1) {
    const x = (i * 2) / (sampleCount - 1) - 1;
    if (drive === 0) {
      curve[i] = x;
    } else {
      curve[i] = Math.tanh(drive * x) / Math.tanh(drive);
    }
  }
  return curve;
}

/**
 * Generate a stereo impulse response for the convolution reverb.
 *
 * Each channel uses independent noise so the tail decorrelates into a wide
 * stereo field, with an exponential decay determined by `decay`.
 */
export function generateImpulseResponse(
  context: BaseAudioContext,
  durationSeconds: number,
  decay: number,
): AudioBuffer {
  const length = Math.max(1, Math.floor(context.sampleRate * durationSeconds));
  const impulse = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      // Uniform noise multiplied by an exponential decay envelope.
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return impulse;
}
