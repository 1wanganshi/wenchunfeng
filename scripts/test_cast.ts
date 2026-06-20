// 临时测试脚本，验证起卦算法
import { castFromNumbers, castFromTime, parseInput } from '../src/lib/iching/cast';

// 测试 1：经典案例 - 邵雍观梅占
// 「乾上兑下」即「履」卦，动爻在 3
// 数字 a=1（乾）, b=2（兑）, c=3（求和后 mod 6 = 3）
// 1, 2 → upper=1(乾), lower=2(兑); a+b+? 让 c 让动爻为 3
console.log('=== 测试 1: 邵雍观梅占 ===');
const t1 = castFromNumbers([1, 2, 3]);
console.log(t1);
console.log(`上卦${t1.upper}（应为1乾），下卦${t1.lower}（应为2兑），动爻${t1.movingLine}（应为3）`);
console.log(`本卦${t1.hexagramNumber}（应为10履）`);
console.log();

// 测试 2：单数字输入
console.log('=== 测试 2: 单数字 888 ===');
const t2 = castFromNumbers([888]);
console.log(t2);
console.log();

// 测试 3：时辰起卦
console.log('=== 测试 3: 时辰起卦 ===');
const t3 = castFromTime();
console.log(t3);
console.log();

// 测试 4：parseInput
console.log('=== 测试 4: parseInput ===');
console.log('"123"', parseInput('123'));
console.log('"1 2 3"', parseInput('1 2 3'));
console.log('"1,2,3"', parseInput('1,2,3'));
console.log('"abc"', parseInput('abc'));
console.log('""', parseInput(''));
console.log('"  "', parseInput('  '));
console.log();

// 测试 5：变卦验证（乾卦动初九 → 姤卦）
console.log('=== 测试 5: 变卦 - 乾卦动初九应变姤卦(44) ===');
// 乾(1) 上 乾(1) 下，动爻=1 → 初爻翻转 → 巽下乾上 = 姤(44)
const t5 = castFromNumbers([8, 8, 7]); // 8%8=0→8（坤）—— 我要乾乾，所以应该用 1,1,1
const t5b = castFromNumbers([1, 1, 1]);
console.log('1,1,1:', t5b);
console.log(`本卦${t5b.hexagramNumber}（应为1乾），变卦${t5b.changedHexagramNumber}（应为44姤）`);
