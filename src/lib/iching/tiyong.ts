/**
 * 梅花易数·体用生克判定
 *
 * 理论依据：docs/meihua-yishu-reference.md 第四节
 *   - 动爻所在经卦为"用卦"（他人、所占之事、外因）
 *   - 无动爻经卦为"体卦"（自己、求测人、事情主体）
 *   - 体用生克五诀定吉凶基调：
 *       用生体=大吉（有进益之喜）
 *       体克用=小吉（我占主动，可成但费力）
 *       比和  =吉（百事顺遂）
 *       体生用=小凶（耗失之患）
 *       用克体=大凶（他人来克我）
 *   - 本卦=事之始，互卦=事之中（过程），变卦=事之终（结果）
 */

import type { TrigramIndex, Hexagram, Trigram } from './types';
import { TRIGRAMS, trigramsToHexagram, hexagramToTrigrams } from './constants';

// 八卦五行映射（与 TrigramIndex 对齐）
// 1乾=金 2兑=金 3离=火 4震=木 5巽=木 6坎=水 7艮=土 8坤=土
export type FiveElement = 'metal' | 'wood' | 'water' | 'fire' | 'earth';

export const TRIGRAM_ELEMENT: Record<TrigramIndex, FiveElement> = {
  1: 'metal', // 乾
  2: 'metal', // 兑
  3: 'fire',  // 离
  4: 'wood',  // 震
  5: 'wood',  // 巽
  6: 'water', // 坎
  7: 'earth', // 艮
  8: 'earth', // 坤
};

const ELEMENT_LABEL: Record<FiveElement, string> = {
  metal: '金',
  wood: '木',
  water: '水',
  fire: '火',
  earth: '土',
};

// 五行相生：key 生 value（金生水、水生木、木生火、火生土、土生金）
const SHENG: Record<FiveElement, FiveElement> = {
  metal: 'water',
  water: 'wood',
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
};

// 五行相克：key 克 value（金克木、木克土、土克水、水克火、火克金）
const KE: Record<FiveElement, FiveElement> = {
  metal: 'wood',
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
};

// 体用生克关系（从"体"的视角看）
export type TiYongRelation =
  | 'yong-sheng-ti' // 用生体：大吉，有进益之喜
  | 'ti-ke-yong'    // 体克用：小吉，主动可成但费力
  | 'bi-he'         // 比和：吉，百事顺遂
  | 'ti-sheng-yong' // 体生用：小凶，耗失之患
  | 'yong-ke-ti';   // 用克体：大凶，他人来克我

export interface TiYongRelationInfo {
  relation: TiYongRelation;
  label: string;    // 如"用生体"
  fortune: 'great-good' | 'good' | 'neutral' | 'bad';
  fortuneLabel: string; // "大吉" / "小吉" / "吉" / "耗" / "大凶"
  advice: string;   // 一句话断语
}

const RELATION_INFO: Record<TiYongRelation, Omit<TiYongRelationInfo, 'relation'>> = {
  'yong-sheng-ti': {
    label: '用生体',
    fortune: 'great-good',
    fortuneLabel: '大吉',
    advice: '有进益之喜，他人助我，事半功倍',
  },
  'ti-ke-yong': {
    label: '体克用',
    fortune: 'good',
    fortuneLabel: '小吉',
    advice: '我占主动，事可成但需费力',
  },
  'bi-he': {
    label: '体用比和',
    fortune: 'good',
    fortuneLabel: '吉',
    advice: '百事顺遂，与所谋之事同气相求',
  },
  'ti-sheng-yong': {
    label: '体生用',
    fortune: 'neutral',
    fortuneLabel: '耗',
    advice: '有耗失之患，付出多回收少，宜守',
  },
  'yong-ke-ti': {
    label: '用克体',
    fortune: 'bad',
    fortuneLabel: '大凶',
    advice: '他人来克我，阻力大，不宜强进',
  },
};

/**
 * 计算两个卦之间的体用生克关系
 * @param tiEl 体卦五行
 * @param yongEl 用卦五行
 */
export function judgeTiYongRelation(tiEl: FiveElement, yongEl: FiveElement): TiYongRelationInfo {
  let relation: TiYongRelation;
  if (tiEl === yongEl) {
    relation = 'bi-he';
  } else if (SHENG[yongEl] === tiEl) {
    relation = 'yong-sheng-ti'; // 用生体
  } else if (KE[tiEl] === yongEl) {
    relation = 'ti-ke-yong'; // 体克用
  } else if (SHENG[tiEl] === yongEl) {
    relation = 'ti-sheng-yong'; // 体生用
  } else {
    relation = 'yong-ke-ti'; // 用克体
  }
  return { relation, ...RELATION_INFO[relation] };
}

/**
 * 由六爻数组（自下而上）计算互卦的上下卦序号
 * 互卦 = 本卦三、四、五爻组成上互卦，二、三、四爻组成下互卦
 * 互卦代表事物中间过程、隐秘之事
 *
 * 注意：互卦只与六爻本身有关，与动爻无关
 */
export function computeMutualTrigrams(hex: Hexagram): {
  upperMutual: TrigramIndex;
  lowerMutual: TrigramIndex;
} {
  // hex 自下而上 [初, 二, 三, 四, 五, 上]
  // 下互卦 = 二、三、四爻（hex[1], hex[2], hex[3]），自下而上排
  // 上互卦 = 三、四、五爻（hex[2], hex[3], hex[4]），自下而上排
  const lowerMutualYao: Trigram = [hex[1], hex[2], hex[3]];
  const upperMutualYao: Trigram = [hex[2], hex[3], hex[4]];

  return {
    lowerMutual: trigramYaoToIndex(lowerMutualYao),
    upperMutual: trigramYaoToIndex(upperMutualYao),
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
 * 根据动爻位置，确定体卦和用卦
 * 动爻 1-3 → 下卦为用，上卦为体
 * 动爻 4-6 → 上卦为用，下卦为体
 */
export function getTiYongTrigrams(
  upper: TrigramIndex,
  lower: TrigramIndex,
  movingLine: number
): { ti: TrigramIndex; yong: TrigramIndex } {
  if (movingLine <= 3) {
    // 动爻在下卦 → 下卦为用
    return { ti: upper, yong: lower };
  } else {
    // 动爻在上卦 → 上卦为用
    return { ti: lower, yong: upper };
  }
}

/**
 * 一站式：给定起卦结果，算出互卦 + 体用卦 + 生克判定 + 互卦对体的生克
 */
export function analyzeTiYong(
  upper: TrigramIndex,
  lower: TrigramIndex,
  movingLine: number
): {
  mutual: { upper: TrigramIndex; lower: TrigramIndex };
  ti: TrigramIndex;
  yong: TrigramIndex;
  tiElement: FiveElement;
  yongElement: FiveElement;
  relation: TiYongRelationInfo;
  mutualToTiRelation: TiYongRelationInfo; // 互卦整体对体卦的生克（取上互）
} {
  const hex = trigramsToHexagram(upper, lower);
  const mutual = computeMutualTrigrams(hex);

  const { ti, yong } = getTiYongTrigrams(upper, lower, movingLine);
  const tiElement = TRIGRAM_ELEMENT[ti];
  const yongElement = TRIGRAM_ELEMENT[yong];

  const relation = judgeTiYongRelation(tiElement, yongElement);

  // 互卦对体卦的生克：取上互卦五行与体卦五行比较
  const mutualElement = TRIGRAM_ELEMENT[mutual.upperMutual];
  const mutualToTiRelation = judgeTiYongRelation(tiElement, mutualElement);

  return {
    mutual: { upper: mutual.upperMutual, lower: mutual.lowerMutual },
    ti,
    yong,
    tiElement,
    yongElement,
    relation,
    mutualToTiRelation,
  };
}

// ============ 大白话文案（给前端直接用） ============

export interface TiYongPlain {
  // 一句话说清"你和这件事的关系"
  headline: string;
  // 展开解释 1-2 句
  detail: string;
  // 中间过程（互卦）一句话
  process: string;
  // 吉利程度标签（前端染色用）
  mood: 'good' | 'ok' | 'bad';
}

const ELEMENT_CN: Record<FiveElement, string> = {
  metal: '金', wood: '木', water: '水', fire: '火', earth: '土',
};

// 八卦自然意象（给普通人看的"是什么"）
const TRIGRAM_NATURE: Record<TrigramIndex, string> = {
  1: '天', 2: '泽', 3: '火', 4: '雷',
  5: '风', 6: '水', 7: '山', 8: '地',
};

/**
 * 生成给普通人看的体用解读
 * @param upper 上卦
 * @param lower 下卦
 * @param movingLine 动爻
 * @param tiName 体卦名（如"艮"）
 * @param yongName 用卦名（如"离"）
 */
export function plainTiYong(
  upper: TrigramIndex,
  lower: TrigramIndex,
  movingLine: number,
  tiName: string,
  yongName: string
): TiYongPlain {
  const a = analyzeTiYong(upper, lower, movingLine);
  const tiEl = ELEMENT_CN[a.tiElement];
  const yongEl = ELEMENT_CN[a.yongElement];
  const tiNature = TRIGRAM_NATURE[a.ti];
  const yongNature = TRIGRAM_NATURE[a.yong];

  // 卦名 + 意象，如「艮(山)」「离(火)」
  const tiLabel = `${tiName}(${tiNature})`;
  const yongLabel = `${yongName}(${yongNature})`;

  let headline = '';
  let detail = '';
  let mood: TiYongPlain['mood'] = 'ok';

  switch (a.relation.relation) {
    case 'yong-sheng-ti':
      headline = '这件事在帮你';
      detail = `用卦${yongLabel}属${yongEl}，体卦${tiLabel}属${tiEl}，${yongEl}生${tiEl}——外在的人和事都在给你递力，你不用硬扛，顺势接纳就有收获。`;
      mood = 'good';
      break;
    case 'ti-ke-yong':
      headline = '你说了算，但得自己使劲';
      detail = `体卦${tiLabel}属${tiEl}，用卦${yongLabel}属${yongEl}，${tiEl}克${yongEl}——主动权在你手里，事情能办成，但没有现成便宜，要靠自己一步一步推。`;
      mood = 'good';
      break;
    case 'bi-he':
      headline = '你和这件事同频';
      detail = `体卦${tiLabel}和用卦${yongLabel}都属${tiEl}，气性相投——事情跟你想的方向一致，不用太费周折，顺着走就行。`;
      mood = 'good';
      break;
    case 'ti-sheng-yong':
      headline = '你在往外掏';
      detail = `体卦${tiLabel}属${tiEl}，用卦${yongLabel}属${yongEl}，${tiEl}生${yongEl}——这一段你付出多、回报少，像在给别人做嫁衣。别耗尽自己，留一手。`;
      mood = 'ok';
      break;
    case 'yong-ke-ti':
      headline = '这件事在压你';
      detail = `用卦${yongLabel}属${yongEl}，体卦${tiLabel}属${tiEl}，${yongEl}克${tiEl}——外在的阻力比你大，硬顶会吃亏。先退一步、换个方式，比硬碰硬强。`;
      mood = 'bad';
      break;
  }

  // 互卦（中间过程）——带上互卦名和意象
  const mutualUpperName = (['乾','兑','离','震','巽','坎','艮','坤'] as const)[a.mutual.upper - 1];
  const mutualUpperNature = TRIGRAM_NATURE[a.mutual.upper];
  const mutualRel = a.mutualToTiRelation.relation;
  let process = '';
  if (mutualRel === 'yong-sheng-ti') {
    process = `中间过程（互卦${mutualUpperName}(${mutualUpperNature})）会生助你——有人拉你一把。`;
  } else if (mutualRel === 'ti-ke-yong') {
    process = `中间过程（互卦${mutualUpperName}(${mutualUpperNature})）靠你自己拿主意。`;
  } else if (mutualRel === 'bi-he') {
    process = `中间过程（互卦${mutualUpperName}(${mutualUpperNature})）平稳，没什么幺蛾子。`;
  } else if (mutualRel === 'ti-sheng-yong') {
    process = `中间过程（互卦${mutualUpperName}(${mutualUpperNature})）会有点累心，别急着求结果。`;
  } else {
    process = `中间过程（互卦${mutualUpperName}(${mutualUpperNature})）可能出点岔子，留个心眼。`;
  }

  return { headline, detail, process, mood };
}
