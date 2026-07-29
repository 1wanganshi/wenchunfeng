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

// 互卦（本卦三、四、五爻为上互，二、三、四爻为下互），代表中间过程
export interface MutualTrigrams {
  upper: TrigramIndex; // 上互卦序号
  lower: TrigramIndex; // 下互卦序号
}

// 体用生克关系
export type TiYongRelation =
  | 'yong-sheng-ti' // 用生体：大吉
  | 'ti-ke-yong'    // 体克用：小吉
  | 'bi-he'         // 比和：吉
  | 'ti-sheng-yong' // 体生用：耗
  | 'yong-ke-ti';   // 用克体：大凶

export type FiveElement = 'metal' | 'wood' | 'water' | 'fire' | 'earth';

// 体用分析结果（附加在 API 响应里）
export interface TiYongAnalysis {
  mutual: MutualTrigrams;         // 互卦
  ti: TrigramIndex;               // 体卦序号
  yong: TrigramIndex;             // 用卦序号
  tiElement: FiveElement;         // 体卦五行
  yongElement: FiveElement;       // 用卦五行
  relation: TiYongRelation;       // 体用生克关系
  relationLabel: string;          // 如"用生体"
  relationFortune: 'great-good' | 'good' | 'neutral' | 'bad'; // 吉凶档
  relationFortuneLabel: string;   // "大吉" / "小吉" / "吉" / "耗" / "大凶"
  relationAdvice: string;         // 断语
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
  tiyong: TiYongAnalysis;  // 体用分析（互卦、生克、吉凶）
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
