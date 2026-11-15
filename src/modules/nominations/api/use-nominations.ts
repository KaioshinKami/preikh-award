import { useAsyncData } from '@/shared/hooks/use-async-data';
import { fetchNominations } from './nominations-api';

export function useNominations() {
  return useAsyncData(fetchNominations, []);
}
