import type { SynthPreset } from '../types/synth';
import { DEFAULT_STATE } from './defaults';

/** Factory preset bank shipped with the synth. */
export const FACTORY_PRESETS: readonly SynthPreset[] = [
  {
    id: 'init',
    name: 'INIT',
    description: 'A clean, neutral starting point.',
    patch: {},
  },
  {
    id: 'bass',
    name: 'BASS',
    description: 'Fat detuned bass with a tight, low filter.',
    patch: {
      osc1Type: 'sawtooth',
      osc1Gain: 0.8,
      osc2Type: 'square',
      osc2Gain: 0.4,
      osc2Detune: -12,
      filterFreq: 800,
      filterQ: 4,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.5,
      release: 0.2,
      delayMix: 0.1,
      reverbMix: 0.05,
    },
  },
  {
    id: 'lead',
    name: 'LEAD',
    description: 'Bright, present lead with a touch of space.',
    patch: {
      osc1Type: 'square',
      osc1Gain: 0.6,
      osc2Type: 'sawtooth',
      osc2Gain: 0.5,
      osc2Detune: 7,
      filterFreq: 3000,
      filterQ: 3,
      attack: 0.01,
      decay: 0.15,
      sustain: 0.7,
      release: 0.2,
      delayMix: 0.25,
      delayTime: 0.4,
      reverbMix: 0.2,
    },
  },
  {
    id: 'pad',
    name: 'PAD',
    description: 'Slow-attack pad with a long release and deep space.',
    patch: {
      osc1Type: 'sine',
      osc1Gain: 0.5,
      osc2Type: 'triangle',
      osc2Gain: 0.5,
      osc2Detune: -5,
      filterFreq: 1500,
      attack: 0.8,
      decay: 0.5,
      sustain: 0.8,
      release: 2.0,
      delayMix: 0.3,
      delayTime: 0.5,
      delayFeedback: 0.4,
      reverbMix: 0.4,
    },
  },
  {
    id: 'noise',
    name: 'NOISE',
    description: 'Aggressive, resonant and driven.',
    patch: {
      osc1Type: 'sawtooth',
      osc1Gain: 0.7,
      osc2Type: 'square',
      osc2Gain: 0.7,
      osc2Detune: -25,
      filterFreq: 5000,
      filterQ: 8,
      attack: 0.001,
      decay: 0.1,
      sustain: 0.9,
      release: 0.1,
      distortion: 0.6,
      delayMix: 0.15,
      reverbMix: 0.1,
    },
  },
  {
    id: 'alien',
    name: 'ALIEN',
    description: 'Wobbling, LFO-driven science-fiction tones.',
    patch: {
      osc1Type: 'sine',
      osc1Gain: 0.6,
      osc2Type: 'sawtooth',
      osc2Gain: 0.3,
      osc2Detune: 19,
      filterFreq: 4000,
      filterQ: 6,
      attack: 0.2,
      decay: 0.8,
      sustain: 0.3,
      release: 1.5,
      lfoRate: 6,
      lfoDepth: 500,
      lfoType: 'sine',
      delayMix: 0.3,
      delayTime: 0.25,
      delayFeedback: 0.5,
      reverbMix: 0.35,
    },
  },
];

/** Resolve a preset to its full, concrete parameter set. */
export function resolvePreset(preset: SynthPreset): typeof DEFAULT_STATE {
  return { ...DEFAULT_STATE, ...preset.patch };
}

export function getPresetById(id: string): SynthPreset | undefined {
  return FACTORY_PRESETS.find((preset) => preset.id === id);
}
