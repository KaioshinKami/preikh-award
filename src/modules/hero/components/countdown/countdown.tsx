import { useMessages } from '@/shared/i18n';
import { HERO_MESSAGES } from '../../model/hero-messages';
import { useCountdown } from './use-countdown';
import styles from './countdown.module.scss';

type CountdownProps = {
  targetIso: string;
};

function formatUnit(value: number): string {
  return String(value).padStart(2, '0');
}

export function Countdown({ targetIso }: CountdownProps) {
  const t = useMessages(HERO_MESSAGES).countdown;
  const timeLeft = useCountdown(targetIso);

  if (timeLeft.isOver) {
    return <p className={styles.caption}>{t.over}</p>;
  }

  const units = [
    { id: 'days', label: t.units.days, value: timeLeft.days },
    { id: 'hours', label: t.units.hours, value: timeLeft.hours },
    { id: 'minutes', label: t.units.minutes, value: timeLeft.minutes },
    { id: 'seconds', label: t.units.seconds, value: timeLeft.seconds },
  ];

  return (
    <div className={styles.countdown}>
      <p className={styles.caption}>{t.caption}</p>
      <div className={styles.units} role='timer' aria-label={t.timerLabel(timeLeft.days)}>
        {units.map((unit) => (
          <div key={unit.id} className={styles.unit}>
            <span className={styles.value}>{formatUnit(unit.value)}</span>
            <span className={styles.label}>{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
