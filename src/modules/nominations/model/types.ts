export type Nominee = {
  id: number;
  name: string;
  tagline: string;
  avatarUrl: string | null;
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
