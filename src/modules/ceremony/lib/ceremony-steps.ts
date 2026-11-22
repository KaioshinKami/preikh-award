import type { CeremonyNomination, CeremonyNominee, CeremonyStep, Place } from '../model/types';

export function countVotes(nominees: CeremonyNominee[]): number {
  return nominees.reduce((total, nominee) => total + nominee.votes, 0);
}

// Most votes first. Equal votes share a place and the next place follows on: 1, 2, 2, 3.
export function rankNominees(nominees: CeremonyNominee[]): Place[] {
  const totalVotes = countVotes(nominees);
  const sorted = [...nominees].sort(
    (first, second) => second.votes - first.votes || first.name.localeCompare(second.name, 'ru'),
  );

  const places: Place[] = [];
  for (const nominee of sorted) {
    const current = places.at(-1);
    if (current && current.votes === nominee.votes) {
      current.nominees.push(nominee);
    } else {
      places.push({
        place: places.length + 1,
        votes: nominee.votes,
        share: totalVotes === 0 ? 0 : nominee.votes / totalVotes,
        nominees: [nominee],
      });
    }
  }
  return places;
}

// Nominations with nominees, in the site's order.
export function ceremonyNominations(nominations: CeremonyNomination[]): CeremonyNomination[] {
  return nominations.filter((nomination) => nomination.nominees.length > 0);
}

// The whole ceremony, slide by slide. For each nomination: the nomination and its nominees,
// "And the winner is…", the winner, then the other places. A nomination nobody voted in only
// gets its first slide.
export function buildCeremonySteps(nominations: CeremonyNomination[]): CeremonyStep[] {
  const steps: CeremonyStep[] = [{ kind: 'opening' }];
  nominations.forEach((nomination, index) => {
    steps.push({ kind: 'nomination', nomination: index });
    if (countVotes(nomination.nominees) === 0) return;
    steps.push({ kind: 'suspense', nomination: index }, { kind: 'winner', nomination: index });
    if (rankNominees(nomination.nominees).length > 1) {
      steps.push({ kind: 'places', nomination: index });
    }
  });
  steps.push({ kind: 'closing' });
  return steps;
}
