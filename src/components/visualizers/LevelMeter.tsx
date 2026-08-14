import { useRef } from 'react';
import { THEME } from '../../constants/theme';
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { useSynth } from '../../state/useSynth';

const BAR_COUNT = 20;
const PEAK_DECAY = 0.008;

/**
 * True-RMS level meter with peak-hold. Reads the time-domain analyser so the
 * meter faithfully reflects the final output (post master volume).
 */
export function LevelMeter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peakRef = useRef(0);
  const { timeAnalyser } = useSynth();

  useCanvasRenderer(canvasRef, (context, width, height) => {
    let level = 0;

    if (timeAnalyser) {
      const bufferLength = timeAnalyser.fftSize;
      const data = new Float32Array(bufferLength);
      timeAnalyser.getFloatTimeDomainData(data);

      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i += 1) {
        const sample = data[i] ?? 0;
        sumSquares += sample * sample;
      }
      level = Math.sqrt(sumSquares / bufferLength);
    }

    // Peak hold with decay.
    const peak = peakRef.current;
    peakRef.current = level > peak ? level : Math.max(0, peak - PEAK_DECAY);

    context.fillStyle = THEME.bg;
    context.fillRect(0, 0, width, height);

    const barHeight = (height - 4) / BAR_COUNT;
    const activeBars = Math.floor(level * BAR_COUNT);
    const peakBar = Math.floor(peakRef.current * BAR_COUNT);

    for (let i = 0; i < BAR_COUNT; i += 1) {
      const fromBottom = i / BAR_COUNT;
      const y = height - 2 - (i + 1) * barHeight;

      if (i < activeBars) {
        context.fillStyle = meterColor(fromBottom);
      } else if (i === peakBar) {
        context.fillStyle = meterColor(fromBottom);
      } else {
        context.fillStyle = THEME.border;
      }
      context.fillRect(2, y, width - 4, barHeight - 1);
    }
  });

  return (
    <div
      className="relative border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-pink"
      style={{ width: '34px' }}
    >
      <span className="absolute top-1 left-0 right-0 z-10 text-[6px] text-[#ff0066] font-mono opacity-70 text-center pointer-events-none">
        LVL
      </span>
      <canvas ref={canvasRef} className="w-full h-24 sm:h-28 block" aria-label="Output level" />
    </div>
  );
}

function meterColor(fromBottom: number): string {
  if (fromBottom > 0.85) return THEME.pink;
  if (fromBottom > 0.65) return THEME.amber;
  return THEME.green;
}
