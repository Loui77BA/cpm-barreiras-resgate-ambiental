/**
 * AudioManager - Generates all game sounds and music programmatically
 * using the Web Audio API in 8-bit chiptune style.
 */
export class AudioManager {
  private static instance: AudioManager;
  private ctx!: AudioContext;
  private masterGain!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;
  private currentMusic: OscillatorNode[] = [];
  private musicTimer: number | null = null;
  private isMuted = false;
  private musicMuted = false;
  private _musicVolume = 0.25;
  private _sfxVolume = 0.4;
  private isInitialized = false;
  private currentMusicKey = '';
  private pendingMusicKey = '';
  private pendingMusicMelody: MelodyNote[] | null = null;
  private lastSfxTime: Map<string, number> = new Map();
  private sfxCooldown = 50; // ms between identical sounds
  private contextReady = false;
  private interactionBound = false;
  private fadeCounter = 0;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  init(): void {
    if (this.isInitialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.6;

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = this._musicVolume;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = this._sfxVolume;

      this.isInitialized = true;

      if (this.ctx.state === 'running') {
        this.contextReady = true;
      } else {
        this.setupInteractionResume();
      }
    } catch {
      console.warn('Web Audio API not available');
    }
  }

  private setupInteractionResume(): void {
    if (this.interactionBound) return;
    this.interactionBound = true;

    const resume = () => {
      if (!this.ctx) return;
      this.ctx.resume().then(() => {
        this.contextReady = true;
        // Replay pending music that was requested before context was ready
        if (this.pendingMusicMelody && this.pendingMusicKey) {
          this.currentMusicKey = ''; // Reset so playMusicLoop doesn't skip
          this.playMusicLoop(this.pendingMusicKey, this.pendingMusicMelody);
          this.pendingMusicKey = '';
          this.pendingMusicMelody = null;
        }
      });
      document.removeEventListener('click', resume);
      document.removeEventListener('touchstart', resume);
      document.removeEventListener('keydown', resume);
      document.removeEventListener('pointerdown', resume);
    };

    document.addEventListener('click', resume);
    document.addEventListener('touchstart', resume);
    document.addEventListener('keydown', resume);
    document.addEventListener('pointerdown', resume);
  }

  private ensureContext(): boolean {
    if (!this.isInitialized) return false;
    if (this.ctx.state === 'running') {
      this.contextReady = true;
      return true;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.contextReady = true;
      });
    }
    return this.contextReady;
  }

  private canPlaySfx(key: string): boolean {
    const now = performance.now();
    const last = this.lastSfxTime.get(key) || 0;
    if (now - last < this.sfxCooldown) return false;
    this.lastSfxTime.set(key, now);
    return true;
  }

  // ===== SOUND EFFECTS =====

  playJump(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playCoin(): void {
    if (!this.ensureContext() || !this.canPlaySfx('coin')) return;
    const now = this.ctx.currentTime;
    // Two-note ascending chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'square';
    osc2.type = 'square';
    osc1.frequency.value = 988; // B5
    osc2.frequency.value = 1319; // E6
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.1);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.3);
  }

  playStomp(): void {
    if (!this.ensureContext() || !this.canPlaySfx('stomp')) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playPowerUp(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.15);
    });
  }

  playDamage(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;

    // Main descending tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.3);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.35);

    // Noise burst layer for impact
    const noiseOsc = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();
    noiseOsc.type = 'sawtooth';
    noiseOsc.frequency.setValueAtTime(180, now);
    noiseOsc.frequency.linearRampToValueAtTime(40, now + 0.15);
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.linearRampToValueAtTime(0, now + 0.15);
    noiseOsc.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noiseOsc.start(now);
    noiseOsc.stop(now + 0.15);

    // Music ducking — briefly lower music volume
    this.duckMusic(0.5);
  }

  /** Temporarily duck music volume, then restore */
  private duckMusic(durationSec = 0.5): void {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const currentVol = this.musicMuted ? 0 : this._musicVolume;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(currentVol, now);
    this.musicGain.gain.linearRampToValueAtTime(currentVol * 0.3, now + 0.05);
    this.musicGain.gain.linearRampToValueAtTime(currentVol, now + durationSec);
  }

  playDeath(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const notes = [784, 698, 622, 523, 440, 349, 262]; // descending
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.14);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.14);
    });
    this.duckMusic(1.0);
  }

  playBlockHit(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(350, now + 0.06);
    osc.frequency.linearRampToValueAtTime(200, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playBlockBreak(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    // Noise-like break sound with square wave
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.18);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playShoot(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playFlagPole(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    // Victory fanfare ascending
    const notes = [523, 659, 784, 1047, 1319, 1568, 2093]; // C5 to C7
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.08 + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.12);
    });
    // Sustained final note
    const fin = this.ctx.createOscillator();
    const finGain = this.ctx.createGain();
    fin.type = 'square';
    fin.frequency.value = 2093;
    finGain.gain.setValueAtTime(0.15, now + 0.56);
    finGain.gain.linearRampToValueAtTime(0, now + 1.5);
    fin.connect(finGain);
    finGain.connect(this.sfxGain);
    fin.start(now + 0.56);
    fin.stop(now + 1.5);
  }

  playBossHit(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  play1Up(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const notes = [330, 392, 523, 659, 784, 1047]; // E4-C6 ascending
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + i * 0.07);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.07 + 0.1);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.1);
    });
  }

  playMenuSelect(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playMenuConfirm(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const notes = [523, 784]; // C5, G5
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.08 + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.12);
    });
  }

  playFootstep(): void {
    if (!this.ensureContext() || !this.canPlaySfx('footstep')) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 80 + Math.random() * 40;
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playShellKick(): void {
    if (!this.ensureContext() || !this.canPlaySfx('shellkick')) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playTimeTick(urgent = false): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = urgent ? 880 : 660;
    gain.gain.setValueAtTime(urgent ? 0.2 : 0.12, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.06);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playPause(): void {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // ===== MUSIC =====

  stopMusic(fade = false): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.currentMusicKey = '';
    this.pendingMusicKey = '';
    this.pendingMusicMelody = null;

    if (fade && this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      const currentVol = this.musicMuted ? 0 : this._musicVolume;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(currentVol, now);
      this.musicGain.gain.linearRampToValueAtTime(0, now + 0.4);
      // Stop oscillators after fade completes
      const oscsToStop = [...this.currentMusic];
      this.currentMusic = [];
      const fadeId = ++this.fadeCounter;
      setTimeout(() => {
        oscsToStop.forEach(osc => {
          try { osc.stop(); } catch { /* already stopped */ }
        });
        // Only restore gain if no new music was started during fade
        if (this.musicGain && this.fadeCounter === fadeId && !this.currentMusicKey) {
          this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
          this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this._musicVolume, this.ctx.currentTime);
        }
      }, 500);
    } else {
      const now = this.ctx?.currentTime ?? 0;
      this.currentMusic.forEach(osc => {
        try { osc.stop(now); } catch { /* already stopped */ }
      });
      this.currentMusic = [];
    }
  }

  playTitleMusic(): void {
    this.playMusicLoop('title', this.titleMelody());
  }

  playLevelMusic(levelIndex: number): void {
    const key = `level-${levelIndex}`;
    if (levelIndex === 3) {
      this.playMusicLoop(key, this.bossMelody());
    } else if (levelIndex === 1) {
      this.playMusicLoop(key, this.undergroundMelody());
    } else if (levelIndex === 2) {
      // Forest level: slower tempo variation of overworld
      const melody = this.overworldMelody().map(n => ({
        ...n,
        duration: n.duration * 1.15, // slightly slower, more peaceful
        wave: (n.freq > 0 ? 'triangle' : undefined) as OscillatorType | undefined, // softer timbre
      }));
      this.playMusicLoop(key, melody);
    } else {
      this.playMusicLoop(key, this.overworldMelody());
    }
  }

  playVictoryMusic(): void {
    this.playMusicLoop('victory', this.victoryMelody());
  }

  playGameOverMusic(): void {
    this.stopMusic();
    this.currentMusicKey = 'gameover';
    if (!this.ensureContext()) {
      this.pendingMusicKey = 'gameover';
      this.pendingMusicMelody = this.gameOverMelody();
      return;
    }
    // Single play, no loop
    const melody = this.gameOverMelody();
    this.playMelodyOnce(melody);
  }

  private playMusicLoop(key: string, melody: MelodyNote[]): void {
    if (this.currentMusicKey === key) return;

    // If context not ready yet, store pending music to play when it resumes
    if (!this.ensureContext()) {
      this.pendingMusicKey = key;
      this.pendingMusicMelody = melody;
      return;
    }

    this.stopMusic();
    this.currentMusicKey = key;

    // Ensure music gain is restored (in case previous stopMusic(true) faded it out)
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this._musicVolume, this.ctx.currentTime);
    }

    const totalDuration = melody.reduce((sum, n) => sum + n.duration, 0);
    this.playMelodyOnce(melody);

    this.musicTimer = window.setInterval(() => {
      if (this.currentMusicKey !== key) return;
      // Keep only recent oscillators to prevent memory leak
      // Old ones have already naturally stopped via osc.stop()
      const maxOscillators = melody.length * 4;
      if (this.currentMusic.length > maxOscillators) {
        this.currentMusic = this.currentMusic.slice(-melody.length * 2);
      }
      this.playMelodyOnce(melody);
    }, totalDuration * 1000 + 200);
  }

  private playMelodyOnce(melody: MelodyNote[]): void {
    if (!this.ensureContext() || this.musicMuted) return;
    const now = this.ctx.currentTime;
    let offset = 0;
    if (this.isMuted) return;

    for (const note of melody) {
      if (note.freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = note.wave || 'square';
        osc.frequency.value = note.freq;
        gain.gain.setValueAtTime(0.15, now + offset);
        gain.gain.setValueAtTime(0.15, now + offset + note.duration * 0.8);
        gain.gain.linearRampToValueAtTime(0, now + offset + note.duration);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now + offset);
        osc.stop(now + offset + note.duration);
        this.currentMusic.push(osc);

        // Add bass harmony for fuller sound
        if (note.bass) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.value = note.bass;
          bassGain.gain.setValueAtTime(0.08, now + offset);
          bassGain.gain.linearRampToValueAtTime(0, now + offset + note.duration);
          bassOsc.connect(bassGain);
          bassGain.connect(this.musicGain);
          bassOsc.start(now + offset);
          bassOsc.stop(now + offset + note.duration);
          this.currentMusic.push(bassOsc);
        }
      }
      offset += note.duration;
    }
  }

  // ===== MELODIES =====

  private titleMelody(): MelodyNote[] {
    const q = 0.2;
    const e = 0.3;
    const h = 0.5;
    const w = 0.8;
    // Cheerful 8-bit theme in C major - extended
    return [
      // Phrase 1: Iconic opening
      { freq: 523, duration: e, bass: 131 }, // C5
      { freq: 523, duration: q, bass: 131 },
      { freq: 0, duration: q },
      { freq: 523, duration: e, bass: 131 },
      { freq: 0, duration: q },
      { freq: 415, duration: e, bass: 131 }, // Ab4
      { freq: 523, duration: h, bass: 131 },
      { freq: 659, duration: h, bass: 165 }, // E5
      { freq: 0, duration: q },
      { freq: 784, duration: h, bass: 196 }, // G5
      { freq: 0, duration: h },
      { freq: 392, duration: h, bass: 196 }, // G4
      { freq: 0, duration: h },

      // Phrase 2
      { freq: 523, duration: h, bass: 175 }, // C5
      { freq: 0, duration: q },
      { freq: 392, duration: e, bass: 131 }, // G4
      { freq: 0, duration: q },
      { freq: 330, duration: e, bass: 110 }, // E4
      { freq: 0, duration: q },
      { freq: 440, duration: e, bass: 147 }, // A4
      { freq: 494, duration: e, bass: 165 }, // B4
      { freq: 0, duration: q },
      { freq: 466, duration: e, bass: 156 }, // Bb4
      { freq: 440, duration: h, bass: 147 }, // A4

      // Phrase 3: Ascending run
      { freq: 392, duration: e, bass: 131 }, // G4
      { freq: 523, duration: e, bass: 165 }, // C5
      { freq: 659, duration: e, bass: 196 }, // E5
      { freq: 784, duration: h, bass: 220 }, // G5
      { freq: 698, duration: e, bass: 196 }, // F5
      { freq: 659, duration: e, bass: 165 }, // E5
      { freq: 0, duration: q },
      { freq: 523, duration: e, bass: 165 }, // C5
      { freq: 440, duration: e, bass: 147 }, // A4
      { freq: 392, duration: e, bass: 131 }, // G4
      { freq: 0, duration: h },

      // Phrase 4: Bridge - F major section
      { freq: 349, duration: e, bass: 175 }, // F4
      { freq: 440, duration: e, bass: 175 }, // A4
      { freq: 523, duration: h, bass: 175 }, // C5
      { freq: 440, duration: e, bass: 175 }, // A4
      { freq: 523, duration: e, bass: 175 }, // C5
      { freq: 587, duration: h, bass: 175 }, // D5
      { freq: 0, duration: q },

      // Phrase 5: G major descent
      { freq: 784, duration: e, bass: 196 }, // G5
      { freq: 698, duration: e, bass: 196 }, // F5
      { freq: 659, duration: e, bass: 165 }, // E5
      { freq: 523, duration: h, bass: 165 }, // C5
      { freq: 440, duration: e, bass: 147 }, // A4
      { freq: 494, duration: e, bass: 147 }, // B4
      { freq: 523, duration: w, bass: 131 }, // C5
      { freq: 0, duration: h },

      // Phrase 6: Repeat opening variation
      { freq: 659, duration: e, bass: 131 }, // E5
      { freq: 659, duration: q, bass: 131 },
      { freq: 0, duration: q },
      { freq: 659, duration: e, bass: 131 },
      { freq: 0, duration: q },
      { freq: 523, duration: e, bass: 131 }, // C5
      { freq: 659, duration: h, bass: 165 }, // E5
      { freq: 784, duration: h, bass: 196 }, // G5
      { freq: 0, duration: q },
      { freq: 1047, duration: w, bass: 262 }, // C6
      { freq: 0, duration: h },

      // Phrase 7: Outro
      { freq: 784, duration: e, bass: 196 }, // G5
      { freq: 659, duration: e, bass: 165 }, // E5
      { freq: 523, duration: e, bass: 131 }, // C5
      { freq: 440, duration: e, bass: 110 }, // A4
      { freq: 494, duration: e, bass: 123 }, // B4
      { freq: 523, duration: w, bass: 131 }, // C5
      { freq: 0, duration: w },
    ];
  }

  private overworldMelody(): MelodyNote[] {
    const q = 0.15;
    const e = 0.22;
    const h = 0.35;
    const w = 0.5;
    // Upbeat adventure theme - extended
    return [
      // Section A: Main theme
      { freq: 659, duration: e, bass: 165 }, // E5
      { freq: 659, duration: e, bass: 165 },
      { freq: 0, duration: q },
      { freq: 659, duration: e, bass: 165 },
      { freq: 0, duration: q },
      { freq: 523, duration: e, bass: 131 }, // C5
      { freq: 659, duration: h, bass: 165 }, // E5
      { freq: 784, duration: h, bass: 196 }, // G5
      { freq: 0, duration: h },
      { freq: 392, duration: h, bass: 98 }, // G4
      { freq: 0, duration: h },

      // Section B: Descending
      { freq: 523, duration: h, bass: 131 }, // C5
      { freq: 0, duration: q },
      { freq: 392, duration: e, bass: 98 }, // G4
      { freq: 0, duration: e },
      { freq: 330, duration: h, bass: 82 }, // E4

      { freq: 440, duration: e, bass: 110 }, // A4
      { freq: 494, duration: e, bass: 123 }, // B4
      { freq: 466, duration: q, bass: 117 }, // Bb4
      { freq: 440, duration: h, bass: 110 }, // A4

      // Section C: Ascending run
      { freq: 392, duration: e, bass: 131 }, // G4
      { freq: 523, duration: e, bass: 165 }, // C5
      { freq: 659, duration: e, bass: 196 }, // E5
      { freq: 784, duration: h, bass: 220 }, // G5
      { freq: 698, duration: e, bass: 196 }, // F5
      { freq: 659, duration: h, bass: 165 }, // E5

      { freq: 523, duration: e, bass: 131 }, // C5
      { freq: 440, duration: e, bass: 110 }, // A4
      { freq: 392, duration: h, bass: 98 }, // G4
      { freq: 0, duration: h },

      // Section D: Bridge - new melodic material
      { freq: 523, duration: e, bass: 175 }, // C5 over F bass
      { freq: 587, duration: e, bass: 175 }, // D5
      { freq: 659, duration: h, bass: 175 }, // E5
      { freq: 587, duration: e, bass: 175 }, // D5
      { freq: 523, duration: e, bass: 175 }, // C5
      { freq: 0, duration: q },

      { freq: 494, duration: e, bass: 196 }, // B4 over G bass
      { freq: 523, duration: e, bass: 196 }, // C5
      { freq: 587, duration: h, bass: 196 }, // D5
      { freq: 0, duration: q },
      { freq: 784, duration: e, bass: 196 }, // G5
      { freq: 698, duration: e, bass: 175 }, // F5
      { freq: 659, duration: h, bass: 165 }, // E5
      { freq: 0, duration: q },

      // Section E: Variation of A
      { freq: 784, duration: e, bass: 262 }, // G5 over C bass
      { freq: 784, duration: e, bass: 262 },
      { freq: 0, duration: q },
      { freq: 784, duration: e, bass: 262 },
      { freq: 0, duration: q },
      { freq: 659, duration: e, bass: 262 }, // E5
      { freq: 784, duration: h, bass: 262 }, // G5
      { freq: 1047, duration: w, bass: 262 }, // C6
      { freq: 0, duration: h },

      // Section F: Resolution
      { freq: 659, duration: e, bass: 131 }, // E5
      { freq: 523, duration: e, bass: 131 }, // C5
      { freq: 440, duration: e, bass: 110 }, // A4
      { freq: 392, duration: e, bass: 98 }, // G4
      { freq: 440, duration: e, bass: 110 }, // A4
      { freq: 523, duration: w, bass: 131 }, // C5
      { freq: 0, duration: w },
    ];
  }

  private undergroundMelody(): MelodyNote[] {
    const q = 0.25;
    const e = 0.35;
    const h = 0.5;
    const w = 0.7;
    // Dark, mysterious underground theme - extended
    return [
      // Section A: Chromatic creep
      { freq: 175, duration: e, wave: 'triangle', bass: 87 }, // F3
      { freq: 185, duration: e, wave: 'triangle', bass: 93 }, // F#3
      { freq: 196, duration: h, wave: 'triangle', bass: 98 }, // G3
      { freq: 0, duration: q },
      { freq: 175, duration: e, wave: 'triangle', bass: 87 },
      { freq: 185, duration: e, wave: 'triangle', bass: 93 },
      { freq: 196, duration: h, wave: 'triangle', bass: 98 },
      { freq: 0, duration: q },

      // Section B: Response
      { freq: 233, duration: e, wave: 'triangle', bass: 117 }, // Bb3
      { freq: 0, duration: q },
      { freq: 262, duration: e, wave: 'triangle', bass: 131 }, // C4
      { freq: 0, duration: q },
      { freq: 233, duration: h, wave: 'triangle', bass: 117 },
      { freq: 196, duration: h, wave: 'triangle', bass: 98 },

      // Section C: Descending
      { freq: 175, duration: e, wave: 'triangle', bass: 87 },
      { freq: 185, duration: e, wave: 'triangle', bass: 93 },
      { freq: 196, duration: h, wave: 'triangle', bass: 98 },
      { freq: 0, duration: q },
      { freq: 262, duration: e, wave: 'triangle', bass: 131 },
      { freq: 247, duration: e, wave: 'triangle', bass: 123 }, // B3
      { freq: 233, duration: h, wave: 'triangle', bass: 117 },
      { freq: 0, duration: h },

      // Section D: Higher register variation
      { freq: 349, duration: e, wave: 'triangle', bass: 87 }, // F4
      { freq: 370, duration: e, wave: 'triangle', bass: 93 }, // F#4
      { freq: 392, duration: h, wave: 'triangle', bass: 98 }, // G4
      { freq: 0, duration: q },
      { freq: 349, duration: e, wave: 'triangle', bass: 87 },
      { freq: 370, duration: e, wave: 'triangle', bass: 93 },
      { freq: 392, duration: h, wave: 'triangle', bass: 98 },
      { freq: 0, duration: q },

      // Section E: Tension
      { freq: 466, duration: e, wave: 'triangle', bass: 117 }, // Bb4
      { freq: 0, duration: q },
      { freq: 523, duration: e, wave: 'triangle', bass: 131 }, // C5
      { freq: 0, duration: q },
      { freq: 466, duration: h, wave: 'triangle', bass: 117 },
      { freq: 392, duration: h, wave: 'triangle', bass: 98 },
      { freq: 0, duration: q },

      // Section F: Resolution back to low
      { freq: 262, duration: e, wave: 'triangle', bass: 131 }, // C4
      { freq: 247, duration: e, wave: 'triangle', bass: 123 }, // B3
      { freq: 233, duration: e, wave: 'triangle', bass: 117 }, // Bb3
      { freq: 196, duration: h, wave: 'triangle', bass: 98 },  // G3
      { freq: 175, duration: w, wave: 'triangle', bass: 87 },  // F3
      { freq: 0, duration: w },
    ];
  }

  private bossMelody(): MelodyNote[] {
    const q = 0.18;
    const e = 0.25;
    const h = 0.4;
    const w = 0.55;
    // Intense boss battle theme - extended
    return [
      // Section A: Aggressive opening
      { freq: 330, duration: q, wave: 'sawtooth', bass: 82 }, // E4
      { freq: 330, duration: q, wave: 'sawtooth', bass: 82 },
      { freq: 330, duration: q, wave: 'sawtooth', bass: 82 },
      { freq: 0, duration: q },
      { freq: 262, duration: q, wave: 'sawtooth', bass: 65 }, // C4
      { freq: 330, duration: e, wave: 'sawtooth', bass: 82 },
      { freq: 0, duration: q },
      { freq: 392, duration: e, wave: 'sawtooth', bass: 98 }, // G4
      { freq: 0, duration: e },
      { freq: 196, duration: h, wave: 'sawtooth', bass: 49 }, // G3
      { freq: 0, duration: q },

      // Section B: Dm response
      { freq: 294, duration: q, wave: 'sawtooth', bass: 73 }, // D4
      { freq: 294, duration: q, wave: 'sawtooth', bass: 73 },
      { freq: 294, duration: q, wave: 'sawtooth', bass: 73 },
      { freq: 0, duration: q },
      { freq: 262, duration: q, wave: 'sawtooth', bass: 65 }, // C4
      { freq: 294, duration: e, wave: 'sawtooth', bass: 73 },
      { freq: 0, duration: q },
      { freq: 349, duration: e, wave: 'sawtooth', bass: 87 }, // F4
      { freq: 0, duration: e },
      { freq: 175, duration: h, wave: 'sawtooth', bass: 44 }, // F3
      { freq: 0, duration: q },

      // Section C: Climax
      { freq: 330, duration: q, wave: 'sawtooth', bass: 82 },
      { freq: 392, duration: q, wave: 'sawtooth', bass: 98 },
      { freq: 440, duration: e, wave: 'sawtooth', bass: 110 }, // A4
      { freq: 392, duration: q, wave: 'sawtooth', bass: 98 },
      { freq: 330, duration: q, wave: 'sawtooth', bass: 82 },
      { freq: 262, duration: e, wave: 'sawtooth', bass: 65 },
      { freq: 294, duration: e, wave: 'sawtooth', bass: 73 },
      { freq: 262, duration: h, wave: 'sawtooth', bass: 65 },
      { freq: 0, duration: q },

      // Section D: Driving rhythm
      { freq: 330, duration: q, wave: 'sawtooth', bass: 82 },
      { freq: 0, duration: q },
      { freq: 330, duration: q, wave: 'sawtooth', bass: 82 },
      { freq: 392, duration: q, wave: 'sawtooth', bass: 98 },
      { freq: 440, duration: q, wave: 'sawtooth', bass: 110 },
      { freq: 392, duration: q, wave: 'sawtooth', bass: 98 },
      { freq: 0, duration: q },
      { freq: 349, duration: q, wave: 'sawtooth', bass: 87 },
      { freq: 330, duration: q, wave: 'sawtooth', bass: 82 },
      { freq: 262, duration: e, wave: 'sawtooth', bass: 65 },
      { freq: 0, duration: q },

      // Section E: Tension build
      { freq: 440, duration: q, wave: 'sawtooth', bass: 110 }, // A4
      { freq: 440, duration: q, wave: 'sawtooth', bass: 110 },
      { freq: 466, duration: q, wave: 'sawtooth', bass: 117 }, // Bb4
      { freq: 466, duration: q, wave: 'sawtooth', bass: 117 },
      { freq: 523, duration: e, wave: 'sawtooth', bass: 131 }, // C5
      { freq: 466, duration: q, wave: 'sawtooth', bass: 117 },
      { freq: 440, duration: q, wave: 'sawtooth', bass: 110 },
      { freq: 392, duration: e, wave: 'sawtooth', bass: 98 },
      { freq: 330, duration: h, wave: 'sawtooth', bass: 82 },
      { freq: 0, duration: h },
    ];
  }

  private victoryMelody(): MelodyNote[] {
    const q = 0.2;
    const e = 0.3;
    const h = 0.5;
    const w = 0.8;
    return [
      // Fanfare A
      { freq: 523, duration: e, bass: 131 }, // C5
      { freq: 659, duration: e, bass: 165 }, // E5
      { freq: 784, duration: e, bass: 196 }, // G5
      { freq: 1047, duration: h, bass: 262 }, // C6
      { freq: 0, duration: q },
      { freq: 784, duration: e, bass: 196 },
      { freq: 1047, duration: w, bass: 262 },
      { freq: 0, duration: q },

      // Fanfare B
      { freq: 587, duration: e, bass: 147 }, // D5
      { freq: 698, duration: e, bass: 175 }, // F5
      { freq: 880, duration: e, bass: 220 }, // A5
      { freq: 1175, duration: h, bass: 294 }, // D6
      { freq: 0, duration: q },
      { freq: 880, duration: e, bass: 220 },
      { freq: 1175, duration: w, bass: 294 },
      { freq: 0, duration: q },

      // Fanfare C
      { freq: 659, duration: e, bass: 165 }, // E5
      { freq: 784, duration: e, bass: 196 }, // G5
      { freq: 988, duration: e, bass: 247 }, // B5
      { freq: 1319, duration: h, bass: 330 }, // E6
      { freq: 1175, duration: e, bass: 294 }, // D6
      { freq: 1047, duration: w, bass: 262 }, // C6
      { freq: 0, duration: h },

      // Celebration section
      { freq: 784, duration: e, bass: 196 }, // G5
      { freq: 784, duration: q, bass: 196 },
      { freq: 0, duration: q },
      { freq: 784, duration: e, bass: 196 },
      { freq: 659, duration: e, bass: 165 }, // E5
      { freq: 784, duration: h, bass: 196 }, // G5
      { freq: 1047, duration: w, bass: 262 }, // C6
      { freq: 0, duration: q },

      // Resolution
      { freq: 880, duration: e, bass: 220 }, // A5
      { freq: 784, duration: e, bass: 196 }, // G5
      { freq: 659, duration: e, bass: 165 }, // E5
      { freq: 523, duration: h, bass: 131 }, // C5
      { freq: 659, duration: e, bass: 165 }, // E5
      { freq: 523, duration: w, bass: 131 }, // C5
      { freq: 0, duration: w },
    ];
  }

  private gameOverMelody(): MelodyNote[] {
    const e = 0.35;
    const h = 0.6;
    const w = 1.0;
    return [
      { freq: 392, duration: e, bass: 98 }, // G4
      { freq: 349, duration: e, bass: 87 }, // F4
      { freq: 330, duration: e, bass: 82 }, // E4
      { freq: 262, duration: h, bass: 65 }, // C4
      { freq: 0, duration: e },
      { freq: 294, duration: e, bass: 73 }, // D4
      { freq: 247, duration: e, bass: 62 }, // B3
      { freq: 262, duration: w, bass: 65 }, // C4
      { freq: 0, duration: h },
    ];
  }

  // ===== VOLUME CONTROLS =====

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
    return this.isMuted;
  }

  toggleMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    this.musicGain.gain.value = this.musicMuted ? 0 : this._musicVolume;
    if (this.musicMuted) {
      this.stopMusic();
    }
    return this.musicMuted;
  }

  get muted(): boolean {
    return this.isMuted;
  }

  get musicIsMuted(): boolean {
    return this.musicMuted;
  }
}

interface MelodyNote {
  freq: number;
  duration: number;
  wave?: OscillatorType;
  bass?: number;
}
