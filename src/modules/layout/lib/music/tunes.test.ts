import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countBeats, parseNotes, PLAYLIST, toMidi } from './tunes.ts';

test('pitch names turn into MIDI note numbers', () => {
  assert.equal(toMidi('C4'), 60);
  assert.equal(toMidi('A4'), 69);
  assert.equal(toMidi('Bb5'), 82);
  assert.equal(toMidi('F#3'), 54);
});

test('notes, chords and rests are read with their lengths', () => {
  assert.deepEqual(parseNotes('E5:1 R:0.5 C3+E3+G3:4'), [
    { pitches: [76], beats: 1 },
    { pitches: [], beats: 0.5 },
    { pitches: [48, 52, 55], beats: 4 },
  ]);
  assert.throws(() => parseNotes('H5:1'));
  assert.throws(() => parseNotes('C5'));
});

test('in every tune the melody lines and the chords last equally long', () => {
  for (const tune of PLAYLIST) {
    const chordBeats = countBeats(parseNotes(tune.chords));
    for (const line of tune.lines) {
      assert.equal(countBeats(parseNotes(line)), chordBeats);
    }
  }
});
