import type { TrigramIndex, Trigram, Hexagram, Yao } from './types';

// 八卦：以「上爻、中爻、初爻」（从上到下视觉上的写法）的二进制表示
// 但内部统一用 [初, 中, 上] 自下而上的数组
// 梅花易数后天八卦数：
//   1 乾 ☰ (天)  上中下三阳
//   2 兑 ☱ (泽)  上阴中阳下阳
//   3 离 ☲ (火)  上阳中阴下阳
//   4 震 ☳ (雷)  上阴中阴下阳
//   5 巽 ☴ (风)  上阳中阳下阴
//   6 坎 ☵ (水)  上阴中阳下阴
//   7 艮 ☶ (山)  上阳中阴下阴
//   8 坤 ☷ (地)  上中下三阴
export const TRIGRAMS: Record<TrigramIndex, {
  name: string;
  symbol: string;
  nature: string; // 所代表的自然物
  yao: Trigram;   // [初, 中, 上]
}> = {
  1: { name: '乾', symbol: '☰', nature: '天', yao: [1, 1, 1] },
  2: { name: '兑', symbol: '☱', nature: '泽', yao: [1, 1, 0] },
  3: { name: '离', symbol: '☲', nature: '火', yao: [1, 0, 1] },
  4: { name: '震', symbol: '☳', nature: '雷', yao: [1, 0, 0] },
  5: { name: '巽', symbol: '☴', nature: '风', yao: [0, 1, 1] },
  6: { name: '坎', symbol: '☵', nature: '水', yao: [0, 1, 0] },
  7: { name: '艮', symbol: '☶', nature: '山', yao: [0, 0, 1] },
  8: { name: '坤', symbol: '☷', nature: '地', yao: [0, 0, 0] },
};

// 由 [上卦序号, 下卦序号] 查 64 卦序的表
// 表格按照《周易》本义的标准卦序排列
// 索引：[upperIndex - 1][lowerIndex - 1] = hexagramNumber (1-64)
// 行 = 上卦（乾兑离震巽坎艮坤），列 = 下卦（同序）
// 这是一个 8x8 的查表，对应六十四卦
export const HEXAGRAM_LOOKUP: number[][] = [
  //  下: 乾  兑  离  震  巽  坎  艮  坤   <- 下卦
  [    1, 10, 13, 25, 44,  6, 33, 12], // 上=乾
  [   43, 58, 49, 17, 28, 47, 31, 45], // 上=兑
  [   14, 38, 30, 21, 50, 64, 56, 35], // 上=离
  [   34, 54, 55, 51, 32, 40, 62, 16], // 上=震
  [    9, 61, 37, 42, 57, 59, 53, 20], // 上=巽
  [    5, 60, 63,  3, 48, 29, 39,  8], // 上=坎
  [   26, 41, 22, 27, 18,  4, 52, 23], // 上=艮
  [   11, 19, 36, 24, 46,  7, 15,  2], // 上=坤
];

/**
 * 给定上下卦序号（1-8），返回 64 卦序（1-64）
 */
export function lookupHexagramNumber(upper: TrigramIndex, lower: TrigramIndex): number {
  return HEXAGRAM_LOOKUP[upper - 1][lower - 1];
}

/**
 * 由六爻数组（自下而上）反查上下卦序号
 */
export function hexagramToTrigrams(hex: Hexagram): { upper: TrigramIndex; lower: TrigramIndex } {
  const lowerYao: Trigram = [hex[0], hex[1], hex[2]];
  const upperYao: Trigram = [hex[3], hex[4], hex[5]];
  return {
    lower: trigramYaoToIndex(lowerYao),
    upper: trigramYaoToIndex(upperYao),
  };
}

function trigramYaoToIndex(yao: Trigram): TrigramIndex {
  for (const k of Object.keys(TRIGRAMS) as unknown as TrigramIndex[]) {
    const t = TRIGRAMS[k];
    if (t.yao[0] === yao[0] && t.yao[1] === yao[1] && t.yao[2] === yao[2]) {
      return k;
    }
  }
  throw new Error('Invalid trigram');
}

/**
 * 由上下卦序号组合成完整六爻数组（自下而上）
 */
export function trigramsToHexagram(upper: TrigramIndex, lower: TrigramIndex): Hexagram {
  const l = TRIGRAMS[lower].yao;
  const u = TRIGRAMS[upper].yao;
  return [l[0], l[1], l[2], u[0], u[1], u[2]];
}

/**
 * 翻转一爻（用于变卦）
 */
export function flipYao(y: Yao): Yao {
  return y === 0 ? 1 : 0;
}
