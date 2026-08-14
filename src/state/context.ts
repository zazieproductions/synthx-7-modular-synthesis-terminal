import { createContext } from 'react';
import type {
  AudioEngineStatus,
  LogEntry,
  SynthParameterKey,
  SynthPatch,
  SynthState,
} from '../types/synth';

/** Public API exposed to the UI by the synth state layer. */
export interface SynthContextValue {
  state: SynthState;
  status: AudioEngineStatus;
  errorMessage: string | null;
  sampleRate: number | null;
  activeVoiceCount: number;
  analyser: AnalyserNode | null;
  timeAnalyser: AnalyserNode | null;
  log: LogEntry[];
  isAudioReady: boolean;
  initAudio: () => Promise<void>;
  setParameter: <K extends SynthParameterKey>(key: K, value: SynthState[K]) => void;
  applyPatch: (patch: SynthPatch) => void;
  loadPreset: (presetId: string) => void;
  noteOn: (note: string) => void;
  noteOff: (note: string) => void;
  noteOffAll: () => void;
}

export const SynthContext = createContext<SynthContextValue | null>(null);
