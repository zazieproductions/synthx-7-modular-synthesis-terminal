# AGON // Signal Engine

> A cybernetic browser synthesizer and audiovisual signal laboratory built with **React**, **TypeScript**, **Canvas**, and the **Web Audio API**. Live demo available.

[![AGON // Signal Engine interface](docs/images/agon-signal-engine-preview.png)](https://zazieproductions.github.io/synthx-7-modular-synthesis-terminal/)

[![Launch AGON // Signal Engine](https://img.shields.io/badge/▶_Launch-AGON_%2F%2F_Signal_Engine-00ff41?style=for-the-badge&logo=github&logoColor=white&labelColor=0a0a0f&color=00ff41)](https://zazieproductions.github.io/synthx-7-modular-synthesis-terminal/)

[![React 19](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white&labelColor=0a0a0f)](https://react.dev)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white&labelColor=0a0a0f)](https://www.typescriptlang.org)
[![Canvas API](https://img.shields.io/badge/Canvas-API-00e5ff?style=flat-square&labelColor=0a0a0f)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-API-ff0066?style=flat-square&labelColor=0a0a0f)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white&labelColor=0a0a0f)](https://vite.dev)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=0a0a0f)](https://tailwindcss.com)
[![CI](https://github.com/zazieproductions/synthx-7-modular-synthesis-terminal/actions/workflows/ci.yml/badge.svg)](https://github.com/zazieproductions/synthx-7-modular-synthesis-terminal/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-00ff41?style=flat-square&labelColor=0a0a0f)](LICENSE)

> ⚠️ **VOLUME WARNING** — this instrument is not polite. It can get **loud**. Turn your speakers down before you hit the launch button; the soft limiter will not save your ears from your own curiosity.

AGON // Signal Engine is the current form of the SYNTHX-7 modular synthesis terminal: a playful, terminal-styled impersonation of a hardware modular synth. Two oscillators feed a resonant filter and an ADSR envelope, then pass through delay, reverb, distortion, and an LFO before hitting a soft limiter. Everything runs in real time with zero backend — just a static site and your browser's audio engine.

---

## Live Demo

AGON // Signal Engine is a **browser-based audiovisual synthesizer** built with **React, TypeScript, Canvas, and the Web Audio API**. No install, no backend, no samples to download — open it, press the **INITIALIZE AUDIO ENGINE** button, and the machine wakes up and starts drawing its own signal.

Because browsers enforce autoplay policies, **audio begins only after you interact with the page**. That first click is the required user gesture that unlocks the Web Audio engine — nothing plays until you touch it.

▶ **Run it now: [Launch AGON // Signal Engine](https://zazieproductions.github.io/synthx-7-modular-synthesis-terminal/)**

The deployed site is rebuilt automatically from `main` by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) and served from GitHub Pages at:

`https://zazieproductions.github.io/synthx-7-modular-synthesis-terminal/`

---

## Features

- **Dual oscillators** — sine, square, sawtooth, and triangle, each with independent gain and ±50-cent detune.
- **Resonant filter** — lowpass, highpass, bandpass, and notch with cutoff, resonance (Q), and gain.
- **ADSR envelope** — with a live curve preview.
- **FX chain** — feedback delay, convolution reverb, and soft-clipping distortion.
- **LFO** — routes to the filter cutoff with selectable waveform, rate, and depth.
- **Polyphonic voice engine** — up to 16 voices with oldest-note stealing.
- **Four visualizers** — oscilloscope, 64-band spectrum, waterfall spectrogram, and a true-RMS level meter with peak hold.
- **Factory preset bank** — INIT, BASS, LEAD, PAD, NOISE, ALIEN.
- **Computer-keyboard + touch input** — playable without a MIDI controller.
- **Safe audio startup** — explicit user gesture, autoplay-policy resume, stuck-note prevention on tab blur, and a soft limiter for gain staging.
- **Accessible controls** — knobs are real `role="slider"` elements with full keyboard support.

## Stack

| Concern  | Technology                                            |
| -------- | ----------------------------------------------------- |
| UI       | React 19, Tailwind CSS 4                              |
| Language | TypeScript 5 (strict)                                 |
| Build    | Vite 7                                                |
| Audio    | Web Audio API (no runtime audio dependency)           |
| Canvas   | Oscilloscope, spectrum, spectrogram, level meter      |
| Testing  | Vitest, React Testing Library, Playwright             |
| Linting  | ESLint 9 (type-aware), Prettier, EditorConfig         |
| CI/CD    | GitHub Actions (quality checks + GitHub Pages deploy) |

> **Note on Tone.js** — the initial release listed Tone.js as a dependency but never imported it; the synth runs on the native Web Audio API. Rather than wrap a fixed-architecture synth in a large third-party framework, the engine was hardened directly on Web Audio and the dead dependency was removed.

## Controls

### Keyboard mapping

Press the **INITIALIZE AUDIO ENGINE** button once, then play:

| Notes (white keys) | Computer key |     | Notes (black keys) | Computer key |
| ------------------ | ------------ | --- | ------------------ | ------------ |
| C4                 | `A`          |     | C#4                | `2`          |
| D4                 | `S`          |     | D#4                | `3`          |
| E4                 | `D`          |     | F#4                | `5`          |
| F4                 | `F`          |     | G#4                | `6`          |
| G4                 | `G`          |     | A#4                | `7`          |
| A4                 | `H`          |     | C#5                | `9`          |
| B4                 | `J`          |     | D#5                | `0`          |
| C5                 | `K`          |     | F#5                | `=`          |
| D5                 | `L`          |     |                    |              |
| E5                 | `;`          |     |                    |              |

On touch screens a two-row pad appears in place of the keybed.

### Knobs

Every knob is keyboard-operable:

- `↑` / `↓` / `←` / `→` — fine adjust
- `Page Up` / `Page Down` — coarse adjust
- `Home` / `End` — jump to minimum / maximum
- Double-click — reset to the parameter default

## Architecture

The codebase is organised so the audio engine, React state, and UI never leak into each other:

```
┌─────────────────────────── React layer ───────────────────────────┐
│  components/            state/                 hooks/             │
│  panels · visualizers   SynthProvider           useCanvasRenderer │
│  keyboard · controls    (engine → context)                        │
└───────────────────────────────┬───────────────────────────────────┘
                                │ typed API
┌───────────────────────────────▼───────────────────────────────────┐
│  audio/SynthEngine  ·  dsp  ·  notes  ·  constants                │
│  (framework-agnostic, unit-tested in isolation)                   │
└───────────────────────────────────────────────────────────────────┘
```

### Signal chain

```
OSC1 ─► gain ─┐
               ├─► envelope ─► filter ─► distortion ─► dry ──────────┐
OSC2 ─► gain ─┘                             ├─► delay ─► wet ─► mix bus
                                            └─► reverb ─► wet ─┘
mix bus ─► master ─► spectrum analyser ─► limiter ─► scope analyser ─► out
                                                        ▲
                                             LFO ─► filter cutoff
```

A single dry path with per-effect wet sends avoids the double-dry-path gain error present in the original implementation, and a soft limiter before the destination guards against clipping at high drive settings.

### Project structure

```
src/
├── audio/            # Engine, DSP helpers, note/frequency math
│   ├── SynthEngine.ts
│   ├── dsp.ts
│   └── notes.ts
├── components/
│   ├── panels/       # Oscillator, Filter, Envelope, Effects
│   ├── visualizers/  # Waveform, Spectrum, Spectrogram, LevelMeter
│   ├── keyboard/     # Computer-keyboard + touch keybed
│   ├── ControlKnob.tsx
│   └── ...           # StatusBar, PatchSelector, TerminalLog, etc.
├── constants/        # Theme tokens, version, live-demo URL
├── hooks/            # Shared canvas renderer
├── state/            # Provider, defaults, parameter specs, presets
├── types/            # Shared domain models
└── utils/            # Pure formatting & math helpers
```

## Getting started

Requires **Node.js ≥ 20**.

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build
npm run preview    # serve the production build locally
```

### Scripts

| Script                 | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the Vite dev server with HMR             |
| `npm run build`        | Type-check (`tsc -b`) and build for production |
| `npm run preview`      | Preview the production build                   |
| `npm run lint`         | ESLint (type-aware)                            |
| `npm run format`       | Prettier write                                 |
| `npm run format:check` | Prettier check (CI)                            |
| `npm run typecheck`    | TypeScript project references                  |
| `npm run test`         | Vitest unit/component tests                    |
| `npm run test:watch`   | Vitest in watch mode                           |
| `npm run e2e`          | Playwright smoke test (builds + serves)        |
| `npm run check`        | format + lint + typecheck + test + build       |

## Testing

Unit and component tests run under Vitest with jsdom:

```bash
npm run test
```

The Playwright smoke test boots the production bundle in headless Chromium, starts the audio engine, and asserts the interface is interactive:

```bash
npx playwright install chromium   # one-time browser download
npm run e2e
```

The README screenshot and the social-preview artwork are generated from the running app (never mocked):

```bash
npm run build && node scripts/capture-screenshots.mjs
```

This writes `docs/images/agon-signal-engine-preview.png` (1920×1080, full interface with live signal), `docs/images/agon-social-preview.png` (1280×640 social-preview artwork), and `public/og-image.png`.

In restricted-network environments where the Playwright CDN is unreachable,
`scripts/ensure-chromium.mjs` extracts an npm-packaged Chromium build and
prints a path you can pass via `PLAYWRIGHT_EXECUTABLE_PATH`.

## Deployment

The site is a fully static bundle and deploys to **GitHub Pages** via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`. Vite uses a
relative `base` (`./`) so the same build works from the repository root, any
sub-path preview, or the Pages project site
(`https://zazieproductions.github.io/synthx-7-modular-synthesis-terminal/`).

> **One-time setup** — before the live-demo link resolves, GitHub Pages has to
> be enabled on the repository and the two workflow files added
> (`.github/workflows/deploy.yml` and `.github/workflows/ci.yml`):
>
> 1. Add the workflows from this repository's `.github/workflows/` directory.
> 2. Open **Settings → Pages** on the repository.
> 3. Under **Build and deployment → Source**, select **GitHub Actions**.
>
> After that, every push to `main` publishes the live demo automatically.

To deploy anywhere else, drop the contents of `dist/` on any static file host.

### Social preview

The repository's social-preview artwork (`docs/images/agon-social-preview.png`, 1280×640) ships in this repo, but GitHub does not read it automatically from the repository tree. It must be uploaded **once, manually**, through:

`Repository Settings → General → Social preview`

and set to `docs/images/agon-social-preview.png`. (The deployed site's Open Graph image, `public/og-image.png`, is the same artwork and is picked up automatically by the build.)

## Browser limitations

- **Web Audio API required.** All evergreen browsers support it; very old browsers do not.
- **Autoplay policy.** Audio starts only after a user gesture (the INITIALIZE button), which is the standard, user-friendly workaround.
- **Performance.** The visualizers pause when the tab is hidden; on low-end hardware reduce the number of held notes.

## Roadmap

- [ ] Web MIDI input
- [ ] Patch save / load / import / export (JSON)
- [ ] Stereo detune (voice spread) and per-voice pan
- [ ] WAV recording of the master output
- [ ] More filter and effect models (comb, chorus, bitcrusher)
- [ ] LocalStorage persistence of the last patch

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.
Security issues should be reported as described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © AGON // Signal Engine contributors (SYNTHX-7)
