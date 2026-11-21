// Old tunes free of copyright, written as notes for the music box. A note is "pitch:beats":
// "E5:1" is a quarter-note E above middle C, "Bb5:0.5" an eighth, "B4:1/3" a triplet eighth,
// "R:2" a half rest. A chord joins pitches with "+": "C3+E3+G3:4".

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
      const [pitchPart, beatsPart = ''] = token.split(':');
      const [numerator, denominator = '1'] = beatsPart.split('/');
      const beats = Number(numerator) / Number(denominator);
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

// Deck the Halls (Welsh traditional). 4/4, C major: "Deck the halls with boughs of holly,
// fa-la-la-la-la, la-la-la-la" twice, then "Don we now our gay apparel" and the last line.
const DECK_LINE = 'G5:1.5 F5:0.5 E5:1 D5:1  C5:1 D5:1 E5:1 C5:1';
const DECK_FA_LA = 'D5:0.5 E5:0.5 F5:0.5 D5:0.5 E5:1.5 D5:0.5  C5:1 B4:1 C5:2';
const DECK_CHORDS = [C_MAJOR, C_MAJOR, 'G3+B3+F4:2 C3+E3+G3:2', 'G3+B3+D4:2 C3+E3+G3:2'].join(' ');

const DECK_THE_HALLS: Tune = {
  bpm: 132,
  lines: [
    [
      DECK_LINE,
      DECK_FA_LA,
      DECK_LINE,
      DECK_FA_LA,
      'D5:1.5 E5:0.5 F5:1 D5:1  E5:1.5 F5:0.5 G5:1 D5:1',
      'E5:0.5 F#5:0.5 G5:1 A5:0.5 B5:0.5 C6:1  B5:1 A5:1 G5:2',
      DECK_LINE,
      'A5:0.5 A5:0.5 A5:0.5 A5:0.5 G5:1.5 F5:0.5  E5:1 D5:1 C5:2',
    ].join(' '),
  ],
  chords: [
    DECK_CHORDS,
    DECK_CHORDS,
    'G3+B3+F4:4 C3+E3+G3:2 G3+B3+D4:2',
    'D3+F#3+A3:2 G3+B3+D4:2 D3+F#3+C4:2 G3+B3+D4:2',
    'G3+B3+F4:2 C3+E3+G3:2',
    C_MAJOR,
    'F3+A3+C4:2 G3+B3+F4:2',
    'C3+E3+G3:1 G3+B3+F4:1 C3+E3+G3:2',
  ].join(' '),
  sleighBells: true,
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

// O Tannenbaum, known as O Christmas Tree (German traditional, words by Ernst Anschütz, 1824).
// 3/4, G major, as in the Wikipedia score: the first part, the middle part, the first part again.
const TREE_A = [
  'G5:0.75 G5:0.25 G5:1 A5:1  B5:0.75 B5:0.25 B5:1.5 B5:0.5',
  'A5:0.5 B5:0.5 C6:1 F#5:1',
].join(' ');
const TREE_A_CHORDS = 'G3+B3+D4:2 D3+F#3+A3:1 G3+B3+D4:3 A3+C4+E4:2 D3+F#3+C4:2 G3+B3+D4:1.5';

const O_CHRISTMAS_TREE: Tune = {
  bpm: 96,
  lines: [
    [
      'D5:0.5',
      TREE_A,
      'A5:1 G5:1 D6:0.5',
      'D6:0.5 B5:0.5 E6:1.5 D6:0.5  D6:0.5 C6:0.5 C6:1.5 C6:0.5',
      'C6:0.5 A5:0.5 D6:1.5 C6:0.5  C6:0.5 B5:0.5 B5:1 D5:0.5',
      TREE_A,
      'A5:1 G5:1 R:0.5',
    ].join(' '),
  ],
  chords: [
    'R:0.5',
    TREE_A_CHORDS,
    'G3+B3+F4:1 C3+E3+G3:2 D3+F#3+C4:6 G3+B3+D4:2.5',
    TREE_A_CHORDS,
  ].join(' '),
};

// Waltz of the Flowers from The Nutcracker (Pyotr Tchaikovsky, 1892): the main theme, in
// C major, with an "oom-pah-pah" waltz accompaniment on the music box.
const WALTZ_A = 'E5:2 B4:1  D5:2 A4:1  C5:2 F4:1  B4:1/3 C5:1/3 B4:1/3 A#4:1 B4:1';
const WALTZ_B = 'F5:2 C5:1  E5:2 B4:1  D5:2 G4:1  C5:1/3 D5:1/3 C5:1/3 B4:1 C5:1';
const WALTZ_BRIDGE = 'F5:2 C5:1  F5:2 C#5:1  F5:2 D5:1  G5:0.5 G4:0.5 A4:0.5 B4:0.5 C5:0.5 D5:0.5';

// One bar of "oom-pah-pah": the bass note, then the rest of the chord twice.
const oomPahPah = (bass: string, upper: string) => `${bass}:1 ${upper}:1 ${upper}:1`;
const WALTZ_C = oomPahPah('C4', 'E4+G4');
const WALTZ_DM = oomPahPah('D4', 'F4+A4');
const WALTZ_G7 = oomPahPah('G3', 'B3+F4');
const WALTZ_A_BEAT = [WALTZ_C, WALTZ_C, WALTZ_DM, WALTZ_G7].join(' ');
const WALTZ_B_BEAT = [WALTZ_DM, WALTZ_G7, WALTZ_C, WALTZ_C].join(' ');
const WALTZ_BRIDGE_BEAT = [
  oomPahPah('G#3', 'C4+F4'),
  oomPahPah('A3', 'C#4+F4'),
  oomPahPah('A#3', 'D4+F4'),
  WALTZ_G7,
].join(' ');

const CHORD_C = 'C3+E3+G3:3';
const CHORD_DM = 'D3+F3+A3:3';
const CHORD_G7 = 'G2+B2+F3:3';
const WALTZ_A_CHORDS = [CHORD_C, CHORD_C, CHORD_DM, CHORD_G7].join(' ');
const WALTZ_B_CHORDS = [CHORD_DM, CHORD_G7, CHORD_C, CHORD_C].join(' ');

const WALTZ_OF_THE_FLOWERS: Tune = {
  bpm: 160,
  lines: [
    [WALTZ_A, WALTZ_B, WALTZ_A, WALTZ_BRIDGE, WALTZ_A, WALTZ_B, 'R:3'].join(' '),
    [
      WALTZ_A_BEAT,
      WALTZ_B_BEAT,
      WALTZ_A_BEAT,
      WALTZ_BRIDGE_BEAT,
      WALTZ_A_BEAT,
      WALTZ_B_BEAT,
      'C4+E4+G4:3',
    ].join(' '),
  ],
  chords: [
    WALTZ_A_CHORDS,
    WALTZ_B_CHORDS,
    WALTZ_A_CHORDS,
    'G#2+C3+F3:3 A2+C#3+F3:3 A#2+D3+F3:3',
    CHORD_G7,
    WALTZ_A_CHORDS,
    WALTZ_B_CHORDS,
    CHORD_C,
  ].join(' '),
};

export const PLAYLIST: Tune[] = [
  JINGLE_BELLS,
  DECK_THE_HALLS,
  O_CHRISTMAS_TREE,
  WALTZ_OF_THE_FLOWERS,
  WE_WISH_YOU,
];
