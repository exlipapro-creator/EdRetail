import type { DesignFamily, FlyerFormat } from '../../lib/flyers';
import { FLYER_FORMATS } from '../../lib/flyers';

/* ═══════════════════════════════════════════════════════════════
 * EdRetail Flyer Design Engine
 * -----------------------------
 * Renders a flyer canvas for a REAL product (actual product asset,
 * real catalog price) in one of three deliberately differentiated
 * design families. Composition is deterministic per family — the
 * EdRetail design language, not a generic template grid.
 *
 * Families:
 *  editorial — large product photography, editorial typography,
 *              restrained CTA. Whitespace-led.
 *  commerce  — offer/price-forward promotional hierarchy, strong CTA.
 *  premium   — minimal typography, generous margins, gallery-like.
 *
 * Every family uses REAL inputs only: the product's actual image,
 * catalog price, and the distributor's verified identity. Nothing
 * is fabricated by this engine.
 * ═══════════════════════════════════════════════════════════════ */

export interface FlyerRenderInput {
  family: DesignFamily;
  format: FlyerFormat;
  productName: string;
  productImage: string; // URL/path — loaded async by the engine
  productBadge?: string;
  headline: string;
  description: string;
  price: number | null;
  offer: string;
  cta: string;
  phone: string;
  distributorName: string;
  distributorRank: string;
  distributorCity: string;
  distributorAvatar: string;
  qrDataUrl: string; // '' disables the QR block
  lang: 'en' | 'sw';
}

/* ── Brand tokens (mirror tailwind.config EDR palette) ────────── */
const NAVY = '#123B6D';
const NAVY_DEEP = '#0A2747';
const EMERALD = '#0E6B52';
const GOLD = '#C5A059';
const INK = '#111827';
const PAPER = '#FFFFFF';
const MIST = '#F0F4F9';

const FONT_STACK = '"Segoe UI", system-ui, -apple-system, sans-serif';

function fmtPrice(p: number | null): string {
  if (p == null || Number.isNaN(p)) return '';
  return `TZS ${p.toLocaleString('en-US')}`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh, x, y, w, h);
}

function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
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
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Product image URL — resolves relative /products/* against origin. */
export function resolveProductImage(image: string): string {
  if (!image) return '';
  if (/^https?:\/\//.test(image)) return image;
  return `${window.location.origin}${image}`;
}

/** Renders the flyer at the format's full resolution. */
export async function renderFlyer(input: FlyerRenderInput): Promise<HTMLCanvasElement> {
  const { w: W, h: H } = FLYER_FORMATS[input.format];
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  // Base paper
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const productImg = input.productImage ? await loadImage(resolveProductImage(input.productImage)) : null;
  const avatarImg = input.distributorAvatar ? await loadImage(resolveProductImage(input.distributorAvatar)) : null;
  // QR is a data URL — decode it BEFORE the family renderers run so the
  // drawImage calls are synchronous and cannot race the decoder.
  const qrImg = input.qrDataUrl ? await loadImage(input.qrDataUrl) : null;

  const s = W / 1080; // scale factor relative to the 1080 design width
  const M = 72 * s; // page margin

  const drawIdentity = (y: number, dark: boolean) => {
    const nameColor = dark ? PAPER : INK;
    const metaColor = dark ? 'rgba(255,255,255,0.75)' : '#6B7280';
    if (avatarImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(M + 28 * s, y + 28 * s, 28 * s, 0, Math.PI * 2);
      ctx.clip();
      drawCoverImage(ctx, avatarImg, M, y, 56 * s, 56 * s);
      ctx.restore();
    } else {
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.2)' : MIST;
      ctx.beginPath();
      ctx.arc(M + 28 * s, y + 28 * s, 28 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = nameColor;
    ctx.font = `700 ${26 * s}px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.fillText(input.distributorName, M + 72 * s, y + 24 * s);
    ctx.fillStyle = metaColor;
    ctx.font = `500 ${19 * s}px ${FONT_STACK}`;
    ctx.fillText(`${input.distributorRank} · ${input.distributorCity}`, M + 72 * s, y + 48 * s);
  };

  const drawCTA = (y: number, w: number, fill: string, text: string, textColor: string) => {
    ctx.fillStyle = fill;
    roundRect(ctx, M, y, w, 88 * s, 14 * s);
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.font = `800 ${30 * s}px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.fillText(text, M + w / 2, y + 56 * s);
    ctx.textAlign = 'left';
  };

  const drawQR = (x: number, y: number, size: number, qrImg: HTMLImageElement | null) => {
    if (!input.qrDataUrl || !qrImg) return;
    ctx.fillStyle = PAPER;
    roundRect(ctx, x - 12 * s, y - 12 * s, size + 24 * s, size + 24 * s, 12 * s);
    ctx.fill();
    ctx.strokeStyle = 'rgba(17,24,39,0.08)';
    ctx.stroke();
    ctx.drawImage(qrImg, x, y, size, size);
  };

  /* ── EDITORIAL family ──────────────────────────────────────── */
  if (input.family === 'editorial') {
    // Full-bleed product photograph top 62%
    if (productImg) {
      ctx.fillStyle = MIST;
      ctx.fillRect(0, 0, W, H * 0.62);
      drawCoverImage(ctx, productImg, 0, 0, W, H * 0.62);
      // gentle fade into paper for text zone
      const fade = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.62);
      fade.addColorStop(0, 'rgba(255,255,255,0)');
      fade.addColorStop(1, 'rgba(255,255,255,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, H * 0.5, W, H * 0.12);
    }

    // Small brand mark row
    ctx.fillStyle = EMERALD;
    ctx.font = `800 ${20 * s}px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.fillText('EDRETAIL', M, H * 0.62 + 44 * s);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = `600 ${18 * s}px ${FONT_STACK}`;
    ctx.textAlign = 'right';
    ctx.fillText('WELLNESS · TANZANIA', W - M, H * 0.62 + 44 * s);
    ctx.textAlign = 'left';

    // Headline — editorial serif-feel via weight contrast
    ctx.fillStyle = INK;
    const headFont = `800 ${64 * s}px ${FONT_STACK}`;
    ctx.font = headFont;
    const headLines = wrapText(ctx, input.headline, W - 2 * M, 3);
    let y = H * 0.62 + 108 * s;
    for (const line of headLines) {
      ctx.fillText(line, M, y);
      y += 74 * s;
    }

    // Description
    ctx.fillStyle = '#4B5563';
    ctx.font = `500 ${26 * s}px ${FONT_STACK}`;
    const descLines = wrapText(ctx, input.description, W - 2 * M, 3);
    y += 8 * s;
    for (const line of descLines) {
      ctx.fillText(line, M, y);
      y += 38 * s;
    }

    // Identity + CTA pinned to bottom
    drawIdentity(H - 190 * s, false);
    if (fmtPrice(input.price)) {
      ctx.fillStyle = NAVY;
      ctx.font = `800 ${34 * s}px ${FONT_STACK}`;
      ctx.textAlign = 'right';
      ctx.fillText(fmtPrice(input.price), W - M, H - 128 * s);
      ctx.textAlign = 'left';
    }
    drawCTA(H - 120 * s, (W - 2 * M) * 0.62, NAVY, input.cta, PAPER);
    drawQR(W - M - 120 * s, H - 320 * s, 120 * s, qrImg);
  }

  /* ── COMMERCE family ───────────────────────────────────────── */
  if (input.family === 'commerce') {
    // Navy header band with offer
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, W, 150 * s);
    ctx.fillStyle = GOLD;
    ctx.font = `900 ${30 * s}px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.fillText(input.offer || 'SPECIAL OFFER', M, 92 * s);

    // Product zone
    const pzY = 150 * s;
    const pzH = H * 0.52;
    ctx.fillStyle = MIST;
    ctx.fillRect(0, pzY, W, pzH);
    if (productImg) drawContainedImage(ctx, productImg, M, pzY + 40 * s, W - 2 * M, pzH - 80 * s);

    // Title row
    ctx.fillStyle = INK;
    ctx.font = `800 ${44 * s}px ${FONT_STACK}`;
    ctx.fillText(input.productName, M, pzY + pzH + 76 * s);

    if (input.productBadge) {
      ctx.fillStyle = EMERALD;
      roundRect(ctx, W - M - 220 * s, pzY + pzH + 40 * s, 220 * s, 44 * s, 10 * s);
      ctx.fill();
      ctx.fillStyle = PAPER;
      ctx.font = `700 ${20 * s}px ${FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.fillText(input.productBadge, W - M - 110 * s, pzY + pzH + 70 * s);
      ctx.textAlign = 'left';
    }

    // Price block — the commerce hierarchy anchor
    ctx.fillStyle = NAVY;
    ctx.font = `900 ${58 * s}px ${FONT_STACK}`;
    ctx.fillText(fmtPrice(input.price) || '', M, pzY + pzH + 160 * s);

    // Bullets/description
    ctx.fillStyle = '#4B5563';
    ctx.font = `500 ${26 * s}px ${FONT_STACK}`;
    let y = pzY + pzH + 208 * s;
    const descLines = wrapText(ctx, input.description, W - 2 * M, 3);
    for (const line of descLines) {
      ctx.fillText(line, M, y);
      y += 40 * s;
    }

    // Full-width CTA
    drawCTA(H - 220 * s, W - 2 * M, EMERALD, input.cta, PAPER);
    drawIdentity(H - 110 * s, false);
    drawQR(W - M - 110 * s, H - 360 * s, 110 * s, qrImg);
  }

  /* ── PREMIUM family ────────────────────────────────────────── */
  if (input.family === 'premium') {
    ctx.fillStyle = NAVY_DEEP;
    ctx.fillRect(0, 0, W, H);
    // Thin gold frame — the premium motif
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2 * s;
    ctx.strokeRect(M / 2, M / 2, W - M, H - M);

    if (productImg) {
      drawContainedImage(ctx, productImg, M, M + 60 * s, W - 2 * M, H * 0.42);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = GOLD;
    ctx.font = `700 ${22 * s}px ${FONT_STACK}`;
    ctx.fillText('E D R E T A I L', W / 2, M + H * 0.42 + 110 * s);

    ctx.fillStyle = PAPER;
    ctx.font = `300 ${52 * s}px ${FONT_STACK}`;
    const headLines = wrapText(ctx, input.headline, W - 2 * M, 2);
    let y = M + H * 0.42 + 170 * s;
    for (const line of headLines) {
      ctx.fillText(line, W / 2, y);
      y += 66 * s;
    }

    if (fmtPrice(input.price)) {
      ctx.fillStyle = GOLD;
      ctx.font = `600 ${36 * s}px ${FONT_STACK}`;
      ctx.fillText(fmtPrice(input.price), W / 2, y + 24 * s);
      y += 60 * s;
    }

    drawIdentity(H - 170 * s, true);
    ctx.textAlign = 'left';
    drawCTA(H - 320 * s, (W - 2 * M) * 0.6, GOLD, input.cta, NAVY_DEEP);
    drawQR(W - M - 110 * s, H - 330 * s, 110 * s, qrImg);
  }

  /* ── WELLNESS EDITORIAL family ────────────────────────────────
   * Calm, ingredient-story composition. Off-white paper, sage/emerald
   * accents, generous margins, product presented as an object of study
   * rather than a discount item. No wellness clichés. */
  if (input.family === 'wellness') {
    ctx.fillStyle = '#FAF8F4'; // warm paper
    ctx.fillRect(0, 0, W, H);

    // Left rail — quiet structural element, not decoration
    ctx.fillStyle = EMERALD;
    ctx.fillRect(0, 0, 14 * s, H);

    // Product presented on a soft plinth
    const plinthY = M + 30 * s;
    ctx.fillStyle = '#EFEAE2';
    roundRect(ctx, M + 24 * s, plinthY, W - 2 * M - 48 * s, H * 0.4, 8 * s);
    ctx.fill();
    if (productImg) {
      drawContainedImage(ctx, productImg, M + 70 * s, plinthY + 30 * s, W - 2 * M - 140 * s, H * 0.4 - 60 * s);
    }

    // Kicker
    ctx.fillStyle = EMERALD;
    ctx.font = `700 ${22 * s}px ${FONT_STACK}`;
    ctx.letterSpacing = '6px';
    ctx.textAlign = 'left';
    ctx.fillText('WELLNESS JOURNEY', M + 24 * s, plinthY + H * 0.4 + 90 * s);
    ctx.letterSpacing = '0px';

    // Headline — lighter weight, more line-height than editorial
    ctx.fillStyle = INK;
    ctx.font = `600 ${56 * s}px ${FONT_STACK}`;
    let y = plinthY + H * 0.4 + 150 * s;
    const headLines = wrapText(ctx, input.headline, W - 2 * M - 24 * s, 3);
    for (const line of headLines) {
      ctx.fillText(line, M + 24 * s, y);
      y += 76 * s;
    }

    // Description with generous measure
    ctx.fillStyle = '#57534E';
    ctx.font = `400 ${26 * s}px ${FONT_STACK}`;
    y += 14 * s;
    const descLines = wrapText(ctx, input.description, W - 2 * M - 24 * s, 4);
    for (const line of descLines) {
      ctx.fillText(line, M + 24 * s, y);
      y += 42 * s;
    }

    // Identity, then quiet CTA — no shouting
    drawIdentity(H - 150 * s, false);
    ctx.textAlign = 'left';
    ctx.fillStyle = EMERALD;
    roundRect(ctx, M + 24 * s, H - 260 * s, 340 * s, 76 * s, 38 * s);
    ctx.fill();
    ctx.fillStyle = PAPER;
    ctx.font = `700 ${26 * s}px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.fillText(input.cta, M + 24 * s + 170 * s, H - 260 * s + 49 * s);
    ctx.textAlign = 'left';

    // Price quiet, right-aligned
    if (fmtPrice(input.price)) {
      ctx.fillStyle = INK;
      ctx.font = `600 ${30 * s}px ${FONT_STACK}`;
      ctx.textAlign = 'right';
      ctx.fillText(fmtPrice(input.price), W - M, H - 205 * s);
      ctx.textAlign = 'left';
    }
    drawQR(W - M - 100 * s, H - 340 * s, 100 * s, qrImg);
  }

  /* ── CATALOG / INFORMATIONAL family ───────────────────────────
   * Structured information hierarchy for print/A4 and detail-led
   * selling. Header masthead, spec-sheet body, footer contact strip. */
  if (input.family === 'catalog') {
    // Masthead
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, W, 120 * s);
    ctx.fillStyle = PAPER;
    ctx.font = `900 ${34 * s}px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.fillText('EDRETAIL', M, 78 * s);
    ctx.font = `600 ${20 * s}px ${FONT_STACK}`;
    ctx.textAlign = 'right';
    ctx.fillText('PRODUCT INFORMATION', W - M, 76 * s);
    ctx.textAlign = 'left';

    // Title block
    ctx.fillStyle = INK;
    ctx.font = `800 ${48 * s}px ${FONT_STACK}`;
    ctx.fillText(input.productName, M, 210 * s);
    if (input.productBadge) {
      ctx.fillStyle = EMERALD;
      ctx.font = `700 ${22 * s}px ${FONT_STACK}`;
      ctx.fillText(input.productBadge, M, 250 * s);
    }

    // Product image, right column
    const colX = W / 2 + 20 * s;
    const colW = W / 2 - M - 20 * s;
    const imgY = 290 * s;
    const imgH = 560 * s;
    ctx.fillStyle = MIST;
    roundRect(ctx, colX, imgY, colW, imgH, 8 * s);
    ctx.fill();
    if (productImg) {
      drawContainedImage(ctx, productImg, colX + 30 * s, imgY + 30 * s, colW - 60 * s, imgH - 60 * s);
    }

    // Left column: headline + description + spec rows
    const leftW = W / 2 - M - 40 * s;
    ctx.fillStyle = INK;
    ctx.font = `700 ${34 * s}px ${FONT_STACK}`;
    let ly = 320 * s;
    const headLines = wrapText(ctx, input.headline, leftW, 3);
    for (const line of headLines) {
      ctx.fillText(line, M, ly);
      ly += 46 * s;
    }

    ctx.fillStyle = '#4B5563';
    ctx.font = `400 ${24 * s}px ${FONT_STACK}`;
    ly += 16 * s;
    const descLines = wrapText(ctx, input.description, leftW, 6);
    for (const line of descLines) {
      ctx.fillText(line, M, ly);
      ly += 36 * s;
    }

    // Spec rows — real data only (name, price, badge)
    ly += 30 * s;
    const specRow = (label: string, value: string) => {
      if (!value) return;
      ctx.fillStyle = '#9CA3AF';
      ctx.font = `600 ${20 * s}px ${FONT_STACK}`;
      ctx.fillText(label.toUpperCase(), M, ly);
      ctx.fillStyle = INK;
      ctx.font = `600 ${24 * s}px ${FONT_STACK}`;
      ctx.fillText(value, M + 220 * s, ly);
      ly += 52 * s;
    };
    specRow('Product', input.productName);
    specRow('Price', fmtPrice(input.price));
    if (input.offer) specRow('Offer', input.offer);

    // Footer strip: CTA + contact + QR
    const fy = H - 190 * s;
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, fy, W, 190 * s);
    ctx.fillStyle = PAPER;
    ctx.font = `800 ${30 * s}px ${FONT_STACK}`;
    ctx.fillText(input.cta, M, fy + 70 * s);
    ctx.font = `500 ${24 * s}px ${FONT_STACK}`;
    ctx.fillText(input.phone, M, fy + 115 * s);
    ctx.font = `500 ${20 * s}px ${FONT_STACK}`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`${input.distributorName} · ${input.distributorCity}`, M, fy + 152 * s);
    drawQR(W - M - 120 * s, fy + 30 * s, 120 * s, qrImg);
  }

  return canvas;
}

/** Small in-app preview rendering (scaled to fit the editor canvas). */
export async function renderFlyerPreview(input: FlyerRenderInput, target: HTMLCanvasElement, maxWidth = 360) {
  const full = await renderFlyer(input);
  const scale = maxWidth / full.width;
  target.width = maxWidth;
  target.height = Math.round(full.height * scale);
  const tctx = target.getContext('2d');
  if (tctx) {
    tctx.fillStyle = PAPER;
    tctx.fillRect(0, 0, target.width, target.height);
    tctx.drawImage(full, 0, 0, target.width, target.height);
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
