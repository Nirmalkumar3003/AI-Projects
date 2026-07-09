/**
 * Web Audio API Sound Synthesizer for Tic Tac Toe
 * This avoids any external file dependencies (no 404s) and creates beautiful,
 * responsive, modern arcade/synth sounds programmatically.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on the first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
  }

  getMute(): boolean {
    return this.isMuted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Play a clean, fast synth pluck sound when making a move.
   * Alternates frequency slightly depending on Player (X vs O).
   */
  playClick(isPlayerX: boolean) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // X gets a slightly higher, brighter sound; O gets a warmer, slightly lower sound
    const startFreq = isPlayerX ? 523.25 : 392.00; // C5 vs G4
    const endFreq = isPlayerX ? 783.99 : 523.25;   // G5 vs C5

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  /**
   * Play a triumphant 4-note chord arpeggio for a victory.
   */
  playWin() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // A beautiful major 7th chord arpeggio: C4 (261.63), E4 (329.63), G4 (392.00), B4 (493.88), C5 (523.25)
    const notes = [261.63, 329.63, 392.00, 523.25];
    const duration = 0.15;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * duration);
      
      const noteStart = now + idx * duration;
      const noteEnd = noteStart + 0.3;

      gainNode.gain.setValueAtTime(0.001, noteStart);
      gainNode.gain.linearRampToValueAtTime(0.12, noteStart + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  }

  /**
   * Play a clean descending slide for a tie/draw.
   */
  playDraw() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(349.23, ctx.currentTime); // F4
    osc.frequency.linearRampToValueAtTime(220.00, ctx.currentTime + 0.3); // A3

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  /**
   * Play a bubbly sound when resetting the game.
   */
  playReset() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440.00, 554.37, 659.25]; // A4, C#5, E5 (A Major)
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      const noteStart = now + idx * 0.06;
      gainNode.gain.setValueAtTime(0.1, noteStart);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.15);

      osc.start(noteStart);
      osc.stop(noteStart + 0.15);
    });
  }
}

export const soundManager = new SoundManager();
