import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
//
// GitHub Pages project site: https://zazieproductions.github.io/synthx-7-modular-synthesis-terminal/
//
// `base: './'` keeps every built asset URL relative to the page URL, so the
// same bundle works when served from the repository root, any sub-path
// preview, or the GitHub Pages project site. Assets therefore resolve
// correctly on Pages (e.g. `./assets/…` from the site root), and a refresh of
// the deployed URL re-serves the same entry page without breaking.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    // Allow the sandboxed preview proxy to reach the dev server.
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
  build: {
    sourcemap: true,
  },
});
