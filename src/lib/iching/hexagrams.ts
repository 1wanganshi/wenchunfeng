import type { HexagramData, DimensionKey } from './types';
import { getOracleContent } from './compact_content';
import SKELETON from './hexagrams_skeleton.json';

/**
 * 64 卦完整数据层
 * - 卦名、卦符、卦辞、爻辞等"事实"数据来自 skeleton（由经典文本生成）
 * - 谶语、维度解读等"创作"数据来自 compact_content + flagship_content
 */

// 类型修正（因为 JSON 读出来是 any）
const skeletonData = (SKELETON as any).hexagrams as Array<{
  number: number;
  name: string;
  symbol: string;
  pinyin: string;
  fullName: string;
  upperTrigram: number;
  lowerTrigram: number;
  guaCi: string;
  yaoCi: [string, string, string, string, string, string];
}>;

const _data = new Map<number, HexagramData>();

for (const s of skeletonData) {
  const content = getOracleContent(s.number);
  _data.set(s.number, {
    number: s.number,
    name: s.name,
    symbol: s.symbol,
    pinyin: s.pinyin,
    fullName: s.fullName,
    upperTrigram: s.upperTrigram as any,
    lowerTrigram: s.lowerTrigram as any,
    guaCi: s.guaCi,
    oracle: content.oracle,
    yaoCi: s.yaoCi,
    dimensions: content.dimensions as Record<DimensionKey, string>,
  });
}

/**
 * 按卦序（1-64）取卦的完整数据
 */
export function getHexagram(num: number): HexagramData {
  const h = _data.get(num);
  if (!h) {
    throw new Error(`Invalid hexagram number: ${num}`);
  }
  return h;
}

/**
 * 取全部 64 卦（用于列表页、搜索等）
 */
export function getAllHexagrams(): HexagramData[] {
  return Array.from(_data.values()).sort((a, b) => a.number - b.number);
}
