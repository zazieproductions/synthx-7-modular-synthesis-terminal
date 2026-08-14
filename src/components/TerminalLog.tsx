import { useEffect, useRef } from 'react';
import { THEME } from '../constants/theme';
import { useSynth } from '../state/useSynth';
import type { LogLevel } from '../types/synth';

const LEVEL_COLORS: Record<LogLevel, string> = {
  SYS: THEME.green,
  AUD: THEME.cyan,
  DSP: THEME.teal,
  ERR: THEME.pink,
};

/**
 * Terminal log stream fed by real engine events (boot, preset loads, errors).
 * Nothing here is fabricated — every line originates from the provider.
 */
export function TerminalLog() {
  const { log } = useSynth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  return (
    <section
      className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow"
      aria-label="Event log"
    >
      <header className="flex items-center justify-between px-2 py-1 border-b border-[#1a1a2e]">
        <h2 className="text-[9px] text-[#00ff41] font-mono opacity-70">TERMINAL // EVENT LOG</h2>
        <span className="text-[8px] text-[#00ff41] font-mono animate-pulse-glow">● LIVE</span>
      </header>
      <div
        ref={scrollRef}
        className="h-28 sm:h-36 overflow-y-auto p-1.5 font-mono text-[9px] leading-relaxed"
        style={{ background: 'rgba(10,10,15,0.8)' }}
        aria-live="polite"
      >
        {log.length === 0 ? (
          <div className="text-[#1a1a2e]">— awaiting audio engine boot —</div>
        ) : (
          log.map((entry) => (
            <div key={entry.id} className="flex gap-1">
              <span className="text-[#1a1a2e] shrink-0 tabular-nums">{entry.timestamp}</span>
              <span className="shrink-0" style={{ color: LEVEL_COLORS[entry.level] }}>
                [{entry.level}]
              </span>
              <span className="text-[#6b7280]">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
