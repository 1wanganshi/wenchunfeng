import { motion } from 'framer-motion';
import clsx from 'clsx';

interface HexagramProps {
  lines: (0 | 1)[]; // 自下而上 6 爻
  movingLine?: number; // 1-6，动爻
  size?: 'xs' | 'sm' | 'md';
  animate?: boolean;
}

// 精确的尺寸控制，确保上下卦对称
const SIZES = {
  xs: { width: 24,  yaoHeight: 2,  gap: 3  }, // 极小，用于卡片角落
  sm: { width: 48,  yaoHeight: 4,  gap: 5  }, // 小尺寸
  md: { width: 96,  yaoHeight: 8,  gap: 10 }, // 中尺寸
};

/**
 * 卦象组件 - 纯 CSS 绘制六爻
 * 数据中 lines[0] = 初爻（最下面）
 * UI 从上到下显示：上爻 → 初爻
 * 
 * 设计要点：
 * - 阴爻中间 gap = 2 × yaoHeight（黄金比例，视觉舒适）
 * - 上下卦之间 gap 和普通 gap 一样（三爻一组自然对称）
 * - 所有尺寸用像素精确控制，确保对称
 */
export function Hexagram({ lines, movingLine, size = 'md', animate = true }: HexagramProps) {
  const s = SIZES[size];
  const yinGap = s.yaoHeight * 2; // 阴爻中间的间隔
  const yinBarWidth = (s.width - yinGap) / 2;

  // UI 从上到下显示 = 数据从后到前
  const displayLines = [...lines].reverse();

  return (
    <div
      className="relative flex flex-col"
      style={{
        width: s.width,
        gap: s.gap,
      }}
    >
      {displayLines.map((line, idx) => {
        const actualPosition = 6 - idx; // 1=初爻（底部）, 6=上爻（顶部）
        const isMoving = movingLine === actualPosition;

        return (
          <motion.div
            key={idx}
            initial={animate ? { opacity: 0, scaleX: 0 } : false}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{
              delay: animate ? idx * 0.15 + 0.2 : 0,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative flex items-center justify-center"
            style={{ height: s.yaoHeight }}
          >
            {line === 1 ? (
              // 阳爻：整根长条
              <div
                className={clsx(
                  'rounded-[1px] transition-colors duration-300',
                  isMoving ? 'bg-vermilion' : 'bg-ink'
                )}
                style={{
                  width: s.width,
                  height: s.yaoHeight,
                  boxShadow: isMoving ? '0 0 8px rgba(196, 59, 45, 0.5)' : 'none',
                }}
              />
            ) : (
              // 阴爻：左右两根短条
              <div
                className="relative"
                style={{ width: s.width, height: s.yaoHeight }}
              >
                <div
                  className={clsx(
                    'absolute left-0 top-0 rounded-[1px] transition-colors duration-300',
                    isMoving ? 'bg-vermilion' : 'bg-ink'
                  )}
                  style={{
                    width: yinBarWidth,
                    height: s.yaoHeight,
                    boxShadow: isMoving ? '0 0 8px rgba(196, 59, 45, 0.5)' : 'none',
                  }}
                />
                <div
                  className={clsx(
                    'absolute right-0 top-0 rounded-[1px] transition-colors duration-300',
                    isMoving ? 'bg-vermilion' : 'bg-ink'
                  )}
                  style={{
                    width: yinBarWidth,
                    height: s.yaoHeight,
                    boxShadow: isMoving ? '0 0 8px rgba(196, 59, 45, 0.5)' : 'none',
                  }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default Hexagram;
