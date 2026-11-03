/** Call play from a user gesture. No audio context or network activity at import time. */
export type SoundName = 'place' | 'remove' | 'cast' | 'flip' | 'win' | 'lose' | 'resonance' | 'damage';
const STORAGE_KEY = 'the-last-constant:muted';
let muted = false;
try { muted = localStorage.getItem(STORAGE_KEY) === 'true'; } catch { /* Storage may be unavailable. */ }
let context: AudioContext | undefined;
let master: GainNode | undefined;
let lastPlay = -Infinity;

export function isMuted(): boolean { return muted; }
export function setMuted(value: boolean): void {
  muted = value;
  try { localStorage.setItem(STORAGE_KEY, String(value)); } catch { /* In-memory mute still works. */ }
  if (context && master) {
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(muted ? 0 : 0.12, context.currentTime, 0.008);
  }
}

function chime(ctx: AudioContext, output: GainNode, frequency: number, start: number, duration: number, volume = 0.5) {
  const voice = ctx.createOscillator(); const envelope = ctx.createGain();
  voice.type = 'sine'; voice.frequency.setValueAtTime(frequency, start);
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(volume, start + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
  voice.connect(envelope); envelope.connect(output);
  voice.onended = () => { voice.disconnect(); envelope.disconnect(); };
  voice.start(start); voice.stop(start + duration + 0.01);
}

function paper(ctx: AudioContext, output: GainNode, start: number, duration: number, frequency: number) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
  const source = ctx.createBufferSource(); const filter = ctx.createBiquadFilter(); const envelope = ctx.createGain();
  source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = 0.7;
  envelope.gain.setValueAtTime(0, start); envelope.gain.linearRampToValueAtTime(0.18, start + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
  source.connect(filter); filter.connect(envelope); envelope.connect(output);
  source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect(); };
  source.start(start); source.stop(start + duration + 0.01);
}

const NOTES: Record<SoundName, readonly [number, number, number][]> = {
  place: [[523.25, 0, 0.13]], remove: [[392, 0, 0.14]],
  cast: [[392, 0, 0.22], [587.33, 0.07, 0.25], [783.99, 0.14, 0.28]],
  flip: [[659.25, 0.02, 0.14]],
  win: [[523.25, 0, 0.24], [659.25, 0.09, 0.25], [783.99, 0.18, 0.32]],
  lose: [[392, 0, 0.22], [329.63, 0.1, 0.27], [261.63, 0.2, 0.3]],
  resonance: [[523.25, 0, 0.4], [659.25, 0.055, 0.4], [783.99, 0.11, 0.4], [1046.5, 0.165, 0.39]],
  damage: [[196, 0, 0.17], [293.66, 0.025, 0.12]],
};

export function play(name: SoundName): void {
  if (muted || typeof window === 'undefined' || !NOTES[name]) return;
  try {
    if (!context || context.state === 'closed') {
      if (!window.AudioContext) return;
      context = new window.AudioContext(); master = context.createGain();
      master.gain.value = 0.12; master.connect(context.destination);
    }
    const ctx = context; const output = master!;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    const start = ctx.currentTime;
    if (start - lastPlay < 0.025) return; // Suppress accidental double clicks.
    lastPlay = start;
    if (name === 'place' || name === 'remove' || name === 'flip') paper(ctx, output, start, 0.085, name === 'flip' ? 1600 : 950);
    for (const [frequency, delay, duration] of NOTES[name]) chime(ctx, output, frequency, start + delay, duration, name === 'resonance' ? 0.3 : 0.45);
  } catch { /* Missing/blocked Web Audio must never prevent a move. */ }
}
