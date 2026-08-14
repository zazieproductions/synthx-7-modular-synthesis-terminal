import { describe, expect, it } from 'vitest';
import {
  HIGHEST_MIDI,
  LOWEST_MIDI,
  midiToFrequency,
  midiToNoteName,
  NOTE_FREQUENCIES,
  noteFrequency,
} from './notes';

describe('midiToFrequency', () => {
  it('maps A4 (MIDI 69) to 440 Hz', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 5);
  });

  it('maps C4 (MIDI 60) to 261.63 Hz', () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 2);
  });

  it('doubles frequency one octave up', () => {
    expect(midiToFrequency(81)).toBeCloseTo(midiToFrequency(69) * 2, 5);
  });
});

describe('midiToNoteName', () => {
  it('names middle C correctly', () => {
    expect(midiToNoteName(60)).toBe('C4');
  });

  it('names sharps with the # suffix', () => {
    expect(midiToNoteName(61)).toBe('C#4');
  });
});

describe('note table', () => {
  it('contains every chromatic note in the configured range', () => {
    expect(Object.keys(NOTE_FREQUENCIES)).toHaveLength(HIGHEST_MIDI - LOWEST_MIDI + 1);
  });

  it('resolves known notes', () => {
    expect(noteFrequency('C4')).toBeCloseTo(261.63, 2);
    expect(noteFrequency('F#5')).toBeCloseTo(739.99, 2);
  });

  it('returns undefined for unknown notes', () => {
    expect(noteFrequency('H4')).toBeUndefined();
  });
});
