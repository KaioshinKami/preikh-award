import { useRef } from 'react';
import { useSnowfall } from './use-snowfall';
import styles from './snowfall.module.scss';

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useSnowfall(canvasRef);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden='true' />;
}
