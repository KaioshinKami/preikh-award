import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { getErrorMessage } from '@/shared/api/api';
import { fetchMyVotes, submitVote } from '../api/nominations-api';
import type { Nominee, VotesByNomination } from './types';

// Votes of the signed-in viewer. A vote is final, so it is confirmed before it is sent.
export function useVotes() {
  const { user, openAuthDialog } = useAuth();
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

  const castVote = async (nominationId: number, nominee: Nominee) => {
    if (!user) {
      openAuthDialog('login');
      return;
    }
    const isConfirmed = window.confirm(
      `Отдать голос за «${nominee.name}»? Изменить его после отправки будет нельзя.`,
    );
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
