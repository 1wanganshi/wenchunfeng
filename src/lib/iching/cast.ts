import type { CastResult, TrigramIndex } from './types';
import {
  HEXAGRAM_LOOKUP,
  trigramsToHexagram,
  hexagramToTrigrams,
  flipYao,
} from './constants';
import { Lunar } from 'lunar-javascript';

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
 * 农历时间起卦（梅花易数·年月日时起卦法）
 *
 * 正统规则（《梅花易数》原书）：
 *  - 上卦 =（年支序 + 农历月 + 农历日）÷ 8 取余
 *  - 下卦 =（年支序 + 农历月 + 农历日 + 时辰支序）÷ 8 取余
 *  - 动爻 =（年支序 + 农历月 + 农历日 + 时辰支序）÷ 6 取余
 *  - 年支序：子1 丑2 寅3 卯4 辰5 巳6 午7 未8 申9 酉10 戌11 亥12
 *  - 时辰支序：同上（子=1…亥=12）
 *
 * 用户留空时调用：以"点下按钮的这一刻"作为心念一动的瞬间起卦。
 */
export function castFromTime(now: Date = new Date()): CastResult {
  const lunar = Lunar.fromDate(now);

  // 年支序（子1…亥12）：从干支"丙午"取地支"午"
  const yearGanZhi = lunar.getYearInGanZhi();
  const yearZhi = yearGanZhi.charAt(yearGanZhi.length - 1);
  const ZHI_ORDER = '子丑寅卯辰巳午未申酉戌亥';
  const yearNum = ZHI_ORDER.indexOf(yearZhi) + 1;

  // 农历月、日（lunar-javascript 月份/日期已按农历返回，正月=1）
  const monthNum = Math.abs(lunar.getMonth()); // 闰月取负数，取绝对值
  const dayNum = lunar.getDay();

  // 时辰支序
  const timeZhi = lunar.getTimeZhi(); // 如"午"
  const hourNum = ZHI_ORDER.indexOf(timeZhi) + 1;

  // 三数
  const a = yearNum + monthNum + dayNum;          // 上卦数
  const b = a + hourNum;                           // 下卦数
  const c = b;                                     // 动爻数（年月日时总和）

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
