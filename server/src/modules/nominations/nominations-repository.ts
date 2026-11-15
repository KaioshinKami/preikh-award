import type { Sql } from '../../db/sql.ts';

export type NomineeRow = {
  id: number;
  name: string;
  tagline: string;
  avatarUrl: string | null;
  votes: number;
};

export type NominationRow = {
  id: number;
  title: string;
  category: string;
  description: string;
  nominees: NomineeRow[];
};

// All nominations with their nominees and vote counts, in creation order.
export function listNominations(sql: Sql): Promise<NominationRow[]> {
  return sql<NominationRow[]>`
    select
      n.id,
      n.title,
      n.category,
      n.description,
      coalesce(
        json_agg(
          json_build_object(
            'id', e.id,
            'name', e.name,
            'tagline', e.tagline,
            'avatarUrl', e.avatar_url,
            'votes', (select count(*) from votes v where v.nominee_id = e.id)
          )
          order by e.id
        ) filter (where e.id is not null),
        '[]'
      ) as nominees
    from nominations n
    left join nominees e on e.nomination_id = n.id
    group by n.id
    order by n.id
  `;
}

export function hideVoteCounts(nominations: NominationRow[]) {
  return nominations.map((nomination) => ({
    ...nomination,
    nominees: nomination.nominees.map(({ votes: _votes, ...nominee }) => nominee),
  }));
}
