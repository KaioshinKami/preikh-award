import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { getErrorMessage } from '@/shared/api/api';

type AsyncDataState<Data> = {
  data: Data | null;
  error: string | null;
  isLoading: boolean;
};

// Loads data on mount and whenever deps change; reload() refetches but keeps the old data on screen.
export function useAsyncData<Data>(load: () => Promise<Data>, deps: DependencyList) {
  const [state, setState] = useState<AsyncDataState<Data>>({
    data: null,
    error: null,
    isLoading: true,
  });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    load()
      .then((data) => {
        if (!isCancelled) setState({ data, error: null, isLoading: false });
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setState((current) => ({ ...current, error: getErrorMessage(error), isLoading: false }));
        }
      });

    return () => {
      isCancelled = true;
    };
    // `load` is expected to change only together with `deps`.
  }, [...deps, reloadCount]);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, isLoading: true }));
    setReloadCount((count) => count + 1);
  }, []);

  return { ...state, reload };
}
