# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-14

### Added

- Framework-agnostic `SynthEngine` class (Web Audio API) with a typed parameter API.
- Safe audio startup: explicit user gesture, context resume for autoplay policies,
  stuck-note prevention on tab blur/hide, and a 16-voice polyphony cap with
  oldest-note stealing.
- Soft limiter (compressor) before the output for gain staging.
- True-RMS level meter with peak hold.
- Device-pixel-ratio-aware, resize-responsive, tab-pause-aware canvas renderer
  shared by all four visualizers.
- Accessible, keyboard-operable knobs (`role="slider"`) and segmented type selectors.
- Factory preset bank (INIT, BASS, LEAD, PAD, NOISE, ALIEN) with typed presets.
- Unit and component test suite (Vitest + React Testing Library) and a Playwright
  smoke test.
- GitHub Actions workflows for CI and GitHub Pages deployment, plus Dependabot.
- Contributor documentation: CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md.
- MIT license, EditorConfig, Prettier, `.nvmrc`, and issue/PR templates.

### Changed

- Reorganised the codebase into `audio/`, `components/`, `state/`, `types/`,
  `constants/`, `hooks/`, and `utils/` modules.
- Replaced the fabricated terminal readouts (random "MEM DUMP", fake CPU/MEM
  metrics, scripted log stream) with an honest system readout and an event log
  driven by real engine events.
- Centralised parameter ranges, steps, and units into a single spec registry.
- Improved semantic HTML (landmarks, headings, labels) and page metadata.

### Fixed

- Removed the double dry-path gain error that doubled the dry signal when both
  delay and reverb were at zero.
- Fixed the distortion curve so zero drive is unity-gain (previously attenuated
  the signal by ~9.5 dB).
- Removed unsafe TypeScript assertions (`as never`, `as any`, `@ts-ignore`) and
  dead dependencies.

### Removed

- Unused dependencies: `tone`, `framer-motion`, `react-router-dom`, `lucide-react`.
- Vite template residue: default README, `vite.svg`, `react.svg`, empty
  `App.css`, and the injected `.vite-source-tags` plugin.
