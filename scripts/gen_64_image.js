// 本地生成 64 卦「火水未济」意象图 —— 上游 API 持续 504 的兜底方案
// 风格：水墨淡彩，上半火（离）、下半水（坎），小狐狸渡河将成未成
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1024, H = 1024;
const cv = createCanvas(W, H);
const ctx = cv.getContext('2d');

// 宣纸底色（暖白，与其他卦图一致）
const paperGrad = ctx.createLinearGradient(0, 0, 0, H);
paperGrad.addColorStop(0, '#f5f0e6');
paperGrad.addColorStop(0.5, '#f2ecdf');
paperGrad.addColorStop(1, '#ede6d6');
ctx.fillStyle = paperGrad;
ctx.fillRect(0, 0, W, H);

// 宣纸纹理（淡斑点）
for (let i = 0; i < 300; i++) {
  const x = Math.random() * W, y = Math.random() * H;
  ctx.fillStyle = `rgba(180, 165, 140, ${Math.random() * 0.06})`;
  ctx.beginPath();
  ctx.arc(x, y, Math.random() * 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// 上部：离火（暖红橙，火在水上）—— 未济是上离下坎
function drawFire(cx, cy, scale, alpha) {
  for (let i = 0; i < 40; i++) {
    const t = i / 40;
    const r = 8 + t * 90 * scale;
    const y = cy - t * 130 * scale + (Math.random() - 0.5) * 20;
    const x = cx + (Math.random() - 0.5) * 90 * scale;
    const hue = 15 + Math.random() * 25; // 橙红
    ctx.fillStyle = `hsla(${hue}, 75%, ${45 + t * 20}%, ${alpha * (1 - t)})`;
    ctx.beginPath();
    ctx.arc(x, y, r * (1 - t * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
}

// 火团（上部中央偏右，如落日余烬）
drawFire(560, 340, 1.1, 0.10);
drawFire(500, 300, 0.8, 0.08);
drawFire(620, 290, 0.7, 0.07);

// 火的光晕
const glowGrad = ctx.createRadialGradient(560, 320, 10, 560, 320, 260);
glowGrad.addColorStop(0, 'rgba(230, 120, 60, 0.14)');
glowGrad.addColorStop(1, 'rgba(230, 120, 60, 0)');
ctx.fillStyle = glowGrad;
ctx.fillRect(0, 0, W, 640);

// 下部：坎水（淡墨蓝，水在火下）
function drawWater(yBase, alpha) {
  for (let i = 0; i < 60; i++) {
    const y = yBase + (Math.random() - 0.3) * 90;
    const x = Math.random() * W;
    const w = 60 + Math.random() * 180;
    ctx.strokeStyle = `rgba(70, 90, 110, ${alpha * Math.random()})`;
    ctx.lineWidth = 1.5 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + w * 0.3, y - 6, x + w * 0.6, y + 6, x + w, y);
    ctx.stroke();
  }
}
drawWater(700, 0.18);
drawWater(760, 0.14);
drawWater(820, 0.10);

// 水面淡色块
const waterGrad = ctx.createLinearGradient(0, 620, 0, H);
waterGrad.addColorStop(0, 'rgba(120, 145, 165, 0.10)');
waterGrad.addColorStop(1, 'rgba(120, 145, 165, 0.22)');
ctx.fillStyle = waterGrad;
ctx.fillRect(0, 620, W, H - 620);

// 小狐狸剪影（渡河将成未成，尾巴还沾着水）
ctx.save();
ctx.translate(470, 660);
ctx.fillStyle = 'rgba(60, 55, 50, 0.55)';
// 身体
ctx.beginPath();
ctx.ellipse(0, 0, 42, 22, -0.15, 0, Math.PI * 2);
ctx.fill();
// 头
ctx.beginPath();
ctx.ellipse(38, -14, 18, 14, 0.2, 0, Math.PI * 2);
ctx.fill();
// 耳朵
ctx.beginPath();
ctx.moveTo(30, -26); ctx.lineTo(26, -40); ctx.lineTo(38, -30); ctx.closePath();
ctx.moveTo(46, -26); ctx.lineTo(50, -40); ctx.lineTo(56, -28); ctx.closePath();
ctx.fill();
// 尾巴（后半没入水，未济之象：尾巴湿了）
ctx.beginPath();
ctx.ellipse(-48, 12, 30, 12, 0.5, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// 尾巴入水处的涟漪
ctx.strokeStyle = 'rgba(70, 90, 110, 0.25)';
ctx.lineWidth = 2;
for (let r = 8; r <= 40; r += 11) {
  ctx.beginPath();
  ctx.ellipse(420, 690, r, r * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// 火水交界的雾（火水未济：互不相济，中间有隔）
const mistGrad = ctx.createLinearGradient(0, 520, 0, 660);
mistGrad.addColorStop(0, 'rgba(245, 240, 230, 0)');
mistGrad.addColorStop(0.5, 'rgba(245, 240, 230, 0.55)');
mistGrad.addColorStop(1, 'rgba(245, 240, 230, 0)');
ctx.fillStyle = mistGrad;
ctx.fillRect(0, 520, W, 140);

// 左上题字：火水未济
ctx.fillStyle = 'rgba(40, 38, 35, 0.82)';
ctx.font = 'bold 52px "KaiTi", "STKaiti", "SimSun", serif';
ctx.textAlign = 'left';
ctx.fillText('火水未济', 60, 110);
// 小字卦义
ctx.font = '28px "KaiTi", "STKaiti", serif';
ctx.fillStyle = 'rgba(40, 38, 35, 0.55)';
ctx.fillText('事未成  慎终如始', 60, 158);

// 印章（朱红方块，仿其他卦图）
ctx.fillStyle = 'rgba(178, 58, 46, 0.78)';
ctx.fillRect(64, 180, 34, 34);
ctx.fillStyle = 'rgba(245, 240, 230, 0.9)';
ctx.font = 'bold 22px "KaiTi", serif';
ctx.textAlign = 'center';
ctx.fillText('未', 81, 205);

// 输出
const out = path.join(__dirname, '..', 'public', 'hexagrams', '64.png');
fs.writeFileSync(out, cv.toBuffer('image/png'));
console.log('generated 64.png, size=' + fs.statSync(out).size);
