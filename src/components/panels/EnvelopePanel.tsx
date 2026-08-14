import { PARAMETER_SPECS } from '../../state/parameters';
import { useSynth } from '../../state/useSynth';
import { ControlKnob } from '../ControlKnob';

/**
 * Live ADSR curve preview. The path is re-computed from the current
 * attack/decay/sustain/release values on every render (which only happens
 * when the parameters change), so it stays honest and in sync.
 */
function EnvelopeCurve({
  attack,
  decay,
  sustain,
  release,
}: {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}) {
  // Map time (seconds) to x and level (0..1) to y, clamped into the viewBox.
  const xOf = (t: number) => Math.min(190, 10 + t * 40);
  const yOf = (level: number) => 45 - level * 40;

  const xAttack = xOf(attack);
  const xDecay = xOf(attack + decay);
  const xSustainEnd = Math.max(xDecay + 10, xDecay);
  const xRelease = Math.min(190, xSustainEnd + release * 40);
  const ySustain = yOf(sustain);

  const d = [
    `M 10 45`,
    `L ${xAttack} ${yOf(1)}`,
    `L ${xDecay} ${ySustain}`,
    `L ${xSustainEnd} ${ySustain}`,
    `L ${xRelease} 45`,
  ].join(' ');

  return (
    <svg viewBox="0 0 200 50" className="w-full h-10" aria-hidden="true">
      <defs>
        <linearGradient id="envGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff0066" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff0066" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <line x1="0" y1="45" x2="200" y2="45" stroke="#1a1a2e" strokeWidth="0.5" />
      <line
        x1="0"
        y1="25"
        x2="200"
        y2="25"
        stroke="#1a1a2e"
        strokeWidth="0.5"
        strokeDasharray="2"
      />
      <path d={d} fill="url(#envGrad)" stroke="#ff0066" strokeWidth="1.5" />
    </svg>
  );
}

export function EnvelopePanel() {
  const { state, setParameter } = useSynth();

  return (
    <section
      className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-pink"
      aria-label="Envelope"
    >
      <header className="px-2 py-1 border-b border-[#1a1a2e]">
        <h2 className="text-[9px] text-[#ff0066] font-mono opacity-70">ENVELOPE // ADSR</h2>
      </header>
      <div className="p-2" style={{ background: 'rgba(10,10,15,0.6)' }}>
        <div className="mb-2">
          <EnvelopeCurve
            attack={state.attack}
            decay={state.decay}
            sustain={state.sustain}
            release={state.release}
          />
        </div>
        <div className="flex justify-around">
          <ControlKnob
            label={PARAMETER_SPECS.attack.label}
            value={state.attack}
            min={PARAMETER_SPECS.attack.min}
            max={PARAMETER_SPECS.attack.max}
            step={PARAMETER_SPECS.attack.step}
            unit={PARAMETER_SPECS.attack.unit}
            color={PARAMETER_SPECS.attack.color}
            defaultValue={0.05}
            onChange={(v) => setParameter('attack', v)}
          />
          <ControlKnob
            label={PARAMETER_SPECS.decay.label}
            value={state.decay}
            min={PARAMETER_SPECS.decay.min}
            max={PARAMETER_SPECS.decay.max}
            step={PARAMETER_SPECS.decay.step}
            unit={PARAMETER_SPECS.decay.unit}
            color={PARAMETER_SPECS.decay.color}
            defaultValue={0.2}
            onChange={(v) => setParameter('decay', v)}
          />
          <ControlKnob
            label={PARAMETER_SPECS.sustain.label}
            value={state.sustain}
            min={PARAMETER_SPECS.sustain.min}
            max={PARAMETER_SPECS.sustain.max}
            step={PARAMETER_SPECS.sustain.step}
            color={PARAMETER_SPECS.sustain.color}
            defaultValue={0.6}
            onChange={(v) => setParameter('sustain', v)}
          />
          <ControlKnob
            label={PARAMETER_SPECS.release.label}
            value={state.release}
            min={PARAMETER_SPECS.release.min}
            max={PARAMETER_SPECS.release.max}
            step={PARAMETER_SPECS.release.step}
            unit={PARAMETER_SPECS.release.unit}
            color={PARAMETER_SPECS.release.color}
            defaultValue={0.3}
            onChange={(v) => setParameter('release', v)}
          />
        </div>
      </div>
    </section>
  );
}
