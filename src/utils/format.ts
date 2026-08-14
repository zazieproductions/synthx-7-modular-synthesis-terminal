/** Formatting helpers for the terminal-style readouts. */

/** Format a number for a control readout, trimming trailing zeros. */
export function formatValue(value: number, step: number): string {
  const decimals = step >= 1 ? 0 : Math.max(0, Math.min(3, -Math.floor(Math.log10(step))));
  return value.toFixed(decimals);
}

/** Format a frequency in Hz: whole Hz below 1 kHz, one decimal above. */
export function formatFrequencyHz(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(2)}kHz` : `${Math.round(value)}Hz`;
}

/** Format a duration in seconds with an "s" suffix. */
export function formatSeconds(value: number): string {
  return `${value.toFixed(2)}s`;
}

/** Format a clock timestamp as HH:MM:SS.mmm. */
export function formatTimestamp(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}
