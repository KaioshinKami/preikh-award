import type { Sql } from '../../db/sql.ts';
import { listNominations } from '../nominations/nominations-repository.ts';

type StatsTotals = {
  votes: number;
  voters: number;
  users: number;
  pendingApplications: number;
};

// Days are counted in Moscow time, the time zone of the ceremony.
export async function getStats(sql: Sql) {
  const [totals] = await sql<StatsTotals[]>`
    select
      (select count(*) from votes)::int as votes,
      (select count(distinct user_id) from votes)::int as voters,
      (select count(*) from users)::int as users,
      (select count(*) from applications where status = 'pending')::int as pending_applications
  `;
  const votesByDay = await sql<{ day: string; votes: number }[]>`
    select to_char(created_at at time zone 'Europe/Moscow', 'YYYY-MM-DD') as day, count(*)::int as votes
    from votes
    group by day
    order by day
  `;
  const nominations = await listNominations(sql);

  return { totals, votesByDay, nominations };
}
