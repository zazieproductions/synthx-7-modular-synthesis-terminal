/**
 * SYNTHX-7 visual identity tokens.
 *
 * Canvas renderers cannot consume Tailwind utility classes, so the neon
 * palette and other visual constants are centralised here and shared by the
 * visualizers and the SVG controls.
 */
export const THEME = {
  bg: '#0a0a0f',
  panel: '#0d0d14',
  border: '#1a1a2e',
  dim: '#6b7280',
  green: '#00ff41',
  cyan: '#00e5ff',
  pink: '#ff0066',
  amber: '#ffaa00',
  purple: '#a855f7',
  teal: '#22d3ee',
} as const;

export type ThemeColor = (typeof THEME)[keyof typeof THEME];

/** Human-readable application version. Keep in sync with package.json. */
export const APP_VERSION = '1.0.0';

/** Canonical live-demo URL (GitHub Pages project site). */
export const LIVE_DEMO_URL =
  'https://zazieproductions.github.io/synthx-7-modular-synthesis-terminal/';
