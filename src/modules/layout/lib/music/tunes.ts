// Old tunes free of copyright, written as notes for the music box. A note is "pitch:beats":
// "E5:1" is a quarter-note E above middle C, "Bb5:0.5" an eighth, "R:2" a half rest.
// A chord joins pitches with "+": "C3+E3+G3:4".

export type Tune = {
  bpm: number;
  // Each line is played on the music box at the same time as the others.
  lines: string[];
  // Soft chords underneath.
  chords: string;
  // Sleigh bells on every beat.
  sleighBells?: boolean;
};

export type ParsedNote = {
  // MIDI note numbers; empty for a rest.
  pitches: number[];
  beats: number;
};

const SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const PITCH_PATTERN = /^([A-G])(#|b)?(-?\d)$/;

// "C4" → 60 (middle C), "A4" → 69, "Bb5" → 82.
export function toMidi(pitch: string): number {
  const match = PITCH_PATTERN.exec(pitch);
  if (!match) throw new Error(`Not a pitch: ${pitch}`);
  const [, letter, accidental, octave] = match;
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return 12 * (Number(octave) + 1) + SEMITONES[letter] + shift;
}

export function parseNotes(text: string): ParsedNote[] {
  return text
    .trim()
    .split(/\s+/)
    .map((token) => {
      const [pitchPart, beatsPart] = token.split(':');
      const beats = Number(beatsPart);
      if (!pitchPart || !(beats > 0)) throw new Error(`Not a note: ${token}`);
      return {
        pitches: pitchPart === 'R' ? [] : pitchPart.split('+').map(toMidi),
        beats,
      };
    });
}

export function countBeats(notes: ParsedNote[]): number {
  return notes.reduce((total, note) => total + note.beats, 0);
}

const repeat = (text: string, times: number) => Array(times).fill(text).join(' ');

// Jingle Bells, the chorus (James Lord Pierpont, 1857). 4/4.
const JINGLE_A = 'E5:1 E5:1 E5:2  E5:1 E5:1 E5:2  E5:1 G5:1 C5:1.5 D5:0.5  E5:4';
const JINGLE_B = 'F5:1 F5:1 F5:1.5 F5:0.5  F5:1 E5:1 E5:1 E5:0.5 E5:0.5';
const C_MAJOR = 'C3+E3+G3:4';
const F_MAJOR = 'F3+A3+C4:4';

const JINGLE_BELLS: Tune = {
  bpm: 116,
  lines: [
    [
      JINGLE_A,
      JINGLE_B,
      'E5:1 D5:1 D5:1 E5:1  D5:2 G5:2',
      JINGLE_A,
      JINGLE_B,
      'G5:1 G5:1 F5:1 D5:1  C5:4',
    ].join(' '),
  ],
  chords: [
    repeat(C_MAJOR, 4),
    F_MAJOR,
    C_MAJOR,
    'D3+F#3+C4:4 G3+B3+D4:4',
    repeat(C_MAJOR, 4),
    F_MAJOR,
    C_MAJOR,
    'G3+B3+F4:4',
    C_MAJOR,
  ].join(' '),
  sleighBells: true,
};

// Shchedryk, known as Carol of the Bells (Mykola Leontovych, 1916). 3/4, G minor: the
// four-note bell figure over a falling bass, joined by a second voice the second time round.
const BELL_FIGURE = 'Bb5:1 A5:0.5 Bb5:0.5 G5:1';
const CAROL_BASS = 'G2+D3+G3:3 F2+Bb2+D3:3 Eb2+G2+Bb2:3 D2+A2+D3:3';

const CAROL_OF_THE_BELLS: Tune = {
  bpm: 150,
  lines: [repeat(BELL_FIGURE, 16), ['R:24', repeat('D6:1 C6:0.5 D6:0.5 Bb5:1', 8)].join(' ')],
  chords: repeat(CAROL_BASS, 4),
};

// We Wish You a Merry Christmas (English traditional). 3/4, F major, twice through.
const WISH_VERSE = [
  'F5:1 F5:0.5 G5:0.5 F5:0.5 E5:0.5  D5:1 D5:1 D5:1',
  'G5:1 G5:0.5 A5:0.5 G5:0.5 F5:0.5  E5:1 C5:1 C5:1',
  'A5:1 A5:0.5 Bb5:0.5 A5:0.5 G5:0.5  F5:1 D5:1 C5:0.5 C5:0.5',
  'D5:1 G5:1 E5:1',
].join(' ');
const WISH_CHORDS = [
  'F3+A3+C4:3 Bb2+D3+F3:3 G2+B2+D3:3 C3+E3+G3:3',
  'A2+C#3+E3:3 D3+F3+A3:3 Bb2+D3+F3:1 C3+E3+G3:2',
].join(' ');

const WE_WISH_YOU: Tune = {
  bpm: 132,
  lines: [['C5:1', WISH_VERSE, 'F5:2 C5:1', WISH_VERSE, 'F5:3'].join(' ')],
  chords: ['R:1', WISH_CHORDS, 'F3+A3+C4:3', WISH_CHORDS, 'F3+A3+C4:3'].join(' '),
};

export const PLAYLIST: Tune[] = [JINGLE_BELLS, CAROL_OF_THE_BELLS, WE_WISH_YOU];
