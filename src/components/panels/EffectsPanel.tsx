import { THEME } from '../../constants/theme';
import { PARAMETER_SPECS } from '../../state/parameters';
import { useSynth } from '../../state/useSynth';
import type { OscType } from '../../types/synth';
import { ControlKnob } from '../ControlKnob';
import { TypeSelector } from '../TypeSelector';

const LFO_TYPES: readonly OscType[] = ['sine', 'square', 'sawtooth', 'triangle'];

export function EffectsPanel() {
  const { state, setParameter } = useSynth();

  return (
    <section
      className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-cyan"
      aria-label="Effects"
    >
      <header className="px-2 py-1 border-b border-[#1a1a2e]">
        <h2 className="text-[9px] text-[#00e5ff] font-mono opacity-70">EFFECTS // DSP CHAIN</h2>
      </header>
      <div className="p-2 space-y-2" style={{ background: 'rgba(10,10,15,0.6)' }}>
        {/* Delay */}
        <section className="border border-[#00e5ff15] rounded-sm p-2" aria-label="Delay">
          <h3 className="text-[10px] text-[#00e5ff] font-mono font-bold mb-2">DELAY</h3>
          <div className="flex justify-around">
            <ControlKnob
              label={PARAMETER_SPECS.delayTime.label}
              value={state.delayTime}
              min={PARAMETER_SPECS.delayTime.min}
              max={PARAMETER_SPECS.delayTime.max}
              step={PARAMETER_SPECS.delayTime.step}
              unit={PARAMETER_SPECS.delayTime.unit}
              color={PARAMETER_SPECS.delayTime.color}
              defaultValue={0.3}
              onChange={(v) => setParameter('delayTime', v)}
            />
            <ControlKnob
              label={PARAMETER_SPECS.delayFeedback.label}
              value={state.delayFeedback}
              min={PARAMETER_SPECS.delayFeedback.min}
              max={PARAMETER_SPECS.delayFeedback.max}
              step={PARAMETER_SPECS.delayFeedback.step}
              color={PARAMETER_SPECS.delayFeedback.color}
              defaultValue={0.3}
              onChange={(v) => setParameter('delayFeedback', v)}
            />
            <ControlKnob
              label={PARAMETER_SPECS.delayMix.label}
              value={state.delayMix}
              min={PARAMETER_SPECS.delayMix.min}
              max={PARAMETER_SPECS.delayMix.max}
              step={PARAMETER_SPECS.delayMix.step}
              color={PARAMETER_SPECS.delayMix.color}
              defaultValue={0.2}
              onChange={(v) => setParameter('delayMix', v)}
            />
          </div>
        </section>

        {/* Reverb & Distortion */}
        <div className="grid grid-cols-2 gap-2">
          <section className="border border-[#a855f715] rounded-sm p-2" aria-label="Reverb">
            <h3 className="text-[10px] text-[#a855f7] font-mono font-bold mb-2">REVERB</h3>
            <div className="flex justify-center">
              <ControlKnob
                label={PARAMETER_SPECS.reverbMix.label}
                value={state.reverbMix}
                min={PARAMETER_SPECS.reverbMix.min}
                max={PARAMETER_SPECS.reverbMix.max}
                step={PARAMETER_SPECS.reverbMix.step}
                color={PARAMETER_SPECS.reverbMix.color}
                defaultValue={0.15}
                onChange={(v) => setParameter('reverbMix', v)}
              />
            </div>
          </section>
          <section className="border border-[#ff006615] rounded-sm p-2" aria-label="Distortion">
            <h3 className="text-[10px] text-[#ff0066] font-mono font-bold mb-2">DISTORT</h3>
            <div className="flex justify-center">
              <ControlKnob
                label={PARAMETER_SPECS.distortion.label}
                value={state.distortion}
                min={PARAMETER_SPECS.distortion.min}
                max={PARAMETER_SPECS.distortion.max}
                step={PARAMETER_SPECS.distortion.step}
                color={PARAMETER_SPECS.distortion.color}
                defaultValue={0}
                onChange={(v) => setParameter('distortion', v)}
              />
            </div>
          </section>
        </div>

        {/* LFO */}
        <section className="border border-[#22d3ee15] rounded-sm p-2" aria-label="LFO">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] text-[#22d3ee] font-mono font-bold">LFO</h3>
            <TypeSelector
              options={LFO_TYPES}
              value={state.lfoType}
              onChange={(v) => setParameter('lfoType', v)}
              color={THEME.teal}
              label={(o) => o.slice(0, 3).toUpperCase()}
              aria-label="LFO waveform"
            />
          </div>
          <div className="flex justify-around">
            <ControlKnob
              label={PARAMETER_SPECS.lfoRate.label}
              value={state.lfoRate}
              min={PARAMETER_SPECS.lfoRate.min}
              max={PARAMETER_SPECS.lfoRate.max}
              step={PARAMETER_SPECS.lfoRate.step}
              unit={PARAMETER_SPECS.lfoRate.unit}
              color={PARAMETER_SPECS.lfoRate.color}
              defaultValue={4}
              onChange={(v) => setParameter('lfoRate', v)}
            />
            <ControlKnob
              label={PARAMETER_SPECS.lfoDepth.label}
              value={state.lfoDepth}
              min={PARAMETER_SPECS.lfoDepth.min}
              max={PARAMETER_SPECS.lfoDepth.max}
              step={PARAMETER_SPECS.lfoDepth.step}
              unit={PARAMETER_SPECS.lfoDepth.unit}
              color={PARAMETER_SPECS.lfoDepth.color}
              defaultValue={0}
              onChange={(v) => setParameter('lfoDepth', v)}
            />
          </div>
        </section>
      </div>
    </section>
  );
}
