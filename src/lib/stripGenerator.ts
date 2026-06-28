// Client-side photostrip generator using HTML Canvas
// Composites guest photos onto TEMPLATE.png (1080×2160)

export interface StripOptions {
  photos: string[]; // base64 data URLs
}

export interface StripResult {
  dataUrl: string;
  filename: string;
}

const STRIP_W = 1080;
const STRIP_H = 2160;

const PAD_X = 100;
const PHOTO_W = STRIP_W - PAD_X * 2; // 880px

const PHOTOS_START_Y = 420;
const PHOTOS_END_Y = 1700;
const GAP_PHOTO = 60;
const PHOTO_COUNT = 3;

const PHOTO_H = Math.floor(
  (PHOTOS_END_Y - PHOTOS_START_Y - (PHOTO_COUNT - 1) * GAP_PHOTO) / PHOTO_COUNT
); // ≈ 393px

const CORNER_RADIUS = 16;
const BORDER_W = 4;
const SHADOW_BLUR = 20;
const SHADOW_OFFSET = 7;
const SHADOW_ALPHA = 0.22;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
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
  x: number, y: number, w: number, h: number,
  biasY = 0.5
) {
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${SHADOW_ALPHA})`;
  ctx.shadowBlur = SHADOW_BLUR;
  ctx.shadowOffsetY = SHADOW_OFFSET;
  roundRect(ctx, x - BORDER_W, y - BORDER_W, w + BORDER_W * 2, h + BORDER_W * 2, CORNER_RADIUS + BORDER_W);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, w, h, CORNER_RADIUS);
  ctx.clip();

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const frameRatio = w / h;
  let sw = img.naturalWidth, sh = img.naturalHeight;
  let sx = 0, sy = 0;

  if (imgRatio > frameRatio) {
    sw = img.naturalHeight * frameRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / frameRatio;
    sy = (img.naturalHeight - sh) * biasY;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

export async function generatePhotostrip(opts: StripOptions): Promise<StripResult> {
  const { photos } = opts;

  const canvas = document.createElement("canvas");
  canvas.width = STRIP_W;
  canvas.height = STRIP_H;
  const ctx = canvas.getContext("2d")!;

  const template = await loadImage("/TEMPLATE.png");
  ctx.drawImage(template, 0, 0, STRIP_W, STRIP_H);

  const photoImages = await Promise.all(photos.map(src => loadImage(src)));

  let photoY = PHOTOS_START_Y;
  for (let i = 0; i < Math.min(photoImages.length, PHOTO_COUNT); i++) {
    drawPhoto(ctx, photoImages[i], PAD_X, photoY, PHOTO_W, PHOTO_H);
    if (i < PHOTO_COUNT - 1) photoY += PHOTO_H + GAP_PHOTO;
  }

  const dataUrl = canvas.toDataURL("image/png", 1.0);
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 15)
    .replace(".", "");
  const filename = `YanIsFinallyForTin_${timestamp}.png`;

  return { dataUrl, filename };
}