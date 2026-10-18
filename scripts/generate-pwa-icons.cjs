const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#0369a1" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Inner shield / border ring -->
  <rect x="24" y="24" width="464" height="464" rx="96" fill="none" stroke="#38bdf8" stroke-width="6" stroke-opacity="0.3" />

  <!-- Center Card Deck / Spade Emblem -->
  <g filter="url(#shadow)" transform="translate(256, 210) scale(1.15)">
    <!-- Bridge Card Shape Behind -->
    <rect x="-90" y="-110" width="180" height="150" rx="16" fill="#ffffff" transform="rotate(-6)" opacity="0.95" />
    <rect x="-90" y="-110" width="180" height="150" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" transform="rotate(6)" />
    
    <!-- Big Spade in Center -->
    <path d="M 0,-65 C -28,-30 -60,0 -40,30 C -25,50 5,42 0,55 C -5,42 25,50 40,30 C 60,0 28,-30 0,-65 Z" fill="#0f172a" />
    <path d="M -12,48 Q 0,42 12,48 L 8,68 L -8,68 Z" fill="#0f172a" />
    
    <!-- Golden Coins / Financial Star at center -->
    <circle cx="0" cy="10" r="14" fill="url(#goldGrad)" stroke="#b45309" stroke-width="1.5" />
    <text x="0" y="15" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" fill="#78350f" text-anchor="middle">Rp</text>
  </g>

  <!-- Title Badge -->
  <g transform="translate(256, 385)">
    <rect x="-140" y="-30" width="280" height="56" rx="28" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" />
    <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#ffffff" letter-spacing="4" text-anchor="middle">GABSI BATU</text>
  </g>

  <!-- Small Subtitle -->
  <text x="256" y="445" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#94a3b8" letter-spacing="3" text-anchor="middle">SISTEM KEUANGAN</text>
</svg>
`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
console.log('Created public/icon.svg');

// PNG Builder Helper
function createPNG(width, height, drawFn) {
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const toCrc = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, toCrc, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

// Draw renderer for PWA icons
function renderIcon(x, y, w, h, isMaskable = false) {
  // Normalize coords [0, 1]
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;

  // Background gradient: from Sky-600 (#0284c7) to Slate-900 (#0f172a)
  const gradT = Math.min(1, Math.max(0, (nx + ny) / 1.5));
  let r = Math.round(2 * (1 - gradT) + 15 * gradT);
  let g = Math.round(132 * (1 - gradT) + 23 * gradT);
  let b = Math.round(199 * (1 - gradT) + 42 * gradT);

  // If not maskable, round corners with anti-aliasing
  if (!isMaskable) {
    const cornerRadius = 0.22;
    const dx = Math.abs(nx - cx);
    const dy = Math.abs(ny - cy);
    const half = 0.5;
    const dCornerX = dx - (half - cornerRadius);
    const dCornerY = dy - (half - cornerRadius);

    if (dCornerX > 0 && dCornerY > 0) {
      const dist = Math.sqrt(dCornerX * dCornerX + dCornerY * dCornerY);
      if (dist > cornerRadius) {
        return [0, 0, 0, 0]; // Transparent outside rounded corner
      }
    }
  }

  // Safe zone scaling factor for maskable
  const scale = isMaskable ? 0.75 : 0.88;
  const sx = (nx - cx) / scale;
  const sy = (ny - cy) / scale;

  // Outer glowing ring
  const distFromCenter = Math.sqrt(sx * sx + sy * sy);
  if (distFromCenter >= 0.44 && distFromCenter <= 0.47) {
    return [56, 189, 248, 255]; // Sky-400
  }

  // Draw central card/shield shape
  // Card rotated: check rectangle rotated
  const cardW = 0.38;
  const cardH = 0.48;
  if (Math.abs(sx) < cardW && Math.abs(sy + 0.05) < cardH) {
    // White/slate card background
    r = 248; g = 250; b = 252;

    // Card border
    if (Math.abs(sx) > cardW - 0.015 || Math.abs(sy + 0.05) > cardH - 0.015) {
      return [203, 213, 225, 255];
    }

    // Inside card: Spade symbol
    const px = sx;
    const py = sy + 0.05;
    // Spade approximation: two circles + tip + stem
    const rCircle = 0.12;
    const dLeftCircle = Math.sqrt((px + 0.09) * (px + 0.09) + (py - 0.02) * (py - 0.02));
    const dRightCircle = Math.sqrt((px - 0.09) * (px - 0.09) + (py - 0.02) * (py - 0.02));
    
    // Tip triangle
    const inTip = py < 0 && py > -0.25 && Math.abs(px) < (0.25 + py) * 0.9;
    // Circles
    const inCircles = (dLeftCircle < rCircle || dRightCircle < rCircle) && py <= 0.12;
    // Stem
    const inStem = py >= 0.10 && py <= 0.22 && Math.abs(px) < (0.04 + (py - 0.10) * 0.4);

    if (inTip || inCircles || inStem) {
      // Dark slate spade
      r = 15; g = 23; b = 42;
    }

    // Center Gold Coin
    const dCoin = Math.sqrt(px * px + py * py);
    if (dCoin < 0.08) {
      // Gold gradient
      return [251, 191, 36, 255]; // Amber-400
    } else if (dCoin < 0.09) {
      return [180, 83, 9, 255]; // Amber-700
    }

    return [r, g, b, 255];
  }

  // Bottom Banner "GABSI"
  if (sy > 0.30 && sy < 0.46 && Math.abs(sx) < 0.42) {
    return [15, 23, 42, 255]; // Dark banner
  }

  return [r, g, b, 255];
}

console.log('Generating PWA icons...');

const png192 = createPNG(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('Created public/pwa-192x192.png');

const png512 = createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('Created public/pwa-512x512.png');

const png512Maskable = createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), png512Maskable);
console.log('Created public/pwa-maskable-512x512.png');

const appleTouchIcon = createPNG(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);
console.log('Created public/apple-touch-icon.png');

const favicon = createPNG(64, 64, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);
console.log('Created public/favicon.ico');

console.log('All PWA assets generated successfully!');
