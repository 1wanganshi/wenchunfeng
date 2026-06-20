import { useRef, useEffect, useState } from 'react';
import { trigramsToHexagram } from '@/lib/iching/constants';
import type { DivineResponse } from '@/lib/iching/types';

interface ShareCardProps {
  result: DivineResponse;
  onClose: () => void;
}

/**
 * 分享卡：用 Canvas 绘制
 * 布局：顶部 AI 意象图 + 卦名 + 谶语 + 落款
 * 尺寸：375 × 667（竖版手机比例）
 */
export default function ShareCard({ result, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [drawing, setDrawing] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 375;
    const H = 667;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.scale(2, 2);

    const drawCard = (heroImg: HTMLImageElement | null) => {
      // 宣纸底
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#f5efe0');
      grad.addColorStop(1, '#ebe2cd');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // 纸纹噪点
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = '#000';
      for (let i = 0; i < 600; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const margin = 24;
      const imgSize = W - margin * 2;
      const imgY = margin;

      // 顶部意象图（正方形）
      if (heroImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(margin, imgY, imgSize, imgSize, 4);
        ctx.clip();
        ctx.drawImage(heroImg, margin, imgY, imgSize, imgSize);
        ctx.restore();
        // 图边框
        ctx.strokeStyle = 'rgba(28,28,28,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(margin, imgY, imgSize, imgSize, 4);
        ctx.stroke();
      } else {
        // 没有图时，用书法卦名占位
        ctx.fillStyle = 'rgba(196,59,45,0.06)';
        ctx.beginPath();
        ctx.roundRect(margin, imgY, imgSize, imgSize, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(28,28,28,0.15)';
        ctx.font = '700 90px "Noto Serif SC", "Songti SC", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(result.primary.name, W / 2, imgY + imgSize / 2);
      }

      // 朱印（右上角压在图上）
      const stampW = 52, stampH = 26;
      const stampX = W - margin - stampW - 8;
      const stampY = imgY + 8;
      ctx.save();
      ctx.translate(stampX + stampW / 2, stampY + stampH / 2);
      ctx.rotate(-3 * Math.PI / 180);
      ctx.translate(-(stampX + stampW / 2), -(stampY + stampH / 2));
      ctx.fillStyle = '#c43b2d';
      ctx.beginPath();
      ctx.roundRect(stampX, stampY, stampW, stampH, 3);
      ctx.fill();
      ctx.fillStyle = '#faf6ed';
      ctx.font = '700 13px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('春風卦', stampX + stampW / 2, stampY + stampH / 2);
      ctx.restore();

      let y = imgY + imgSize + 28;

      // 卦名
      ctx.fillStyle = '#1c1c1c';
      ctx.font = '700 30px "Noto Serif SC", "Songti SC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(result.primary.fullName, W / 2, y);
      y += 8;

      // 小卦象（卦名下方，极小）
      y += 14;
      const primaryLines = trigramsToHexagram(result.primary.upperTrigram, result.primary.lowerTrigram);
      const yaoW = 34, yaoH = 3, yaoGap = 4;
      const yaoX = W / 2 - yaoW / 2;
      for (let i = 0; i < 6; i++) {
        const yy = y + i * (yaoH + yaoGap);
        const isMoving = result.cast.movingLine === 6 - i;
        const isYang = primaryLines[5 - i];
        ctx.fillStyle = isMoving ? '#c43b2d' : '#1c1c1c';
        if (isYang) {
          ctx.beginPath();
          ctx.roundRect(yaoX, yy, yaoW, yaoH, 1);
          ctx.fill();
        } else {
          const gap = yaoH * 2;
          const half = (yaoW - gap) / 2;
          ctx.beginPath();
          ctx.roundRect(yaoX, yy, half, yaoH, 1);
          ctx.fill();
          ctx.beginPath();
          ctx.roundRect(yaoX + half + gap, yy, half, yaoH, 1);
          ctx.fill();
        }
      }
      y += 6 * (yaoH + yaoGap) + 22;

      // 分隔线
      ctx.strokeStyle = 'rgba(28,28,28,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin + 30, y);
      ctx.lineTo(W - margin - 30, y);
      ctx.stroke();
      ctx.fillStyle = '#c43b2d';
      ctx.beginPath();
      ctx.arc(W / 2, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      y += 26;

      // 谶语
      ctx.fillStyle = '#1c1c1c';
      ctx.font = '400 15px "Noto Serif SC", "Songti SC", serif';
      ctx.textAlign = 'center';
      const lines = result.primary.oracle.split('\n');
      const lh = 26;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], W / 2, y + i * lh);
      }
      y += lines.length * lh + 10;

      // 落款
      ctx.fillStyle = '#999';
      ctx.font = '11px "Noto Serif SC", serif';
      ctx.fillText('問春風 · 梅花易数起卦', W / 2, H - 30);
      ctx.fillStyle = '#bbb';
      ctx.font = '9px sans-serif';
      ctx.fillText('心诚则灵，玩玩就好', W / 2, H - 16);

      setImageUrl(canvas.toDataURL('image/png'));
      setDrawing(false);
    };

    // 加载意象图
    const heroImg = new Image();
    heroImg.crossOrigin = 'anonymous';
    heroImg.onload = () => drawCard(heroImg);
    heroImg.onerror = () => drawCard(null);
    heroImg.src = `/hexagrams/${result.primary.number.toString().padStart(2, '0')}.png`;
  }, [result]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
          <span className="font-title text-sm tracking-wider">分享卡片</span>
          <button className="text-ink-pale hover:text-ink text-sm" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="p-4 flex justify-center bg-paper min-h-[200px] items-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="分享卡片"
              className="shadow-md rounded-sm max-w-full"
              style={{ width: 280 }}
            />
          ) : (
            <span className="text-ink-pale text-sm">{drawing ? '生成中...' : ''}</span>
          )}
        </div>
        <div className="p-3 border-t border-gray-100 flex gap-3">
          <button
            className="dim-btn flex-1 text-sm"
            disabled={!imageUrl}
            onClick={() => {
              if (!imageUrl) return;
              const link = document.createElement('a');
              link.download = `问春风-${result.primary.name}卦.png`;
              link.href = imageUrl;
              link.click();
            }}
          >
            保存图片
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
