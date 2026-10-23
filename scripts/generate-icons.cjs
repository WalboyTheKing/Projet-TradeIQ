const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function generateBrandedIcon(size, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = createChunk('IHDR', ihdrData);

  const rowSize = 1 + size * 4;
  const rawData = Buffer.alloc(rowSize * size);

  // Colors
  const bg = [9, 13, 20]; // #090D14
  const emerald = [16, 185, 129]; // #10B981
  const emeraldLight = [52, 211, 153]; // #34D399
  const borderCol = [30, 41, 59]; // #1E293B

  const center = size / 2;
  const scale = size / 512;
  const pad = isMaskable ? size * 0.18 : size * 0.08;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte 0 (None)

    for (let x = 0; x < size; x++) {
      const px = rowOffset + 1 + x * 4;

      // Base background color
      let r = bg[0];
      let g = bg[1];
      let b = bg[2];
      let a = 255;

      // Draw subtle circular glow behind icon
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < size * 0.45) {
        const glow = (1 - dist / (size * 0.45)) * 0.15;
        r = Math.min(255, Math.round(r + emerald[0] * glow));
        g = Math.min(255, Math.round(g + emerald[1] * glow));
        b = Math.min(255, Math.round(b + emerald[2] * glow));
      }

      // Draw outer badge rounded rectangle boundary
      const innerW = size - pad * 2;
      const innerH = size - pad * 2;
      const rx = x - pad;
      const ry = y - pad;

      if (rx >= 0 && rx <= innerW && ry >= 0 && ry <= innerH) {
        // Inner badge fill
        r = 15;
        g = 23;
        b = 42; // #0F172A

        // Border
        const borderThick = Math.max(2, Math.round(6 * scale));
        if (rx < borderThick || rx > innerW - borderThick || ry < borderThick || ry > innerH - borderThick) {
          r = emerald[0];
          g = emerald[1];
          b = emerald[2];
        }

        // Draw Candlesticks in center
        // Candle 1 (Bullish green)
        const c1X = center - 70 * scale;
        const c1W = 28 * scale;
        const c1Top = center - 30 * scale;
        const c1Bottom = center + 50 * scale;
        const c1WickTop = center - 60 * scale;
        const c1WickBottom = center + 75 * scale;

        if (Math.abs(x - (c1X + c1W / 2)) <= 2 * scale && y >= c1WickTop && y <= c1WickBottom) {
          r = emeraldLight[0]; g = emeraldLight[1]; b = emeraldLight[2];
        }
        if (x >= c1X && x <= c1X + c1W && y >= c1Top && y <= c1Bottom) {
          r = emerald[0]; g = emerald[1]; b = emerald[2];
        }

        // Candle 2 (Displacement candle, large)
        const c2X = center - 14 * scale;
        const c2W = 28 * scale;
        const c2Top = center - 80 * scale;
        const c2Bottom = center + 25 * scale;
        const c2WickTop = center - 105 * scale;
        const c2WickBottom = center + 45 * scale;

        if (Math.abs(x - (c2X + c2W / 2)) <= 2 * scale && y >= c2WickTop && y <= c2WickBottom) {
          r = emeraldLight[0]; g = emeraldLight[1]; b = emeraldLight[2];
        }
        if (x >= c2X && x <= c2X + c2W && y >= c2Top && y <= c2Bottom) {
          r = emeraldLight[0]; g = emeraldLight[1]; b = emeraldLight[2];
        }

        // Candle 3 (Bearish pull back, small red/slate)
        const c3X = center + 42 * scale;
        const c3W = 28 * scale;
        const c3Top = center - 45 * scale;
        const c3Bottom = center - 10 * scale;
        const c3WickTop = center - 65 * scale;
        const c3WickBottom = center + 15 * scale;

        if (Math.abs(x - (c3X + c3W / 2)) <= 2 * scale && y >= c3WickTop && y <= c3WickBottom) {
          r = 239; g = 68; b = 68; // #EF4444
        }
        if (x >= c3X && x <= c3X + c3W && y >= c3Top && y <= c3Bottom) {
          r = 220; g = 38; b = 38; // Red
        }

        // Horizontal baseline accent
        if (y >= center + 75 * scale && y <= center + 78 * scale && x >= center - 95 * scale && x <= center + 95 * scale) {
          r = emerald[0]; g = emerald[1]; b = emerald[2];
        }
      }

      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = a;
    }
  }

  const idat = createChunk('IDAT', zlib.deflateSync(rawData));
  const iend = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

const publicDir = path.resolve(__dirname, '../public');
fs.mkdirSync(publicDir, { recursive: true });

// 1. Apple Touch Icon (180x180)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateBrandedIcon(180, false));
console.log('Generated apple-touch-icon.png (180x180)');

// 2. PWA Standard 192x192
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateBrandedIcon(192, false));
console.log('Generated pwa-192x192.png (192x192)');

// 3. PWA Standard 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateBrandedIcon(512, false));
console.log('Generated pwa-512x512.png (512x512)');

// 4. PWA Maskable 512x512 (with safe-zone 18% padding)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateBrandedIcon(512, true));
console.log('Generated pwa-maskable-512x512.png (512x512 maskable)');

// 5. SVG Vector Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D14" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="bullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)" stroke="#10B981" stroke-width="12" />
  <!-- Center Glow -->
  <circle cx="256" cy="256" r="180" fill="#10B981" fill-opacity="0.12" filter="blur(30px)" />
  <!-- Candlestick 1 -->
  <line x1="186" y1="196" x2="186" y2="331" stroke="#34D399" stroke-width="6" stroke-linecap="round" />
  <rect x="172" y="226" width="28" height="80" rx="4" fill="url(#bullGrad)" />
  <!-- Candlestick 2 (Displacement) -->
  <line x1="256" y1="151" x2="256" y2="301" stroke="#34D399" stroke-width="6" stroke-linecap="round" />
  <rect x="242" y="176" width="28" height="105" rx="4" fill="url(#bullGrad)" />
  <!-- Candlestick 3 (Pullback) -->
  <line x1="326" y1="191" x2="326" y2="271" stroke="#EF4444" stroke-width="6" stroke-linecap="round" />
  <rect x="312" y="211" width="28" height="35" rx="4" fill="#EF4444" />
  <!-- Text Brand Label -->
  <text x="256" y="380" font-family="monospace, sans-serif" font-weight="900" font-size="52" fill="#ECFDF5" letter-spacing="4" text-anchor="middle">TRADEIQ</text>
  <text x="256" y="415" font-family="monospace, sans-serif" font-weight="600" font-size="20" fill="#10B981" letter-spacing="2" text-anchor="middle">QUANTITATIVE SUITE</text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('Generated icon.svg');
