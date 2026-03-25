export interface CertificateData {
  participantName: string;
  courseTitle: string;
  duration: string;
  dateIssued: string | null;
  certificateCode: string | null;
}

export function generateCertificate(data: CertificateData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const W = 1200;
      const H = 850;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // ─── Background ────────────────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#FEFDF5');
      bg.addColorStop(0.5, '#FAF6EC');
      bg.addColorStop(1, '#F5F0E0');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Subtle radial glow in center
      const glow = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 600);
      glow.addColorStop(0, 'rgba(255,255,255,0.45)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // ─── Triple Border ─────────────────────────────────────────────────────────
      // Outermost — navy
      ctx.strokeStyle = '#1a237e';
      ctx.lineWidth = 12;
      drawRRect(ctx, 14, 14, W - 28, H - 28, 10);
      ctx.stroke();

      // Gold accent
      ctx.strokeStyle = '#C9A84C';
      ctx.lineWidth = 3;
      drawRRect(ctx, 29, 29, W - 58, H - 58, 6);
      ctx.stroke();

      // Inner thin navy
      ctx.strokeStyle = '#1a237e';
      ctx.lineWidth = 1;
      drawRRect(ctx, 40, 40, W - 80, H - 80, 3);
      ctx.stroke();

      // ─── Corner Ornaments ──────────────────────────────────────────────────────
      drawCorner(ctx, 56, 56, 1, 1); // top-left
      drawCorner(ctx, W - 56, 56, -1, 1); // top-right
      drawCorner(ctx, W - 56, H - 56, -1, -1); // bottom-right
      drawCorner(ctx, 56, H - 56, 1, -1); // bottom-left

      // ─── Header Ornament ───────────────────────────────────────────────────────
      drawHeaderDots(ctx, W / 2, 85);

      // ─── CERTIFICATE ───────────────────────────────────────────────────────────
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = 'rgba(26,35,126,0.18)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#1a237e';
      ctx.font = "bold 70px 'Times New Roman', 'Georgia', serif";
      ctx.fillText('CERTIFICATE', W / 2, 148);
      clearShadow(ctx);

      ctx.fillStyle = '#B8860B';
      ctx.font = "bold 28px 'Times New Roman', 'Georgia', serif";
      ctx.fillText('O F   A C H I E V E M E N T', W / 2, 194);

      // ─── Divider ───────────────────────────────────────────────────────────────
      drawDivider(ctx, W, 222);

      // ─── "This certificate is proudly presented to" ────────────────────────────
      ctx.fillStyle = '#777';
      ctx.font = "italic 20px 'Times New Roman', 'Georgia', serif";
      ctx.fillText('This certificate is proudly presented to', W / 2, 261);

      // ─── Participant Name ──────────────────────────────────────────────────────
      ctx.shadowColor = 'rgba(26,35,126,0.14)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#1a237e';
      ctx.font = "bold 52px 'Times New Roman', 'Georgia', 'Sarabun', sans-serif";
      ctx.fillText(data.participantName, W / 2, 322);
      clearShadow(ctx);

      // Gold underline under name
      const nW = Math.min(ctx.measureText(data.participantName).width + 80, W - 180);
      ctx.strokeStyle = '#C9A84C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - nW / 2, 349);
      ctx.lineTo(W / 2 + nW / 2, 349);
      ctx.stroke();

      // ─── "in recognition..." ───────────────────────────────────────────────────
      ctx.fillStyle = '#777';
      ctx.font = "italic 20px 'Times New Roman', 'Georgia', serif";
      ctx.fillText('in recognition of the successful completion of the course', W / 2, 385);

      // ─── Course Title ──────────────────────────────────────────────────────────
      ctx.fillStyle = '#1a237e';
      ctx.font = "bold 28px 'Times New Roman', 'Georgia', 'Sarabun', sans-serif";
      const endCourseY = wrapCenter(ctx, data.courseTitle, W / 2, 428, W - 200, 38);

      // ─── Body Paragraph ────────────────────────────────────────────────────────
      const bodyTop = endCourseY + 38;

      ctx.fillStyle = '#555';
      ctx.font = "italic 16px 'Times New Roman', 'Georgia', serif";
      const p1End = wrapCenter(
        ctx,
        'Your dedication, commitment, and outstanding performance throughout the program are truly commendable.',
        W / 2,
        bodyTop,
        W - 200,
        24,
      );
      const p2End = wrapCenter(
        ctx,
        'Your efforts have demonstrated a strong pursuit of knowledge and professional growth.',
        W / 2,
        p1End + 26,
        W - 200,
        24,
      );

      ctx.fillStyle = '#666';
      ctx.font = "italic 15px 'Times New Roman', 'Georgia', serif";
      const p3End = wrapCenter(
        ctx,
        'We congratulate you on this achievement and wish you continued success in all your future endeavors.',
        W / 2,
        p2End + 26,
        W - 200,
        22,
      );

      // ─── Bottom Divider ────────────────────────────────────────────────────────
      const divY = p3End + 44;
      drawDivider(ctx, W, divY);

      // ─── Date & Signature ──────────────────────────────────────────────────────
      const botY = divY + 68;

      // Left — Date + Duration
      ctx.textAlign = 'left';
      ctx.fillStyle = '#555';
      ctx.font = "16px 'Times New Roman', serif";
      ctx.fillText(
        `Date: ${data.dateIssued || new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        90,
        botY,
      );
      ctx.fillStyle = '#888';
      ctx.font = "14px 'Times New Roman', serif";
      ctx.fillText(`Duration: ${data.duration}`, 90, botY + 28);

      // Right — Signature
      const sigX = W - 230;
      ctx.strokeStyle = '#C9A84C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sigX - 125, botY - 8);
      ctx.lineTo(sigX + 125, botY - 8);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#1a237e';
      ctx.font = "bold 17px 'Times New Roman', serif";
      ctx.fillText('Mr. Saman Thumjai', sigX, botY + 14);
      ctx.fillStyle = '#888';
      ctx.font = "15px 'Times New Roman', serif";
      ctx.fillText('Director', sigX, botY + 36);

      // ─── Certificate Code (footer) ─────────────────────────────────────────────
      if (data.certificateCode) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ccc';
        ctx.font = '11px monospace';
        ctx.fillText(`Certificate No. ${data.certificateCode}`, W / 2, H - 48);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.96));
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function drawRRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** Corner bracket — dx/dy ±1 controls direction (inward from corner) */
function drawCorner(ctx: CanvasRenderingContext2D, cx: number, cy: number, dx: number, dy: number) {
  const arm = 30;
  const off = 9;
  ctx.lineCap = 'round';

  // Outer L
  ctx.strokeStyle = '#C9A84C';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx + dx * arm, cy);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx, cy + dy * arm);
  ctx.stroke();

  // Inner accent
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + dx * (arm - off), cy + dy * off);
  ctx.lineTo(cx + dx * off, cy + dy * off);
  ctx.lineTo(cx + dx * off, cy + dy * (arm - off));
  ctx.stroke();

  // Corner dot
  ctx.fillStyle = '#C9A84C';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeaderDots(ctx: CanvasRenderingContext2D, cx: number, y: number) {
  const positions = [-2, -1, 0, 1, 2];
  const sizes = [3, 5, 7, 5, 3];
  const gap = 28;
  for (let i = 0; i < positions.length; i++) {
    const px = cx + positions[i]! * gap;
    const s = sizes[i]!;
    ctx.save();
    ctx.translate(px, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#C9A84C';
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.restore();
  }
}

function drawDivider(ctx: CanvasRenderingContext2D, W: number, y: number) {
  const pad = 80;
  const cx = W / 2;
  ctx.strokeStyle = '#C9A84C';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(cx - 22, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 22, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();

  // Central diamond
  ctx.save();
  ctx.translate(cx, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#C9A84C';
  ctx.fillRect(-7, -7, 14, 14);
  ctx.restore();

  // Small side dots
  ctx.fillStyle = '#C9A84C';
  ctx.beginPath();
  ctx.arc(cx - 36, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 36, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/** Wraps centered text; returns Y of last line drawn */
function wrapCenter(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const test = line + (words[i] ?? '') + ' ';
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = (words[i] ?? '') + ' ';
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, curY);
  return curY;
}
