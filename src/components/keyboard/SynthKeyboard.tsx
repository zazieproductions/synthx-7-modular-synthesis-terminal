import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { THEME } from '../../constants/theme';
import { useSynth } from '../../state/useSynth';

interface KeyDef {
  note: string;
  /** Computer key mapped to this note (lower-case), if any. */
  computerKey: string | null;
  black: boolean;
}

/** Two-row keyboard layout — black keys above, naturals below. */
const WHITE_KEYS: readonly { note: string; computerKey: string | null }[] = [
  { note: 'C4', computerKey: 'a' },
  { note: 'D4', computerKey: 's' },
  { note: 'E4', computerKey: 'd' },
  { note: 'F4', computerKey: 'f' },
  { note: 'G4', computerKey: 'g' },
  { note: 'A4', computerKey: 'h' },
  { note: 'B4', computerKey: 'j' },
  { note: 'C5', computerKey: 'k' },
  { note: 'D5', computerKey: 'l' },
  { note: 'E5', computerKey: ';' },
  { note: 'F5', computerKey: null },
  { note: 'G5', computerKey: null },
  { note: 'A5', computerKey: null },
];

const BLACK_KEYS: readonly { note: string; computerKey: string | null }[] = [
  { note: 'C#4', computerKey: '2' },
  { note: 'D#4', computerKey: '3' },
  { note: 'F#4', computerKey: '5' },
  { note: 'G#4', computerKey: '6' },
  { note: 'A#4', computerKey: '7' },
  { note: 'C#5', computerKey: '9' },
  { note: 'D#5', computerKey: '0' },
  { note: 'F#5', computerKey: '=' },
  { note: 'G#5', computerKey: null },
  { note: 'A#5', computerKey: null },
];

/** Touch pad layout (naturals on top, sharps below). */
const PAD_ROWS: readonly (readonly (string | null)[])[] = [
  ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null, 'C#5'],
];

const NOTE_COLORS: Record<string, string> = {
  C: THEME.green,
  'C#': THEME.cyan,
  D: THEME.green,
  'D#': THEME.cyan,
  E: THEME.green,
  F: THEME.amber,
  'F#': THEME.cyan,
  G: THEME.amber,
  'G#': THEME.cyan,
  A: THEME.pink,
  'A#': THEME.cyan,
  B: THEME.pink,
};

function noteColor(note: string): string {
  const name = note.replace(/[0-9]/g, '');
  return NOTE_COLORS[name] ?? THEME.green;
}

function buildKeyDefs(): KeyDef[] {
  const whites = WHITE_KEYS.map((entry) => ({ ...entry, black: false }));
  const blacks = BLACK_KEYS.map((entry) => ({ ...entry, black: true }));
  return [...whites, ...blacks];
}

export function SynthKeyboard() {
  const { noteOn, noteOff, noteOffAll } = useSynth();
  const [activeNotes, setActiveNotes] = useState<ReadonlySet<string>>(new Set());
  const activeNotesRef = useRef<Set<string>>(new Set());

  const keyDefs = useMemo(() => buildKeyDefs(), []);

  const handleNoteOn = useCallback(
    (note: string) => {
      if (activeNotesRef.current.has(note)) return;
      activeNotesRef.current.add(note);
      setActiveNotes(new Set(activeNotesRef.current));
      noteOn(note);
    },
    [noteOn],
  );

  const handleNoteOff = useCallback(
    (note: string) => {
      if (!activeNotesRef.current.has(note)) return;
      activeNotesRef.current.delete(note);
      setActiveNotes(new Set(activeNotesRef.current));
      noteOff(note);
    },
    [noteOff],
  );

  // Computer-keyboard mapping.
  useEffect(() => {
    const keyMap = new Map<string, string>();
    for (const def of keyDefs) {
      if (def.computerKey) keyMap.set(def.computerKey.toLowerCase(), def.note);
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const note = keyMap.get(event.key.toLowerCase());
      if (note) handleNoteOn(note);
    };
    const onKeyUp = (event: globalThis.KeyboardEvent) => {
      const note = keyMap.get(event.key.toLowerCase());
      if (note) handleNoteOff(note);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [keyDefs, handleNoteOn, handleNoteOff]);

  // Release visual key state if the window loses focus.
  useEffect(() => {
    const releaseAll = () => {
      activeNotesRef.current.clear();
      setActiveNotes(new Set());
      noteOffAll();
    };
    window.addEventListener('blur', releaseAll);
    return () => window.removeEventListener('blur', releaseAll);
  }, [noteOffAll]);

  const handlePointerDown = (note: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleNoteOn(note);
  };

  const handleKeyDown = (note: string) => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) handleNoteOn(note);
    }
  };

  const renderKey = (def: KeyDef) => {
    const active = activeNotes.has(def.note);
    const color = noteColor(def.note);
    const label = def.note.replace(/[0-9]/g, '');

    return (
      <button
        key={def.note}
        type="button"
        aria-label={`Play ${def.note}${def.computerKey ? ` (key ${def.computerKey.toUpperCase()})` : ''}`}
        className={`synth-key rounded-sm border font-mono transition-all ${
          def.black ? 'h-14 text-[8px]' : 'h-16 text-[9px]'
        } ${active ? 'active' : ''}`}
        style={{
          background: active ? color : THEME.panel,
          borderColor: color,
          color: active ? THEME.bg : color,
          boxShadow: active ? `0 0 10px ${color}40` : 'none',
        }}
        onPointerDown={handlePointerDown(def.note)}
        onPointerUp={() => handleNoteOff(def.note)}
        onPointerLeave={() => handleNoteOff(def.note)}
        onPointerCancel={() => handleNoteOff(def.note)}
        onKeyDown={handleKeyDown(def.note)}
        onKeyUp={() => handleNoteOff(def.note)}
        onBlur={() => handleNoteOff(def.note)}
      >
        {label}
        {!def.black && def.computerKey && (
          <span className="block text-[7px] opacity-50">{def.computerKey.toUpperCase()}</span>
        )}
      </button>
    );
  };

  return (
    <section className="border border-[#1a1a2e] rounded-sm p-2 panel-glow" aria-label="Keyboard">
      <header className="text-[9px] text-[#00ff41] font-mono opacity-70 mb-2">
        KEYBOARD // A–; NATURALS · 2–0 SHARPS · TOUCH PAD BELOW
      </header>

      {/* Desktop layout */}
      <div className="hidden sm:block">
        <div className="flex gap-1 mb-1">
          {BLACK_KEYS.map((entry) => (
            <div key={entry.note} className="flex-1 flex justify-center">
              {renderKey({ ...entry, black: true })}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {WHITE_KEYS.map((entry) => (
            <div key={entry.note} className="flex-1">
              {renderKey({ ...entry, black: false })}
            </div>
          ))}
        </div>
      </div>

      {/* Touch layout */}
      <div className="sm:hidden">
        {PAD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 mb-1">
            {row.map((note, i) => (
              <div key={`${rowIndex}-${i}`} className="flex-1">
                {note ? (
                  <button
                    type="button"
                    aria-label={`Play ${note}`}
                    className={`synth-key w-full h-12 rounded-sm text-[9px] font-mono border transition-all ${
                      activeNotes.has(note) ? 'active' : ''
                    }`}
                    style={{
                      background: activeNotes.has(note) ? noteColor(note) : THEME.panel,
                      borderColor: noteColor(note),
                      color: activeNotes.has(note) ? THEME.bg : noteColor(note),
                      boxShadow: activeNotes.has(note) ? `0 0 10px ${noteColor(note)}40` : 'none',
                    }}
                    onPointerDown={handlePointerDown(note)}
                    onPointerUp={() => handleNoteOff(note)}
                    onPointerLeave={() => handleNoteOff(note)}
                    onPointerCancel={() => handleNoteOff(note)}
                  >
                    {note.replace(/[0-9]/g, '')}
                  </button>
                ) : (
                  <div className="w-full h-12" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
