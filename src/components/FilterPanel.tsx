import type { FilterType, SynthState } from '../hooks/useSynthEngine';
import { ControlKnob } from './ControlKnob';

interface Props {
  state: SynthState;
  updateState: <K extends keyof SynthState>(key: K, value: SynthState[K]) => void;
}

const FILTER_TYPES: FilterType[] = ['lowpass', 'highpass', 'bandpass', 'notch'];

export function FilterPanel({ state, updateState }: Props) {
  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-amber">
      <div className="px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#ffaa00] font-mono opacity-70">
          FILTER // VCF MODULE
        </span>
      </div>
      <div className="p-2" style={{ background: 'rgba(10,10,15,0.6)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-0.5">
            {FILTER_TYPES.map(t => (
              <button
                key={t}
                className={`px-1.5 py-0.5 text-[7px] font-mono rounded-sm border transition-all ${
                  state.filterType === t
                    ? 'bg-[#ffaa00] text-[#0a0a0f] border-[#ffaa00]'
                    : 'border-[#1a1a2e] text-[#6b7280] hover:border-[#ffaa0040]'
                }`}
                onClick={() => updateState('filterType', t)}
              >
                {t.slice(0, 4).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-around">
          <ControlKnob
            label="FREQ"
            value={state.filterFreq}
            min={20}
            max={20000}
            step={1}
            unit="Hz"
            color="#ffaa00"
            onChange={v => updateState('filterFreq', v)}
          />
          <ControlKnob
            label="RES"
            value={state.filterQ}
            min={0.1}
            max={20}
            step={0.1}
            color="#ffaa00"
            onChange={v => updateState('filterQ', v)}
          />
          <ControlKnob
            label="GAIN"
            value={state.filterGain}
            min={-40}
            max={40}
            step={0.5}
            unit="dB"
            color="#ffaa00"
            onChange={v => updateState('filterGain', v)}
          />
        </div>
      </div>
    </div>
  );
}
