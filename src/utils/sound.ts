// Web Audio API Sound Synthesizer for Safari Game Aviator

class SoundController {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  // Play button click tap
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio fallback silent
    }
  }

  // Engine sound starts during flight
  public startEngine() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      this.stopEngine();

      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(85, this.ctx.currentTime);

      // Low pass filter to simulate deep aircraft propeller
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.engineGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.2);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
    } catch {
      // Ignore
    }
  }

  // Modulate engine pitch with multiplier
  public updateEnginePitch(multiplier: number) {
    if (this.isMuted || !this.engineOsc || !this.ctx) return;
    try {
      // Scale frequency from 85Hz at 1.00x up to 340Hz at 20x+
      const targetFreq = Math.min(420, 85 + Math.log2(Math.max(1, multiplier)) * 60);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    } catch {
      // Ignore
    }
  }

  public stopEngine() {
    try {
      if (this.engineOsc && this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
        setTimeout(() => {
          try {
            this.engineOsc?.stop();
            this.engineOsc?.disconnect();
            this.engineOsc = null;
          } catch {
            // Already stopped
          }
        }, 80);
      }
    } catch {
      // Ignore
    }
  }

  // Cashout success chime
  public playCashout() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 triumphant chord
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // Crash / Flew away sound
  public playCrash() {
    this.stopEngine();
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Noise burst + low pitch drop
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {
      // Ignore
    }
  }

  // Chicken cluck / bok-bok sound effect
  public playChickenCluck() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Pitch modulation: 600Hz down to 300Hz quick cluck
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.04);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Ignore
    }
  }

  // Car tire screech on collision
  public playCarScreech() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundController();
