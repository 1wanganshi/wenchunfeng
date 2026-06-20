'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hexagram from '@/components/Hexagram';
import ShareCard from '@/components/ShareCard';
import { trigramsToHexagram } from '@/lib/iching/constants';
import type { DivineResponse, DimensionKey } from '@/lib/iching/types';

const DIMENSIONS: { key: DimensionKey; label: string; icon: string }[] = [
  { key: 'career', label: '问事业', icon: '事' },
  { key: 'love', label: '问感情', icon: '情' },
  { key: 'wealth', label: '问财运', icon: '财' },
  { key: 'decision', label: '问决策', icon: '决' },
  { key: 'health', label: '问健康', icon: '康' },
  { key: 'social', label: '问人际', icon: '际' },
];

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DivineResponse | null>(null);
  const [activeDim, setActiveDim] = useState<DimensionKey | null>(null);
  const [oracleText, setOracleText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 打字机效果
  useEffect(() => {
    if (!result) return;
    setOracleText('');
    const text = result.primary.oracle;
    let i = 0;
    const timer = setInterval(() => {
      setOracleText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 55);
    return () => clearInterval(timer);
  }, [result]);

  const handleDivine = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setActiveDim(null);
    setShowResult(false);

    await new Promise((r) => setTimeout(r, 600));

    try {
      const res = await fetch('/api/divine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setResult(data);
      setTimeout(() => setShowResult(true), 100);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleReset = useCallback(() => {
    setResult(null);
    setActiveDim(null);
    setShowResult(false);
    setOracleText('');
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const primaryLines = result
    ? (trigramsToHexagram(result.primary.upperTrigram, result.primary.lowerTrigram) as (0 | 1)[])
    : ([0, 0, 0, 0, 0, 0] as (0 | 1)[]);

  const changedLines = result
    ? (trigramsToHexagram(result.changed.upperTrigram, result.changed.lowerTrigram) as (0 | 1)[])
    : ([0, 0, 0, 0, 0, 0] as (0 | 1)[]);

  return (
    <main className="paper-bg min-h-screen w-full relative overflow-hidden">
      {/* 顶部墨晕装饰 */}
      <div
        className="ink-spread"
        style={{ width: 400, height: 400, top: -150, left: -100 }}
      />
      <div
        className="ink-spread"
        style={{ width: 300, height: 300, top: -80, right: -80 }}
      />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 sm:py-10">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-6"
        >
          <h1 className="font-title text-3xl sm:text-4xl tracking-[0.4em] text-ink mb-1">
            問春風
          </h1>
          <p className="text-ink-pale text-xs tracking-[0.3em] font-body">
            一卦一春风
          </p>
        </motion.div>

        {/* 输入区 */}
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md flex flex-col items-center gap-8"
            >
              <div className="w-full">
                <input
                  ref={inputRef}
                  type="text"
                  className="input-field text-center"
                  placeholder="写一组数字，或什么都不写"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDivine()}
                />
                <p className="text-center text-ink-pale text-xs mt-3 tracking-wider">
                  一个数 · 两个数 · 三个数 · 或留空
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={handleDivine}
                disabled={loading}
              >
                {loading ? '占卦中...' : '问 春 风'}
              </button>

              <p className="text-ink-pale text-xs text-center font-body max-w-xs opacity-60">
                梅花易数·三数起卦
                <br />
                心诚则灵，玩玩就好
              </p>
            </motion.div>
          )}

          {showResult && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md flex flex-col items-center gap-5"
            >
              {/* 意象图占位 + 卦名 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="w-full relative"
              >
                {/* 意象图区域 - AI 生成的卦象意象图 */}
                <div className="relative w-full aspect-square rounded-sm overflow-hidden border border-ink/10 bg-white/20 backdrop-blur-sm">
                  {/* 占位背景（图片加载前/失败时显示） */}
                  <div
                    className="absolute inset-0 flex items-center justify-center flex-col"
                    style={{
                      background: `linear-gradient(135deg, rgba(196,59,45,0.08) 0%, rgba(28,28,28,0.03) 50%, rgba(196,59,45,0.05) 100%)`,
                    }}
                  >
                    <span className="font-title text-7xl sm:text-8xl text-ink/20 tracking-widest select-none">
                      {result.primary.name}
                    </span>
                    <span className="text-ink-pale text-sm mt-2 tracking-[0.3em]">
                      {result.primary.fullName}
                    </span>
                  </div>

                  {/* AI 意象图 */}
                  <motion.img
                    key={result.primary.number}
                    src={`/hexagrams/${result.primary.number.toString().padStart(2, '0')}.png`}
                    alt={`${result.primary.name}卦意象图`}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      // 图片不存在时隐藏，露出底下的书法占位
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />

                  {/* 图片上的轻微暗角，让角落的卦象/朱印更清晰 */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 55%, rgba(250,246,237,0.4) 100%)',
                    }}
                  />

                  {/* 底部卦名条 */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-paper/80 to-transparent flex items-end justify-center">
                    <span className="font-title text-lg text-ink tracking-[0.3em]">
                      {result.primary.fullName}
                    </span>
                  </div>
                </div>

                {/* 左上角：小型卦象 */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Hexagram
                    lines={primaryLines}
                    movingLine={result.cast.movingLine}
                    size="xs"
                    animate={false}
                  />
                  <span className="text-ink-pale text-xs tracking-wider">
                    第 {result.cast.movingLine} 爻
                  </span>
                </div>

                {/* 右上角：朱印 */}
                <div
                  className="absolute top-3 right-3 stamp text-xs"
                  style={{ transform: 'rotate(-3deg)' }}
                >
                  春風卦
                </div>
              </motion.div>

              {/* 谶语 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="w-full px-5 py-5 bg-white/30 backdrop-blur-sm border border-ink/10 rounded-sm"
              >
                <div className="font-body text-base sm:text-lg text-ink leading-loose whitespace-pre-line min-h-[7em]">
                  {oracleText}
                  {showResult && oracleText.length < result.primary.oracle.length && (
                    <span className="inline-block w-[2px] h-5 bg-ink ml-1 animate-pulse align-middle" />
                  )}
                </div>
              </motion.div>

              {/* 行动卡：动爻+吉凶+走向 */}
              {(() => {
                const f = result.movingYaoFortune;
                const labelMap = {
                  'great-good': '大吉',
                  'good': '吉',
                  'neutral': '平',
                  'caution': '需谨慎',
                  'bad': '凶',
                  'wait': '暂宜止',
                };
                // 判断整体走向是好是坏
                const isGood = f === 'great-good' || f === 'good';
                const isBad = f === 'bad' || f === 'caution';
                const isNeutral = f === 'neutral' || f === 'wait';
                const trendText = isGood
                  ? '顺着动爻说的做，会走向一个好结果——'
                  : isBad
                  ? '照现在这样走下去，有风险——'
                  : '稳着来，走向没有大起大落——';
                const trendLabel = isGood ? '宜进' : isBad ? '需警惕' : '尚平稳';
                const trendColor = isGood ? 'bg-bamboo' : isBad ? 'bg-vermilion' : 'bg-ink';
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="w-full px-5 py-5 bg-white/30 backdrop-blur-sm border border-ink/10 rounded-sm"
                  >
                    <p className="text-center text-ink-pale text-[11px] mb-4 tracking-[0.2em]">
                      这 一 卦 在 告 诉 你 什 么
                    </p>

                    {/* 现状 */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-ink-pale text-xs shrink-0">现状</span>
                      <span className="font-title text-base text-ink">
                        {result.primary.name} · {result.primary.fullName}
                      </span>
                    </div>

                    {/* 关键动爻 */}
                    <div className="relative pl-3 border-l-2 border-vermilion mb-4">
                      <p className="text-vermilion text-xs mb-1 tracking-wider">
                        关键时刻 — 第{result.cast.movingLine}爻在动
                      </p>
                      <p className="font-body text-ink text-sm italic mb-1">
                        「{result.movingYaoCi}」
                      </p>
                      <p className="font-body text-ink-light text-sm">
                        {result.movingYaoPlain}
                      </p>
                    </div>

                    {/* 吉凶 + 行动 */}
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded text-sm font-bold tracking-wider ${
                          f === 'great-good' ? 'bg-bamboo text-paper' :
                          f === 'good' ? 'bg-bamboo text-paper' :
                          f === 'neutral' ? 'bg-ink text-paper' :
                          f === 'wait' ? 'bg-ink-pale text-paper' :
                          'bg-vermilion text-paper'
                        }`}
                      >
                        {labelMap[f]}
                      </span>
                      <span className="font-body text-ink text-sm font-bold">
                        {result.movingYaoAdvice}
                      </span>
                    </div>

                    {/* 分隔线 */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-ink/10" />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] tracking-wider ${trendColor} text-paper`}>
                        {trendLabel}
                      </span>
                      <div className="flex-1 h-px bg-ink/10" />
                    </div>

                    {/* 走向说明 */}
                    <p className="text-center font-body text-ink text-sm leading-relaxed mb-3">
                      {trendText}
                    </p>

                    {/* 变卦谶语 */}
                    <div className="mb-3 px-3 py-3 bg-white/40 rounded-sm border border-ink/5">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="flex flex-col items-center gap-1">
                          <Hexagram lines={primaryLines} movingLine={result.cast.movingLine} size="sm" animate={false} />
                          <span className="text-[10px] text-ink-pale">{result.primary.name}</span>
                        </div>
                        <span className="text-vermilion text-lg">→</span>
                        <div className="flex flex-col items-center gap-1">
                          <Hexagram lines={changedLines} size="sm" animate={false} />
                          <span className="text-[10px] text-ink-pale">{result.changed.name}</span>
                        </div>
                      </div>
                      <p className="font-body text-ink-light text-sm leading-relaxed whitespace-pre-line">
                        {result.changed.oracle}
                      </p>
                    </div>

                    <p className="text-center text-ink-light text-xs font-body">
                      动爻说「{result.movingYaoAdvice}」，顺着走会到「{result.changed.name}」——{result.changed.oracle.split('\n')[0]}
                    </p>
                  </motion.div>
                );
              })()}

              {/* 六个维度按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                className="w-full"
              >
                <p className="text-center text-ink-pale text-xs mb-3 tracking-wider">
                  再问点具体的
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {DIMENSIONS.map((d) => (
                    <button
                      key={d.key}
                      className={`dim-btn py-2.5 text-sm ${
                        activeDim === d.key ? 'active' : ''
                      }`}
                      onClick={() => {
                        setActiveDim(activeDim === d.key ? null : d.key);
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* 维度解读抽屉 */}
              <AnimatePresence>
                {activeDim && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full overflow-hidden"
                  >
                    <div className="w-full px-5 py-4 bg-white/40 backdrop-blur-sm border border-ink/10 rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="stamp text-xs"
                          style={{ transform: 'rotate(-1deg)' }}
                        >
                          {DIMENSIONS.find((d) => d.key === activeDim)?.label}
                        </span>
                      </div>
                      <p className="font-body text-ink leading-relaxed text-sm">
                        {result.primary.dimensions[activeDim]}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 底部操作按钮 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="flex gap-3 mt-1"
              >
                <button onClick={handleReset} className="dim-btn text-sm px-4">
                  再问一卦
                </button>
                <button
                  onClick={() => setShowShare(true)}
                  className="dim-btn text-sm px-4"
                >
                  生成卡片
                </button>
              </motion.div>

              <div className="h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* loading 状态 */}
        {loading && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 mt-8"
          >
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* 墨晕扩散动画 */}
              <motion.div
                className="absolute inset-0 rounded-full bg-ink/[0.07]"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 2] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-ink/[0.05]"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 2] }}
                transition={{
                  duration: 1.8,
                  delay: 0.6,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
              <p className="relative text-ink-pale font-body text-sm tracking-[0.3em]">
                起卦中
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 底部墨晕装饰 */}
      <div
        className="ink-spread absolute pointer-events-none"
        style={{ width: 500, height: 300, bottom: -100, left: '50%', transform: 'translateX(-50%)' }}
      />

      {/* 分享卡弹窗 */}
      <AnimatePresence>
        {showShare && result && (
          <ShareCard result={result} onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
