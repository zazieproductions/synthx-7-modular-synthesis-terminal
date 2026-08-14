/**
 * Reusable rotary control.
 *
 * Fully keyboard-operable (arrow keys, page up/down, Home/End), exposes
 * `role="slider"` with numeric ARIA state for assistive tech, and supports
 * pointer drag plus double-click-to-reset.
 */
import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { clamp, roundToStep } from '../utils/math';
import { formatValue } from '../utils/format';

interface ControlKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  color: string;
  defaultValue?: number;
  onChange: (value: number) => void;
}

/** Normalise a value into a 0..100 percentage for the arc. */
function toPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

export function ControlKnob({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  color,
  defaultValue,
  onChange,
}: ControlKnobProps) {
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{ startY: number; startValue: number } | null>(null);

  const percent = toPercent(value, min, max);
  const angle = -135 + (percent / 100) * 270;
  const range = max - min;

  const commit = useCallback(
    (next: number) => {
      onChange(roundToStep(clamp(next, min, max), step, min, max));
    },
    [onChange, min, max, step],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragState.current = { startY: event.clientY, startValue: value };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (!state) return;
    const sensitivity = range / 150;
    commit(state.startValue + (state.startY - event.clientY) * sensitivity);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
    setDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const coarse = range / 10;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        event.preventDefault();
        commit(value + step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        event.preventDefault();
        commit(value - step);
        break;
      case 'PageUp':
        event.preventDefault();
        commit(value + coarse);
        break;
      case 'PageDown':
        event.preventDefault();
        commit(value - coarse);
        break;
      case 'Home':
        event.preventDefault();
        onChange(min);
        break;
      case 'End':
        event.preventDefault();
        onChange(max);
        break;
      default:
        break;
    }
  };

  const handleDoubleClick = () => {
    if (defaultValue !== undefined) onChange(clamp(defaultValue, min, max));
  };

  const display = formatValue(value, step);
  const valueText = `${display}${unit}`;

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      <span id={`${label.replace(/\s+/g, '-')}-label`} className="sr-only">
        {label}
      </span>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(4))}
        aria-valuetext={valueText}
        className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-grab ${
          dragging ? 'cursor-grabbing' : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        title={`${label}: ${valueText}`}
      >
        <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${percent} ${100 - percent}`}
            transform="rotate(-135 24 24)"
            opacity={0.85}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
          <line
            x1="24"
            y1="24"
            x2={24 + 14 * Math.sin((angle * Math.PI) / 180)}
            y2={24 - 14 * Math.cos((angle * Math.PI) / 180)}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="24" cy="24" r="3" fill={color} opacity={0.5} />
        </svg>
      </div>
      <div className="text-[8px] uppercase tracking-wider opacity-60 font-mono" style={{ color }}>
        {label}
      </div>
      <div className="text-[9px] font-mono tabular-nums" style={{ color }} aria-hidden="true">
        {display}
        {unit}
      </div>
    </div>
  );
}
