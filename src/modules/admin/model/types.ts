// Kazakh and English versions of the texts; the main fields hold Russian.
export type TranslationLocale = 'kk' | 'en';
export type Translations<Field extends string> = Partial<
  Record<TranslationLocale, Partial<Record<Field, string>>>
>;
export type NominationTranslations = Translations<'title' | 'category' | 'description'>;
export type NomineeTranslations = Translations<'name' | 'tagline'>;

export type AdminNominee = {
  id: number;
  name: string;
  tagline: string;
  avatarUrl: string | null;
  translations: NomineeTranslations;
  votes: number;
};

export type AdminNomination = {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string | null;
  translations: NominationTranslations;
  nominees: AdminNominee[];
};

export type AdminStats = {
  totals: {
    votes: number;
    voters: number;
    users: number;
    pendingApplications: number;
  };
  votesByDay: { day: string; votes: number }[];
  nominations: AdminNomination[];
};

export type VotingSettings = {
  votingOpen: boolean;
  resultsPublished: boolean;
};

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type Application = {
  id: number;
  nomineeName: string;
  comment: string;
  status: ApplicationStatus;
  createdAt: string;
  nominationId: number;
  nominationTitle: string;
  authorName: string;
  authorEmail: string;
  // People behind the suggestion, its author included.
  supports: number;
};

export type UserRole = 'user' | 'admin';

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  votes: number;
  applications: number;
};

export type AdminVote = {
  id: number;
  createdAt: string;
  userId: number;
  userName: string;
  userEmail: string;
  nominationId: number;
  nominationTitle: string;
  nomineeId: number;
  nomineeName: string;
};

export type VotesFilter = {
  userId: number | null;
  nominationId: number | null;
  search: string;
  limit: number;
  offset: number;
};

export type VotesPage = {
  votes: AdminVote[];
  total: number;
  // The user from `userId`, so the filter can show a name even when they have no votes.
  user: { id: number; name: string; email: string } | null;
};

export type NominationInput = {
  title: string;
  category: string;
  description: string;
  imageUrl: string | null;
  translations: NominationTranslations;
};

export type NomineeInput = {
  name: string;
  tagline: string;
  avatarUrl: string | null;
  translations: NomineeTranslations;
};
