/**
 * Shared domain models for SYNTHX-7.
 *
 * Everything that describes the synthesizer's parameters, presets, and
 * runtime status lives here so that the audio engine, React state layer,
 * and UI components all agree on a single source of truth.
 */

/** Oscillator waveforms supported by both oscillators and the LFO. */
export type OscType = 'sine' | 'square' | 'sawtooth' | 'triangle';

/** Biquad filter types exposed by the VCF module. */
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

/** Every live-editable parameter of the synthesis engine. */
export interface SynthState {
  masterVolume: number;
  osc1Type: OscType;
  osc1Detune: number;
  osc1Gain: number;
  osc2Type: OscType;
  osc2Detune: number;
  osc2Gain: number;
  filterType: FilterType;
  filterFreq: number;
  filterQ: number;
  filterGain: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  delayTime: number;
  delayFeedback: number;
  delayMix: number;
  distortion: number;
  reverbMix: number;
  lfoRate: number;
  lfoDepth: number;
  lfoType: OscType;
}

export type SynthParameterKey = keyof SynthState;

/** Parameters that take a discrete enum value rather than a numeric range. */
export type ChoiceParameterKey = 'osc1Type' | 'osc2Type' | 'filterType' | 'lfoType';

/** Parameters that are continuously adjustable numbers. */
export type NumericParameterKey = Exclude<SynthParameterKey, ChoiceParameterKey>;

/**
 * A partial parameter set used to describe presets and patches. `applyPatch`
 * merges a patch over the current state and leaves untouched keys alone.
 */
export type SynthPatch = Partial<SynthState>;

/** A named, serializable preset. */
export interface SynthPreset {
  id: string;
  name: string;
  description: string;
  patch: SynthPatch;
}

/** Lifecycle of the audio engine. */
export type AudioEngineStatus = 'idle' | 'initializing' | 'ready' | 'error';

/** A single line in the on-screen terminal log. */
export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export type LogLevel = 'SYS' | 'AUD' | 'DSP' | 'ERR';

/** Note name using scientific pitch notation, e.g. `C4` or `F#5`. */
export type NoteName = string;
