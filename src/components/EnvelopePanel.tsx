import type { SynthState } from '../hooks/useSynthEngine';
import { ControlKnob } from './ControlKnob';

interface Props {
  state: SynthState;
  updateState: <K extends keyof SynthState>(key: K, value: SynthState[K]) => void;
}

export function EnvelopePanel({ state, updateState }: Props) {
  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-pink">
      <div className="px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#ff0066] font-mono opacity-70">
          ENVELOPE // ADSR
        </span>
      </div>
      <div className="p-2" style={{ background: 'rgba(10,10,15,0.6)' }}>
        {/* ADSR Visualization */}
        <div className="mb-2">
          <svg viewBox="0 0 200 50" className="w-full h-10">
            <defs>
              <linearGradient id="envGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff0066" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff0066" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Grid */}
            <line x1="0" y1="50" x2="200" y2="50" stroke="#1a1a2e" strokeWidth="0.5" />
            <line x1="0" y1="25" x2="200" y2="25" stroke="#1a1a2e" strokeWidth="0.5" strokeDasharray="2" />
            
            {/* ADSR shape */}
            <path
              d={`M 0 50 L ${state.attack * 40} 5 L ${(state.attack + state.decay) * 40} ${50 - state.sustain * 45} L 140 ${50 - state.sustain * 45} L ${140 + state.release * 40} 50`}
              fill="url(#envGrad)"
              stroke="#ff0066"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <div className="flex justify-around">
          <ControlKnob
            label="ATK"
            value={state.attack}
            min={0.001}
            max={2}
            step={0.001}
            unit="s"
            color="#ff0066"
            onChange={v => updateState('attack', v)}
          />
          <ControlKnob
            label="DEC"
            value={state.decay}
            min={0.001}
            max={2}
            step={0.001}
            unit="s"
            color="#ff0066"
            onChange={v => updateState('decay', v)}
          />
          <ControlKnob
            label="SUS"
            value={state.sustain}
            min={0}
            max={1}
            step={0.01}
            color="#ff0066"
            onChange={v => updateState('sustain', v)}
          />
          <ControlKnob
            label="REL"
            value={state.release}
            min={0.001}
            max={5}
            step={0.001}
            unit="s"
            color="#ff0066"
            onChange={v => updateState('release', v)}
          />
        </div>
      </div>
    </div>
  );
}
