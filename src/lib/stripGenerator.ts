// Client-side photostrip generator using HTML Canvas
// Output: 1080 x 1920 PNG

export interface StripOptions {
  photos: string[]; // base64 data URLs
  weddingDate?: string;
}

export interface StripResult {
  dataUrl: string;
  filename: string;
}

// Strip layout constants (px)
const STRIP_W = 1080;
const STRIP_H = 1920;

const PAD_X = 55;      // horizontal padding for photos
const PAD_TOP = 45;    // top padding
const PAD_BOTTOM = 45; // bottom padding

const HEADER_H = 195;
const FOOTER_H = 160;
const GAP_HEADER = 25; // gap below header
const GAP_PHOTO = 22;  // gap between photos
const GAP_FOOTER = 25; // gap above footer

// Photo dimensions
const PHOTO_W = STRIP_W - PAD_X * 2;  // 970px
const PHOTO_COUNT = 3;
const PHOTO_H = Math.floor(
  (STRIP_H - PAD_TOP - HEADER_H - GAP_HEADER - (PHOTO_COUNT - 1) * GAP_PHOTO - GAP_FOOTER - FOOTER_H - PAD_BOTTOM)
  / PHOTO_COUNT
); // ≈ 474px

const CORNER_RADIUS = 18;
const BORDER_W = 4;
const SHADOW_BLUR = 18;
const SHADOW_OFFSET_Y = 6;
const SHADOW_ALPHA = 0.18;

// Colors
const COLOR_BG = "#F5F1E8";
const COLOR_BURGUNDY = "#800020";
const COLOR_CHAMPAGNE = "#F7E7CE";
const COLOR_CHAMPAGNE_DARK = "#E8C99A";
const COLOR_BROWN = "#6F4E37";
const COLOR_WHITE = "#FFFFFF";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // Shadow
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${SHADOW_ALPHA})`;
  ctx.shadowBlur = SHADOW_BLUR;
  ctx.shadowOffsetY = SHADOW_OFFSET_Y;

  // White border
  roundRect(ctx, x - BORDER_W, y - BORDER_W, w + BORDER_W * 2, h + BORDER_W * 2, CORNER_RADIUS + BORDER_W);
  ctx.fillStyle = COLOR_WHITE;
  ctx.fill();
  ctx.restore();

  // Clip photo to rounded rect
  ctx.save();
  roundRect(ctx, x, y, w, h, CORNER_RADIUS);
  ctx.clip();

  // Draw image cover-fit
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const frameRatio = w / h;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  let sx = 0;
  let sy = 0;

  if (imgRatio > frameRatio) {
    sw = img.naturalHeight * frameRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / frameRatio;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

function drawOrnamentalLine(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  width: number
) {
  const halfW = width / 2;
  const grad = ctx.createLinearGradient(cx - halfW, y, cx + halfW, y);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.3, COLOR_CHAMPAGNE_DARK);
  grad.addColorStop(0.5, COLOR_CHAMPAGNE_DARK);
  grad.addColorStop(1, "transparent");

  ctx.save();
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, y);
  ctx.lineTo(cx + halfW, y);
  ctx.stroke();
  ctx.restore();
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.fillStyle = COLOR_CHAMPAGNE_DARK;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export async function generatePhotostrip(opts: StripOptions): Promise<StripResult> {
  const { photos, weddingDate = "July 5, 2026" } = opts;

  const canvas = document.createElement("canvas");
  canvas.width = STRIP_W;
  canvas.height = STRIP_H;
  const ctx = canvas.getContext("2d")!;

  // ── Background ──────────────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, STRIP_W, STRIP_H);
  bgGrad.addColorStop(0, "#F5F1E8");
  bgGrad.addColorStop(0.5, "#F7E7CE");
  bgGrad.addColorStop(1, "#F5F1E8");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  // Subtle dot texture
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let gx = 20; gx < STRIP_W; gx += 40) {
    for (let gy = 20; gy < STRIP_H; gy += 40) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_BURGUNDY;
      ctx.fill();
    }
  }
  ctx.restore();

  // Thin burgundy borders left and right edge
  ctx.save();
  ctx.fillStyle = COLOR_BURGUNDY;
  ctx.globalAlpha = 0.08;
  ctx.fillRect(0, 0, 6, STRIP_H);
  ctx.fillRect(STRIP_W - 6, 0, 6, STRIP_H);
  ctx.restore();

  const cx = STRIP_W / 2;

  // ── Header ──────────────────────────────────────────────────────────────────
  let y = PAD_TOP;

  // "Wedding Photobooth" subtitle
  ctx.save();
  ctx.fillStyle = COLOR_BROWN;
  ctx.globalAlpha = 0.8;
  ctx.font = `300 28px 'Lato', sans-serif`;
  ctx.textAlign = "center";
  ctx.letterSpacing = "6px";
  ctx.fillText("WEDDING PHOTOBOOTH", cx, y + 36);
  ctx.restore();

  // Ornamental line below subtitle
  drawOrnamentalLine(ctx, cx, y + 52, 280);

  // "Yan ♥ Tin" main title
  ctx.save();
  ctx.font = `700 italic 88px 'Playfair Display', serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_BURGUNDY;
  ctx.fillText("Yan", cx - 68, y + 140);
  ctx.restore();

  ctx.save();
  ctx.font = `400 72px 'Playfair Display', serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_CHAMPAGNE_DARK;
  ctx.fillText("♥", cx, y + 140);
  ctx.restore();

  ctx.save();
  ctx.font = `700 italic 88px 'Playfair Display', serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_BURGUNDY;
  ctx.fillText("Tin", cx + 68, y + 140);
  ctx.restore();

  // Hashtag
  ctx.save();
  ctx.font = `300 26px 'Lato', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_BROWN;
  ctx.globalAlpha = 0.75;
  ctx.fillText("#YanIsFinallyForTin", cx, y + 178);
  ctx.restore();

  // ── Photos ──────────────────────────────────────────────────────────────────
  const photoImages = await Promise.all(photos.map(loadImage));

  let photoY = PAD_TOP + HEADER_H + GAP_HEADER;

  for (let i = 0; i < Math.min(photoImages.length, 3); i++) {
    drawPhoto(ctx, photoImages[i], PAD_X, photoY, PHOTO_W, PHOTO_H);
    photoY += PHOTO_H + (i < 2 ? GAP_PHOTO : 0);
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  const footerY = STRIP_H - PAD_BOTTOM - FOOTER_H;

  // Top ornamental line
  drawOrnamentalLine(ctx, cx, footerY, 320);

  // Small diamonds flanking the line
  drawDiamond(ctx, cx - 180, footerY, 5);
  drawDiamond(ctx, cx + 180, footerY, 5);

  // "Thank you for celebrating with us"
  ctx.save();
  ctx.font = `italic 32px 'Playfair Display', serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_BURGUNDY;
  ctx.fillText("Thank you for celebrating with us", cx, footerY + 45);
  ctx.restore();

  // Hashtag in footer
  ctx.save();
  ctx.font = `400 26px 'Lato', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_BROWN;
  ctx.globalAlpha = 0.8;
  ctx.fillText("#YanIsFinallyForTin", cx, footerY + 85);
  ctx.restore();

  // Wedding date
  ctx.save();
  ctx.font = `300 24px 'Lato', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_BROWN;
  ctx.globalAlpha = 0.6;
  ctx.fillText(weddingDate, cx, footerY + 120);
  ctx.restore();

  // Bottom ornamental line
  drawOrnamentalLine(ctx, cx, footerY + 145, 200);

  // Corner flourishes on the strip
  const flourishSize = 16;
  ctx.save();
  ctx.fillStyle = COLOR_CHAMPAGNE_DARK;
  ctx.globalAlpha = 0.5;
  ctx.font = `${flourishSize * 2}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("✦", 40, 40);
  ctx.fillText("✦", STRIP_W - 40, 40);
  ctx.fillText("✦", 40, STRIP_H - 20);
  ctx.fillText("✦", STRIP_W - 40, STRIP_H - 20);
  ctx.restore();

  // Export
  const dataUrl = canvas.toDataURL("image/png", 1.0);
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 15)
    .replace(".", "");
  const filename = `YanIsFinallyForTin_${timestamp}.png`;

  return { dataUrl, filename };
}
