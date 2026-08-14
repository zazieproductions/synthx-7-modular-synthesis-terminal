import { useRef } from 'react';
import { THEME } from '../../constants/theme';
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { useSynth } from '../../state/useSynth';

/**
 * Waterfall spectrogram. Each frame a new row is drawn at the top and the
 * previous frame is shifted down using `drawImage` (a GPU copy), which is far
 * cheaper than round-tripping pixel data through `getImageData`.
 */
export function SpectrogramDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { analyser } = useSynth();

  useCanvasRenderer(canvasRef, (context, width, height) => {
    // Scroll the existing image down one row.
    context.drawImage(context.canvas, 0, 0, width, height - 1, 0, 1, width, height - 1);

    if (!analyser) {
      // Keep a blank top row until audio is available.
      context.fillStyle = THEME.bg;
      context.fillRect(0, 0, width, 1);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(data);
    const usableBins = Math.floor(bufferLength * 0.75);

    for (let x = 0; x < width; x += 1) {
      const ratio = x / width;
      const index = Math.min(usableBins - 1, Math.floor(ratio * ratio * usableBins));
      const percent = (data[index] ?? 0) / 255;
      context.fillStyle = heatColor(percent);
      context.fillRect(x, 0, 1, 1);
    }
  });

  return (
    <div className="relative border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-cyan">
      <span className="absolute top-1 left-2 z-10 text-[9px] text-[#00e5ff] font-mono opacity-70 pointer-events-none">
        SPECTROGRAM // FFT-2048
      </span>
      <canvas
        ref={canvasRef}
        className="w-full h-32 sm:h-40 block"
        style={{ imageRendering: 'pixelated' }}
        aria-label="Spectrogram waterfall"
      />
    </div>
  );
}

/** Map a 0..1 magnitude to an RGB string along a green→cyan→pink ramp. */
function heatColor(percent: number): string {
  const t = Math.min(1, Math.max(0, percent));
  if (t < 0.5) {
    const g = Math.floor((t / 0.5) * 255);
    return `rgb(0, ${g}, ${Math.floor(t * 2 * 120)})`;
  }
  const u = (t - 0.5) / 0.5;
  return `rgb(${Math.floor(u * 255)}, 255, ${Math.floor(120 + u * 135)})`;
}
