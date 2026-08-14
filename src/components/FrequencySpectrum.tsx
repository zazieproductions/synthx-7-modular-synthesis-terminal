import { useEffect, useRef } from 'react';

interface Props {
  analyserRef: React.RefObject<AnalyserNode | null>;
}

export function FrequencySpectrum({ analyserRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      if (!analyser) {
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < height; y += height / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Frequency labels
      ctx.fillStyle = '#1a1a2e';
      ctx.font = '8px JetBrains Mono';
      const freqLabels = ['100', '500', '1k', '5k', '10k', '20k'];
      freqLabels.forEach((label, i) => {
        const x = (i / freqLabels.length) * width;
        ctx.fillText(label, x + 2, height - 2);
      });

      // Bars
      const barCount = 64;
      const barWidth = width / barCount - 1;

      for (let i = 0; i < barCount; i++) {
        const index = Math.floor((i / barCount) * bufferLength * 0.5);
        const value = dataArray[index] / 255;
        const barHeight = value * height;

        const x = i * (barWidth + 1);
        const y = height - barHeight;

        // Gradient color based on frequency
        const hue = 120 - (i / barCount) * 120;
        ctx.fillStyle = `hsl(${hue}, 100%, ${40 + value * 30}%)`;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Top cap
        ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
        ctx.fillRect(x, y, barWidth, 1);
      }
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyserRef]);

  return (
    <div className="relative border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-amber">
      <div className="absolute top-1 left-2 z-10 text-[9px] text-[#ffaa00] font-mono opacity-70">
        SPECTRUM // 64-BAND
      </div>
      <canvas
        ref={canvasRef}
        width={512}
        height={96}
        className="w-full h-20 sm:h-24"
      />
    </div>
  );
}
