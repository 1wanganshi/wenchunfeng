import type { CastResult, TrigramIndex } from './types';
import {
  HEXAGRAM_LOOKUP,
  trigramsToHexagram,
  hexagramToTrigrams,
  flipYao,
} from './constants';

/**
 * 梅花易数·三数起卦法
 *
 * 规则：
 *  - 第一个数 ÷ 8 取余 → 上卦序号 (余 0 算 8)
 *  - 第二个数 ÷ 8 取余 → 下卦序号
 *  - 三数之和 ÷ 6 取余 → 动爻 (余 0 算 6)
 *
 * 用户行为：
 *  - 输入 1 个数字  → 用这个数 + 它的反序数 + 时间戳秒数 凑成三数
 *  - 输入 2 个数字  → 用 a, b, a+b 凑成三数
 *  - 输入 3 个数字  → 直接用
 *  - 一个都不输入   → 用「年支序+月+日」、「年支序+月+日+时」起卦（时辰起卦法）
 */
export function castFromNumbers(nums: number[]): CastResult {
  // 规整成三个正整数
  let a: number, b: number, c: number;
  let source: 'user' | 'time' = 'user';

  if (nums.length === 0) {
    // 当前时辰起卦
    return castFromTime();
  } else if (nums.length === 1) {
    a = nums[0];
    // 用反序数当 b（如 123 -> 321）
    b = parseInt(String(a).split('').reverse().join(''), 10) || a + 1;
    c = a + b;
  } else if (nums.length === 2) {
    a = nums[0];
    b = nums[1];
    c = a + b;
  } else {
    a = nums[0];
    b = nums[1];
    c = nums[2];
  }

  // 任何 0 用 1 替代避免 mod 异常
  a = Math.abs(a) || 1;
  b = Math.abs(b) || 1;
  c = Math.abs(c) || 1;

  return computeCast(a, b, c, source);
}

/**
 * 时辰起卦：用当前时间作为输入
 *  - 农历换算太重，简化为：用月份、日期、小时凑数
 *  - 这样在不同时间起卦结果不同，有玄学的"机"的味道
 */
export function castFromTime(now: Date = new Date()): CastResult {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const a = year + month + day;          // 上卦数
  const b = year + month + day + hour;   // 下卦数
  const c = a + b + minute;              // 动爻数（加分钟让每分钟都不同）

  return computeCast(a, b, c, 'time');
}

/**
 * 核心计算：三数 → 卦象 + 动爻 + 变卦
 */
function computeCast(a: number, b: number, c: number, source: 'user' | 'time'): CastResult {
  // 上卦
  let upperRem = a % 8;
  if (upperRem === 0) upperRem = 8;
  const upper = upperRem as TrigramIndex;

  // 下卦
  let lowerRem = b % 8;
  if (lowerRem === 0) lowerRem = 8;
  const lower = lowerRem as TrigramIndex;

  // 动爻
  let movingRem = c % 6;
  if (movingRem === 0) movingRem = 6;
  const movingLine = movingRem;

  // 本卦
  const hexagramNumber = HEXAGRAM_LOOKUP[upper - 1][lower - 1];

  // 变卦：将动爻翻转
  const primaryHex = trigramsToHexagram(upper, lower);
  const changedHex = [...primaryHex] as typeof primaryHex;
  changedHex[movingLine - 1] = flipYao(changedHex[movingLine - 1]);
  const changedTri = hexagramToTrigrams(changedHex);
  const changedHexagramNumber = HEXAGRAM_LOOKUP[changedTri.upper - 1][changedTri.lower - 1];

  return {
    upper,
    lower,
    movingLine,
    hexagramNumber,
    changedHexagramNumber,
    inputs: { a, b, c },
    source,
  };
}

/**
 * 把任意字符串解析成数字数组
 *  - "123" → [123]
 *  - "1 2 3" → [1, 2, 3]
 *  - "1,2,3" → [1, 2, 3]
 *  - "abc" → []
 *  - "" → []
 */
export function parseInput(raw: string): number[] {
  if (!raw || !raw.trim()) return [];
  const cleaned = raw.replace(/[^\d\s,，、]/g, ' ').replace(/[,，、]/g, ' ');
  const parts = cleaned.split(/\s+/).filter(Boolean);
  // 如果用户输入的是单一长数字串如 "123"，且没有分隔符，就把它当一个数
  if (parts.length === 1) {
    const n = parseInt(parts[0], 10);
    return isNaN(n) ? [] : [n];
  }
  return parts
    .map((p) => parseInt(p, 10))
    .filter((n) => !isNaN(n));
}
