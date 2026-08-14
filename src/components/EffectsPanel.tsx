import type { OscType, SynthState } from '../hooks/useSynthEngine';
import { ControlKnob } from './ControlKnob';

interface Props {
  state: SynthState;
  updateState: <K extends keyof SynthState>(key: K, value: SynthState[K]) => void;
}

const LFO_TYPES: OscType[] = ['sine', 'square', 'sawtooth', 'triangle'];

export function EffectsPanel({ state, updateState }: Props) {
  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-cyan">
      <div className="px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#00e5ff] font-mono opacity-70">
          EFFECTS // DSP CHAIN
        </span>
      </div>
      <div className="p-2 space-y-2" style={{ background: 'rgba(10,10,15,0.6)' }}>
        {/* Delay */}
        <div className="border border-[#00e5ff15] rounded-sm p-2">
          <div className="text-[10px] text-[#00e5ff] font-mono font-bold mb-2">DELAY</div>
          <div className="flex justify-around">
            <ControlKnob
              label="TIME"
              value={state.delayTime}
              min={0}
              max={1}
              step={0.01}
              unit="s"
              color="#00e5ff"
              onChange={v => updateState('delayTime', v)}
            />
            <ControlKnob
              label="FDBK"
              value={state.delayFeedback}
              min={0}
              max={0.9}
              step={0.01}
              color="#00e5ff"
              onChange={v => updateState('delayFeedback', v)}
            />
            <ControlKnob
              label="MIX"
              value={state.delayMix}
              min={0}
              max={0.8}
              step={0.01}
              color="#00e5ff"
              onChange={v => updateState('delayMix', v)}
            />
          </div>
        </div>

        {/* Reverb & Distortion */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-[#a855f715] rounded-sm p-2">
            <div className="text-[10px] text-[#a855f7] font-mono font-bold mb-2">REVERB</div>
            <div className="flex justify-center">
              <ControlKnob
                label="MIX"
                value={state.reverbMix}
                min={0}
                max={1}
                step={0.01}
                color="#a855f7"
                onChange={v => updateState('reverbMix', v)}
              />
            </div>
          </div>
          <div className="border border-[#ff006615] rounded-sm p-2">
            <div className="text-[10px] text-[#ff0066] font-mono font-bold mb-2">DISTORT</div>
            <div className="flex justify-center">
              <ControlKnob
                label="DRIVE"
                value={state.distortion}
                min={0}
                max={1}
                step={0.01}
                color="#ff0066"
                onChange={v => updateState('distortion', v)}
              />
            </div>
          </div>
        </div>

        {/* LFO */}
        <div className="border border-[#22d3ee15] rounded-sm p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#22d3ee] font-mono font-bold">LFO</span>
            <div className="flex gap-0.5">
              {LFO_TYPES.map(t => (
                <button
                  key={t}
                  className={`px-1.5 py-0.5 text-[7px] font-mono rounded-sm border transition-all ${
                    state.lfoType === t
                      ? 'bg-[#22d3ee] text-[#0a0a0f] border-[#22d3ee]'
                      : 'border-[#1a1a2e] text-[#6b7280] hover:border-[#22d3ee40]'
                  }`}
                  onClick={() => updateState('lfoType', t)}
                >
                  {t.slice(0, 3).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-around">
            <ControlKnob
              label="RATE"
              value={state.lfoRate}
              min={0.1}
              max={20}
              step={0.1}
              unit="Hz"
              color="#22d3ee"
              onChange={v => updateState('lfoRate', v)}
            />
            <ControlKnob
              label="DEPTH"
              value={state.lfoDepth}
              min={0}
              max={1000}
              step={1}
              color="#22d3ee"
              onChange={v => updateState('lfoDepth', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
