/**
 * Social-preview artwork (1280×640) template.
 *
 * Built from the app's own self-hosted fonts and neon palette so the text is
 * crisp and exact — not AI-generated bitmap lettering.
 */
import { readdirSync } from 'node:fs';

export function fontFaceRules() {
  const assets = readdirSync('dist/assets');
  const faces = [];
  for (const family of ['share-tech-mono', 'jetbrains-mono']) {
    for (const weight of [300, 400, 500, 700]) {
      const file = assets.find(
        (name) =>
          name.startsWith(`${family}-latin-${weight}-normal-`) &&
          (name.endsWith('.woff2') || name.endsWith('.woff')),
      );
      if (file) {
        faces.push(
          `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};` +
            `font-display:swap;src:url('./assets/${file}') format('${file.endsWith('.woff2') ? 'woff2' : 'woff'}');}`,
        );
      }
    }
  }
  if (faces.length === 0) throw new Error('Could not locate self-hosted fonts in dist/assets');
  return faces.join('\n');
}

/**
 * Social-preview artwork (1280×640). Built from the same fonts, palette and
 * terminal idiom as the app itself — no AI-generated lettering.
 */
export function socialPreviewHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  ${fontFaceRules()}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1280px; height: 640px; overflow: hidden; background: #0a0a0f; }
  body {
    font-family: 'JetBrains Mono', monospace;
    color: #00ff41;
    position: relative;
  }
  .frame {
    position: absolute; inset: 0;
    border: 1px solid #1a1a2e;
    display: flex; flex-direction: column;
  }
  /* corner brackets */
  .frame::before, .frame::after {
    content: ''; position: absolute; width: 22px; height: 22px; pointer-events: none;
  }
  .frame::before { top: 10px; left: 10px; border-top: 2px solid #00ff41; border-left: 2px solid #00ff41; }
  .frame::after { bottom: 10px; right: 10px; border-bottom: 2px solid #00ff41; border-right: 2px solid #00ff41; }

  /* scanlines + vignette */
  .scanlines {
    position: absolute; inset: 0; pointer-events: none; z-index: 5;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,65,0.04) 3px, rgba(0,255,65,0.04) 4px);
  }
  .vignette {
    position: absolute; inset: 0; pointer-events: none; z-index: 6;
    background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%);
  }

  header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 24px;
    border-bottom: 1px solid #1a1a2e;
    background: #0d0d14;
    font-size: 11px; letter-spacing: 0.18em; color: #6b7280;
  }
  header .brand { color: #ff0066; }
  header .status { color: #00ff41; }

  main {
    flex: 1; display: grid; grid-template-columns: 1fr 1.25fr; gap: 24px;
    padding: 34px 40px 26px; position: relative; z-index: 2;
  }
  .left { display: flex; flex-direction: column; justify-content: space-between; gap: 18px; }
  .title-block { }
  .eyebrow {
    font-size: 12px; letter-spacing: 0.42em; color: #00e5ff; margin-bottom: 14px;
  }
  h1 {
    font-family: 'Share Tech Mono', monospace;
    font-weight: 400; font-size: 66px; line-height: 0.98; letter-spacing: 0.02em;
    color: #00ff41;
    text-shadow: 0 0 18px rgba(0,255,65,0.45), 0 0 60px rgba(0,255,65,0.25);
  }
  h1 .slash { color: #ff0066; text-shadow: 0 0 18px rgba(255,0,102,0.5); }
  .subtitle {
    margin-top: 16px; font-size: 17px; letter-spacing: 0.30em; color: #00e5ff;
    text-shadow: 0 0 12px rgba(0,229,255,0.35);
    text-transform: uppercase;
  }
  .specs {
    display: grid; grid-template-columns: auto auto; gap: 6px 22px;
    font-size: 12px; color: #6b7280; letter-spacing: 0.08em;
  }
  .specs b { color: #00ff41; font-weight: 500; }
  .specs .p { color: #ff0066; }
  .specs .c { color: #00e5ff; }
  .specs .a { color: #ffaa00; }

  .right { position: relative; border: 1px solid #1a1a2e; background: rgba(13,13,20,0.85); }
  .right .tag {
    position: absolute; top: -8px; left: 12px; background: #0a0a0f; padding: 0 8px;
    font-size: 10px; letter-spacing: 0.25em; color: #ff0066;
  }
  canvas#scope { position: absolute; inset: 0; width: 100%; height: 100%; }

  footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 24px; border-top: 1px solid #1a1a2e; background: #0d0d14;
    font-size: 11px; letter-spacing: 0.22em; color: #3a3a4e;
  }
  footer .producer { color: #00e5ff; text-transform: uppercase; }
  footer .stack { color: #3a3a4e; }
</style>
</head>
<body>
<div class="frame">
  <header>
    <span class="brand">ZAZIE PRODUCTIONS // SIGNAL LAB</span>
    <span class="status">● DSP ACTIVE // 44.1 kHz // 16 VOICES</span>
    <span>AGON-7 // v1.0.0</span>
  </header>

  <main>
    <section class="left">
      <div class="title-block">
        <div class="eyebrow">CYBERNETIC INSTRUMENT</div>
        <h1>AGON <span class="slash">//</span><br/>SIGNAL ENGINE</h1>
        <div class="subtitle">Browser-Based Audiovisual Synthesis</div>
      </div>
      <div class="specs">
        <span>OSC1</span><span><b class="c">SAW</b> +19ct</span>
        <span>OSC2</span><span><b class="c">SQR</b> −12ct</span>
        <span>VCF</span><span><b class="p">LP 4kHz</b> Q 6</span>
        <span>LFO</span><span><b class="a">6.0 Hz</b> → CUTOFF</span>
        <span>FX</span><span>DELAY + REVERB</span>
      </div>
    </section>

    <section class="right">
      <div class="tag">SIGNAL SCOPE // LIVE</div>
      <canvas id="scope"></canvas>
    </section>
  </main>

  <footer>
    <span>REACT // TYPESCRIPT // CANVAS // WEB AUDIO API</span>
    <span class="producer">Zazie Productions</span>
    <span>github.com/zazieproductions/synthx-7-modular-synthesis-terminal</span>
  </footer>
</div>
<div class="scanlines"></div>
<div class="vignette"></div>

<script>
  const canvas = document.getElementById('scope');
  const ctx = canvas.getContext('2d');
  function size() {
    const r = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.round(r.width * devicePixelRatio);
    canvas.height = Math.round(r.height * devicePixelRatio);
  }
  size();
  window.addEventListener('resize', size);

  const GREEN = '#00ff41';
  const CYAN = '#00e5ff';
  const PINK = '#ff0066';
  const AMBER = '#ffaa00';
  const DIM = '#1a1a2e';

  let t = 0;
  const BARS = 48;
  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    for (let i = 1; i < 8; i++) {
      const x = (w / 8) * i;
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    ctx.stroke();

    // spectrum bars
    const barW = w / (BARS * 1.6);
    for (let i = 0; i < BARS; i++) {
      const env = 0.35 + 0.65 * Math.exp(-i / 9);
      const wob = 0.5 + 0.5 * Math.sin(t * 0.11 + i * 0.55);
      const flick = 0.75 + 0.25 * Math.sin(t * 0.9 + i * 2.3);
      const v = Math.min(0.95, env * (0.25 + 0.85 * wob * wob * wob) * flick);
      const bh = Math.max(3, v * h * 0.92);
      const x = 14 + i * ((w - 28) / BARS);
      const hue = i % 3 === 0 ? CYAN : GREEN;
      ctx.fillStyle = hue;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(x, h - bh, barW, bh);
    }
    ctx.globalAlpha = 1;

    // scope waveform (compound oscillator — the AGON voice)
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 2;
    ctx.shadowColor = GREEN;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const u = x / w;
      const env = Math.exp(-((u - 0.5) ** 2) / 0.06);
      const y =
        h / 2 +
        Math.sin(u * 26 + t * 0.16) * 0.28 * h * env +
        Math.sin(u * 11 - t * 0.23) * 0.34 * h * env * 0.8 +
        Math.sin(u * 47 + t * 0.31) * 0.10 * h * env * 0.9;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // peak marker
    const peak = h * (0.16 + 0.10 * (0.5 + 0.5 * Math.sin(t * 0.37)));
    ctx.strokeStyle = PINK;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, peak); ctx.lineTo(w, peak);
    ctx.stroke();
    ctx.setLineDash([]);

    // readout
    ctx.fillStyle = AMBER;
    ctx.font = Math.round(w * 0.022) + "px 'JetBrains Mono', monospace";
    ctx.fillText('RMS −12.4 dB  //  PEAK HOLD', 18, 34);

    t += 1;
    requestAnimationFrame(draw);
  }
  draw();
</script>
</body>
</html>`;
}
