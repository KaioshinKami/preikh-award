import { ApiError } from '../../api-error.ts';
import type { Sql } from '../../db/sql.ts';
import { getSettings } from '../settings/settings-repository.ts';

type CastVoteInput = {
  userId: number;
  nominationId: number;
  nomineeId: number;
};

// One vote per user per nomination, final once cast. The unique constraint and the composite
// foreign key in the schema enforce the same rules if two requests race.
export async function castVote(sql: Sql, { userId, nominationId, nomineeId }: CastVoteInput) {
  const { votingOpen } = await getSettings(sql);
  if (!votingOpen) throw new ApiError(403, 'Голосование сейчас закрыто', 'voting_closed');

  const [nominee] = await sql`
    select id from nominees where id = ${nomineeId} and nomination_id = ${nominationId}
  `;
  if (!nominee)
    throw new ApiError(
      400,
      'Этот номинант не участвует в выбранной номинации',
      'nominee_not_in_nomination',
    );

  const inserted = await sql`
    insert into votes (user_id, nomination_id, nominee_id)
    values (${userId}, ${nominationId}, ${nomineeId})
    on conflict (user_id, nomination_id) do nothing
    returning id
  `;
  if (inserted.length === 0)
    throw new ApiError(409, 'Вы уже проголосовали в этой номинации', 'already_voted');
}

// { [nominationId]: nomineeId }
export async function getUserVotes(sql: Sql, userId: number): Promise<Record<number, number>> {
  const rows = await sql<{ nominationId: number; nomineeId: number }[]>`
    select nomination_id, nominee_id from votes where user_id = ${userId}
  `;
  return Object.fromEntries(rows.map((row) => [row.nominationId, row.nomineeId]));
}
