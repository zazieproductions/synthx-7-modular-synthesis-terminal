import { useState, useCallback } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color?: string;
  onChange: (v: number) => void;
}

export function ControlKnob({ label, value, min, max, step = 0.01, unit = '', color = '#00ff41', onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const percent = ((value - min) / (max - min)) * 100;
  const angle = (percent / 100) * 270 - 135;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [value]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = startY - e.clientY;
    const range = max - min;
    const sensitivity = range / 100;
    let newValue = startValue + delta * sensitivity;
    newValue = Math.max(min, Math.min(max, newValue));
    newValue = Math.round(newValue / step) * step;
    onChange(newValue);
  }, [isDragging, startY, startValue, min, max, step, onChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const displayValue = step >= 1 ? Math.round(value) : value.toFixed(2);

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      <div className="text-[8px] uppercase tracking-wider opacity-60" style={{ color }}>
        {label}
      </div>
      <div
        className="relative w-10 h-10 sm:w-12 sm:h-12 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Outer ring */}
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* Background arc */}
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeDasharray={`${270 * Math.PI * 20 / 360} ${90 * Math.PI * 20 / 360}`}
            strokeDashoffset={0}
            transform="rotate(135 24 24)"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${percent * Math.PI * 20 / 100} ${(270 - percent * 270 / 100) * Math.PI * 20 / 360 + 90 * Math.PI * 20 / 360}`}
            strokeDashoffset={0}
            transform="rotate(135 24 24)"
            strokeLinecap="round"
            opacity={0.8}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
          {/* Indicator line */}
          <line
            x1="24" y1="24"
            x2={24 + 14 * Math.sin((angle * Math.PI) / 180)}
            y2={24 - 14 * Math.cos((angle * Math.PI) / 180)}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle cx="24" cy="24" r="3" fill={color} opacity={0.5} />
        </svg>
      </div>
      <div className="text-[9px] font-mono" style={{ color }}>
        {displayValue}{unit}
      </div>
    </div>
  );
}
