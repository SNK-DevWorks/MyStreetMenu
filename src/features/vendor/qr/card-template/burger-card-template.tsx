'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Share2, Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

export const BURGER_TEMPLATE_URL =
  'https://res.cloudinary.com/dfledgwk1/image/upload/v1784898180/qr1_dnr9ca.png';

// ─── QR Modules Generator ──────────────────────────────────────────────────

export function buildQrModules(text: string): boolean[][] {
  try {
    const qr = QRCode.create(text || 'https://mystreetmenu.com', {
      errorCorrectionLevel: 'H',
    });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const grid: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(Boolean(data[r * size + c]));
      }
      grid.push(row);
    }
    return grid;
  } catch (err) {
    console.error('Failed to generate QR modules:', err);
    return Array.from({ length: 25 }, () => Array(25).fill(false));
  }
}

// ─── Image Loader Helper ───────────────────────────────────────────────────

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function getWhiteLogoCanvas(logoImg: HTMLImageElement): HTMLCanvasElement {
  const off = document.createElement('canvas');
  const w = logoImg.naturalWidth || logoImg.width || 200;
  const h = logoImg.naturalHeight || logoImg.height || 50;
  off.width = w;
  off.height = h;
  const offCtx = off.getContext('2d');
  if (offCtx) {
    offCtx.drawImage(logoImg, 0, 0, w, h);
    offCtx.globalCompositeOperation = 'source-in';
    offCtx.fillStyle = '#ffffff';
    offCtx.fillRect(0, 0, w, h);
  }
  return off;
}

// ─── Canvas Card Renderer ──────────────────────────────────────────────────

export async function renderBurgerCardToCanvas(opts: {
  vendorName: string;
  vendorAddress: string;
  qrModules: boolean[][];
  accentColor: string;
  templateImg: HTMLImageElement | null;
  logoImg?: HTMLImageElement | null;
}): Promise<HTMLCanvasElement> {
  const { vendorName, vendorAddress, qrModules, accentColor, templateImg, logoImg } = opts;
  const W = 460, H = 710;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2; // 2x retina
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // --- Card Outer Background ---
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 0, 0, W, H, 28);
  ctx.fill();

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  roundRect(ctx, 0.5, 0.5, W - 1, H - 1, 28);
  ctx.stroke();

  // --- Top Orange Gradient Header ---
  const grad = ctx.createLinearGradient(0, 0, W, 100);
  grad.addColorStop(0, accentColor);
  grad.addColorStop(1, shiftHue(accentColor));
  ctx.fillStyle = grad;
  roundRectTop(ctx, 0, 0, W, 100, 28);
  ctx.fill();

  // Decorative circles pattern on header
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(W + 10, -10, 65, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-15, 100, 75, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Header Logo Text ---
  if (logoImg) {
    const whiteLogoCanvas = getWhiteLogoCanvas(logoImg);
    const imgW = logoImg.naturalWidth || logoImg.width || 200;
    const imgH = logoImg.naturalHeight || logoImg.height || 50;
    const aspect = imgW / imgH;
    const logoH = 38;
    const logoW = Math.min(logoH * aspect, W - 40);
    const logoX = (W - logoW) / 2;
    const logoY = 22;
    ctx.drawImage(whiteLogoCanvas, logoX, logoY, logoW, logoH);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MyStreetMenu', W / 2, 50);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '500 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Scan to view our menu', W / 2, 78);

  // --- Burger QR Container (Enlarged for Prominence) ---
  const bX = W / 2 - 180, bY = 115, bW = 360, bH = 460;

  if (templateImg) {
    ctx.save();
    roundRect(ctx, bX, bY, bW, bH, 24);
    ctx.clip();
    ctx.drawImage(templateImg, bX, bY, bW, bH);
    ctx.restore();
  }

  // --- Overlay Dynamic QR Code ---
  const qrX = bX + bW * 0.225;
  const qrY = bY + bH * 0.335;
  const qrW = bW * 0.55;
  const qrH = bH * 0.42;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX - 3, qrY - 3, qrW + 6, qrH + 6);

  const M = qrModules.length;
  const cellW = qrW / M;
  const cellH = qrH / M;

  // 1. Crisp Clean Data Modules (rx = 0.22)
  ctx.fillStyle = '#0f172a';
  for (let r = 0; r < M; r++) {
    for (let c = 0; c < M; c++) {
      const isFinderCell =
        (r < 7 && c < 7) ||
        (r < 7 && c >= M - 7) ||
        (r >= M - 7 && c < 7);
      if (!isFinderCell && qrModules[r][c]) {
        const x = qrX + c * cellW + cellW * 0.05;
        const y = qrY + r * cellH + cellH * 0.05;
        roundRect(ctx, x, y, cellW * 0.9, cellH * 0.9, cellW * 0.22);
        ctx.fill();
      }
    }
  }

  // 2. Render 3 Crisp Finder Eyes
  const finders = [
    { r: 0, c: 0 },
    { r: 0, c: M - 7 },
    { r: M - 7, c: 0 },
  ];
  for (const { r, c } of finders) {
    const fX = qrX + c * cellW;
    const fY = qrY + r * cellH;

    // Outer 7x7 rounded frame
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, fX, fY, 7 * cellW, 7 * cellH, 1.4 * cellW);
    ctx.fill();

    // Inner 5x5 cutout
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, fX + cellW, fY + cellH, 5 * cellW, 5 * cellH, 0.9 * cellW);
    ctx.fill();

    // Center 3x3 rounded eye
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, fX + 2 * cellW, fY + 2 * cellH, 3 * cellW, 3 * cellH, 0.6 * cellW);
    ctx.fill();
  }

  // --- Center Logo Badge in Canvas ---
  const logoR = qrW * 0.12;
  const cx = qrX + qrW / 2;
  const cy = qrY + qrH / 2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, logoR + 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(cx, cy, logoR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', cx, cy + 0.5);
  ctx.textBaseline = 'alphabetic';

  // --- Vendor Info at Bottom ---
  const infoY = bY + bH + 46;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(vendorName, W / 2, infoY);

  return canvas;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function roundRectTop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function shiftHue(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 10);
  const b = Math.min(255, (n & 0xff) + 30);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ─── Component Props ───────────────────────────────────────────────────────

export interface BurgerCardTemplateProps {
  vendorName?: string;
  vendorAddress?: string;
  publicMenuUrl: string;
  accentColor?: string;
}

export default function BurgerCardTemplate({
  vendorName = 'Vendor Name',
  vendorAddress = 'Vendor Address',
  publicMenuUrl,
  accentColor = '#f77512',
}: BurgerCardTemplateProps) {
  const [templateImg, setTemplateImg] = useState<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [shared, setShared] = useState(false);
  const [templateImgLoaded, setTemplateImgLoaded] = useState(false);

  // Preload Cloudinary template image & text logo
  useEffect(() => {
    loadImage(BURGER_TEMPLATE_URL)
      .then((img) => { setTemplateImg(img); setTemplateImgLoaded(true); })
      .catch(() => { console.warn('Failed to load burger QR template image'); setTemplateImgLoaded(true); });

    loadImage('/text-logo.png')
      .then((img) => setLogoImg(img))
      .catch(() => console.warn('Failed to load text logo image'));
  }, []);

  const qrModules = buildQrModules(publicMenuUrl);
  const M = qrModules.length;

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      let loadedImg = templateImg;
      if (!loadedImg) {
        try {
          loadedImg = await loadImage(BURGER_TEMPLATE_URL);
        } catch {
          loadedImg = null;
        }
      }
      let loadedLogo = logoImg;
      if (!loadedLogo) {
        try {
          loadedLogo = await loadImage('/text-logo.png');
        } catch {
          loadedLogo = null;
        }
      }
      const canvas = await renderBurgerCardToCanvas({
        vendorName,
        vendorAddress,
        qrModules,
        accentColor,
        templateImg: loadedImg,
        logoImg: loadedLogo,
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'mystreetmenu-qr-card.png';
      a.click();
    } finally {
      setDownloading(false);
    }
  }, [vendorName, vendorAddress, qrModules, accentColor, templateImg, logoImg]);

  const handleDownloadQrOnly = useCallback(async () => {
    try {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(canvas, publicMenuUrl || 'https://mystreetmenu.com', {
        width: size,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${vendorName ? vendorName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'vendor'}-qr-code.png`;
      a.click();
    } catch (err) {
      console.error('Failed to download QR code image:', err);
    }
  }, [publicMenuUrl, vendorName]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Street Menu',
          text: 'Scan to view our menu!',
          url: publicMenuUrl,
        });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(publicMenuUrl);
    } catch {
      /* ignore */
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }, [publicMenuUrl]);

  return (
    <div className="w-full flex flex-col items-start select-none pt-0 pb-2">

      {/* ── Full Styled Card ── */}
      <div
        id="burger-qr-card"
        className="relative w-full max-w-[380px] bg-white rounded-[28px] shadow-2xl border border-gray-200/80 overflow-hidden"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)' }}
      >
        {/* Top Orange Gradient Banner Header */}
        <div
          className="relative flex flex-col items-center justify-center py-6 px-4 overflow-hidden text-center"
          style={{ background: `linear-gradient(135deg, ${accentColor}, #c95e00)` }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10 bg-white" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/text-logo.png"
            alt="MyStreetMenu"
            className="h-9 object-contain brightness-0 invert z-10 drop-shadow-xs"
          />
          <span className="relative text-white/80 text-[13px] font-medium mt-0.5 z-10">
            Scan to view our menu
          </span>
        </div>

        {/* Card Content Body */}
        <div className="flex flex-col items-center px-6 pt-5 pb-7 gap-5">

          {/* Burger QR Graphic with rounded corners */}
          <div className="relative w-[335px] h-[425px] rounded-[24px] overflow-hidden flex items-center justify-center bg-white">
            {/* Skeleton shimmer while image loads */}
            {!templateImgLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-[24px]" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BURGER_TEMPLATE_URL}
              alt="Burger QR Template"
              className={`w-full h-full object-contain pointer-events-none drop-shadow-md transition-opacity duration-300 ${templateImgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setTemplateImgLoaded(true)}
            />
            {/* Dynamic Custom Stylish QR Code Overlay */}
            <div
              className="absolute bg-white flex items-center justify-center p-1.5 rounded-xl shadow-2xs"
              style={{
                top: '33.5%',
                left: '22.5%',
                width: '55%',
                height: '42%',
              }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <svg
                  className="w-full h-full"
                  viewBox={`0 0 ${M} ${M}`}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Crisp Clean Rounded-Rect Data Modules */}
                  {qrModules.map((row, r) =>
                    row.map((on, c) => {
                      if (!on) return null;
                      const isFinderCell =
                        (r < 7 && c < 7) ||
                        (r < 7 && c >= M - 7) ||
                        (r >= M - 7 && c < 7);
                      if (isFinderCell) return null;

                      return (
                        <rect
                          key={`${r}-${c}`}
                          x={c + 0.05}
                          y={r + 0.05}
                          width={0.9}
                          height={0.9}
                          rx={0.22}
                          ry={0.22}
                          fill="#0f172a"
                        />
                      );
                    })
                  )}

                  {/* Crisp Clean 7x7 Finder Eyes */}
                  {[
                    { r: 0, c: 0 },
                    { r: 0, c: M - 7 },
                    { r: M - 7, c: 0 },
                  ].map(({ r, c }, idx) => (
                    <g key={`finder-${idx}`}>
                      <rect
                        x={c}
                        y={r}
                        width={7}
                        height={7}
                        rx={1.4}
                        ry={1.4}
                        fill="#0f172a"
                      />
                      <rect
                        x={c + 1}
                        y={r + 1}
                        width={5}
                        height={5}
                        rx={0.9}
                        ry={0.9}
                        fill="#ffffff"
                      />
                      <rect
                        x={c + 2}
                        y={r + 2}
                        width={3}
                        height={3}
                        rx={0.6}
                        ry={0.6}
                        fill="#0f172a"
                      />
                    </g>
                  ))}
                </svg>

                {/* Center Logo Badge */}
                <div
                  className="absolute rounded-full bg-white flex items-center justify-center shadow-md pointer-events-none"
                  style={{ width: '24%', height: '24%', padding: 2 }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-white font-black text-[12px] shadow-2xs"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #c95e00)` }}
                  >
                    M
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Name */}
          <div className="flex flex-col items-center justify-center text-center -mt-2">
            <p className="text-[24px] font-black text-slate-900 tracking-tight">{vendorName}</p>
          </div>

        </div>
      </div>

      {/* Action Buttons Below Card */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-[380px] mt-6">
        <button
          id="qr-share"
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-1.5 py-3 px-1.5 rounded-2xl border-2 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs bg-white text-slate-700 hover:bg-slate-50"
          style={{ borderColor: '#e2e8f0' }}
        >
          <Share2 className="w-4 h-4 text-slate-600" strokeWidth={2} />
          <span className="whitespace-nowrap">{shared ? 'Copied!' : 'Share'}</span>
        </button>

        <button
          id="qr-download-only"
          type="button"
          onClick={handleDownloadQrOnly}
          className="flex flex-col items-center justify-center gap-1.5 py-3 px-1.5 rounded-2xl border-2 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs bg-white text-slate-700 hover:bg-slate-50"
          style={{ borderColor: '#e2e8f0' }}
          title="Download standalone high-resolution QR image"
        >
          <QrCode className="w-4 h-4 text-slate-600" strokeWidth={2} />
          <span className="whitespace-nowrap">Download QR</span>
        </button>

        <button
          id="qr-download"
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex flex-col items-center justify-center gap-1.5 py-3 px-1.5 rounded-2xl font-extrabold text-xs text-white transition-all active:scale-95 cursor-pointer disabled:opacity-70 shadow-md hover:shadow-lg shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #c95e00)`,
          }}
        >
          <Download className="w-4 h-4" strokeWidth={2.5} />
          <span className="whitespace-nowrap">{downloading ? 'Saving…' : 'Download Card'}</span>
        </button>
      </div>

    </div>
  );
}

