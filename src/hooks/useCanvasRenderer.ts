/**
 * Shared canvas animation loop for the visualizers.
 *
 * Responsibilities:
 *   - size the backing store to the element's CSS size × devicePixelRatio
 *   - keep the drawing transform aligned so callers draw in CSS pixels
 *   - re-measure on container resize (ResizeObserver)
 *   - pause the loop when the tab is hidden (requestAnimationFrame already
 *     pauses, but we stop cleanly to avoid a stale frame on return)
 *   - cancel the loop and disconnect observers on unmount
 *
 * The `draw` callback is held in a ref so a re-render never restarts the
 * animation loop — visualizers therefore re-render only when their input
 * (the analyser node) changes, not once per frame.
 */
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export type CanvasDrawFn = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  now: number,
) => void;

const MAX_DPR = 2;

export function useCanvasRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draw: CanvasDrawFn,
): void {
  const drawRef = useRef(draw);

  // Keep the latest draw callback without restarting the animation loop.
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let running = true;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = Math.max(1, Math.round(bounds.width * dpr));
      height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    let frame = 0;
    const loop = (now: number) => {
      if (!running) return;
      frame = requestAnimationFrame(loop);
      const cssWidth = width / Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const cssHeight = height / Math.min(window.devicePixelRatio || 1, MAX_DPR);
      drawRef.current(context, cssWidth, cssHeight, now);
    };
    frame = requestAnimationFrame(loop);

    const onVisibilityChange = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        frame = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [canvasRef]);
}
