import type { SynthState } from '../types/synth';

/** The factory state used on first boot and by the INIT preset. */
export const DEFAULT_STATE: SynthState = {
  masterVolume: 0.5,
  osc1Type: 'sawtooth',
  osc1Detune: 0,
  osc1Gain: 0.7,
  osc2Type: 'square',
  osc2Detune: -7,
  osc2Gain: 0.3,
  filterType: 'lowpass',
  filterFreq: 2000,
  filterQ: 2,
  filterGain: 0,
  attack: 0.05,
  decay: 0.2,
  sustain: 0.6,
  release: 0.3,
  delayTime: 0.3,
  delayFeedback: 0.3,
  delayMix: 0.2,
  distortion: 0,
  reverbMix: 0.15,
  lfoRate: 4,
  lfoDepth: 0,
  lfoType: 'sine',
};
