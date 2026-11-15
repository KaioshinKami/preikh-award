export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
};

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function getTimeLeft(targetTime: number, now: number): TimeLeft {
  const remainingMs = Math.max(0, targetTime - now);

  return {
    days: Math.floor(remainingMs / DAY_MS),
    hours: Math.floor((remainingMs % DAY_MS) / HOUR_MS),
    minutes: Math.floor((remainingMs % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((remainingMs % MINUTE_MS) / SECOND_MS),
    isOver: remainingMs === 0,
  };
}
