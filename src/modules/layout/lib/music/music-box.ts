import { parseNotes, PLAYLIST, type Tune } from './tunes';

const VOLUME = 0.8;
const FADE_SECONDS = 0.4;
// Notes are put on the audio clock only this far ahead, so the browser only ever holds the few
// notes about to sound: a phone can't keep up with a whole tune of notes waiting at once.
const SCHEDULE_AHEAD_SECONDS = 1.5;
const CHECK_EVERY_MS = 250;
// A note that comes due during a long freeze of the page is dropped rather than played late.
const LATE_NOTE_SECONDS = 0.25;
const PAUSE_BETWEEN_TUNES_SECONDS = 1.2;
const START_LEAD_SECONDS = 0.15;

// A music-box tine: a few sine partials, the higher ones dying away faster.
const TINE_PARTIALS = [
  { ratio: 1, level: 1, decay: 1.8 },
  { ratio: 2, level: 0.3, decay: 0.9 },
  { ratio: 3.01, level: 0.1, decay: 0.45 },
  { ratio: 4.2, level: 0.07, decay: 0.18 },
];
const TINE_ATTACK_SECONDS = 0.004;
// The fundamental is quieter than a thousandth of its start by then.
const TINE_SECONDS = 1.6;
const MELODY_LEVEL = 0.2;
const SECOND_VOICE_LEVEL = 0.12;
const CHORD_LEVEL = 0.045;
const SLEIGH_BELL_LEVEL = 0.03;
// A short mono echo: a long stereo one is one of the heaviest things a phone can be asked to do.
const REVERB_SECONDS = 1.6;

const midiToFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
// A player's small unevenness, so the box doesn't sound like a metronome.
const humanize = (seconds: number) => (Math.random() - 0.5) * 2 * seconds;

type MusicEvent =
  | { time: number; kind: 'tine'; pitch: number; level: number }
  | { time: number; kind: 'chord'; pitches: number[]; seconds: number }
  | { time: number; kind: 'sleighBell'; isAccent: boolean };

// Every note of a tune starting at `start`, in time order, and when the tune ends.
function tuneEvents(tune: Tune, start: number): { events: MusicEvent[]; end: number } {
  const beatSeconds = 60 / tune.bpm;
  const events: MusicEvent[] = [];
  let end = start;

  tune.lines.forEach((line, lineIndex) => {
    const level = lineIndex === 0 ? MELODY_LEVEL : SECOND_VOICE_LEVEL;
    let time = start;
    for (const note of parseNotes(line)) {
      for (const pitch of note.pitches) {
        events.push({
          time: time + humanize(0.006),
          kind: 'tine',
          pitch,
          level: level * (0.88 + Math.random() * 0.24),
        });
      }
      time += note.beats * beatSeconds;
    }
    end = Math.max(end, time);
  });

  let time = start;
  for (const chord of parseNotes(tune.chords)) {
    const seconds = chord.beats * beatSeconds;
    if (chord.pitches.length > 0) {
      events.push({ time, kind: 'chord', pitches: chord.pitches, seconds });
    }
    time += seconds;
  }

  if (tune.sleighBells) {
    for (let beat = 0; start + beat * beatSeconds < end; beat++) {
      events.push({
        time: start + beat * beatSeconds,
        kind: 'sleighBell',
        isAccent: beat % 2 === 1,
      });
    }
  }

  events.sort((first, second) => first.time - second.time);
  return { events, end };
}

// One tine, written out once as samples, so playing it later is a single cheap buffer instead of
// four oscillators with their envelopes.
export function renderTine(context: BaseAudioContext, midi: number): AudioBuffer {
  const { sampleRate } = context;
  const length = Math.ceil(sampleRate * TINE_SECONDS);
  const buffer = context.createBuffer(1, length, sampleRate);
  const samples = buffer.getChannelData(0);
  const frequency = midiToFrequency(midi);
  const attackSamples = TINE_ATTACK_SECONDS * sampleRate;

  for (const partial of TINE_PARTIALS) {
    const step = (2 * Math.PI * frequency * partial.ratio) / sampleRate;
    const decaySamples = partial.decay * sampleRate;
    // Fades to the same quietness the melody's notes used to fade to.
    const finalLevel = 0.0001 / (MELODY_LEVEL * partial.level);
    const fadePerSample = finalLevel ** (1 / (decaySamples - attackSamples));
    const end = Math.min(length, Math.ceil(decaySamples));
    let fading = partial.level;
    for (let index = 0; index < end; index++) {
      let envelope: number;
      if (index < attackSamples) {
        envelope = (partial.level * index) / attackSamples;
      } else {
        envelope = fading;
        fading *= fadePerSample;
      }
      samples[index] += envelope * Math.sin(step * index);
    }
  }
  return buffer;
}

function createReverb(context: AudioContext): ConvolverNode {
  const length = Math.round(context.sampleRate * REVERB_SECONDS);
  const impulse = context.createBuffer(1, length, context.sampleRate);
  const samples = impulse.getChannelData(0);
  for (let index = 0; index < length; index++) {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 3;
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
  private readonly tines = new Map<number, AudioBuffer>();
  private tuneIndex = 0;
  private nextTuneTime = 0;
  // Notes of the tune being played that are not on the audio clock yet.
  private pending: MusicEvent[] = [];
  private pendingIndex = 0;
  private checkTimer: number | undefined;
  private suspendTimer: number | undefined;
  private readonly runningListeners = new Set<(isRunning: boolean) => void>();

  static isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.AudioContext === 'function';
  }

  // Tells when sound actually starts and stops. Until the visitor clicks or presses a key on the
  // page, a browser usually keeps the sound off however often play() is called.
  onRunningChange(listener: (isRunning: boolean) => void): () => void {
    this.runningListeners.add(listener);
    return () => this.runningListeners.delete(listener);
  }

  isRunning(): boolean {
    return this.graph?.context.state === 'running';
  }

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
    this.tines.clear();
  }

  private setUp(): Graph {
    const context = new AudioContext();
    context.addEventListener('statechange', () => {
      const isRunning = context.state === 'running';
      for (const listener of this.runningListeners) listener(isRunning);
    });
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

  // Puts the notes of the next moments on the audio clock, moving on to the next tune when the
  // current one runs out.
  private scheduleAhead(): void {
    if (!this.graph) return;
    const now = this.graph.context.currentTime;
    const horizon = now + SCHEDULE_AHEAD_SECONDS;

    for (;;) {
      if (this.pendingIndex >= this.pending.length) {
        // A fresh audio clock stands at 0: leave room so no note lands before "now".
        if (this.nextTuneTime < now + START_LEAD_SECONDS) {
          this.nextTuneTime = now + START_LEAD_SECONDS;
        }
        if (this.nextTuneTime > horizon) return;
        const { events, end } = tuneEvents(PLAYLIST[this.tuneIndex], this.nextTuneTime);
        this.pending = events;
        this.pendingIndex = 0;
        this.nextTuneTime = end + PAUSE_BETWEEN_TUNES_SECONDS;
        this.tuneIndex = (this.tuneIndex + 1) % PLAYLIST.length;
        continue;
      }

      const event = this.pending[this.pendingIndex];
      if (event.time > horizon) return;
      this.pendingIndex++;
      if (event.time < now - LATE_NOTE_SECONDS) continue;
      this.start(event, Math.max(event.time, now));
    }
  }

  private start(event: MusicEvent, time: number): void {
    if (event.kind === 'tine') this.tine(time, event.pitch, event.level);
    else if (event.kind === 'chord') this.chord(time, event.pitches, event.seconds);
    else this.sleighBell(time, event.isAccent);
  }

  private tine(time: number, midi: number, level: number): void {
    const { context, voices } = this.graph!;
    let buffer = this.tines.get(midi);
    if (!buffer) {
      buffer = renderTine(context, midi);
      this.tines.set(midi, buffer);
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = level;
    source.connect(gain).connect(voices);
    source.start(time);
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
