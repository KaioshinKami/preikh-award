import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getVoteResults, getVoteStatus } from './get-vote-results.ts';

const nominee = (id: number, votes?: number) => ({
  id,
  name: '',
  tagline: '',
  avatarUrl: null,
  votes,
});

test('results stay hidden while the server sends no counts', () => {
  assert.equal(getVoteResults([nominee(1), nominee(2)]), null);
});

test('results give each nominee a share of the nomination votes', () => {
  const results = getVoteResults([nominee(1, 3), nominee(2, 1)]);

  assert.deepEqual(results?.get(1), { votes: 3, share: 0.75 });
  assert.deepEqual(results?.get(2), { votes: 1, share: 0.25 });
});

test('a cast vote locks the other nominees of the nomination', () => {
  const base = { votedNomineeId: 1, pendingNomineeId: null, isVotingOpen: true };

  assert.equal(getVoteStatus({ ...base, nomineeId: 1 }), 'voted');
  assert.equal(getVoteStatus({ ...base, nomineeId: 2 }), 'locked');
  assert.equal(
    getVoteStatus({ ...base, nomineeId: 2, votedNomineeId: undefined, isVotingOpen: false }),
    'closed',
  );
});
