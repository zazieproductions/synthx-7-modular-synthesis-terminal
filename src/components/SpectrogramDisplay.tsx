import { useEffect, useRef } from 'react';

interface Props {
  analyserRef: React.RefObject<AnalyserNode | null>;
}

export function SpectrogramDisplay({ analyserRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      if (!analyser) return;

      const width = canvas.width;
      const height = canvas.height;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Shift existing image down
      const imageData = ctx.getImageData(0, 0, width, height - 1);
      ctx.putImageData(imageData, 0, 1);

      // Draw new line at top
      for (let i = 0; i < width; i++) {
        const index = Math.floor((i / width) * bufferLength);
        const value = dataArray[index];
        const percent = value / 255;

        let r = 0, g = 0, b = 0;
        if (percent < 0.25) {
          r = 0;
          g = Math.floor(percent * 4 * 255);
          b = Math.floor(percent * 4 * 100);
        } else if (percent < 0.5) {
          r = 0;
          g = 255;
          b = Math.floor((percent - 0.25) * 4 * 255);
        } else if (percent < 0.75) {
          r = Math.floor((percent - 0.5) * 4 * 255);
          g = 255 - Math.floor((percent - 0.5) * 4 * 128);
          b = 255;
        } else {
          r = 255;
          g = Math.floor(127 - (percent - 0.75) * 4 * 127);
          b = 255 - Math.floor((percent - 0.75) * 4 * 255);
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(i, 0, 1, 1);
      }
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyserRef]);

  return (
    <div className="relative border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-cyan">
      <div className="absolute top-1 left-2 z-10 text-[9px] text-[#00e5ff] font-mono opacity-70">
        SPECTROGRAM // FFT-2048
      </div>
      <canvas
        ref={canvasRef}
        width={512}
        height={128}
        className="w-full h-32 sm:h-40"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
