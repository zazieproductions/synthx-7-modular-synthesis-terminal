import { useRef } from 'react';
import { THEME } from '../../constants/theme';
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { useSynth } from '../../state/useSynth';

/** Oscilloscope readout of the post-master time-domain signal. */
export function WaveformDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { timeAnalyser } = useSynth();

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

    // Flat reference line when the engine is not running yet.
    if (!timeAnalyser) {
      context.strokeStyle = `${THEME.green}30`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, height / 2);
      context.lineTo(width, height / 2);
      context.stroke();
      return;
    }

    const bufferLength = timeAnalyser.fftSize;
    const data = new Float32Array(bufferLength);
    timeAnalyser.getFloatTimeDomainData(data);

    context.lineWidth = 1.5;
    context.strokeStyle = THEME.green;
    context.shadowColor = THEME.green;
    context.shadowBlur = 4;
    context.beginPath();

    const sliceWidth = width / bufferLength;
    for (let i = 0; i < bufferLength; i += 1) {
      const y = ((data[i] ?? 0) * 0.5 + 0.5) * height;
      if (i === 0) context.moveTo(0, y);
      else context.lineTo(i * sliceWidth, y);
    }
    context.stroke();
    context.shadowBlur = 0;

    // Center line.
    context.strokeStyle = `${THEME.green}20`;
    context.lineWidth = 0.5;
    context.beginPath();
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    context.stroke();
  });

  return (
    <div className="relative border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow">
      <span className="absolute top-1 left-2 z-10 text-[9px] text-[#00ff41] font-mono opacity-70 pointer-events-none">
        WAVEFORM // SCOPE-CH1
      </span>
      <canvas ref={canvasRef} className="w-full h-24 sm:h-28 block" aria-label="Waveform scope" />
    </div>
  );
}
