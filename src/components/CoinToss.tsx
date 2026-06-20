'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CoinTossProps {
  active: boolean;
  onComplete: () => void;
  muted: boolean;
  onToggleMute: () => void;
  onShakeStart: () => void;   // 摇晃音效
  onDropStart: () => void;    // 落桌音效
  onBellStart: () => void;    // 开场磬声
}

// 单枚古铜钱（方孔圆钱）
function Coin({
  delay,
  phase,
  index,
}: {
  delay: number;
  phase: 'gather' | 'shake' | 'drop' | 'settle';
  index: number;
}) {
  // 三枚铜钱在摇晃时的随机轨迹
  const shakeX = [(index - 1) * 14, (index - 1) * -10, (index - 1) * 16, (index - 1) * -8];
  const shakeY = [-8, 10, -12, 6];
  const dropX = (index - 1) * 42;

  return (
    <motion.div
      className="absolute"
      style={{ left: '50%', top: '50%' }}
      initial={{ x: 0, y: -120, opacity: 0, scale: 0.6, rotate: 0 }}
      animate={
        phase === 'gather'
          ? { x: (index - 1) * 8, y: 0, opacity: 1, scale: 1, rotate: 0 }
          : phase === 'shake'
          ? {
              x: shakeX,
              y: shakeY,
              rotate: [0, 180, 360, 540],
              scale: 1,
              opacity: 1,
            }
          : phase === 'drop'
          ? { x: dropX, y: 60, opacity: 1, scale: 1, rotate: 720 + index * 120 }
          : { x: dropX, y: 60, opacity: 1, scale: 1, rotate: 720 + index * 120 }
      }
      transition={
        phase === 'shake'
          ? { duration: 1.4, repeat: 0, ease: 'easeInOut' }
          : phase === 'drop'
          ? { duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: delay }
          : { duration: 0.5, ease: 'easeOut' }
      }
    >
      <div
        className="relative"
        style={{
          width: 56,
          height: 56,
          marginLeft: -28,
          marginTop: -28,
        }}
      >
        {/* 铜钱外圆 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, #e8c97a 0%, #c9a24a 45%, #9c7a2e 80%, #7a5d1f 100%)',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)',
            border: '2px solid #8a6a28',
          }}
        />
        {/* 方孔 */}
        <div
          className="absolute"
          style={{
            width: 16,
            height: 16,
            left: 20,
            top: 20,
            background: 'var(--paper, #faf6ed)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
            border: '1px solid #8a6a28',
          }}
        />
        {/* 钱文（四个点意象） */}
        {[
          { t: 4, l: 24 },
          { t: 44, l: 24 },
          { t: 24, l: 4 },
          { t: 24, l: 44 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 6,
              height: 6,
              top: p.t,
              left: p.l,
              background: 'rgba(122,93,31,0.5)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function CoinToss({
  active,
  onComplete,
  muted,
  onToggleMute,
  onShakeStart,
  onDropStart,
  onBellStart,
}: CoinTossProps) {
  const [phase, setPhase] = useState<'gather' | 'shake' | 'drop' | 'settle'>('gather');

  useEffect(() => {
    if (!active) {
      setPhase('gather');
      return;
    }
    // 时间线编排（总约 3.5s）
    onBellStart();
    setPhase('gather');

    const t1 = setTimeout(() => {
      setPhase('shake');
      onShakeStart();
    }, 700); // 聚 0.7s 后开始摇

    const t2 = setTimeout(() => {
      setPhase('drop');
      onDropStart();
    }, 2200); // 摇 1.5s 后撒落

    const t3 = setTimeout(() => {
      setPhase('settle');
    }, 2900);

    const t4 = setTimeout(() => {
      onComplete();
    }, 3500); // 总时长结束

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [active, onComplete, onBellStart, onShakeStart, onDropStart]);

  const phaseText: Record<string, string> = {
    gather: '凝神...',
    shake: '摇卦...',
    drop: '落定...',
    settle: '成卦...',
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(28,24,20,0.92) 0%, rgba(20,16,12,0.97) 100%)',
          }}
        >
          {/* 静音按钮 */}
          <button
            onClick={onToggleMute}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-paper/70 hover:text-paper hover:bg-white/20 transition-colors text-lg"
            title={muted ? '开启声音' : '静音'}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {/* 摇卦区域 */}
          <div className="relative" style={{ width: 200, height: 240 }}>
            {/* 卦盅光晕 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 180,
                height: 180,
                left: 10,
                top: 20,
                background:
                  'radial-gradient(circle, rgba(196,59,45,0.12) 0%, transparent 70%)',
              }}
              animate={
                phase === 'shake'
                  ? { scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }
                  : { scale: 1, opacity: 0.4 }
              }
              transition={{ duration: 0.5, repeat: phase === 'shake' ? Infinity : 0 }}
            />

            {/* 摇晃时整体晃动容器 */}
            <motion.div
              className="absolute inset-0"
              animate={
                phase === 'shake'
                  ? { x: [0, -6, 5, -4, 6, 0], y: [0, 4, -3, 5, -2, 0] }
                  : { x: 0, y: 0 }
              }
              transition={{ duration: 0.45, repeat: phase === 'shake' ? Infinity : 0 }}
            >
              {[0, 1, 2].map((i) => (
                <Coin key={i} index={i} delay={i * 0.08} phase={phase} />
              ))}
            </motion.div>

            {/* 落桌时的墨晕炸开 */}
            {phase === 'settle' && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  left: 70,
                  top: 130,
                  background:
                    'radial-gradient(circle, rgba(250,246,237,0.15) 0%, transparent 70%)',
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )}
          </div>

          {/* 阶段文字 */}
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-title text-paper/80 text-lg tracking-[0.5em] mt-8"
            style={{ fontFamily: '"Noto Serif SC", serif' }}
          >
            {phaseText[phase]}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
