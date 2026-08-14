import { useRef } from 'react';
import { THEME } from '../../constants/theme';
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { useSynth } from '../../state/useSynth';

const BAR_COUNT = 64;

/** Logarithmically-binned frequency spectrum analyser. */
export function FrequencySpectrum() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { analyser } = useSynth();

  useCanvasRenderer(canvasRef, (context, width, height) => {
    context.fillStyle = THEME.bg;
    context.fillRect(0, 0, width, height);

    // Horizontal grid.
    context.strokeStyle = THEME.border;
    context.lineWidth = 0.5;
    for (let y = 0; y <= height; y += height / 4) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    // Frequency labels along the bottom edge.
    context.fillStyle = THEME.border;
    context.font = '8px monospace';
    const labels = ['100', '500', '1k', '5k', '10k', '20k'];
    labels.forEach((label, i) => {
      context.fillText(label, 2 + (i / labels.length) * width, height - 2);
    });

    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(data);

    const barWidth = width / BAR_COUNT;
    const usableBins = Math.floor(bufferLength * 0.5);

    for (let i = 0; i < BAR_COUNT; i += 1) {
      // Logarithmic index mapping so low frequencies aren't crammed together.
      const ratio = i / BAR_COUNT;
      const index = Math.min(usableBins - 1, Math.floor(ratio * ratio * usableBins));
      const value = data[index] ?? 0;
      const normalised = value / 255;
      const barHeight = normalised * height;
      const x = i * barWidth;
      const y = height - barHeight;

      const hue = 120 - ratio * 120;
      context.fillStyle = `hsl(${hue}, 100%, ${40 + normalised * 30}%)`;
      context.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    }
  });

  return (
    <div className="relative border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-amber">
      <span className="absolute top-1 left-2 z-10 text-[9px] text-[#ffaa00] font-mono opacity-70 pointer-events-none">
        SPECTRUM // 64-BAND
      </span>
      <canvas
        ref={canvasRef}
        className="w-full h-20 sm:h-24 block"
        aria-label="Frequency spectrum"
      />
    </div>
  );
}
