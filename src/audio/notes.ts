/**
 * Pitch utilities: MIDI <-> frequency <-> scientific pitch notation.
 *
 * The note table is generated rather than hand-written, which keeps the
 * mapping exact and makes extending the keyboard range a one-line change.
 */

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/** Lowest MIDI note included in the note table (C2). */
export const LOWEST_MIDI = 36;
/** Highest MIDI note included in the note table (C6). */
export const HIGHEST_MIDI = 84;

/** Convert a MIDI note number to its frequency in Hz (12-TET, A4 = 440 Hz). */
export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Convert a MIDI note number to scientific pitch notation, e.g. 60 -> "C4". */
export function midiToNoteName(midi: number): string {
  const name = SHARP_NAMES[midi % SHARP_NAMES.length];
  const octave = Math.floor(midi / SHARP_NAMES.length) - 1;
  return `${name}${octave}`;
}

/** Look up the frequency of a note such as "C4" or "F#5". */
export function noteFrequency(note: string): number | undefined {
  return NOTE_FREQUENCIES[note];
}

/** A pre-computed, frozen lookup table from note name to frequency. */
export const NOTE_FREQUENCIES: Readonly<Record<string, number>> = (() => {
  const table: Record<string, number> = {};
  for (let midi = LOWEST_MIDI; midi <= HIGHEST_MIDI; midi += 1) {
    table[midiToNoteName(midi)] = midiToFrequency(midi);
  }
  return Object.freeze(table);
})();

/** All note names in the table, sorted from low to high. */
export const NOTE_NAMES: readonly string[] = Object.freeze(Object.keys(NOTE_FREQUENCIES));
