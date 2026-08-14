/**
 * Central registry of every numeric parameter's range and presentation.
 *
 * Panels look these values up instead of hard-coding min/max/step, which
 * removes magic numbers and guarantees that the UI, the presets, and any
 * future parameter automation all share identical bounds.
 */
import { THEME } from '../constants/theme';
import type { NumericParameterKey } from '../types/synth';

export interface ParameterSpec {
  /** Short label rendered under the knob. */
  label: string;
  min: number;
  max: number;
  step: number;
  /** Display suffix, e.g. "Hz", "s", "%". */
  unit?: string;
  /** Accent colour for the knob and readout. */
  color: string;
}

export const PARAMETER_SPECS: Record<NumericParameterKey, ParameterSpec> = {
  masterVolume: { label: 'MASTER', min: 0, max: 1, step: 0.01, unit: '%', color: THEME.green },
  osc1Detune: { label: 'DETUNE', min: -50, max: 50, step: 1, unit: 'ct', color: THEME.green },
  osc1Gain: { label: 'GAIN', min: 0, max: 1, step: 0.01, color: THEME.green },
  osc2Detune: { label: 'DETUNE', min: -50, max: 50, step: 1, unit: 'ct', color: THEME.cyan },
  osc2Gain: { label: 'GAIN', min: 0, max: 1, step: 0.01, color: THEME.cyan },
  filterFreq: { label: 'FREQ', min: 20, max: 20_000, step: 1, unit: 'Hz', color: THEME.amber },
  filterQ: { label: 'RES', min: 0.1, max: 20, step: 0.1, color: THEME.amber },
  filterGain: { label: 'GAIN', min: -40, max: 40, step: 0.5, unit: 'dB', color: THEME.amber },
  attack: { label: 'ATK', min: 0.001, max: 2, step: 0.001, unit: 's', color: THEME.pink },
  decay: { label: 'DEC', min: 0.001, max: 2, step: 0.001, unit: 's', color: THEME.pink },
  sustain: { label: 'SUS', min: 0, max: 1, step: 0.01, color: THEME.pink },
  release: { label: 'REL', min: 0.001, max: 5, step: 0.001, unit: 's', color: THEME.pink },
  delayTime: { label: 'TIME', min: 0, max: 1, step: 0.01, unit: 's', color: THEME.cyan },
  delayFeedback: { label: 'FDBK', min: 0, max: 0.9, step: 0.01, color: THEME.cyan },
  delayMix: { label: 'MIX', min: 0, max: 0.8, step: 0.01, color: THEME.cyan },
  distortion: { label: 'DRIVE', min: 0, max: 1, step: 0.01, color: THEME.pink },
  reverbMix: { label: 'MIX', min: 0, max: 1, step: 0.01, color: THEME.purple },
  lfoRate: { label: 'RATE', min: 0.1, max: 20, step: 0.1, unit: 'Hz', color: THEME.teal },
  lfoDepth: { label: 'DEPTH', min: 0, max: 1000, step: 1, unit: 'Hz', color: THEME.teal },
};
