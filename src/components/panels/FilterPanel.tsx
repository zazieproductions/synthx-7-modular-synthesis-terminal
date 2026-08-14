import { THEME } from '../../constants/theme';
import { PARAMETER_SPECS } from '../../state/parameters';
import { useSynth } from '../../state/useSynth';
import type { FilterType } from '../../types/synth';
import { ControlKnob } from '../ControlKnob';
import { TypeSelector } from '../TypeSelector';

const FILTER_TYPES: readonly FilterType[] = ['lowpass', 'highpass', 'bandpass', 'notch'];
const FILTER_LABELS: Record<FilterType, string> = {
  lowpass: 'LP',
  highpass: 'HP',
  bandpass: 'BP',
  notch: 'NOTCH',
};

export function FilterPanel() {
  const { state, setParameter } = useSynth();

  return (
    <section
      className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-amber"
      aria-label="Filter"
    >
      <header className="px-2 py-1 border-b border-[#1a1a2e]">
        <h2 className="text-[9px] text-[#ffaa00] font-mono opacity-70">FILTER // VCF MODULE</h2>
      </header>
      <div className="p-2" style={{ background: 'rgba(10,10,15,0.6)' }}>
        <div className="flex items-center justify-between mb-2">
          <TypeSelector
            options={FILTER_TYPES}
            value={state.filterType}
            onChange={(v) => setParameter('filterType', v)}
            color={THEME.amber}
            label={(option) => FILTER_LABELS[option]}
            aria-label="Filter type"
          />
        </div>
        <div className="flex justify-around">
          <ControlKnob
            label={PARAMETER_SPECS.filterFreq.label}
            value={state.filterFreq}
            min={PARAMETER_SPECS.filterFreq.min}
            max={PARAMETER_SPECS.filterFreq.max}
            step={PARAMETER_SPECS.filterFreq.step}
            unit={PARAMETER_SPECS.filterFreq.unit}
            color={PARAMETER_SPECS.filterFreq.color}
            defaultValue={2000}
            onChange={(v) => setParameter('filterFreq', v)}
          />
          <ControlKnob
            label={PARAMETER_SPECS.filterQ.label}
            value={state.filterQ}
            min={PARAMETER_SPECS.filterQ.min}
            max={PARAMETER_SPECS.filterQ.max}
            step={PARAMETER_SPECS.filterQ.step}
            color={PARAMETER_SPECS.filterQ.color}
            defaultValue={2}
            onChange={(v) => setParameter('filterQ', v)}
          />
          <ControlKnob
            label={PARAMETER_SPECS.filterGain.label}
            value={state.filterGain}
            min={PARAMETER_SPECS.filterGain.min}
            max={PARAMETER_SPECS.filterGain.max}
            step={PARAMETER_SPECS.filterGain.step}
            unit={PARAMETER_SPECS.filterGain.unit}
            color={PARAMETER_SPECS.filterGain.color}
            defaultValue={0}
            onChange={(v) => setParameter('filterGain', v)}
          />
        </div>
      </div>
    </section>
  );
}
