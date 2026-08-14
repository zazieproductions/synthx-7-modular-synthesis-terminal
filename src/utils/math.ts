/** Small numeric helpers shared across the audio engine and controls. */

/** Clamp `value` into the inclusive range `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Clamp into the normalised `[0, 1]` range. */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * Snap `value` to the nearest multiple of `step`, then clamp to the range.
 * Used by knobs and keyboard-adjustable sliders so drags stay on-grid.
 */
export function roundToStep(value: number, step: number, min: number, max: number): number {
  if (step <= 0) return clamp(value, min, max);
  const snapped = Math.round((value - min) / step) * step + min;
  // Avoid floating-point drift on the final decimal place.
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  const factor = 10 ** decimals;
  return clamp(Math.round(snapped * factor) / factor, min, max);
}
