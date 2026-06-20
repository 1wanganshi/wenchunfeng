/**
 * 批量生成 64 卦 AI 意象图
 * 使用 fmgo.top 的 gpt-image-2 模型
 * 风格：新中式水墨 + 推背图意境 + 意象化 + 留白
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const API_KEY = 'sk-KYQAyxDocaBJz0QBV0Gul4PMdN5sg8qfWZxLtKFMrSJds5ZK';
const API_URL = 'https://www.fmgo.top/v1/images/generations';
const MODEL = 'gpt-image-2';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'hexagrams');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 64 卦的生图 prompt（每卦一个独特的意象场景）
// 风格统一：中国水墨 + 留白 + 意象化 + 推背图式的神秘意境
const HEXAGRAM_PROMPTS = {
  1: 'Chinese ink wash painting of a dragon soaring high in the clouds, minimalist, large blank space, zen style, mysterious ancient Chinese aesthetic, ink diffusion effect, golden ratio composition, masterpiece',
  2: 'Chinese ink wash painting of vast fertile earth with mountains in distance, a single river flowing gently, minimalist, large blank space, zen aesthetic, earth tones, ancient Chinese landscape, masterpiece',
  3: 'Chinese ink wash painting of a seed sprouting through dark soil during thunderstorm, new life emerging from chaos, rain and lightning in background, minimalist, mysterious atmosphere, large blank space, masterpiece',
  4: 'Chinese ink wash painting of a clear spring flowing from beneath a mountain, young scholars seeking wisdom by the water, misty mountains, minimalist, large blank space, zen atmosphere, masterpiece',
  5: 'Chinese ink wash painting of dense clouds gathering in the sky before rain, a scholar waiting patiently under a pavilion, wine jar beside him, minimalist, large blank space, anticipation mood, masterpiece',
  6: 'Chinese ink wash painting of sky and water flowing in opposite directions, two boats passing each other, tension and conflict implied, minimalist ink wash, large blank space, ancient Chinese aesthetic, masterpiece',
  7: 'Chinese ink wash painting of an army marching through vast wilderness, commander on horseback, flags flowing, disciplined troops, minimalist ink wash, large blank space, solemn atmosphere, masterpiece',
  8: 'Chinese ink wash painting of water soaking into the earth, people gathering together harmoniously around a well, unity and connection theme, minimalist ink wash, large blank space, warm atmosphere, masterpiece',
  9: 'Chinese ink wash painting of wind blowing gently across the sky, small clouds gathering, not yet raining, accumulation theme, minimalist ink wash, large blank space, subtle delicate atmosphere, masterpiece',
  10: 'Chinese ink wash painting of a person carefully stepping on a tigers tail, the tiger not attacking, balance and caution theme, minimalist ink wash, large blank space, tense but graceful, masterpiece',
  11: 'Chinese ink wash painting of heaven and earth meeting, everything flowing smoothly, flowers blooming, river flowing, harmony and prosperity theme, minimalist ink wash, large blank space, peaceful joyful, masterpiece',
  12: 'Chinese ink wash painting of sky rising and earth sinking, growing apart, withered tree on barren ground, obstruction and stagnation theme, minimalist ink wash, large blank space, somber mood, masterpiece',
  13: 'Chinese ink wash painting of people gathering together under a bright sky, like-minded companions walking together, friendship and unity theme, minimalist ink wash, large blank space, warm hopeful, masterpiece',
  14: 'Chinese ink wash painting of a great fire in the sky above vast fields, abundant harvest, prosperity and richness theme, golden light, minimalist ink wash with golden accents, large blank space, masterpiece',
  15: 'Chinese ink wash painting of a tall mountain hidden within the earth, humility and hidden strength theme, a lone traveler on the path, minimalist ink wash, large blank space, quiet dignified atmosphere, masterpiece',
  16: 'Chinese ink wash painting of thunder echoing over the earth, people enjoying music and dance, celebration and joy theme, minimalist ink wash, large blank space, lively harmonious, masterpiece',
  17: 'Chinese ink wash painting of thunder hidden within a marsh, following the natural flow, a wise person adapting to circumstances, minimalist ink wash, large blank space, flowing organic, masterpiece',
  18: 'Chinese ink wash painting of wind blowing through mountains, decay and renewal theme, an old temple being restored, minimalist ink wash, large blank space, mysterious transformative, masterpiece',
  19: 'Chinese ink wash painting of a gentle slope above a marsh, approaching tide, leader watching from above, supervision and guidance theme, minimalist ink wash, large blank space, majestic calm, masterpiece',
  20: 'Chinese ink wash painting of wind blowing over the earth, observation and contemplation theme, a sage observing the world from a high place, minimalist ink wash, large blank space, philosophical mood, masterpiece',
  21: 'Chinese ink wash painting of lightning striking through a dark sky, biting through obstacles, justice and judgment theme, fire and thunder, minimalist ink wash, large blank space, dramatic powerful, masterpiece',
  22: 'Chinese ink wash painting of a mountain glowing with sunset light, ornament and beauty theme, a scholar in elegant robes, minimalist ink wash with warm golden tones, large blank space, refined aesthetic, masterpiece',
  23: 'Chinese ink wash painting of a mountain slowly eroding, peeling away layers, decline and stripping away theme, bare tree on crumbling cliff, minimalist ink wash, large blank space, somber poetic, masterpiece',
  24: 'Chinese ink wash painting of thunder deep within the earth, spring returning, renewal and rebirth theme, first sprout in frozen ground, minimalist ink wash, large blank space, hopeful quiet, masterpiece',
  25: 'Chinese ink wash painting of thunder rolling naturally across the sky, no delusion, pure authenticity theme, clear open sky, minimalist ink wash, large blank space, honest straightforward, masterpiece',
  26: 'Chinese ink wash painting of a great mountain containing the sky within, great accumulation and stored potential, hidden treasure theme, majestic misty mountain, minimalist ink wash, large blank space, monumental quiet, masterpiece',
  27: 'Chinese ink wash painting of an open mouth with mountain above and thunder below, nourishment and care theme, a wise elder teaching the young, minimalist ink wash, large blank space, gentle nurturing, masterpiece',
  28: 'Chinese ink wash painting of a weakened beam bending under great weight, crisis and excess theme, a wooden structure straining, minimalist ink wash, large blank space, tense dramatic, masterpiece',
  29: 'Chinese ink wash painting of water flowing through dangerous gorges, one after another, perseverance through difficulty theme, river winding through cliffs, minimalist ink wash, large blank space, dangerous but determined, masterpiece',
  30: 'Chinese ink wash painting of two bright fires, one above the other, illumination and clarity theme, lighthouse guiding through dark night, minimalist ink wash with warm glow, large blank space, radiant warm, masterpiece',
  31: 'Chinese ink wash painting of a serene lake reflecting a mountain, mutual attraction and resonance theme, two hearts connecting, misty romantic atmosphere, minimalist ink wash, large blank space, tender poetic, masterpiece',
  32: 'Chinese ink wash painting of wind and thunder in harmony, long lasting and eternal theme, a great tree standing firm through seasons, minimalist ink wash, large blank space, steady enduring, masterpiece',
  33: 'Chinese ink wash painting of heaven rising above a mountain, retreat and withdrawal theme, a wise hermit walking away into the mountains, minimalist ink wash, large blank space, solitary dignified, masterpiece',
  34: 'Chinese ink wash painting of thunder booming powerfully in the sky above, great strength and vitality theme, powerful unstoppable force, minimalist ink wash, large blank space, dynamic energetic, masterpiece',
  35: 'Chinese ink wash painting of the sun rising from the earth, progress and advancement theme, dawn breaking over mountains, golden morning light, minimalist ink wash with warm tones, large blank space, hopeful rising, masterpiece',
  36: 'Chinese ink wash painting of the sun setting into the earth, light wounded and hidden, darkness falling, a lone figure walking into twilight, minimalist ink wash, large blank space, melancholic poetic, masterpiece',
  37: 'Chinese ink wash painting of wind blowing from a warm hearth, family and home theme, a traditional Chinese house with warm light from windows, smoke rising from chimney, minimalist ink wash, large blank space, cozy warm, masterpiece',
  38: 'Chinese ink wash painting of fire above a marsh, opposites facing each other, divergence and misunderstanding theme, two figures looking in different directions, minimalist ink wash, large blank space, tense separated, masterpiece',
  39: 'Chinese ink wash painting of a rushing stream blocked by mountains, difficulty and obstruction theme, a traveler stopped by a steep mountain pass, minimalist ink wash, large blank space, challenging determined, masterpiece',
  40: 'Chinese ink wash painting of thunder and rain dispersing, release and relief theme, storm clearing, rainbow appearing, tension dissolving, minimalist ink wash, large blank space, liberating fresh, masterpiece',
  41: 'Chinese ink wash painting of a mountain lake with water level decreasing, reduction and sacrifice theme, giving up something for a higher purpose, minimalist ink wash, large blank space, contemplative solemn, masterpiece',
  42: 'Chinese ink wash painting of wind and thunder joining forces, increase and benefit theme, nourishing rain falling on sprouting seeds, minimalist ink wash, large blank space, fertile growing, masterpiece',
  43: 'Chinese ink wash painting of a rising flood about to break through, decisive breakthrough theme, water at the brim of a dam, tension before release, minimalist ink wash, large blank space, powerful climactic, masterpiece',
  44: 'Chinese ink wash painting of wind meeting the sky unexpectedly, a chance encounter theme, two strangers meeting on a winding road, minimalist ink wash, large blank space, fateful mysterious, masterpiece',
  45: 'Chinese ink wash painting of a gathering of people by a lake, assembly and community theme, a crowd coming together for celebration, minimalist ink wash, large blank space, united festive, masterpiece',
  46: 'Chinese ink wash painting of wind rising from the earth, ascending and growth theme, a tree reaching toward the sky, roots deep below, minimalist ink wash, large blank space, upward hopeful, masterpiece',
  47: 'Chinese ink wash painting of a withered tree in a dried-up lake, exhaustion and hardship theme, a person trapped with no way out, minimalist ink wash, large blank space, desolate resilient, masterpiece',
  48: 'Chinese ink wash painting of a deep water well, sustenance and resource theme, people drawing water from an ancient well, minimalist ink wash, large blank space, deep refreshing, masterpiece',
  49: 'Chinese ink wash painting of fire burning within a marsh, revolution and transformation theme, a phoenix rising from flames, old being consumed to make way for new, minimalist ink wash, large blank space, dramatic powerful, masterpiece',
  50: 'Chinese ink wash painting of a ceremonial bronze tripod cauldron over fire, new beginnings and establishment theme, ancient ritual vessel, golden light, minimalist ink wash with bronze tones, large blank space, sacred monumental, masterpiece',
  51: 'Chinese ink wash painting of thunder echoing thunder, shock and awakening theme, lightning striking, a person startled but unharmed, minimalist ink wash, large blank space, powerful startling, masterpiece',
  52: 'Chinese ink wash painting of two mountains standing still, one above the other, stillness and stopping theme, a meditating monk unmoving, minimalist ink wash, large blank space, calm centred, masterpiece',
  53: 'Chinese ink wash painting of wild geese gradually flying toward the mountains, gradual progress theme, flock of birds in formation, minimalist ink wash, large blank space, patient steady, masterpiece',
  54: 'Chinese ink wash painting of thunder over a still marsh, a young woman about to marry, transition and new role theme, wedding procession in distance, minimalist ink wash, large blank space, tender anticipatory, masterpiece',
  55: 'Chinese ink wash painting of thunder and lightning at midday, abundance and fullness theme, sun at highest point, dramatic shadows, minimalist ink wash, large blank space, intense fleeting, masterpiece',
  56: 'Chinese ink wash painting of fire burning on a mountain top, a wanderer traveling through foreign lands, journey and displacement theme, lone traveler with pack, minimalist ink wash, large blank space, wandering solitary, masterpiece',
  57: 'Chinese ink wash painting of wind following wind, gentle penetration and flexibility theme, wind bending grass but not breaking it, minimalist ink wash, large blank space, subtle persistent, masterpiece',
  58: 'Chinese ink wash painting of two marsh lakes side by side, joy and harmony theme, reflections on calm water, minimalist ink wash, large blank space, peaceful content, masterpiece',
  59: 'Chinese ink wash painting of wind blowing over water, dispersion and dissolution theme, ice breaking up on a lake, fragments drifting apart, minimalist ink wash, large blank space, liberating melancholic, masterpiece',
  60: 'Chinese ink wash painting of water held back by a dam, moderation and limits theme, a controlled waterway, balance between too much and too little, minimalist ink wash, large blank space, measured balanced, masterpiece',
  61: 'Chinese ink wash painting of wind above a marsh, inner truth and sincerity theme, a heart reflected in still water, trust and honesty, minimalist ink wash, large blank space, pure genuine, masterpiece',
  62: 'Chinese ink wash painting of thunder above a mountain, small excess and imperfection theme, a bird trying to fly too high, caution against overreach, minimalist ink wash, large blank space, careful modest, masterpiece',
  63: 'Chinese ink wash painting of water above fire, completion and balance theme, a just-filled vessel, things achieved but caution needed, minimalist ink wash, large blank space, achieved but fragile, masterpiece',
  64: 'Chinese ink wash painting of fire above water, not yet complete, crossing the river but not yet to the other side, a fox with its tail still wet, minimalist ink wash, large blank space, unresolved hopeful, masterpiece',
};

// 下载图片
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

// 调用 API 生成单张图
function generateImage(prompt, size = '1024x1024') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: MODEL,
      prompt: prompt,
      size: size,
      n: 1,
    });

    const options = {
      hostname: 'www.fmgo.top',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 180000, // 3 分钟超时
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data[0] && json.data[0].url) {
            resolve(json.data[0].url);
          } else {
            reject(new Error(`Unexpected response: ${data.slice(0, 200)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}, data: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// 主函数
async function main() {
  const startNum = parseInt(process.argv[2] || '1', 10);
  const endNum = parseInt(process.argv[3] || '64', 10);
  const concurrency = parseInt(process.argv[4] || '2', 10);

  console.log(`Generating hexagrams ${startNum}-${endNum}, concurrency: ${concurrency}`);
  console.log(`Output dir: ${OUTPUT_DIR}`);
  console.log('');

  const nums = [];
  for (let i = startNum; i <= endNum; i++) {
    const outPath = path.join(OUTPUT_DIR, `${i.toString().padStart(2, '0')}.png`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
      console.log(`[skip] ${i} already exists`);
      continue;
    }
    nums.push(i);
  }

  console.log(`\n${nums.length} images to generate\n`);

  let completed = 0;
  let failed = [];

  // 并发控制
  async function worker(workerId) {
    while (nums.length > 0) {
      const num = nums.shift();
      const prompt = HEXAGRAM_PROMPTS[num];
      if (!prompt) {
        console.log(`[warn] No prompt for hexagram ${num}`);
        continue;
      }

      const outPath = path.join(OUTPUT_DIR, `${num.toString().padStart(2, '0')}.png`);
      const tmpPath = outPath + '.tmp';

      console.log(`[${workerId}] Generating hexagram ${num}...`);
      const startTime = Date.now();

      try {
        // 重试 3 次
        let url = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            url = await generateImage(prompt, '1024x1024');
            break;
          } catch (e) {
            if (attempt < 3) {
              console.log(`[${workerId}] Attempt ${attempt} failed for ${num}: ${e.message}, retrying...`);
              await new Promise((r) => setTimeout(r, 5000));
            } else {
              throw e;
            }
          }
        }

        await downloadImage(url, tmpPath);
        fs.renameSync(tmpPath, outPath);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        completed++;
        console.log(`[${workerId}] ✓ ${num} done (${elapsed}s) — ${completed}/${nums.length + completed + failed.length}`);
      } catch (e) {
        failed.push(num);
        console.log(`[${workerId}] ✗ ${num} FAILED: ${e.message}`);
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker(`W${i + 1}`));
  }
  await Promise.all(workers);

  console.log('');
  console.log('================================');
  console.log(`Done! Completed: ${completed}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log(`Failed hexagrams: ${failed.join(', ')}`);
  }
  console.log('================================');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
