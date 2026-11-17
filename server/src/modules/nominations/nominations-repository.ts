import type { Sql } from '../../db/sql.ts';
import type { NominationTranslations, NomineeTranslations } from './translations.ts';

export type NomineeRow = {
  id: number;
  name: string;
  tagline: string;
  avatarUrl: string | null;
  translations: NomineeTranslations;
  votes: number;
};

export type NominationRow = {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string | null;
  translations: NominationTranslations;
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
      n.image_url,
      n.translations,
      coalesce(
        json_agg(
          json_build_object(
            'id', e.id,
            'name', e.name,
            'tagline', e.tagline,
            'avatarUrl', e.avatar_url,
            'translations', e.translations,
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
