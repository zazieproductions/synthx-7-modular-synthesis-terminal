import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  type: 'SYS' | 'AUD' | 'MOD' | 'NET' | 'DSP' | 'ERR' | 'DBG';
  message: string;
}

const SCRIPT_MESSAGES: Omit<LogEntry, 'timestamp'>[] = [
  { type: 'SYS', message: 'SYNTHX-7 v4.2.1 firmware loaded' },
  { type: 'AUD', message: 'AudioContext initialized @ 44100Hz' },
  { type: 'DSP', message: 'FFT buffer allocated: 2048 bins' },
  { type: 'MOD', message: 'OSC1: sawtooth @ 0Hz [detune: 0ct]' },
  { type: 'MOD', message: 'OSC2: square @ 0Hz [detune: -7ct]' },
  { type: 'SYS', message: 'Filter module: lowpass 2000Hz Q:2.00' },
  { type: 'DSP', message: 'ADSR envelope: A:50ms D:200ms S:0.60 R:300ms' },
  { type: 'AUD', message: 'Delay line: 300ms feedback: 0.30 mix: 0.20' },
  { type: 'AUD', message: 'Reverb convolution: 2.0s decay' },
  { type: 'DSP', message: 'LFO modulating filter @ 4.00Hz depth: 0' },
  { type: 'NET', message: 'MIDI bridge: scanning ports...' },
  { type: 'NET', message: 'No MIDI devices found' },
  { type: 'SYS', message: 'Spectrogram engine: waterfall mode active' },
  { type: 'DSP', message: 'Distortion waveshaper: 0.00%' },
  { type: 'DBG', message: 'Memory: 2.4MB / 64MB allocated' },
  { type: 'SYS', message: 'Polyphony: 8 voices max' },
  { type: 'AUD', message: 'Master output gain: 0.50' },
  { type: 'DSP', message: 'Oversampling: 4x (anti-alias)' },
  { type: 'DBG', message: 'Render loop: 60fps stable' },
  { type: 'SYS', message: 'Thermal monitoring: 42°C nominal' },
  { type: 'NET', message: 'Clock sync: internal 120BPM' },
  { type: 'DSP', message: 'Spectrum analyzer: 64-band active' },
  { type: 'AUD', message: 'DC offset filter: engaged' },
  { type: 'SYS', message: 'Patch buffer: auto-save enabled' },
  { type: 'DBG', message: 'CPU load: 3.2% (audio thread)' },
  { type: 'MOD', message: 'Mod matrix: LFO->Filter routing OK' },
  { type: 'SYS', message: 'DAC calibration: reference 0dBFS' },
  { type: 'AUD', message: 'Anti-alias filter: Nyquist 22050Hz' },
  { type: 'DSP', message: 'Phase accumulator: 32-bit precision' },
  { type: 'ERR', message: 'Warning: buffer underrun detected (recovered)' },
  { type: 'NET', message: 'OSC server: listening on port 9000' },
  { type: 'SYS', message: 'Firmware checksum: 0x7FA2E1 verified' },
];

const TYPE_COLORS: Record<string, string> = {
  SYS: '#00ff41',
  AUD: '#00e5ff',
  MOD: '#ffaa00',
  NET: '#a855f7',
  DSP: '#22d3ee',
  ERR: '#ff0066',
  DBG: '#6b7280',
};

export function RunningScripts() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const entry = SCRIPT_MESSAGES[indexRef.current % SCRIPT_MESSAGES.length];
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      
      setLogs(prev => {
        const next = [...prev, { ...entry, timestamp }];
        if (next.length > 50) next.shift(); // Keep last 50
        return next;
      });
      
      indexRef.current++;
    }, 800 + Math.random() * 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow">
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#00ff41] font-mono opacity-70">
          TERMINAL // LOG STREAM
        </span>
        <span className="text-[8px] text-[#00ff41] font-mono animate-pulse-glow">● LIVE</span>
      </div>
      <div
        ref={scrollRef}
        className="h-28 sm:h-36 overflow-y-auto p-1.5 font-mono text-[9px] leading-relaxed"
        style={{ background: 'rgba(10,10,15,0.8)' }}
      >
        {logs.map((log, i) => (
          <div key={i} className="flex gap-1">
            <span className="text-[#1a1a2e] shrink-0">{log.timestamp}</span>
            <span className="shrink-0" style={{ color: TYPE_COLORS[log.type] }}>[{log.type}]</span>
            <span className="text-[#6b7280]">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
