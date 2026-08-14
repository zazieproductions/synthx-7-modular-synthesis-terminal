import { useState, useEffect } from 'react';
import { useSynthEngine } from './hooks/useSynthEngine';
import { SpectrogramDisplay } from './components/SpectrogramDisplay';
import { WaveformDisplay } from './components/WaveformDisplay';
import { LevelMeter } from './components/LevelMeter';
import { FrequencySpectrum } from './components/FrequencySpectrum';
import { SynthKeyboard } from './components/SynthKeyboard';
import { RunningScripts } from './components/RunningScripts';
import { ModularInfo } from './components/ModularInfo';
import { OscillatorPanel } from './components/OscillatorPanel';
import { FilterPanel } from './components/FilterPanel';
import { EnvelopePanel } from './components/EnvelopePanel';
import { EffectsPanel } from './components/EffectsPanel';

function HexDump() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
      ).join(' ');
      const ascii = Array.from({ length: 16 }, () => {
        const c = Math.floor(Math.random() * 96 + 32);
        return c >= 33 && c <= 126 ? String.fromCharCode(c) : '.';
      }).join('');
      const addr = Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0').toUpperCase();
      setLines(prev => {
        const next = [...prev, `${addr}: ${hex}  ${ascii}`];
        return next.length > 8 ? next.slice(-8) : next;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow">
      <div className="px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#00ff41] font-mono opacity-70">
          MEM DUMP // 0x7F00-0x7FFF
        </span>
      </div>
      <div className="p-1.5 font-mono text-[8px] leading-relaxed text-[#1a3a1a]" style={{ background: 'rgba(10,10,15,0.6)' }}>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function PatchSelector({ state, updateState }: { state: ReturnType<typeof useSynthEngine>['state']; updateState: ReturnType<typeof useSynthEngine>['updateState'] }) {
  const patches = [
    { name: 'INIT', state: {} },
    { name: 'BASS', state: { osc1Type: 'sawtooth' as const, osc1Gain: 0.8, osc2Type: 'square' as const, osc2Gain: 0.4, osc2Detune: -12, filterFreq: 800, filterQ: 4, attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.2, delayMix: 0.1, reverbMix: 0.05 } },
    { name: 'LEAD', state: { osc1Type: 'square' as const, osc1Gain: 0.6, osc2Type: 'sawtooth' as const, osc2Gain: 0.5, osc2Detune: 7, filterFreq: 3000, filterQ: 3, attack: 0.01, decay: 0.15, sustain: 0.7, release: 0.2, delayMix: 0.25, delayTime: 0.4, reverbMix: 0.2 } },
    { name: 'PAD', state: { osc1Type: 'sine' as const, osc1Gain: 0.5, osc2Type: 'triangle' as const, osc2Gain: 0.5, osc2Detune: -5, filterFreq: 1500, attack: 0.8, decay: 0.5, sustain: 0.8, release: 2.0, delayMix: 0.3, delayTime: 0.5, delayFeedback: 0.4, reverbMix: 0.4 } },
    { name: 'NOISE', state: { osc1Type: 'sawtooth' as const, osc1Gain: 0.7, osc2Type: 'square' as const, osc2Gain: 0.7, osc2Detune: -25, filterFreq: 5000, filterQ: 8, attack: 0.001, decay: 0.1, sustain: 0.9, release: 0.1, distortion: 0.6, delayMix: 0.15, reverbMix: 0.1 } },
    { name: 'ALIEN', state: { osc1Type: 'sine' as const, osc1Gain: 0.6, osc2Type: 'sawtooth' as const, osc2Gain: 0.3, osc2Detune: 19, filterFreq: 4000, filterQ: 6, attack: 0.2, decay: 0.8, sustain: 0.3, release: 1.5, lfoRate: 6, lfoDepth: 500, lfoType: 'sine' as const, delayMix: 0.3, delayTime: 0.25, delayFeedback: 0.5, reverbMix: 0.35 } },
  ];

  const [activePatch, setActivePatch] = useState('INIT');

  const loadPatch = (patchName: string) => {
    const patch = patches.find(p => p.name === patchName);
    if (!patch) return;
    setActivePatch(patchName);
    Object.entries(patch.state).forEach(([key, value]) => {
      updateState(key as keyof typeof state, value as never);
    });
  };

  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-pink">
      <div className="px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#ff0066] font-mono opacity-70">
          PATCHES // PRESET BANK
        </span>
      </div>
      <div className="p-1.5 flex flex-wrap gap-1" style={{ background: 'rgba(10,10,15,0.6)' }}>
        {patches.map(p => (
          <button
            key={p.name}
            className={`px-2 py-1 text-[9px] font-mono rounded-sm border transition-all ${
              activePatch === p.name
                ? 'bg-[#ff0066] text-[#0a0a0f] border-[#ff0066] font-bold'
                : 'border-[#1a1a2e] text-[#6b7280] hover:border-[#ff006640] hover:text-[#ff0066]'
            }`}
            onClick={() => loadPatch(p.name)}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusBar({ isAudioReady, masterVolume, updateState }: { isAudioReady: boolean; masterVolume: number; updateState: (key: string, value: number) => void }) {
  const [time, setTime] = useState('');
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }) + '.' + now.getMilliseconds().toString().padStart(3, '0'));
      setFrames(f => f + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between px-2 py-1 border-b border-[#1a1a2e] bg-[#0d0d14] text-[9px] font-mono">
      <div className="flex items-center gap-2">
        <span className="text-[#00ff41] font-bold animate-flicker">SYNTHX-7</span>
        <span className="text-[#1a1a2e]">│</span>
        <span className={isAudioReady ? 'text-[#00ff41]' : 'text-[#ffaa00]'}>
          {isAudioReady ? '● DSP ACTIVE' : '○ STANDBY'}
        </span>
        <span className="text-[#1a1a2e]">│</span>
        <span className="text-[#6b7280]">V4.2.1</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#6b7280]">MASTER:</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={masterVolume}
          onChange={e => updateState('masterVolume', parseFloat(e.target.value))}
          className="w-16 sm:w-20"
        />
        <span className="text-[#00ff41] w-8">{Math.round(masterVolume * 100)}%</span>
        <span className="text-[#1a1a2e]">│</span>
        <span className="text-[#6b7280]">F:{frames}</span>
        <span className="text-[#1a1a2e]">│</span>
        <span className="text-[#ffaa00]">{time}</span>
      </div>
    </div>
  );
}

function CircuitDiagram() {
  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-cyan">
      <div className="px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#00e5ff] font-mono opacity-70">
          CIRCUIT // SIGNAL ROUTING
        </span>
      </div>
      <div className="p-2" style={{ background: 'rgba(10,10,15,0.6)' }}>
        <svg viewBox="0 0 200 80" className="w-full h-16">
          {/* OSC1 */}
          <rect x="2" y="5" width="36" height="20" rx="2" fill="none" stroke="#00ff41" strokeWidth="0.8" />
          <text x="20" y="18" textAnchor="middle" fill="#00ff41" fontSize="6" fontFamily="monospace">OSC1</text>
          
          {/* OSC2 */}
          <rect x="2" y="35" width="36" height="20" rx="2" fill="none" stroke="#00e5ff" strokeWidth="0.8" />
          <text x="20" y="48" textAnchor="middle" fill="#00e5ff" fontSize="6" fontFamily="monospace">OSC2</text>
          
          {/* Mixer */}
          <rect x="52" y="18" width="30" height="24" rx="2" fill="none" stroke="#a855f7" strokeWidth="0.8" />
          <text x="67" y="34" textAnchor="middle" fill="#a855f7" fontSize="5" fontFamily="monospace">MIX</text>
          
          {/* Filter */}
          <rect x="96" y="18" width="30" height="24" rx="2" fill="none" stroke="#ffaa00" strokeWidth="0.8" />
          <text x="111" y="34" textAnchor="middle" fill="#ffaa00" fontSize="5" fontFamily="monospace">VCF</text>
          
          {/* Envelope */}
          <rect x="140" y="18" width="30" height="24" rx="2" fill="none" stroke="#ff0066" strokeWidth="0.8" />
          <text x="155" y="34" textAnchor="middle" fill="#ff0066" fontSize="5" fontFamily="monospace">ENV</text>
          
          {/* Output */}
          <rect x="180" y="22" width="16" height="16" rx="8" fill="none" stroke="#00ff41" strokeWidth="0.8" />
          <text x="188" y="33" textAnchor="middle" fill="#00ff41" fontSize="5" fontFamily="monospace">OUT</text>
          
          {/* LFO */}
          <rect x="96" y="55" width="30" height="16" rx="2" fill="none" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="2" />
          <text x="111" y="66" textAnchor="middle" fill="#22d3ee" fontSize="5" fontFamily="monospace">LFO</text>
          
          {/* Connections */}
          <line x1="38" y1="15" x2="52" y2="26" stroke="#00ff41" strokeWidth="0.5" opacity="0.6" />
          <line x1="38" y1="45" x2="52" y2="34" stroke="#00e5ff" strokeWidth="0.5" opacity="0.6" />
          <line x1="82" y1="30" x2="96" y2="30" stroke="#a855f7" strokeWidth="0.5" opacity="0.6" />
          <line x1="126" y1="30" x2="140" y2="30" stroke="#ffaa00" strokeWidth="0.5" opacity="0.6" />
          <line x1="170" y1="30" x2="180" y2="30" stroke="#ff0066" strokeWidth="0.5" opacity="0.6" />
          <line x1="111" y1="55" x2="111" y2="42" stroke="#22d3ee" strokeWidth="0.5" opacity="0.4" strokeDasharray="2" />
          
          {/* Signal flow dots (animated via CSS) */}
          <circle cx="45" cy="20" r="1.5" fill="#00ff41" opacity="0.8">
            <animate attributeName="cx" values="38;52" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="89" cy="30" r="1.5" fill="#a855f7" opacity="0.8">
            <animate attributeName="cx" values="82;96" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="133" cy="30" r="1.5" fill="#ffaa00" opacity="0.8">
            <animate attributeName="cx" values="126;140" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </div>
  );
}

function MatrixRain() {
  const [chars, setChars] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const char = String.fromCharCode(0x30A0 + Math.random() * 96);
      setChars(prev => {
        const next = [...prev, char];
        return next.length > 20 ? next.slice(-20) : next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow">
      <div className="px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#00ff41] font-mono opacity-70">
          ENTROPY // RANDOM
        </span>
      </div>
      <div className="p-1.5 font-mono text-[10px] text-[#00ff4130] leading-tight break-all h-8 overflow-hidden" style={{ background: 'rgba(10,10,15,0.6)' }}>
        {chars.join('')}
      </div>
    </div>
  );
}

export default function App() {
  const {
    state,
    updateState,
    noteOn,
    noteOff,
    noteOffAll,
    initAudio,
    isAudioReady,
    analyserRef,
    analyserTimeRef,
  } = useSynthEngine();

  const [started, setStarted] = useState(false);

  const handleStart = () => {
    initAudio();
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-md w-full text-center space-y-8">
          {/* Boot screen */}
          <div className="space-y-2">
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[#00ff41] animate-flicker" style={{ fontFamily: 'Share Tech Mono, monospace', textShadow: '0 0 20px #00ff4140, 0 0 40px #00ff4120' }}>
              SYNTHX-7
            </div>
            <div className="text-[#00e5ff] font-mono text-sm tracking-[0.3em]">
              MODULAR SYNTHESIS TERMINAL
            </div>
            <div className="text-[#6b7280] font-mono text-xs">
              v4.2.1 // DUAL OSC // VCF // ADSR // FX CHAIN
            </div>
          </div>

          {/* ASCII art synth */}
          <pre className="text-[#00ff41] text-[8px] sm:text-[10px] leading-tight opacity-60 font-mono">
{`    ┌──────────────────────────┐
    │  ╔═══╗  ╔═══╗  ╔═══╗   │
    │  ║OSC1║  ║VCF║  ║ENV║   │
    │  ╚═╤═╝  ╚═╤═╝  ╚═╤═╝   │
    │    │       │       │     │
    │  ╔═╧═╗  ╔═╧═╗  ╔═╧═╗   │
    │  ║OSC2║──║FX ║──║OUT║   │
    │  ╚═══╝  ╚═══╝  ╚═══╝   │
    └──────────────────────────┘`}
          </pre>

          <button
            onClick={handleStart}
            className="px-8 py-3 border-2 border-[#00ff41] text-[#00ff41] font-mono text-sm rounded-sm transition-all hover:bg-[#00ff41] hover:text-[#0a0a0f] hover:shadow-[0_0_30px_#00ff4140] active:scale-95"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}
          >
            {'>'} INITIALIZE AUDIO ENGINE {'<'}
          </button>

          <div className="text-[#1a1a2e] font-mono text-[10px] space-y-0.5">
            <div>Web Audio API // 44100Hz // Stereo</div>
            <div>Touch + Keyboard Compatible</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      {/* Status Bar */}
      <StatusBar
        isAudioReady={isAudioReady}
        masterVolume={state.masterVolume}
        updateState={(k, v) => updateState(k as keyof typeof state, v as never)}
      />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Visualizations Row */}
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <SpectrogramDisplay analyserRef={analyserRef} />
            <WaveformDisplay analyserRef={analyserTimeRef} />
          </div>
          <LevelMeter analyserRef={analyserRef} />
        </div>

        {/* Frequency Spectrum */}
        <FrequencySpectrum analyserRef={analyserRef} />

        {/* Circuit + Patches + Matrix Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <CircuitDiagram />
          <PatchSelector state={state} updateState={updateState} />
          <MatrixRain />
        </div>

        {/* Control Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <OscillatorPanel state={state} updateState={updateState} />
          <FilterPanel state={state} updateState={updateState} />
        </div>

        <EnvelopePanel state={state} updateState={updateState} />
        <EffectsPanel state={state} updateState={updateState} />

        {/* Modular Info + Terminal + Hex Dump */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ModularInfo state={state} isAudioReady={isAudioReady} />
          <div className="space-y-2">
            <RunningScripts />
            <HexDump />
          </div>
        </div>

        {/* Keyboard */}
        <SynthKeyboard noteOn={noteOn} noteOff={noteOff} noteOffAll={noteOffAll} />

        {/* Bottom spacer for mobile */}
        <div className="h-4" />
      </div>

      {/* Bottom status */}
      <div className="flex items-center justify-between px-2 py-1 border-t border-[#1a1a2e] bg-[#0d0d14] text-[8px] font-mono text-[#1a1a2e]">
        <span>SYNTHX-7 TERMINAL // 2024</span>
        <span>TOUCH/KEYBOARD INPUT // WEB AUDIO API</span>
        <span>POLYPHONIC</span>
      </div>
    </div>
  );
}
