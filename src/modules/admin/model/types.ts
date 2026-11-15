export type AdminNominee = {
  id: number;
  name: string;
  tagline: string;
  avatarUrl: string | null;
  votes: number;
};

export type AdminNomination = {
  id: number;
  title: string;
  category: string;
  description: string;
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
};

export type NominationInput = {
  title: string;
  category: string;
  description: string;
};

export type NomineeInput = {
  name: string;
  tagline: string;
  avatarUrl: string | null;
};
