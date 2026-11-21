import { useId } from 'react';
import styles from './ice-loader.module.scss';

type IceLoaderProps = {
  className?: string;
  // Read by screen readers only; the loader itself is a picture.
  label?: string;
};

const CENTER = 50;
const FRAME_RADIUS = 40;
const FRAME = Array.from({ length: 6 }, (_, index) => {
  const angle = ((index * 60 - 90) * Math.PI) / 180;
  return `${CENTER + FRAME_RADIUS * Math.cos(angle)},${CENTER + FRAME_RADIUS * Math.sin(angle)}`;
}).join(' ');

// One arm of the snowflake, repeated six times around the centre.
const ARM = 'M50 50V30M50 37l-5-5M50 37l5-5M50 44l-6-4M50 44l6-4';
const ARM_ANGLES = [0, 60, 120, 180, 240, 300];

// The site's loading mark: the ice medallion of the nomination emblems with a turning
// snowflake inside and a gleam running around its edge.
export function IceLoader({ className, label }: IceLoaderProps) {
  const gradientId = useId();
  const classNames = [styles.loader, className].filter(Boolean).join(' ');

  return (
    <span className={classNames} role={label ? 'img' : undefined} aria-label={label}>
      <svg viewBox='0 0 100 100' aria-hidden='true' focusable='false'>
        <defs>
          <linearGradient id={gradientId} x1='0.15' y1='0' x2='0.85' y2='1'>
            <stop offset='0' stopColor='#f0f9ff' />
            <stop offset='0.5' stopColor='#7dd3fc' />
            <stop offset='1' stopColor='#a78bfa' />
          </linearGradient>
        </defs>
        <polygon className={styles.glass} points={FRAME} />
        <polygon className={styles.frame} points={FRAME} />
        <polygon
          className={styles.gleam}
          points={FRAME}
          pathLength={100}
          stroke={`url(#${gradientId})`}
        />
        <polygon
          className={styles.gem}
          points='50,4 56,10 50,16 44,10'
          fill={`url(#${gradientId})`}
        />
        <g className={styles.flake} stroke={`url(#${gradientId})`}>
          {ARM_ANGLES.map((angle) => (
            <path key={angle} d={ARM} transform={`rotate(${angle} 50 50)`} />
          ))}
        </g>
      </svg>
    </span>
  );
}
