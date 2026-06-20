import { NextRequest } from 'next/server';
import { castFromNumbers, parseInput } from '@/lib/iching/cast';
import { getHexagram } from '@/lib/iching/hexagrams';
import { judgeYao } from '@/lib/iching/yao_fortune';
import { YAO_PLAIN } from '@/lib/iching/yao_plain';
import type { DivineResponse, YaoFortune } from '@/lib/iching/types';

const FORTUNE_LABEL: Record<YaoFortune, string> = {
  'great-good': '大吉',
  'good': '吉',
  'neutral': '平',
  'caution': '需谨慎',
  'bad': '凶',
  'wait': '暂宜止',
};

const FORTUNE_ADVICE: Record<YaoFortune, string> = {
  'great-good': '宜进 · 大胆推进',
  'good': '宜进 · 顺势而为',
  'neutral': '宜守 · 稳扎稳打',
  'caution': '宜慎 · 悠着点来',
  'bad': '宜退 · 及时收手',
  'wait': '宜止 · 时机未到',
};

const FORTUNE_COLOR: Record<YaoFortune, 'good' | 'neutral' | 'bad' | 'wait'> = {
  'great-good': 'good',
  'good': 'good',
  'neutral': 'neutral',
  'caution': 'bad',
  'bad': 'bad',
  'wait': 'wait',
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const rawInput: string = body.input ?? '';

  const nums = parseInput(rawInput);
  const cast = castFromNumbers(nums);

  const primary = getHexagram(cast.hexagramNumber);
  const changed = getHexagram(cast.changedHexagramNumber);

  const movingYaoCi = primary.yaoCi[cast.movingLine - 1];
  const fortune = judgeYao(movingYaoCi);

  // 爻辞白话：优先取手写精修版，否则用爻辞原文兜底
  const plainFromLib = YAO_PLAIN[cast.hexagramNumber]?.[cast.movingLine - 1];
  const movingYaoPlain = plainFromLib || movingYaoCi;

  const result: DivineResponse = {
    cast,
    primary,
    changed,
    movingYaoCi,
    movingYaoPlain,
    movingYaoFortune: fortune,
    movingYaoAdvice: FORTUNE_ADVICE[fortune],
  };

  return Response.json(result);
}

export function GET() {
  return Response.json({ message: '问春风 —— 易经六十四卦起卦 API。请使用 POST 请求' });
}