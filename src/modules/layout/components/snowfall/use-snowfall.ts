import { useEffect, type RefObject } from 'react';
import {
  createFlakes,
  createFlakeSprite,
  drawFlakes,
  moveFlakes,
  type Flake,
} from './snowfall-engine';

const MAX_PIXEL_RATIO = 2;
const MAX_FRAME_SECONDS = 0.05;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Animates snow on the canvas; with reduced motion it draws one still frame.
export function useSnowfall(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const sprite = createFlakeSprite();
    let flakes: Flake[] = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrameTime = 0;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      // Mobile toolbars change only the height; keep flakes then to avoid a visible jump.
      const isWidthChanged = window.innerWidth !== width;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (isWidthChanged) flakes = createFlakes(width, height);
      drawFlakes(context, sprite, flakes, width, height);
    };

    const renderFrame = (time: number) => {
      const elapsedSeconds = lastFrameTime ? (time - lastFrameTime) / 1000 : 0;
      lastFrameTime = time;
      moveFlakes(flakes, width, height, Math.min(elapsedSeconds, MAX_FRAME_SECONDS), time / 1000);
      drawFlakes(context, sprite, flakes, width, height);
      frameId = requestAnimationFrame(renderFrame);
    };

    const syncWithMotionPreference = () => {
      cancelAnimationFrame(frameId);
      lastFrameTime = 0;
      if (!reducedMotion.matches) frameId = requestAnimationFrame(renderFrame);
    };

    resize();
    syncWithMotionPreference();
    window.addEventListener('resize', resize);
    reducedMotion.addEventListener('change', syncWithMotionPreference);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      reducedMotion.removeEventListener('change', syncWithMotionPreference);
    };
  }, [canvasRef]);
}
