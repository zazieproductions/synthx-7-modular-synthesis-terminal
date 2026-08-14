import { THEME } from '../../constants/theme';
import { PARAMETER_SPECS } from '../../state/parameters';
import type { OscType } from '../../types/synth';
import { ControlKnob } from '../ControlKnob';
import { TypeSelector } from '../TypeSelector';
import { useSynth } from '../../state/useSynth';

const OSC_TYPES: readonly OscType[] = ['sine', 'square', 'sawtooth', 'triangle'];

export function OscillatorPanel() {
  const { state, setParameter } = useSynth();

  return (
    <section
      className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow"
      aria-label="Oscillators"
    >
      <header className="px-2 py-1 border-b border-[#1a1a2e]">
        <h2 className="text-[9px] text-[#00ff41] font-mono opacity-70">OSCILLATORS // DUAL CORE</h2>
      </header>
      <div className="p-2 space-y-2" style={{ background: 'rgba(10,10,15,0.6)' }}>
        <fieldset className="border border-[#00ff4120] rounded-sm p-2">
          <legend className="sr-only">Oscillator 1</legend>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#00ff41] font-mono font-bold">OSC-1</span>
            <TypeSelector
              options={OSC_TYPES}
              value={state.osc1Type}
              onChange={(v) => setParameter('osc1Type', v)}
              color={THEME.green}
              label={(o) => o.slice(0, 3).toUpperCase()}
              aria-label="Oscillator 1 waveform"
            />
          </div>
          <div className="flex justify-around">
            <ControlKnob
              label={PARAMETER_SPECS.osc1Gain.label}
              value={state.osc1Gain}
              min={PARAMETER_SPECS.osc1Gain.min}
              max={PARAMETER_SPECS.osc1Gain.max}
              step={PARAMETER_SPECS.osc1Gain.step}
              color={PARAMETER_SPECS.osc1Gain.color}
              defaultValue={0.7}
              onChange={(v) => setParameter('osc1Gain', v)}
            />
            <ControlKnob
              label={PARAMETER_SPECS.osc1Detune.label}
              value={state.osc1Detune}
              min={PARAMETER_SPECS.osc1Detune.min}
              max={PARAMETER_SPECS.osc1Detune.max}
              step={PARAMETER_SPECS.osc1Detune.step}
              unit={PARAMETER_SPECS.osc1Detune.unit}
              color={PARAMETER_SPECS.osc1Detune.color}
              defaultValue={0}
              onChange={(v) => setParameter('osc1Detune', v)}
            />
          </div>
        </fieldset>

        <fieldset className="border border-[#00e5ff20] rounded-sm p-2">
          <legend className="sr-only">Oscillator 2</legend>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#00e5ff] font-mono font-bold">OSC-2</span>
            <TypeSelector
              options={OSC_TYPES}
              value={state.osc2Type}
              onChange={(v) => setParameter('osc2Type', v)}
              color={THEME.cyan}
              label={(o) => o.slice(0, 3).toUpperCase()}
              aria-label="Oscillator 2 waveform"
            />
          </div>
          <div className="flex justify-around">
            <ControlKnob
              label={PARAMETER_SPECS.osc2Gain.label}
              value={state.osc2Gain}
              min={PARAMETER_SPECS.osc2Gain.min}
              max={PARAMETER_SPECS.osc2Gain.max}
              step={PARAMETER_SPECS.osc2Gain.step}
              color={PARAMETER_SPECS.osc2Gain.color}
              defaultValue={0.3}
              onChange={(v) => setParameter('osc2Gain', v)}
            />
            <ControlKnob
              label={PARAMETER_SPECS.osc2Detune.label}
              value={state.osc2Detune}
              min={PARAMETER_SPECS.osc2Detune.min}
              max={PARAMETER_SPECS.osc2Detune.max}
              step={PARAMETER_SPECS.osc2Detune.step}
              unit={PARAMETER_SPECS.osc2Detune.unit}
              color={PARAMETER_SPECS.osc2Detune.color}
              defaultValue={-7}
              onChange={(v) => setParameter('osc2Detune', v)}
            />
          </div>
        </fieldset>
      </div>
    </section>
  );
}
