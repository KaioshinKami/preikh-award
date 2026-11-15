import { useState } from 'react';
import { getErrorMessage } from '@/shared/api/api';

// Runs one admin mutation at a time, keeps its error, and calls onDone after a success.
export function useAdminAction(onDone: () => void) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    setIsRunning(true);
    setError(null);
    try {
      await action();
      onDone();
      return true;
    } catch (actionError) {
      setError(getErrorMessage(actionError));
      return false;
    } finally {
      setIsRunning(false);
    }
  };

  return { run, isRunning, error };
}
