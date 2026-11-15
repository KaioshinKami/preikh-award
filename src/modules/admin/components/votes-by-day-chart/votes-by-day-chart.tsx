import { formatVotes } from '@/modules/nominations';
import { fillMissingDays, type DayVotes } from '../../lib/fill-missing-days';
import styles from './votes-by-day-chart.module.scss';

type VotesByDayChartProps = {
  votesByDay: DayVotes[];
};

const MAX_AXIS_LABELS = 6;
const dayFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

function formatDay(day: string): string {
  return dayFormat.format(new Date(`${day}T00:00:00Z`));
}

export function VotesByDayChart({ votesByDay }: VotesByDayChartProps) {
  const days = fillMissingDays(votesByDay);

  if (days.length === 0) {
    return <p className={styles.empty}>Голосов пока нет — график появится после первого голоса.</p>;
  }

  const maxVotes = Math.max(...days.map((entry) => entry.votes));
  const labelStep = Math.ceil(days.length / MAX_AXIS_LABELS);

  return (
    <figure className={styles.chart}>
      <figcaption className={styles.caption}>Голоса по дням, МСК</figcaption>
      <div className={styles.plot}>
        <span className={styles.maxLabel}>{maxVotes}</span>
        <ol className={styles.columns}>
          {days.map((entry, index) => (
            <li key={entry.day} className={styles.column} tabIndex={0}>
              <span
                className={styles.bar}
                style={{ height: `${(entry.votes / maxVotes) * 100}%` }}
              />
              <span className={styles.tooltip}>
                {formatDay(entry.day)}: {formatVotes(entry.votes)}
              </span>
              {index % labelStep === 0 && (
                <span className={styles.dayLabel} aria-hidden='true'>
                  {formatDay(entry.day)}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
