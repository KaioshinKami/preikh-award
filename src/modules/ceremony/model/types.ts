// What the ceremony screen needs from the admin API's nominations, vote counts included.
export type CeremonyNominee = {
  id: number;
  name: string;
  avatarUrl: string | null;
  votes: number;
};

export type CeremonyNomination = {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string | null;
  nominees: CeremonyNominee[];
};

// One place in a nomination. Nominees with the same number of votes share it.
export type Place = {
  place: number;
  votes: number;
  // Of all the votes in the nomination, 0 to 1.
  share: number;
  nominees: CeremonyNominee[];
};

// What is on the screen. `nomination` points into the list of nominations being shown.
export type CeremonyStep =
  | { kind: 'opening' }
  | { kind: 'nomination'; nomination: number }
  | { kind: 'suspense'; nomination: number }
  | { kind: 'winner'; nomination: number }
  | { kind: 'places'; nomination: number }
  | { kind: 'closing' };
