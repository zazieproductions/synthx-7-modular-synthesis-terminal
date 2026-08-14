import type { OscType, SynthState } from '../hooks/useSynthEngine';
import { ControlKnob } from './ControlKnob';

interface Props {
  state: SynthState;
  updateState: <K extends keyof SynthState>(key: K, value: SynthState[K]) => void;
}

const OSC_TYPES: OscType[] = ['sine', 'square', 'sawtooth', 'triangle'];

export function OscillatorPanel({ state, updateState }: Props) {
  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow">
      <div className="px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#00ff41] font-mono opacity-70">
          OSCILLATORS // DUAL CORE
        </span>
      </div>
      <div className="p-2 space-y-2" style={{ background: 'rgba(10,10,15,0.6)' }}>
        {/* OSC 1 */}
        <div className="border border-[#00ff4120] rounded-sm p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#00ff41] font-mono font-bold">OSC-1</span>
            <div className="flex gap-0.5">
              {OSC_TYPES.map(t => (
                <button
                  key={t}
                  className={`px-1.5 py-0.5 text-[7px] font-mono rounded-sm border transition-all ${
                    state.osc1Type === t
                      ? 'bg-[#00ff41] text-[#0a0a0f] border-[#00ff41]'
                      : 'border-[#1a1a2e] text-[#6b7280] hover:border-[#00ff4140]'
                  }`}
                  onClick={() => updateState('osc1Type', t)}
                >
                  {t.slice(0, 3).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-around">
            <ControlKnob
              label="GAIN"
              value={state.osc1Gain}
              min={0}
              max={1}
              step={0.01}
              color="#00ff41"
              onChange={v => updateState('osc1Gain', v)}
            />
            <ControlKnob
              label="DETUNE"
              value={state.osc1Detune}
              min={-50}
              max={50}
              step={1}
              unit="ct"
              color="#00ff41"
              onChange={v => updateState('osc1Detune', v)}
            />
          </div>
        </div>

        {/* OSC 2 */}
        <div className="border border-[#00e5ff20] rounded-sm p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#00e5ff] font-mono font-bold">OSC-2</span>
            <div className="flex gap-0.5">
              {OSC_TYPES.map(t => (
                <button
                  key={t}
                  className={`px-1.5 py-0.5 text-[7px] font-mono rounded-sm border transition-all ${
                    state.osc2Type === t
                      ? 'bg-[#00e5ff] text-[#0a0a0f] border-[#00e5ff]'
                      : 'border-[#1a1a2e] text-[#6b7280] hover:border-[#00e5ff40]'
                  }`}
                  onClick={() => updateState('osc2Type', t)}
                >
                  {t.slice(0, 3).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-around">
            <ControlKnob
              label="GAIN"
              value={state.osc2Gain}
              min={0}
              max={1}
              step={0.01}
              color="#00e5ff"
              onChange={v => updateState('osc2Gain', v)}
            />
            <ControlKnob
              label="DETUNE"
              value={state.osc2Detune}
              min={-50}
              max={50}
              step={1}
              unit="ct"
              color="#00e5ff"
              onChange={v => updateState('osc2Detune', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
