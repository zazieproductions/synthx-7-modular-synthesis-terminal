import { useState, useCallback, useRef, useEffect } from 'react';

interface Props {
  noteOn: (note: string) => void;
  noteOff: (note: string) => void;
  noteOffAll: () => void;
}

const KEYBOARD_ROWS = [
  // Top row - sharps/flats (black keys)
  { notes: ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null, 'C#5', 'D#5', null, 'F#5', 'G#5', 'A#5'],
    keys: ['2', '3', null, '5', '6', '7', null, '9', '0', null, '=', null, null],
    isBlack: true },
  // Bottom row - naturals (white keys)
  { notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'],
    keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', null, null, null],
    isBlack: false },
];

// Touch-friendly pad layout
const PAD_NOTES = [
  ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null, 'C#5'],
];

const NOTE_COLORS: Record<string, string> = {
  'C': '#00ff41', 'C#': '#00e5ff', 'D': '#00ff41', 'D#': '#00e5ff',
  'E': '#00ff41', 'F': '#ffaa00', 'F#': '#00e5ff', 'G': '#ffaa00',
  'G#': '#00e5ff', 'A': '#ff0066', 'A#': '#00e5ff', 'B': '#ff0066',
};

function getNoteColor(note: string): string {
  const name = note.replace(/[0-9]/g, '');
  return NOTE_COLORS[name] || '#00ff41';
}

export function SynthKeyboard({ noteOn, noteOff, noteOffAll }: Props) {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const activeNotesRef = useRef<Set<string>>(new Set());

  const handleNoteOn = useCallback((note: string) => {
    if (activeNotesRef.current.has(note)) return;
    activeNotesRef.current.add(note);
    setActiveNotes(new Set(activeNotesRef.current));
    noteOn(note);
  }, [noteOn]);

  const handleNoteOff = useCallback((note: string) => {
    activeNotesRef.current.delete(note);
    setActiveNotes(new Set(activeNotesRef.current));
    noteOff(note);
  }, [noteOff]);

  // Keyboard mapping
  useEffect(() => {
    const keyMap: Record<string, string> = {};
    KEYBOARD_ROWS.forEach(row => {
      row.notes.forEach((note, i) => {
        if (note && row.keys[i]) {
          keyMap[row.keys[i].toLowerCase()] = note;
        }
      });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = keyMap[e.key.toLowerCase()];
      if (note) handleNoteOn(note);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note) handleNoteOff(note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleNoteOn, handleNoteOff]);

  return (
    <div className="border border-[#1a1a2e] rounded-sm p-2 panel-glow">
      <div className="text-[9px] text-[#00ff41] font-mono opacity-70 mb-2">
        KEYBOARD // [A-;] WHITE [2-0] BLACK // TOUCH PAD BELOW
      </div>
      
      {/* Desktop keyboard layout */}
      <div className="hidden sm:block">
        <div className="relative h-24 mb-1">
          {/* Black keys */}
          <div className="flex gap-1 px-0">
            {KEYBOARD_ROWS[0].notes.map((note, i) => (
              <div key={i} className="flex-1 flex justify-center">
                {note && (
                  <button
                    className={`synth-key w-8 h-14 rounded-sm text-[8px] font-mono border transition-all ${
                      activeNotes.has(note) ? 'active scale-95' : ''
                    }`}
                    style={{
                      background: activeNotes.has(note) ? getNoteColor(note) : '#0d0d14',
                      borderColor: getNoteColor(note),
                      color: activeNotes.has(note) ? '#0a0a0f' : getNoteColor(note),
                      boxShadow: activeNotes.has(note) ? `0 0 10px ${getNoteColor(note)}40` : 'none',
                    }}
                    onPointerDown={(e) => { e.preventDefault(); handleNoteOn(note); }}
                    onPointerUp={() => handleNoteOff(note)}
                    onPointerLeave={() => { if (activeNotesRef.current.has(note)) handleNoteOff(note); }}
                  >
                    {note.replace('4', '').replace('5', '')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* White keys */}
        <div className="flex gap-1">
          {KEYBOARD_ROWS[1].notes.map((note, i) => (
            <div key={i} className="flex-1">
              {note && (
                <button
                  className={`synth-key w-full h-16 rounded-sm text-[9px] font-mono border transition-all ${
                    activeNotes.has(note) ? 'active scale-95' : ''
                  }`}
                  style={{
                    background: activeNotes.has(note) ? getNoteColor(note) : '#0d0d14',
                    borderColor: getNoteColor(note),
                    color: activeNotes.has(note) ? '#0a0a0f' : getNoteColor(note),
                    boxShadow: activeNotes.has(note) ? `0 0 10px ${getNoteColor(note)}40` : 'none',
                  }}
                  onPointerDown={(e) => { e.preventDefault(); handleNoteOn(note); }}
                  onPointerUp={() => handleNoteOff(note)}
                  onPointerLeave={() => { if (activeNotesRef.current.has(note)) handleNoteOff(note); }}
                >
                  <div>{note.replace('4', '').replace('5', '')}</div>
                  <div className="text-[7px] opacity-50">{KEYBOARD_ROWS[1].keys[i]?.toUpperCase()}</div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile pad layout */}
      <div className="sm:hidden">
        {PAD_NOTES.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 mb-1">
            {row.map((note, i) => (
              <div key={i} className="flex-1">
                {note ? (
                  <button
                    className={`synth-key w-full h-12 rounded-sm text-[9px] font-mono border transition-all ${
                      activeNotes.has(note) ? 'active scale-95' : ''
                    }`}
                    style={{
                      background: activeNotes.has(note) ? getNoteColor(note) : '#0d0d14',
                      borderColor: getNoteColor(note),
                      color: activeNotes.has(note) ? '#0a0a0f' : getNoteColor(note),
                      boxShadow: activeNotes.has(note) ? `0 0 10px ${getNoteColor(note)}40` : 'none',
                    }}
                    onTouchStart={(e) => { e.preventDefault(); handleNoteOn(note); }}
                    onTouchEnd={() => handleNoteOff(note)}
                    onTouchCancel={() => handleNoteOff(note)}
                  >
                    {note.replace('4', '').replace('5', '')}
                  </button>
                ) : (
                  <div className="w-full h-12" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
