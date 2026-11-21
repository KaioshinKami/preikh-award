import { useMessages } from '@/shared/i18n';
import { HERO_MESSAGES } from '../../model/hero-messages';
import { useCountdown } from './use-countdown';
import styles from './countdown.module.scss';

type CountdownProps = {
  targetIso: string;
};

type UnitValues = { days: number; hours: number; minutes: number; seconds: number };

const SECRET_VALUE = '?';

function formatUnit(value: number): string {
  return String(value).padStart(2, '0');
}

type CountdownUnitsProps = {
  // Null keeps the date a secret: every unit shows "?".
  values: UnitValues | null;
  timerLabel: string;
};

function CountdownUnits({ values, timerLabel }: CountdownUnitsProps) {
  const t = useMessages(HERO_MESSAGES).countdown;
  const units = (['days', 'hours', 'minutes', 'seconds'] as const).map((id) => ({
    id,
    label: t.units[id],
    value: values ? formatUnit(values[id]) : SECRET_VALUE,
  }));

  return (
    <div className={styles.countdown}>
      <p className={styles.caption}>{t.caption}</p>
      <div
        className={styles.units}
        role={values ? 'timer' : undefined}
        aria-label={timerLabel}
        data-secret={!values}
      >
        {units.map((unit) => (
          <div key={unit.id} className={styles.unit}>
            <span className={styles.value}>{unit.value}</span>
            <span className={styles.label}>{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Countdown({ targetIso }: CountdownProps) {
  const t = useMessages(HERO_MESSAGES).countdown;
  const timeLeft = useCountdown(targetIso);

  if (timeLeft.isOver) {
    return <p className={styles.caption}>{t.over}</p>;
  }

  return <CountdownUnits values={timeLeft} timerLabel={t.timerLabel(timeLeft.days)} />;
}

// The countdown while the ceremony's date is a secret: "?" in every unit, nothing ticking.
export function SecretCountdown() {
  const t = useMessages(HERO_MESSAGES).countdown;
  return <CountdownUnits values={null} timerLabel={t.secretLabel} />;
}
