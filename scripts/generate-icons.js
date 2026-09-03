import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, innerR, innerG, innerB) {
  // Build uncompressed image data
  // Each scanline: filter byte (0) + width * 4 bytes (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;
  const innerRadius = width * 0.18;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < innerRadius) {
        // Inner core (Gold/Flame #FFB703)
        rawData[pxOffset] = innerR;
        rawData[pxOffset + 1] = innerG;
        rawData[pxOffset + 2] = innerB;
        rawData[pxOffset + 3] = 255;
      } else if (dist < radius) {
        // Mid flame (#CC0000)
        rawData[pxOffset] = 204;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 255;
      } else {
        // Background (#0A192F Navy)
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Generate assets
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 10, 25, 47, 255, 183, 3));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 10, 25, 47, 255, 183, 3));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 10, 25, 47, 255, 183, 3));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 10, 25, 47, 255, 183, 3));
fs.writeFileSync('public/favicon.ico', createPNG(32, 32, 10, 25, 47, 255, 183, 3));
console.log('PWA PNG Assets generated successfully');
