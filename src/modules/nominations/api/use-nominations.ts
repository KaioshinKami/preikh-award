import { useAsyncData } from '@/shared/hooks/use-async-data';
import type { NominationsData } from '../model/types';
import { fetchNominations } from './nominations-api';

// The last loaded list, shared by the main page and the nomination pages. Going back to the
// main page then renders the full grid at once, so the scroll position can be restored.
let cachedNominations: NominationsData | null = null;

async function loadNominations(): Promise<NominationsData> {
  cachedNominations = await fetchNominations();
  return cachedNominations;
}

// Shows the cached list right away and refreshes it in the background.
export function useNominations() {
  const result = useAsyncData(loadNominations, []);
  return { ...result, data: result.data ?? cachedNominations };
}
