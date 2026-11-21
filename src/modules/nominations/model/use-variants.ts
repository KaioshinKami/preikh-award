import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { getErrorMessage } from '@/shared/api/api';
import { fetchVariants, supportVariant, unsupportVariant } from '../api/nominations-api';
import type { Variant } from './types';

// The open picks of one nomination. Loaded again after signing in or out, since the list says
// which picks are the visitor's own and which they support.
export function useVariants(nominationId: number) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [variants, setVariants] = useState<Variant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    fetchVariants(nominationId).then(
      (loaded) => {
        if (!isCurrent) return;
        setVariants(loaded);
        setError(null);
      },
      (loadError: unknown) => {
        if (isCurrent) setError(getErrorMessage(loadError));
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [nominationId, userId, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // The list keeps its order while the visitor clicks, so a row never jumps away from the cursor.
  const toggleSupport = async (variant: Variant) => {
    setPendingId(variant.id);
    setError(null);
    try {
      const { supports } = variant.isSupported
        ? await unsupportVariant(variant.id)
        : await supportVariant(variant.id);
      setVariants(
        (current) =>
          current?.map((item) =>
            item.id === variant.id
              ? { ...item, supports, isSupported: !variant.isSupported }
              : item,
          ) ?? null,
      );
    } catch (toggleError) {
      setError(getErrorMessage(toggleError));
      reload();
    } finally {
      setPendingId(null);
    }
  };

  return { variants, error, pendingId, reload, toggleSupport };
}
