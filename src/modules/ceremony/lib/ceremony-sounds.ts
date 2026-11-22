import { renderTine } from '@/modules/layout';

const VOLUME = 0.9;
// A music-box flourish when the winner appears: C major up two octaves, then the chord.
const FLOURISH = [72, 76, 79, 84, 88, 91];
const FLOURISH_STEP_SECONDS = 0.08;
const FINAL_CHORD = [72, 76, 79, 84];

// Sounds for the ceremony screen: a drum roll under "And the winner is…" and a cymbal with a
// music-box flourish when the winner is shown. Made in the browser, nothing is downloaded.
export class CeremonySounds {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private roll: GainNode | null = null;
  private readonly tines = new Map<number, AudioBuffer>();

  // Call from a click or key press: browsers only allow sound after one.
  unlock(): void {
    void this.ensureContext().resume();
  }

  drumroll(seconds: number): void {
    const context = this.ensureContext();
    this.stopDrumroll();
    const roll = context.createGain();
    roll.connect(this.output!);
    this.roll = roll;

    const start = context.currentTime + 0.05;
    for (let time = 0; time < seconds;) {
      const progress = time / seconds;
      // Faster and louder towards the end.
      this.snareHit(start + time, 0.08 + 0.3 * progress ** 1.5, roll);
      time += (0.075 - 0.04 * progress) * (0.9 + Math.random() * 0.2);
    }
  }

  stopDrumroll(): void {
    if (!this.roll || !this.context) return;
    const roll = this.roll;
    this.roll = null;
    roll.gain.setTargetAtTime(0, this.context.currentTime, 0.03);
    window.setTimeout(() => roll.disconnect(), 400);
  }

  reveal(): void {
    const context = this.ensureContext();
    this.stopDrumroll();
    const now = context.currentTime + 0.02;
    this.cymbal(now);
    this.boom(now);
    FLOURISH.forEach((midi, index) => this.tine(now + index * FLOURISH_STEP_SECONDS, midi, 0.32));
    const chordTime = now + FLOURISH.length * FLOURISH_STEP_SECONDS + 0.15;
    for (const midi of FINAL_CHORD) this.tine(chordTime, midi, 0.22);
  }

  close(): void {
    void this.context?.close();
    this.context = null;
    this.tines.clear();
  }

  private ensureContext(): AudioContext {
    if (this.context) return this.context;
    const context = new AudioContext();
    const compressor = context.createDynamicsCompressor();
    const output = context.createGain();
    output.gain.value = VOLUME;
    output.connect(compressor).connect(context.destination);

    const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;

    this.context = context;
    this.output = output;
    this.noise = noise;
    return context;
  }

  private snareHit(time: number, level: number, destination: AudioNode): void {
    const context = this.context!;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    source.buffer = this.noise;
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 0.7;
    envelope.gain.setValueAtTime(level, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
    source.connect(filter).connect(envelope).connect(destination);
    source.start(time, Math.random() * 0.8);
    source.stop(time + 0.08);
  }

  private cymbal(time: number): void {
    const context = this.context!;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    source.buffer = this.noise;
    source.loop = true;
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    envelope.gain.setValueAtTime(0.35, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 2.2);
    source.connect(filter).connect(envelope).connect(this.output!);
    source.start(time);
    source.stop(time + 2.3);
  }

  private boom(time: number): void {
    const context = this.context!;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.frequency.setValueAtTime(80, time);
    oscillator.frequency.exponentialRampToValueAtTime(40, time + 0.6);
    envelope.gain.setValueAtTime(0.5, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);
    oscillator.connect(envelope).connect(this.output!);
    oscillator.start(time);
    oscillator.stop(time + 0.85);
  }

  private tine(time: number, midi: number, level: number): void {
    const context = this.context!;
    let buffer = this.tines.get(midi);
    if (!buffer) {
      buffer = renderTine(context, midi);
      this.tines.set(midi, buffer);
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = level;
    source.connect(gain).connect(this.output!);
    source.start(time);
  }
}
