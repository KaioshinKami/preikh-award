import { useEffect, useState } from 'react';
import { getTimeLeft, type TimeLeft } from '../../lib/get-time-left';

const TICK_MS = 1000;

export function useCountdown(targetIso: string): TimeLeft {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  return getTimeLeft(Date.parse(targetIso), now);
}
