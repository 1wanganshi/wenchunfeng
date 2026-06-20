/**
 * 爻辞吉凶判定引擎
 *
 * 易学原理：《周易》爻辞中的"断辞"（吉凶用语）有明确的等级体系。
 * 通过识别爻辞里的关键断辞，可以准确判定这一爻的吉凶倾向，
 * 进而给出"该进/该守/该退"的行动建议。
 *
 * 这是变卦解读的核心：动爻爻辞 = 老天给的当下行动指南。
 */

export type Fortune =
  | 'great-good'  // 大吉
  | 'good'        // 吉
  | 'neutral'     // 平/无咎
  | 'caution'     // 小凶/需谨慎
  | 'bad'         // 凶
  | 'wait';       // 勿用/暂止

export interface YaoJudgement {
  fortune: Fortune;
  label: string;       // 吉凶标签，如"大吉""宜守"
  advice: string;      // 行动建议，如"宜进""宜退"
  color: 'good' | 'neutral' | 'bad' | 'wait'; // UI 颜色
  plain: string;       // 爻辞的大白话翻译
}

// 吉凶颜色映射
const FORTUNE_COLOR: Record<Fortune, 'good' | 'neutral' | 'bad' | 'wait'> = {
  'great-good': 'good',
  'good': 'good',
  'neutral': 'neutral',
  'caution': 'bad',
  'bad': 'bad',
  'wait': 'wait',
};

const FORTUNE_LABEL: Record<Fortune, string> = {
  'great-good': '大吉',
  'good': '吉',
  'neutral': '平',
  'caution': '需谨慎',
  'bad': '凶',
  'wait': '暂宜止',
};

const FORTUNE_ADVICE: Record<Fortune, string> = {
  'great-good': '宜进 · 大胆去做',
  'good': '宜进 · 顺势而为',
  'neutral': '宜守 · 谨慎稳妥',
  'caution': '宜慎 · 悠着点来',
  'bad': '宜退 · 及时收手',
  'wait': '宜止 · 时机未到',
};

/**
 * 判定一句爻辞的吉凶
 * 规则按优先级：凶 > 大吉 > 勿用 > 谨慎 > 吉 > 无咎 > 平
 * （凶和勿用是强信号，优先识别）
 */
export function judgeYao(yaoText: string): Fortune {
  const t = yaoText;

  // 1. 明确的"凶"——最强负面信号
  if (/凶/.test(t)) {
    // 但"征凶"配"居贞吉"这类要看整体，简化处理：有凶且无明显转吉则判凶
    if (/(终吉|居贞吉|艰则吉|有终)/.test(t)) {
      return 'caution'; // 凶中有转机
    }
    return 'bad';
  }

  // 2. "勿用、勿往、勿逐、勿恤"——暂止信号（无凶时）
  if (/勿用|勿有攸往|勿往/.test(t)) {
    return 'wait';
  }

  // 3. "元吉、大吉"——大吉
  if (/元吉|大吉/.test(t)) {
    return 'great-good';
  }

  // 4. 明确的"吉"（无凶无勿用时）
  if (/吉/.test(t)) {
    // "贞凶""征凶"已被上面捕获，这里是纯吉
    return 'good';
  }

  // 5. "利"——有利
  if (/利涉大川|利见大人|利有攸往|无不利|利贞/.test(t)) {
    return 'good';
  }

  // 6. "厉、吝、悔、眚"——需谨慎（无吉时）
  if (/厉|吝|有悔|灾|眚|羞|咎(?!，?无)|戕/.test(t)) {
    // "无咎"是好的，要排除
    if (/无咎/.test(t) && !/(厉|吝|悔|灾|眚|羞|凶)/.test(t.replace('无咎', ''))) {
      return 'neutral';
    }
    return 'caution';
  }

  // 7. "无咎、悔亡"——平，无过错
  if (/无咎|悔亡/.test(t)) {
    return 'neutral';
  }

  // 8. "亨、利"——小吉
  if (/亨|利/.test(t)) {
    return 'good';
  }

  // 默认：平
  return 'neutral';
}

/**
 * 获取完整的爻判定（吉凶 + 标签 + 建议 + 颜色）
 */
export function getYaoJudgement(yaoText: string, plainText: string): YaoJudgement {
  const fortune = judgeYao(yaoText);
  return {
    fortune,
    label: FORTUNE_LABEL[fortune],
    advice: FORTUNE_ADVICE[fortune],
    color: FORTUNE_COLOR[fortune],
    plain: plainText,
  };
}
