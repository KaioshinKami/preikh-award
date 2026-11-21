import { parseNotes, PLAYLIST, type ParsedNote, type Tune } from './tunes';

const VOLUME = 0.8;
const FADE_SECONDS = 0.4;
// Tunes are put on the audio clock a little before they are due, checked this often.
const SCHEDULE_AHEAD_SECONDS = 1.5;
const CHECK_EVERY_MS = 400;
const PAUSE_BETWEEN_TUNES_SECONDS = 1.2;

// A music-box tine: a few sine partials, the higher ones dying away faster.
const TINE_PARTIALS = [
  { ratio: 1, level: 1, decay: 1.8 },
  { ratio: 2, level: 0.3, decay: 0.9 },
  { ratio: 3.01, level: 0.1, decay: 0.45 },
  { ratio: 4.2, level: 0.07, decay: 0.18 },
];
const MELODY_LEVEL = 0.2;
const SECOND_VOICE_LEVEL = 0.12;
const CHORD_LEVEL = 0.045;
const SLEIGH_BELL_LEVEL = 0.03;
const REVERB_SECONDS = 2.6;

const midiToFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
// A player's small unevenness, so the box doesn't sound like a metronome.
const humanize = (seconds: number) => (Math.random() - 0.5) * 2 * seconds;

type ParsedTune = {
  bpm: number;
  lines: ParsedNote[][];
  chords: ParsedNote[];
  sleighBells: boolean;
};

const parseTune = (tune: Tune): ParsedTune => ({
  bpm: tune.bpm,
  lines: tune.lines.map(parseNotes),
  chords: parseNotes(tune.chords),
  sleighBells: tune.sleighBells ?? false,
});

function createReverb(context: AudioContext): ConvolverNode {
  const length = Math.round(context.sampleRate * REVERB_SECONDS);
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
    const samples = impulse.getChannelData(channel);
    for (let index = 0; index < length; index++) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 3;
    }
  }
  const reverb = context.createConvolver();
  reverb.buffer = impulse;
  return reverb;
}

type Graph = { context: AudioContext; voices: GainNode; output: GainNode; noise: AudioBuffer };

// New Year music made in the browser: old carols on a music box with soft chords, sleigh bells
// and a snowy echo. Nothing is downloaded. The playlist loops until paused.
export class MusicBox {
  private graph: Graph | null = null;
  private readonly tunes = PLAYLIST.map(parseTune);
  private tuneIndex = 0;
  private nextTuneTime = 0;
  private checkTimer: number | undefined;
  private suspendTimer: number | undefined;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.AudioContext === 'function';
  }

  // Must be called from a click or key press the first time: browsers keep sound off until then.
  play(): void {
    const { context, output } = this.graph ?? this.setUp();
    window.clearTimeout(this.suspendTimer);
    void context.resume();

    const now = context.currentTime;
    output.gain.cancelScheduledValues(now);
    output.gain.setValueAtTime(output.gain.value, now);
    output.gain.linearRampToValueAtTime(VOLUME, now + FADE_SECONDS);

    if (this.checkTimer === undefined) {
      this.checkTimer = window.setInterval(() => this.scheduleAhead(), CHECK_EVERY_MS);
    }
    this.scheduleAhead();
  }

  // Fades out, then freezes the audio clock, so play() carries on from the same note.
  pause(): void {
    window.clearInterval(this.checkTimer);
    this.checkTimer = undefined;
    if (!this.graph) return;

    const { context, output } = this.graph;
    const now = context.currentTime;
    output.gain.cancelScheduledValues(now);
    output.gain.setValueAtTime(output.gain.value, now);
    output.gain.linearRampToValueAtTime(0, now + FADE_SECONDS);
    this.suspendTimer = window.setTimeout(() => void context.suspend(), FADE_SECONDS * 1000 + 50);
  }

  close(): void {
    window.clearInterval(this.checkTimer);
    window.clearTimeout(this.suspendTimer);
    this.checkTimer = undefined;
    void this.graph?.context.close();
    this.graph = null;
  }

  private setUp(): Graph {
    const context = new AudioContext();
    const voices = context.createGain();
    const dry = context.createGain();
    const wet = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const output = context.createGain();
    dry.gain.value = 0.85;
    wet.gain.value = 0.3;
    output.gain.value = 0;

    voices.connect(dry).connect(compressor);
    voices.connect(createReverb(context)).connect(wet).connect(compressor);
    compressor.connect(output).connect(context.destination);

    const noise = context.createBuffer(1, Math.round(context.sampleRate * 0.2), context.sampleRate);
    const noiseSamples = noise.getChannelData(0);
    for (let index = 0; index < noiseSamples.length; index++) {
      noiseSamples[index] = Math.random() * 2 - 1;
    }

    this.graph = { context, voices, output, noise };
    return this.graph;
  }

  private scheduleAhead(): void {
    if (!this.graph) return;
    const now = this.graph.context.currentTime;
    while (this.nextTuneTime < now + SCHEDULE_AHEAD_SECONDS) {
      if (this.nextTuneTime < now) this.nextTuneTime = now + 0.15;
      const end = this.scheduleTune(this.tunes[this.tuneIndex], this.nextTuneTime);
      this.nextTuneTime = end + PAUSE_BETWEEN_TUNES_SECONDS;
      this.tuneIndex = (this.tuneIndex + 1) % this.tunes.length;
    }
  }

  // Puts a whole tune on the audio clock from `start` and returns when it ends.
  private scheduleTune(tune: ParsedTune, start: number): number {
    const beatSeconds = 60 / tune.bpm;
    let end = start;

    tune.lines.forEach((line, lineIndex) => {
      const level = lineIndex === 0 ? MELODY_LEVEL : SECOND_VOICE_LEVEL;
      let time = start;
      for (const note of line) {
        for (const pitch of note.pitches) {
          this.tine(time + humanize(0.006), pitch, level * (0.88 + Math.random() * 0.24));
        }
        time += note.beats * beatSeconds;
      }
      end = Math.max(end, time);
    });

    let time = start;
    for (const chord of tune.chords) {
      if (chord.pitches.length > 0) this.chord(time, chord.pitches, chord.beats * beatSeconds);
      time += chord.beats * beatSeconds;
    }

    if (tune.sleighBells) {
      for (let beat = 0; start + beat * beatSeconds < end; beat++) {
        this.sleighBell(start + beat * beatSeconds, beat % 2 === 1);
      }
    }
    return end;
  }

  private tine(time: number, midi: number, level: number): void {
    const { context, voices } = this.graph!;
    const frequency = midiToFrequency(midi);
    for (const partial of TINE_PARTIALS) {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.frequency.value = frequency * partial.ratio;
      envelope.gain.setValueAtTime(0, time);
      envelope.gain.linearRampToValueAtTime(level * partial.level, time + 0.004);
      envelope.gain.exponentialRampToValueAtTime(0.0001, time + partial.decay);
      oscillator.connect(envelope).connect(voices);
      oscillator.start(time);
      oscillator.stop(time + partial.decay + 0.05);
    }
  }

  private chord(time: number, pitches: number[], seconds: number): void {
    const { context, voices } = this.graph!;
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(CHORD_LEVEL, time + 0.12);
    envelope.gain.linearRampToValueAtTime(CHORD_LEVEL * 0.6, time + seconds);
    envelope.gain.linearRampToValueAtTime(0, time + seconds + 0.6);
    filter.connect(envelope).connect(voices);

    for (const pitch of pitches) {
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.value = midiToFrequency(pitch);
      oscillator.connect(filter);
      oscillator.start(time);
      oscillator.stop(time + seconds + 0.7);
    }
  }

  private sleighBell(time: number, isAccent: boolean): void {
    const { context, voices, noise } = this.graph!;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    source.buffer = noise;
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const level = SLEIGH_BELL_LEVEL * (isAccent ? 1.6 : 1);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(level, time + 0.002);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
    source.connect(filter).connect(envelope).connect(voices);
    source.start(time);
    source.stop(time + 0.16);
  }
}
