/**
 * 补齐缺失的卦图 —— 单并发、慢速、避开限流
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'sk-KYQAyxDocaBJz0QBV0Gul4PMdN5sg8qfWZxLtKFMrSJds5ZK';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'hexagrams');

// 从主脚本里复制 prompt 表
const HEXAGRAM_PROMPTS = require('./hexagram_prompts.js');

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) { reject(new Error(`download ${response.statusCode}`)); return; }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => { fileStream.close(); resolve(destPath); });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ model: 'gpt-image-2', prompt, size: '1024x1024', n: 1 });
    const options = {
      hostname: 'www.fmgo.top', path: '/v1/images/generations', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(postData) },
      timeout: 200000,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data[0] && json.data[0].url) resolve(json.data[0].url);
          else reject(new Error(data.slice(0, 150)));
        } catch (e) { reject(new Error(data.slice(0, 150))); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(postData); req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  // 找出缺失的卦
  const missing = [];
  for (let i = 1; i <= 64; i++) {
    const f = path.join(OUTPUT_DIR, `${i.toString().padStart(2, '0')}.png`);
    if (!fs.existsSync(f) || fs.statSync(f).size < 10000) missing.push(i);
  }
  console.log(`缺失 ${missing.length} 张: ${missing.join(', ')}\n`);

  for (const num of missing) {
    const prompt = HEXAGRAM_PROMPTS[num];
    const outPath = path.join(OUTPUT_DIR, `${num.toString().padStart(2, '0')}.png`);
    const tmpPath = outPath + '.tmp';
    let done = false;
    for (let attempt = 1; attempt <= 5 && !done; attempt++) {
      try {
        process.stdout.write(`卦${num} 第${attempt}次... `);
        const url = await generateImage(prompt);
        await downloadImage(url, tmpPath);
        fs.renameSync(tmpPath, outPath);
        console.log('✓');
        done = true;
      } catch (e) {
        console.log(`✗ ${e.message.slice(0, 50)}`);
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        await sleep(8000); // 限流时多等
      }
    }
    if (!done) console.log(`卦${num} 最终失败`);
    await sleep(3000); // 每张之间间隔，避免限流
  }

  // 最终统计
  const stillMissing = [];
  for (let i = 1; i <= 64; i++) {
    const f = path.join(OUTPUT_DIR, `${i.toString().padStart(2, '0')}.png`);
    if (!fs.existsSync(f) || fs.statSync(f).size < 10000) stillMissing.push(i);
  }
  console.log(`\n完成。仍缺失: ${stillMissing.length ? stillMissing.join(', ') : '无，全部 64 张完成！'}`);
}

main();
