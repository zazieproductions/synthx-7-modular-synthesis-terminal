import { APP_VERSION } from '../constants/theme';
import { useSynth } from '../state/useSynth';

/**
 * Landing screen shown before the audio engine is started. The explicit
 * button doubles as the required user gesture for the Web Audio autoplay
 * policy.
 */
export function BootScreen() {
  const { initAudio, status, errorMessage } = useSynth();
  const initializing = status === 'initializing';

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: '#0a0a0f' }}
    >
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1
            className="text-4xl sm:text-5xl font-mono font-bold text-[#00ff41] animate-flicker"
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              textShadow: '0 0 20px #00ff4140, 0 0 40px #00ff4120',
            }}
          >
            SYNTHX-7
          </h1>
          <p className="text-[#00e5ff] font-mono text-sm tracking-[0.3em]">
            MODULAR SYNTHESIS TERMINAL
          </p>
          <p className="text-[#6b7280] font-mono text-xs">
            v{APP_VERSION} // DUAL OSC // VCF // ADSR // FX CHAIN
          </p>
        </div>

        <pre
          className="text-[#00ff41] text-[8px] sm:text-[10px] leading-tight opacity-60 font-mono"
          aria-hidden="true"
        >
          {`    ┌──────────────────────────┐
    │  ╔═══╗  ╔═══╗  ╔═══╗   │
    │  ║OSC1║  ║VCF║  ║ENV║   │
    │  ╚═╤═╝  ╚═╤═╝  ╚═╤═╝   │
    │    │       │       │     │
    │  ╔═╧═╗  ╔═╧═╗  ╔═╧═╗   │
    │  ║OSC2║──║FX ║──║OUT║   │
    │  ╚═══╝  ╚═══╝  ╚═══╝   │
    └──────────────────────────┘`}
        </pre>

        <button
          type="button"
          onClick={() => void initAudio()}
          disabled={initializing}
          className="px-8 py-3 border-2 border-[#00ff41] text-[#00ff41] font-mono text-sm rounded-sm transition-all hover:bg-[#00ff41] hover:text-[#0a0a0f] hover:shadow-[0_0_30px_#00ff4140] active:scale-95 disabled:opacity-50"
          style={{ fontFamily: 'Share Tech Mono, monospace' }}
        >
          {initializing ? '> INITIALIZING… <' : '> INITIALIZE AUDIO ENGINE <'}
        </button>

        {errorMessage && (
          <p
            role="alert"
            className="text-[#ff0066] font-mono text-xs border border-[#ff006640] rounded-sm p-2"
          >
            ERROR: {errorMessage}
          </p>
        )}

        <div className="text-[#1a1a2e] font-mono text-[10px] space-y-0.5">
          <p>Web Audio API // Stereo</p>
          <p>Computer keyboard + touch compatible</p>
          <p className="text-[#3a3a4e]">Audio starts on your click (browser autoplay policy)</p>
        </div>
      </div>
    </main>
  );
}
