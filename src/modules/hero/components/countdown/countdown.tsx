import { useCountdown } from './use-countdown';
import styles from './countdown.module.scss';

type CountdownProps = {
  targetIso: string;
};

function formatUnit(value: number): string {
  return String(value).padStart(2, '0');
}

export function Countdown({ targetIso }: CountdownProps) {
  const timeLeft = useCountdown(targetIso);

  if (timeLeft.isOver) {
    return <p className={styles.caption}>Церемония состоялась — спасибо, что были с нами!</p>;
  }

  const units = [
    { label: 'дней', value: timeLeft.days },
    { label: 'часов', value: timeLeft.hours },
    { label: 'минут', value: timeLeft.minutes },
    { label: 'секунд', value: timeLeft.seconds },
  ];

  return (
    <div className={styles.countdown}>
      <p className={styles.caption}>До церемонии</p>
      <div className={styles.units} role='timer' aria-label={`${timeLeft.days} дней до церемонии`}>
        {units.map((unit) => (
          <div key={unit.label} className={styles.unit}>
            <span className={styles.value}>{formatUnit(unit.value)}</span>
            <span className={styles.label}>{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
