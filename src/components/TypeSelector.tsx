/**
 * Accessible segmented control for discrete choices (waveforms, filter types).
 * Uses `aria-pressed` semantics and keeps the neon styling consistent.
 */
interface TypeSelectorProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  color: string;
  /** Short display label per option (defaults to the upper-cased value). */
  label?: (option: T) => string;
  'aria-label'?: string;
}

export function TypeSelector<T extends string>({
  options,
  value,
  onChange,
  color,
  label,
  'aria-label': ariaLabel,
}: TypeSelectorProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex gap-0.5">
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={`px-1.5 py-0.5 text-[7px] font-mono rounded-sm border transition-colors ${
              selected ? 'font-bold' : 'border-[#1a1a2e] text-[#6b7280] hover:text-[#9ca3af]'
            }`}
            style={
              selected
                ? { backgroundColor: color, color: '#0a0a0f', borderColor: color }
                : undefined
            }
          >
            {label ? label(option) : option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
