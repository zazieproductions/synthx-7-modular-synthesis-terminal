import { BootScreen } from './components/BootScreen';
import { PatchSelector } from './components/PatchSelector';
import { SignalChainDiagram } from './components/SignalChainDiagram';
import { StatusBar } from './components/StatusBar';
import { SystemInfo } from './components/SystemInfo';
import { TerminalLog } from './components/TerminalLog';
import { SynthKeyboard } from './components/keyboard/SynthKeyboard';
import { EffectsPanel } from './components/panels/EffectsPanel';
import { EnvelopePanel } from './components/panels/EnvelopePanel';
import { FilterPanel } from './components/panels/FilterPanel';
import { OscillatorPanel } from './components/panels/OscillatorPanel';
import { FrequencySpectrum } from './components/visualizers/FrequencySpectrum';
import { LevelMeter } from './components/visualizers/LevelMeter';
import { SpectrogramDisplay } from './components/visualizers/SpectrogramDisplay';
import { WaveformDisplay } from './components/visualizers/WaveformDisplay';
import { SynthProvider } from './state/SynthProvider';
import { useSynth } from './state/useSynth';

function SynthApp() {
  const { status } = useSynth();

  if (status !== 'ready') {
    return <BootScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      <StatusBar />

      <main className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Visualizations row */}
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <SpectrogramDisplay />
            <WaveformDisplay />
          </div>
          <LevelMeter />
        </div>

        <FrequencySpectrum />

        {/* Routing + presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <SignalChainDiagram />
          <PatchSelector />
        </div>

        {/* Control panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <OscillatorPanel />
          <FilterPanel />
        </div>

        <EnvelopePanel />
        <EffectsPanel />

        {/* Readouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <SystemInfo />
          <TerminalLog />
        </div>

        <SynthKeyboard />
      </main>

      <footer className="flex items-center justify-between px-2 py-1 border-t border-[#1a1a2e] bg-[#0d0d14] text-[8px] font-mono text-[#3a3a4e]">
        <span>SYNTHX-7 TERMINAL</span>
        <span className="hidden sm:inline">COMPUTER KEYBOARD + TOUCH INPUT // WEB AUDIO API</span>
        <span>POLYPHONIC</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SynthProvider>
      <SynthApp />
    </SynthProvider>
  );
}
