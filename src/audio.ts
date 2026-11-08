import { useCallback, useEffect, useRef, useState } from 'react';
import { content } from './content';

/* A tiny generative music box built with the Web Audio API.
   No audio file needed, no copyright worries, and it only starts after a tap. */

const NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
const PATTERN = [0, 2, 4, 2, 1, 3, 5, 3, 2, 4, 6, 4, 3, 1, 2, 0];

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

class MusicBox {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private suspendTimer: number | null = null;
  private step = 0;

  start() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;
      if (!AC) throw new Error('Web Audio is not supported');
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.0001;
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.34;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.32;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 2600;
      master.connect(ctx.destination);
      master.connect(delay);
      delay.connect(lowpass);
      lowpass.connect(feedback);
      feedback.connect(delay);
      lowpass.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
    }
    const ctx = this.ctx;
    const master = this.master!;
    if (this.suspendTimer != null) {
      window.clearTimeout(this.suspendTimer);
      this.suspendTimer = null;
    }
    void ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.2);
    if (this.timer == null) {
      this.tick();
      this.timer = window.setInterval(() => this.tick(), 520);
    }
  }

  stop() {
    const ctx = this.ctx;
    const master = this.master;
    if (this.timer != null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    this.suspendTimer = window.setTimeout(() => {
      void ctx.suspend();
    }, 900);
  }

  private tick() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const idx = PATTERN[this.step % PATTERN.length];
    this.step += 1;
    if (this.step % 8 === 0 && Math.random() < 0.4) return; // a little breath
    const f = NOTES[idx];
    const t = ctx.currentTime;
    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = f;
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = f * 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;
    o1.connect(g);
    o2.connect(g2);
    g2.connect(g);
    g.connect(this.master);
    o1.start(t);
    o2.start(t);
    o1.stop(t + 1.9);
    o2.stop(t + 1.9);
  }
}

export function useMusic() {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const boxRef = useRef<MusicBox | null>(null);
  const useFile = content.music.src.trim().length > 0;

  const toggle = useCallback(async () => {
    try {
      if (!playing) {
        if (useFile) {
          if (!audioRef.current) {
            const a = new Audio(content.music.src);
            a.loop = true;
            a.volume = 0.5;
            a.onerror = () => {
              setError(true);
              setPlaying(false);
            };
            audioRef.current = a;
          }
          await audioRef.current.play();
        } else {
          if (!boxRef.current) boxRef.current = new MusicBox();
          boxRef.current.start();
        }
        setError(false);
        setPlaying(true);
      } else {
        audioRef.current?.pause();
        boxRef.current?.stop();
        setPlaying(false);
      }
    } catch {
      setError(true);
      setPlaying(false);
    }
  }, [playing, useFile]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      boxRef.current?.stop();
    },
    [],
  );

  return { playing, error, toggle };
}
