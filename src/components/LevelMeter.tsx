import { useEffect, useRef } from 'react';

interface Props {
  analyserRef: React.RefObject<AnalyserNode | null>;
}

export function LevelMeter({ analyserRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const peakRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      const width = canvas.width;
      const height = canvas.height;

      let level = 0;
      if (analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        level = sum / dataArray.length / 255;
      }

      // Peak hold
      if (level > peakRef.current) {
        peakRef.current = level;
      } else {
        peakRef.current = Math.max(0, peakRef.current - 0.005);
      }

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Draw meter bars
      const barCount = 20;
      const barHeight = (height - 4) / barCount;
      const activeBars = Math.floor(level * barCount);
      const peakBar = Math.floor(peakRef.current * barCount);

      for (let i = 0; i < barCount; i++) {
        const y = height - 2 - (i + 1) * barHeight;
        const fromBottom = i / barCount;

        if (i < activeBars) {
          if (fromBottom > 0.85) {
            ctx.fillStyle = '#ff0066';
          } else if (fromBottom > 0.65) {
            ctx.fillStyle = '#ffaa00';
          } else {
            ctx.fillStyle = '#00ff41';
          }
        } else if (i === peakBar) {
          ctx.fillStyle = fromBottom > 0.85 ? '#ff0066' : fromBottom > 0.65 ? '#ffaa00' : '#00ff41';
        } else {
          ctx.fillStyle = '#1a1a2e';
        }

        ctx.fillRect(2, y, width - 4, barHeight - 1);
      }
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyserRef]);

  return (
    <div className="relative border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-pink" style={{ width: '32px' }}>
      <div className="absolute top-1 left-0 right-0 z-10 text-[6px] text-[#ff0066] font-mono opacity-70 text-center">
        LVL
      </div>
      <canvas
        ref={canvasRef}
        width={28}
        height={128}
        className="w-full h-24 sm:h-28"
      />
    </div>
  );
}
