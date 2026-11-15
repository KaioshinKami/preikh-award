export type DayVotes = {
  day: string;
  votes: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDay(day: string): number {
  return Date.parse(`${day}T00:00:00Z`);
}

// The server lists only days that had votes; a time axis needs the empty days too.
export function fillMissingDays(votesByDay: DayVotes[]): DayVotes[] {
  if (votesByDay.length === 0) return [];

  const votesByDate = new Map(votesByDay.map((entry) => [entry.day, entry.votes]));
  const firstDay = parseDay(votesByDay[0].day);
  const lastDay = parseDay(votesByDay[votesByDay.length - 1].day);
  const filledDays: DayVotes[] = [];

  for (let time = firstDay; time <= lastDay; time += DAY_MS) {
    const day = new Date(time).toISOString().slice(0, 10);
    filledDays.push({ day, votes: votesByDate.get(day) ?? 0 });
  }

  return filledDays;
}
