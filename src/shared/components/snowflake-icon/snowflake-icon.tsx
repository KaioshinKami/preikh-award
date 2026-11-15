const ARM_PATH = 'M12 12V2.5M12 6 9.6 3.9M12 6l2.4-2.1M12 9.2 9.2 7.3M12 9.2l2.8-1.9';
const ARM_ANGLES = [0, 60, 120, 180, 240, 300];

type SnowflakeIconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function SnowflakeIcon({ size = 24, strokeWidth = 1.5, className }: SnowflakeIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      aria-hidden='true'
    >
      {ARM_ANGLES.map((angle) => (
        <path key={angle} d={ARM_PATH} transform={`rotate(${angle} 12 12)`} />
      ))}
    </svg>
  );
}
