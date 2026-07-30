// 检查每卦 6 维度是否齐全 + 长度是否达标
const fs = require('fs');
function checkFile(path, name) {
  const src = fs.readFileSync(path, 'utf8');
  const blocks = src.split(/^  (?=\d+: \{)/m);
  const issues = [];
  const dimRe = /(career|love|wealth|decision|health|social):/g;
  for (const b of blocks) {
    const m = b.match(/^(\d+): \{/);
    if (!m) continue;
    const num = +m[1];
    const found = new Set([...b.matchAll(dimRe)].map(x => x[1]));
    const dims = ['career','love','wealth','decision','health','social'];
    const missing = dims.filter(d => !found.has(d));
    if (missing.length) issues.push(num + '缺:' + missing.join('/'));
    for (const d of dims) {
      const dm = b.match(new RegExp(d + ": '([^']*)'"));
      if (dm && dm[1].length < 20) issues.push(num + '.' + d + ' 过短(' + dm[1].length + '字): ' + dm[1]);
    }
  }
  console.log(name + ' 检查完毕, 问题数=' + issues.length);
  for (const i of issues) console.log('  - ' + i);
}
checkFile('src/lib/iching/compact_content.ts', 'compact');
checkFile('src/lib/iching/flagship_content.ts', 'flagship');
