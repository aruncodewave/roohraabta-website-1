import sharp from "sharp";

type Plate = { x: number; y: number; w: number; h: number };

function isWhite(r: number, g: number, b: number) {
  return r >= 246 && g >= 246 && b >= 246 && Math.max(r, g, b) - Math.min(r, g, b) < 14;
}

function findPlate(data: Buffer, w: number, h: number, channels: number): Plate | null {
  const at = (x: number, y: number) => {
    const index = (y * w + x) * channels;
    return [data[index], data[index + 1], data[index + 2]] as const;
  };
  const rows: number[] = [];
  const limit = Math.floor(w * 0.62);

  for (let y = 0; y < h; y++) {
    let gap = 0;
    let last = -1;
    for (let x = 0; x < limit; x++) {
      const [r, g, b] = at(x, y);
      if (isWhite(r, g, b)) {
        gap = 0;
        last = x;
      } else if (++gap > 24) {
        break;
      }
    }
    rows.push(last);
  }

  const minW = w * 0.28;
  const maxW = w * 0.58;
  const bands: { start: number; end: number; widths: number[] }[] = [];
  let y = 0;
  while (y < h) {
    if (rows[y] < minW || rows[y] > maxW) {
      y++;
      continue;
    }
    const start = y;
    const widths: number[] = [];
    while (y < h && rows[y] >= minW && rows[y] <= maxW) {
      widths.push(rows[y]);
      y++;
    }
    if (y - start > h * 0.035) bands.push({ start, end: y, widths });
  }
  if (!bands.length) return null;

  bands.sort((a, b) => b.widths.length - a.widths.length);
  const main = bands[0];
  const sorted = [...main.widths].sort((a, b) => a - b);
  const plateW = sorted[Math.floor(sorted.length * 0.75)];
  let y0 = main.start;
  let y1 = main.end;

  const leftOn = (row: number) => {
    let count = 0;
    let white = 0;
    for (let x = 0; x < 48; x += 2) {
      count++;
      const [r, g, b] = at(x, row);
      if (isWhite(r, g, b)) white++;
    }
    return white / count > 0.85;
  };

  while (y1 < h && y1 - y0 < h * 0.22 && leftOn(y1) && rows[y1] > w * 0.12) y1++;
  while (y0 > 0 && y1 - y0 < h * 0.22 && leftOn(y0 - 1) && rows[y0 - 1] > w * 0.12) y0--;

  const height = y1 - y0;
  if (height < h * 0.05 || height > h * 0.24) return null;

  let white = 0;
  let total = 0;
  let rightWhite = 0;
  let rightTotal = 0;
  for (let row = y0; row < y1; row += 3) {
    for (let x = 0; x < plateW; x += 8) {
      total++;
      const [r, g, b] = at(x, row);
      if (isWhite(r, g, b)) white++;
    }
    for (let x = plateW + 12; x < Math.min(w - 1, plateW + w * 0.18); x += 8) {
      rightTotal++;
      const [r, g, b] = at(x, row);
      if (isWhite(r, g, b)) rightWhite++;
    }
  }

  if (!total || white / total < 0.78) return null;
  if (rightTotal && rightWhite / rightTotal > 0.45) return null;

  return { x: 0, y: y0, w: Math.min(w - 2, plateW + 4), h: height };
}

function inpaint(data: Buffer, w: number, h: number, channels: number, plate: Plate) {
  const copy = Buffer.from(data);
  const y0 = Math.max(0, plate.y - 8);
  const x1 = Math.min(w - 2, plate.w + 10);
  const y1 = Math.min(h - 1, plate.y + plate.h + 8);
  const sample = (sx: number, sy: number) => {
    const index = (sy * w + sx) * channels;
    return [copy[index], copy[index + 1], copy[index + 2]] as const;
  };

  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < x1; x++) {
      const fromRight = Math.max(1, x1 - x);
      const fromBottom = Math.max(1, y1 - y);
      const right = sample(Math.min(w - 1, x1 + 2), y);
      const bottom = sample(Math.min(x1 - 1, x), Math.min(h - 1, y1 + 1));
      const rightWeight = 1 / (fromRight * fromRight);
      const bottomWeight = 1 / (fromBottom * fromBottom);
      const sum = rightWeight + bottomWeight;
      const index = (y * w + x) * channels;
      data[index] = (right[0] * rightWeight + bottom[0] * bottomWeight) / sum;
      data[index + 1] = (right[1] * rightWeight + bottom[1] * bottomWeight) / sum;
      data[index + 2] = (right[2] * rightWeight + bottom[2] * bottomWeight) / sum;
    }
  }

  const radius = 14;
  const blurred = Buffer.from(data);
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < x1; x++) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let count = 0;
      for (let ky = -radius; ky <= radius; ky += 3) {
        for (let kx = -radius; kx <= radius; kx += 3) {
          const sx = Math.min(w - 1, Math.max(0, x + kx));
          const sy = Math.min(h - 1, Math.max(0, y + ky));
          const index = (sy * w + sx) * channels;
          red += data[index];
          green += data[index + 1];
          blue += data[index + 2];
          count++;
        }
      }
      const index = (y * w + x) * channels;
      blurred[index] = red / count;
      blurred[index + 1] = green / count;
      blurred[index + 2] = blue / count;
    }
  }

  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < x1; x++) {
      const index = (y * w + x) * channels;
      data[index] = blurred[index];
      data[index + 1] = blurred[index + 1];
      data[index + 2] = blurred[index + 2];
    }
  }
}

export async function stripLogoPlate(input: Buffer) {
  const resized = await sharp(input).rotate().resize({ width: 1400, withoutEnlargement: true }).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const plate = findPlate(resized.data, resized.info.width, resized.info.height, resized.info.channels);
  if (!plate) return null;

  inpaint(resized.data, resized.info.width, resized.info.height, resized.info.channels, plate);
  return sharp(resized.data, { raw: resized.info }).jpeg({ quality: 82 }).toBuffer();
}
