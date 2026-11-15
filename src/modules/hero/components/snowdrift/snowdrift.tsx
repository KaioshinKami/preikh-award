type SnowdriftProps = {
  className?: string;
};

export function Snowdrift({ className }: SnowdriftProps) {
  return (
    <svg className={className} viewBox='0 0 1440 180' preserveAspectRatio='none' aria-hidden='true'>
      <defs>
        <linearGradient id='snowdrift-glow' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#e0f2fe' stopOpacity='0.28' />
          <stop offset='0.7' stopColor='#050914' stopOpacity='1' />
        </linearGradient>
      </defs>
      <path
        d='M0 96C160 52 320 40 480 66S800 140 960 112s320-72 480-40V180H0Z'
        fill='url(#snowdrift-glow)'
      />
      <path d='M0 136c200-30 360-38 560-14s360 32 560 6 240-24 320-16V180H0Z' fill='#050914' />
    </svg>
  );
}
