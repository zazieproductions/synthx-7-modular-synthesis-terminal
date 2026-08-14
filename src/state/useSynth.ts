import { useContext } from 'react';
import { SynthContext } from './context';
import type { SynthContextValue } from './context';

/** Access the synth state and controls from any component. */
export function useSynth(): SynthContextValue {
  const context = useContext(SynthContext);
  if (context === null) {
    throw new Error('useSynth must be used within a SynthProvider');
  }
  return context;
}
