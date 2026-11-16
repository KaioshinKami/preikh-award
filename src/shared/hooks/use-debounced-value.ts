import { useEffect, useState } from 'react';

// Follows `value` once it has stopped changing for `delayMs`, e.g. to search after typing pauses.
export function useDebouncedValue<Value>(value: Value, delayMs: number): Value {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
