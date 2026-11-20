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
// A photo belongs to the person, not to one nomination: nominees with the same name (any case,
// spaces around ignored) share it. The admin routes write a saved photo to all of them; here a
// nominee without a photo of its own shows the one set for its name elsewhere (photos uploaded
// before sharing existed, or a nominee added without a photo).
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
            'avatarUrl', coalesce(e.avatar_url, (
              select s.avatar_url from nominees s
              where s.avatar_url is not null and lower(btrim(s.name)) = lower(btrim(e.name))
              order by s.id desc
              limit 1
            )),
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
