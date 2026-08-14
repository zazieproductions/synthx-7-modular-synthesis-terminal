import { useEffect, useState } from 'react';
import { APP_VERSION } from '../constants/theme';
import { PARAMETER_SPECS } from '../state/parameters';
import { useSynth } from '../state/useSynth';
import { formatTimestamp } from '../utils/format';

/** Top status strip: brand, DSP state, master volume, live clock. */
export function StatusBar() {
  const { state, isAudioReady, setParameter } = useSynth();
  const [clock, setClock] = useState(() => formatTimestamp(new Date()));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClock(formatTimestamp(new Date()));
    }, 200);
    return () => window.clearInterval(interval);
  }, []);

  const spec = PARAMETER_SPECS.masterVolume;

  return (
    <header className="flex items-center justify-between px-2 py-1 border-b border-[#1a1a2e] bg-[#0d0d14] text-[9px] font-mono">
      <div className="flex items-center gap-2">
        <span className="text-[#00ff41] font-bold animate-flicker">SYNTHX-7</span>
        <span className="text-[#1a1a2e]" aria-hidden="true">
          │
        </span>
        <span className={isAudioReady ? 'text-[#00ff41]' : 'text-[#ffaa00]'}>
          {isAudioReady ? '● DSP ACTIVE' : '○ STANDBY'}
        </span>
        <span className="text-[#1a1a2e]" aria-hidden="true">
          │
        </span>
        <span className="text-[#6b7280]">v{APP_VERSION}</span>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="master-volume" className="text-[#6b7280]">
          MASTER
        </label>
        <input
          id="master-volume"
          type="range"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={state.masterVolume}
          onChange={(event) => setParameter('masterVolume', Number(event.target.value))}
          className="w-16 sm:w-20"
          aria-valuetext={`${Math.round(state.masterVolume * 100)}%`}
        />
        <span className="text-[#00ff41] w-8 tabular-nums" aria-hidden="true">
          {Math.round(state.masterVolume * 100)}%
        </span>
        <span className="text-[#1a1a2e]" aria-hidden="true">
          │
        </span>
        <span className="text-[#ffaa00] tabular-nums">{clock}</span>
      </div>
    </header>
  );
}
