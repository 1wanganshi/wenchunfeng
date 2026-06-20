// 易经类型定义

// 八卦：用 0=阴 1=阳 表示一爻，从下往上排
// 一个经卦由 3 爻组成，共 8 个；一个别卦由 6 爻组成，共 64 个
export type Yao = 0 | 1; // 0 阴 -- ;  1 阳 ——
export type Trigram = [Yao, Yao, Yao]; // 自下而上 [初, 中, 上]
export type Hexagram = [Yao, Yao, Yao, Yao, Yao, Yao]; // 自下而上 [初, 二, 三, 四, 五, 上]

// 八经卦序号（先天/后天均通用，这里用梅花易数后天数）
// 1 乾, 2 兑, 3 离, 4 震, 5 巽, 6 坎, 7 艮, 8 坤
export type TrigramIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// 起卦结果
export interface CastResult {
  upper: TrigramIndex;     // 上卦序号 (1-8)
  lower: TrigramIndex;     // 下卦序号 (1-8)
  movingLine: number;      // 动爻 (1-6, 自下而上)
  hexagramNumber: number;  // 本卦卦序 (1-64)
  changedHexagramNumber: number; // 变卦卦序 (1-64)
  inputs: { a: number; b: number; c: number };
  source: 'user' | 'time'; // 起卦来源
}

// 一个维度的解读
export interface DimensionReading {
  key: DimensionKey;
  label: string;
  text: string;
}

export type DimensionKey =
  | 'career'
  | 'love'
  | 'wealth'
  | 'decision'
  | 'health'
  | 'social';

// 一个卦的完整数据
export interface HexagramData {
  number: number;          // 1-64
  name: string;            // 中文卦名 如 "乾"
  symbol: string;          // 卦符 如 "䷀"
  pinyin: string;
  fullName: string;        // 通称 如 "乾为天"
  upperTrigram: TrigramIndex;
  lowerTrigram: TrigramIndex;
  guaCi: string;           // 卦辞原文
  oracle: string;          // 谶语（诗意大白话），首屏展示
  yaoCi: [string, string, string, string, string, string]; // 六爻爻辞原文，自下而上
  dimensions: Record<DimensionKey, string>; // 6 个维度的白话解读
}

// API 响应
export interface DivineResponse {
  cast: CastResult;
  primary: HexagramData;
  changed: HexagramData;
  movingYaoCi: string;     // 动爻爻辞原文
  movingYaoPlain: string;  // 动爻爻辞白话翻译
  movingYaoFortune: YaoFortune;  // 动爻吉凶判定
  movingYaoAdvice: string; // 动爻行动建议
}

// 吉凶等级
export type YaoFortune = 'great-good' | 'good' | 'neutral' | 'caution' | 'bad' | 'wait';

export interface MovingYaoJudgement {
  plain: string;       // 爻辞白话
  fortune: YaoFortune; // 吉凶等级
  label: string;       // 吉凶标签
  advice: string;      // 行动建议
  color: 'good' | 'neutral' | 'bad' | 'wait';
}
