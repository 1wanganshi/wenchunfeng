// 测试 384 爻吉凶判定分布
const s = require('../src/lib/iching/hexagrams_skeleton.json');

// 内联 judgeYao 逻辑（与 yao_fortune.ts 一致）
function judgeYao(t) {
  if (/凶/.test(t)) {
    if (/(终吉|居贞吉|艰则吉|有终)/.test(t)) return 'caution';
    return 'bad';
  }
  if (/勿用|勿有攸往|勿往/.test(t)) return 'wait';
  if (/元吉|大吉/.test(t)) return 'great-good';
  if (/吉/.test(t)) return 'good';
  if (/利涉大川|利见大人|利有攸往|无不利|利贞/.test(t)) return 'good';
  if (/厉|吝|有悔|灾|眚|羞|戕/.test(t)) {
    if (/无咎/.test(t) && !/(厉|吝|悔|灾|眚|羞|凶)/.test(t.replace('无咎',''))) return 'neutral';
    return 'caution';
  }
  if (/无咎|悔亡/.test(t)) return 'neutral';
  if (/亨|利/.test(t)) return 'good';
  return 'neutral';
}

const stats = {};
const samples = { 'great-good':[], 'good':[], 'neutral':[], 'caution':[], 'bad':[], 'wait':[] };

for (const h of s.hexagrams) {
  h.yaoCi.forEach((y, i) => {
    const f = judgeYao(y);
    stats[f] = (stats[f] || 0) + 1;
    if (samples[f].length < 3) samples[f].push(`${h.name}${i+1}: ${y}`);
  });
}

console.log('=== 384 爻吉凶分布 ===');
const labels = {'great-good':'大吉','good':'吉','neutral':'平/无咎','caution':'需谨慎','bad':'凶','wait':'暂宜止'};
for (const [k,v] of Object.entries(stats)) {
  console.log(`${labels[k].padEnd(6)}: ${v} 爻 (${(v/384*100).toFixed(0)}%)`);
}
console.log('\n=== 各类样例 ===');
for (const [k, arr] of Object.entries(samples)) {
  if (arr.length) {
    console.log(`\n【${labels[k]}】`);
    arr.forEach(a => console.log('  ' + a));
  }
}
