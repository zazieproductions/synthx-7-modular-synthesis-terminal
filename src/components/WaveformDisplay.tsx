import { useEffect, useRef } from 'react';

interface Props {
  analyserRef: React.RefObject<AnalyserNode | null>;
}

export function WaveformDisplay({ analyserRef }: Props) {
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
        // Draw flat line
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#00ff4130';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        return;
      }

      const width = canvas.width;
      const height = canvas.height;

      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);
      analyser.getFloatTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < height; y += height / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Waveform
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#00ff41';
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 4;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i];
        const y = (v * 0.5 + 0.5) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      // Center line
      ctx.strokeStyle = '#00ff4120';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyserRef]);

  return (
    <div className="relative border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow">
      <div className="absolute top-1 left-2 z-10 text-[9px] text-[#00ff41] font-mono opacity-70">
        WAVEFORM // SCOPE-CH1
      </div>
      <canvas
        ref={canvasRef}
        width={512}
        height={128}
        className="w-full h-24 sm:h-28"
      />
    </div>
  );
}
