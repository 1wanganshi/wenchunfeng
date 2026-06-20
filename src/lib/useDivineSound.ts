'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * 摇卦音效管理
 * - 真实音效文件（铜钱摇晃、落桌、磬声）
 * - Web Audio 合成做补充（铜钱叮当的清脆碰撞）
 * - 全局静音开关，存 localStorage
 */
export function useDivineSound() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Record<string, AudioBuffer>>({});
  const loadedRef = useRef(false);

  // 读取静音偏好
  useEffect(() => {
    const saved = localStorage.getItem('wcf-muted');
    if (saved === '1') setMuted(true);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem('wcf-muted', next ? '1' : '0');
      return next;
    });
  }, []);

  // 懒加载音频（首次交互时初始化 AudioContext，避免浏览器自动播放限制）
  const ensureLoaded = useCallback(async () => {
    if (loadedRef.current) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      ctxRef.current = ctx;

      const files = {
        shake: '/sounds/coin-shake.mp3',
        drop: '/sounds/coin-drop.mp3',
        bell: '/sounds/bell.mp3',
      };

      await Promise.all(
        Object.entries(files).map(async ([key, url]) => {
          try {
            const res = await fetch(url);
            const arr = await res.arrayBuffer();
            const buf = await ctx.decodeAudioData(arr);
            buffersRef.current[key] = buf;
          } catch {
            // 单个文件失败不影响其他
          }
        })
      );
      loadedRef.current = true;
    } catch {
      // AudioContext 初始化失败，静默降级
    }
  }, []);

  // 播放真实音效文件
  const playFile = useCallback(
    (key: string, opts?: { volume?: number; rate?: number; delay?: number }) => {
      if (muted) return;
      const ctx = ctxRef.current;
      const buf = buffersRef.current[key];
      if (!ctx || !buf) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = opts?.rate ?? 1;
      const gain = ctx.createGain();
      gain.gain.value = opts?.volume ?? 1;
      src.connect(gain).connect(ctx.destination);
      src.start(ctx.currentTime + (opts?.delay ?? 0));
    },
    [muted]
  );

  // Web Audio 合成「铜钱清脆叮当」——补充真实音效的清脆碰撞质感
  const playClink = useCallback(
    (delay = 0, baseFreq = 2400) => {
      if (muted) return;
      const ctx = ctxRef.current;
      if (!ctx) return;
      const t = ctx.currentTime + delay;
      // 两个高频正弦叠加，模拟金属碰撞泛音
      [baseFreq, baseFreq * 1.34].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + Math.random() * 120, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(i === 0 ? 0.18 : 0.1, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    },
    [muted]
  );

  // 摇晃阶段：连续多次清脆碰撞，营造"哗啦哗啦"
  const playShakeSequence = useCallback(() => {
    if (muted) return;
    playFile('shake', { volume: 0.5 });
    // 叠加合成的铜钱碰撞，有节奏感
    const times = [0.1, 0.28, 0.42, 0.6, 0.78, 0.95, 1.15, 1.35];
    times.forEach((dt) => playClink(dt, 2200 + Math.random() * 600));
  }, [muted, playFile, playClink]);

  return {
    muted,
    toggleMute,
    ensureLoaded,
    playFile,
    playClink,
    playShakeSequence,
  };
}
