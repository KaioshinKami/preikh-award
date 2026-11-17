import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { getErrorMessage } from '@/shared/api/api';
import { useMessages } from '@/shared/i18n';
import { fetchMyVotes, submitVote } from '../api/nominations-api';
import { NOMINATIONS_MESSAGES } from './nominations-messages';
import type { Nominee, VotesByNomination } from './types';

// Votes of the signed-in viewer. A vote is final, so it is confirmed before it is sent.
export function useVotes() {
  const { user, openAuthDialog } = useAuth();
  const t = useMessages(NOMINATIONS_MESSAGES);
  const [votes, setVotes] = useState<VotesByNomination>({});
  const [pendingNomineeId, setPendingNomineeId] = useState<number | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const refreshVotes = useCallback(() => {
    fetchMyVotes()
      .then(setVotes)
      .catch((error: unknown) => setVoteError(getErrorMessage(error)));
  }, []);

  useEffect(() => {
    setVoteError(null);
    if (user) refreshVotes();
    else setVotes({});
  }, [user, refreshVotes]);

  const castVote = async (nominationId: number, nominee: Nominee, displayName: string) => {
    if (!user) {
      openAuthDialog('login');
      return;
    }
    const isConfirmed = window.confirm(t.confirmVote(displayName));
    if (!isConfirmed) return;

    setVoteError(null);
    setPendingNomineeId(nominee.id);
    try {
      await submitVote(nominationId, nominee.id);
      setVotes((currentVotes) => ({ ...currentVotes, [nominationId]: nominee.id }));
    } catch (error) {
      setVoteError(getErrorMessage(error));
      refreshVotes();
    } finally {
      setPendingNomineeId(null);
    }
  };

  return { votes, pendingNomineeId, voteError, castVote };
}
