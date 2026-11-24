// src/lib/soundEngine.ts

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureCtx(): AudioContext | null {
    if (this.muted || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playClick() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.045);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playDiceTick() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const freqs = [340, 440, 560, 700];
    freqs.forEach((f, idx) => {
      const now = ctx.currentTime + idx * 0.04;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    });
  }

  public playCopySuccess() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [587.33, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.14, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.17);
    });
  }

  // Camera shutter snap + heavy Vine Boom bass drop + alert ping
  public playCaught4K() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Double camera shutter noise burst
    [0, 0.075].forEach((offset) => {
      const bufferSize = Math.floor(ctx.sampleRate * 0.045);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2400, now + offset);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now + offset);
    });

    // 2. Heavy Vine Boom sub drop
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = "sine";
    boomOsc.frequency.setValueAtTime(165, now + 0.04);
    boomOsc.frequency.exponentialRampToValueAtTime(34, now + 0.85);

    boomGain.gain.setValueAtTime(0.001, now + 0.03);
    boomGain.gain.linearRampToValueAtTime(0.85, now + 0.06);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.05);

    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start(now + 0.03);
    boomOsc.stop(now + 1.1);

    // 3. Punchy saw overtone on impact
    const hitOsc = ctx.createOscillator();
    const hitGain = ctx.createGain();
    hitOsc.type = "sawtooth";
    hitOsc.frequency.setValueAtTime(110, now + 0.05);
    hitOsc.frequency.exponentialRampToValueAtTime(42, now + 0.35);
    hitGain.gain.setValueAtTime(0.18, now + 0.05);
    hitGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    hitOsc.connect(hitGain);
    hitGain.connect(ctx.destination);
    hitOsc.start(now + 0.05);
    hitOsc.stop(now + 0.38);

    // 4. Short siren chirp
    const siren = ctx.createOscillator();
    const sirenGain = ctx.createGain();
    siren.type = "square";
    siren.frequency.setValueAtTime(880, now + 0.14);
    siren.frequency.setValueAtTime(660, now + 0.26);
    sirenGain.gain.setValueAtTime(0.08, now + 0.14);
    sirenGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    siren.connect(sirenGain);
    sirenGain.connect(ctx.destination);
    siren.start(now + 0.14);
    siren.stop(now + 0.43);
  }
}

export const soundFX = new SoundEngine();