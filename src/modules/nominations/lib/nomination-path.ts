const NOMINATION_PATH = /^\/nominations\/(\d+)\/?$/;

export function getNominationPath(nominationId: number): string {
  return `/nominations/${nominationId}`;
}

// "/nominations/12" → 12; any other path → null.
export function parseNominationPath(pathname: string): number | null {
  const match = NOMINATION_PATH.exec(pathname);
  return match ? Number(match[1]) : null;
}

// The id of a nomination's card on the main page, so "back" can scroll straight to it.
export function getNominationAnchorId(nominationId: number): string {
  return `nomination-${nominationId}`;
}
