/**
 * 384 爻辞白话翻译
 * 数据源：scripts/build_yao_plain.py 生成
 */

import raw from './yao_plain.json';

export const YAO_PLAIN: Record<number, [string, string, string, string, string, string]> = raw as any;