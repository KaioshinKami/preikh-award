// Kazakh and English texts entered in the admin page; Russian is in the main fields.
export type Translations<Field extends string> = Partial<
  Record<'kk' | 'en', Partial<Record<Field, string>>>
>;

export type Nominee = {
  id: number;
  name: string;
  tagline: string;
  avatarUrl: string | null;
  translations?: Translations<'name' | 'tagline'>;
  // Present only after the admin publishes the results.
  votes?: number;
};

export type Nomination = {
  id: number;
  title: string;
  category: string;
  description: string;
  // The nomination's logo; a snowflake emblem is drawn when it is missing.
  imageUrl: string | null;
  translations?: Translations<'title' | 'category' | 'description'>;
  nominees: Nominee[];
};

export type NominationsData = {
  nominations: Nomination[];
  votingOpen: boolean;
  resultsPublished: boolean;
};

// nominationId → nomineeId the signed-in viewer voted for
export type VotesByNomination = Record<number, number>;

export type VoteStatus = 'available' | 'pending' | 'voted' | 'locked' | 'closed';
