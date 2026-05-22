// Web Audio synth — SFX puros sem files externos.
// Toggle via localStorage("sfxEnabled" === "true"). Silencio por padrao.

const STORAGE_KEY = "sfxEnabled";

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor: typeof AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    _ctx = new Ctor();
    return _ctx;
  } catch {
    return null;
  }
}

export function isSfxEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSfxEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent("sfx:toggle", { detail: { enabled } }));
  } catch {
    // ignore
  }
}

// Helper — agenda envelope ADSR-ish simples num GainNode
function envelope(
  gain: GainNode,
  startAt: number,
  peak: number,
  attack: number,
  release: number,
) {
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + attack + release);
}

// Garante que o context esta "running" (browsers exigem gesto do user pra liberar)
function resume(ctx: AudioContext): void {
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
}

/**
 * SWOOSH — sliding sine 800→200Hz, ~100ms. Pra abrir mini-cart.
 */
export function playSwoosh(): void {
  if (!isSfxEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  resume(ctx);

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
  envelope(gain, now, 0.18, 0.01, 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * DING — sine 800Hz puro, ~80ms. Pra confirmar toggle.
 */
export function playDing(): void {
  if (!isSfxEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  resume(ctx);

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  envelope(gain, now, 0.2, 0.005, 0.08);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * BAM — square wave low + envelope agressivo. Pra "adicionar ao carrinho".
 */
export function playBam(): void {
  if (!isSfxEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  resume(ctx);

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
  envelope(gain, now, 0.22, 0.005, 0.18);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

/**
 * POW — noise burst + filter sweep. Combo BAM impactante pra add-to-cart.
 */
export function playPow(): void {
  if (!isSfxEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  resume(ctx);

  const now = ctx.currentTime;

  // Camada 1: noise burst
  const bufferSize = Math.floor(ctx.sampleRate * 0.18);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(2400, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(300, now + 0.18);
  const noiseGain = ctx.createGain();
  envelope(noiseGain, now, 0.18, 0.003, 0.17);
  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  noise.start(now);

  // Camada 2: square sub pra body
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
  const oscGain = ctx.createGain();
  envelope(oscGain, now, 0.2, 0.005, 0.14);
  osc.connect(oscGain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}
