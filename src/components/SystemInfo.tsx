import { MAX_POLYPHONY } from '../audio/SynthEngine';
import { useSynth } from '../state/useSynth';
import { formatFrequencyHz } from '../utils/format';

/**
 * Honest, read-only system readout. Everything here is derived from the
 * running engine — sample rate, status, voice count, and current patch.
 */
export function SystemInfo() {
  const { state, isAudioReady, sampleRate, activeVoiceCount } = useSynth();

  return (
    <section
      className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-amber"
      aria-label="System info"
    >
      <header className="px-2 py-1 border-b border-[#1a1a2e]">
        <h2 className="text-[9px] text-[#ffaa00] font-mono opacity-70">SYSTEM // PATCH READOUT</h2>
      </header>
      <div
        className="p-2 font-mono text-[9px] space-y-1.5"
        style={{ background: 'rgba(10,10,15,0.6)' }}
      >
        <div className="flex justify-between text-[#6b7280]">
          <span>STATUS</span>
          <span className={isAudioReady ? 'text-[#00ff41]' : 'text-[#ffaa00]'}>
            {isAudioReady ? '● ONLINE' : '○ STANDBY'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[#6b7280]">SAMPLE RATE</div>
            <div className="text-[#00ff41]">{sampleRate ? `${sampleRate} Hz` : '—'}</div>
          </div>
          <div>
            <div className="text-[#6b7280]">VOICES</div>
            <div className="text-[#00e5ff]">
              {activeVoiceCount} / {MAX_POLYPHONY}
            </div>
          </div>
        </div>

        <div className="pt-1 border-t border-[#1a1a2e]">
          <div className="text-[#00ff41]">OSCILLATORS</div>
          <div className="text-[#6b7280]">
            OSC1 {state.osc1Type.toUpperCase()} · gain {state.osc1Gain.toFixed(2)} ·{' '}
            {state.osc1Detune >= 0 ? '+' : ''}
            {state.osc1Detune}ct
          </div>
          <div className="text-[#6b7280]">
            OSC2 {state.osc2Type.toUpperCase()} · gain {state.osc2Gain.toFixed(2)} ·{' '}
            {state.osc2Detune >= 0 ? '+' : ''}
            {state.osc2Detune}ct
          </div>
        </div>

        <div className="text-[#ffaa00]">
          FILTER <span className="text-[#6b7280]">{state.filterType.toUpperCase()}</span>
          <span className="text-[#6b7280]">
            {' '}
            · {formatFrequencyHz(state.filterFreq)} · Q {state.filterQ.toFixed(2)}
          </span>
        </div>

        <div className="text-[#a855f7]">
          FX{' '}
          <span className="text-[#6b7280]">
            delay {state.delayTime.toFixed(2)}s · reverb {state.reverbMix.toFixed(2)} · drive{' '}
            {state.distortion.toFixed(2)}
          </span>
        </div>

        <div className="text-[#22d3ee]">
          LFO{' '}
          <span className="text-[#6b7280]">
            {state.lfoType} @ {state.lfoRate.toFixed(1)} Hz · depth {state.lfoDepth.toFixed(0)}
          </span>
        </div>
      </div>
    </section>
  );
}
