/* Pixel-art library. One char = one pixel. Shared palette keys:
 * K outline · W white · C body colour · D shade · L light/headlight · T tyre · G hub grey
 * S skin · H hair · M mouth · E eye · B blush · Y yellow
 */
import type { Palette } from './Sprite';

export const C = {
  K: '#0f0d22',
  W: '#fff4dc',
  glass: '#bfe6ff',
  tyre: '#0f0d22',
  hub: '#8a84b8',
  gold: '#ffcc4d',
  blue: '#5aa7ff',
  blueD: '#2f6fc4',
  red: '#ef5a4b',
  redD: '#b8342a',
  teal: '#47c9a8',
  tealD: '#2a8f77',
  skin: '#f2c79b',
  skin2: '#c98d5e',
  brown: '#6b3f22',
  coffee: '#a0612f',
  cream: '#fff4dc',
  purple: '#3a3378',
};

export const car = (body: string, shade: string): { map: string[]; pal: Palette } => ({
  map: [
    '......KKKKKKKK........',
    '.....KWWWKWWWWK.......',
    '....KWWWWKWWWWWK......',
    '..KKKKKKKKKKKKKKKKK...',
    '.KCCCCCCCCCCCCCCCCCK..',
    'KCCCCCCCCCCCCCCCCCLLK.',
    'KCCCCCCCCCCCCCCCCCCCK.',
    'KDDDDDDDDDDDDDDDDDDDK.',
    '.KKTTTKKKKKKKKKTTTKK..',
    '..TTGTT.......TTGTT...',
    '...TTT.........TTT....',
  ],
  pal: { K: C.K, W: C.glass, C: body, D: shade, L: C.gold, T: C.tyre, G: C.hub },
});

export const truck = (body: string, shade: string): { map: string[]; pal: Palette } => ({
  map: [
    '...................KKKKKKK...',
    'KKKKKKKKKKKKKKKK..KCCCCCCCK..',
    'KDDDDDDDDDDDDDDK..KCWWWWWCK..',
    'KDDDDDDDDDDDDDDK.KCCWWWWWCCK.',
    'KDDDDDDDDDDDDDDKKCCCCCCCCCCK.',
    'KDDDDDDDDDDDDDDKCCCCCCCCCCLLK',
    'KDDDDDDDDDDDDDDKCCCCCCCCCCCCK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    '.KTTTK.KTTTK.........KTTTK...',
    '.TTGTT.TTGTT.........TTGTT...',
    '..TTT...TTT...........TTT....',
  ],
  pal: { K: C.K, W: C.glass, C: body, D: shade, L: C.gold, T: C.tyre, G: C.hub },
});

/**
 * Comic portrait busts, 22 × 24 pixels: hair, ears, shaded skin, eyes with pupils and
 * highlights, brows, nose, mouth and a shirt. Each mood changes eyes, brows and mouth
 * so the expression reads from the back of a classroom.
 */
export type Mood = 'grim' | 'scared' | 'smug' | 'happy' | 'shocked' | 'sad';
export type HairStyle = 'short' | 'spiky' | 'long' | 'neat';

const FW = 22;
const FH = 27;

function blank(): string[][] {
  return Array.from({ length: FH }, () => Array.from({ length: FW }, () => '.'));
}
function put(g: string[][], x: number, y: number, ch: string) {
  if (y >= 0 && y < FH && x >= 0 && x < FW) g[y][x] = ch;
}
function rect(g: string[][], x0: number, y0: number, x1: number, y1: number, ch: string) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch);
}
/** Draw a list of [x, y] points. */
function pts(g: string[][], list: [number, number][], ch: string) {
  list.forEach(([x, y]) => put(g, x, y, ch));
}

/** Head occupies x 3..18, y 2..18; rounded by trimming corners. */
function head(g: string[][]) {
  const rows: [number, number][] = [
    [7, 14], [5, 16], [4, 17], [4, 17], [3, 18], [3, 18], [3, 18], [3, 18], [3, 18],
    [3, 18], [3, 18], [3, 18], [4, 17], [4, 17], [5, 16], [6, 15], [8, 13],
  ];
  rows.forEach(([a, b], i) => {
    const y = 2 + i;
    put(g, a - 1, y, 'K');
    put(g, b + 1, y, 'K');
    rect(g, a, y, b, y, 'S');
    // shade the right cheek
    put(g, b, y, 'D');
    if (b - 1 > a + 8) put(g, b - 1, y, i > 9 ? 'D' : 'S');
  });
  rect(g, 7, 1, 14, 1, 'K');
  rect(g, 8, 19, 13, 19, 'K');
  // ears
  pts(g, [[1, 9], [1, 10], [1, 11], [2, 12]], 'K');
  pts(g, [[2, 9], [2, 10], [2, 11]], 'S');
  pts(g, [[20, 9], [20, 10], [20, 11], [19, 12]], 'K');
  pts(g, [[19, 9], [19, 10], [19, 11]], 'D');
}

function hair(g: string[][], style: HairStyle) {
  // crown
  rect(g, 7, 2, 14, 2, 'H');
  rect(g, 5, 3, 16, 3, 'H');
  rect(g, 4, 4, 17, 5, 'H');
  // fringe with a parting
  rect(g, 3, 6, 18, 6, 'H');
  pts(g, [[3, 7], [4, 7], [17, 7], [18, 7], [3, 8], [18, 8]], 'H');
  pts(g, [[8, 7], [9, 7], [10, 7], [13, 7], [14, 7]], 'H');
  pts(g, [[9, 3], [10, 4], [11, 4]], 'h');
  if (style === 'spiky') {
    pts(g, [[6, 1], [9, 0], [12, 0], [15, 1], [6, 2], [9, 1], [12, 1], [15, 2], [10, 1], [11, 1]], 'H');
    pts(g, [[5, 0], [8, 0], [13, 0], [16, 0], [5, 1], [16, 1]], 'K');
  }
  if (style === 'long') {
    rect(g, 3, 9, 4, 16, 'H');
    rect(g, 17, 9, 18, 16, 'H');
    pts(g, [[2, 13], [2, 14], [2, 15], [2, 16], [3, 17], [4, 17], [19, 13], [19, 14], [19, 15], [19, 16], [18, 17], [17, 17]], 'K');
  }
  if (style === 'neat') {
    rect(g, 12, 7, 17, 7, 'H');
    pts(g, [[11, 6]], 'h');
  }
}

function eyes(g: string[][], mood: Mood) {
  const L = 6;
  const R = 13;
  const y = 10;
  const open = (x: number) => {
    rect(g, x, y, x + 2, y + 1, 'W');
    put(g, x + 1, y, 'E');
    put(g, x + 1, y + 1, 'E');
    put(g, x + 2, y, 'W');
    pts(g, [[x - 1, y], [x - 1, y + 1], [x + 3, y], [x + 3, y + 1]], 'K');
    rect(g, x, y - 1, x + 2, y - 1, 'K');
    rect(g, x, y + 2, x + 2, y + 2, 'K');
  };
  if (mood === 'happy') {
    [L, R].forEach((x) => pts(g, [[x, y + 1], [x + 1, y], [x + 2, y + 1]], 'K'));
  } else if (mood === 'grim') {
    [L, R].forEach((x) => {
      rect(g, x, y + 1, x + 2, y + 1, 'W');
      put(g, x + 1, y + 1, 'E');
      rect(g, x - 1, y, x + 3, y, 'K');
      rect(g, x, y + 2, x + 2, y + 2, 'K');
    });
  } else if (mood === 'shocked' || mood === 'scared') {
    [L, R].forEach((x) => {
      rect(g, x, y - 1, x + 2, y + 1, 'W');
      put(g, x + 1, y, 'E');
      pts(g, [[x - 1, y - 1], [x - 1, y], [x - 1, y + 1], [x + 3, y - 1], [x + 3, y], [x + 3, y + 1]], 'K');
      rect(g, x, y - 2, x + 2, y - 2, 'K');
      rect(g, x, y + 2, x + 2, y + 2, 'K');
    });
  } else {
    open(L);
    open(R);
    if (mood === 'smug') {
      // heavy lids
      rect(g, L, y, L + 2, y, 'K');
      rect(g, R, y, R + 2, y, 'K');
    }
  }
}

function brows(g: string[][], mood: Mood) {
  const y = 8;
  const b: Record<Mood, [number, number][]> = {
    grim: [[5, y - 1], [6, y], [7, y], [8, y + 1], [16, y - 1], [15, y], [14, y], [13, y + 1]],
    smug: [[5, y], [6, y], [7, y], [8, y], [13, y - 1], [14, y - 1], [15, y - 1], [16, y]],
    happy: [[5, y], [6, y - 1], [7, y - 1], [8, y], [13, y], [14, y - 1], [15, y - 1], [16, y]],
    shocked: [[5, y - 2], [6, y - 3], [7, y - 3], [8, y - 2], [13, y - 2], [14, y - 3], [15, y - 3], [16, y - 2]],
    scared: [[5, y - 1], [6, y - 2], [7, y - 2], [8, y - 3], [13, y - 3], [14, y - 2], [15, y - 2], [16, y - 1]],
    sad: [[5, y], [6, y], [7, y - 1], [8, y - 2], [13, y - 2], [14, y - 1], [15, y], [16, y]],
  };
  pts(g, b[mood], 'K');
}

function mouth(g: string[][], mood: Mood) {
  const y = 15;
  if (mood === 'happy') {
    pts(g, [[7, y - 1], [14, y - 1]], 'K');
    rect(g, 8, y, 13, y, 'K');
    rect(g, 9, y + 1, 12, y + 1, 'M');
    pts(g, [[8, y + 1], [13, y + 1]], 'K');
    rect(g, 9, y + 2, 12, y + 2, 'K');
    pts(g, [[9, y], [10, y], [11, y], [12, y]], 'W');
  } else if (mood === 'smug') {
    rect(g, 9, y, 13, y, 'K');
    pts(g, [[14, y - 1], [8, y + 1]], 'K');
  } else if (mood === 'grim') {
    rect(g, 8, y, 13, y, 'K');
  } else if (mood === 'sad') {
    rect(g, 9, y, 12, y, 'K');
    pts(g, [[8, y + 1], [13, y + 1]], 'K');
  } else {
    // shocked / scared: open mouth
    rect(g, 9, y - 1, 12, y - 1, 'K');
    pts(g, [[8, y], [8, y + 1], [13, y], [13, y + 1]], 'K');
    rect(g, 9, y, 12, y + 1, 'M');
    rect(g, 9, y + 2, 12, y + 2, 'K');
  }
}

export function face(mood: Mood, hairColour: string, skin = C.skin, shirt = '#3a3378', style: HairStyle = 'short'): { map: string[]; pal: Palette } {
  const g = blank();
  head(g);
  hair(g, style);
  eyes(g, mood);
  brows(g, mood);
  // nose
  pts(g, [[10, 12], [11, 13], [10, 13]], 'D');
  if (mood === 'happy' || mood === 'shocked' || mood === 'scared') pts(g, [[5, 13], [6, 13], [15, 13], [16, 13]], 'B');
  if (mood === 'scared') pts(g, [[18, 5], [18, 6], [17, 7]], 'T');
  mouth(g, mood);
  // neck and shoulders
  rect(g, 9, 20, 12, 21, 'D');
  pts(g, [[8, 20], [8, 21], [13, 20], [13, 21]], 'K');
  rect(g, 5, 22, 16, 22, 'K');
  pts(g, [[4, 23], [17, 23], [3, 24], [18, 24], [2, 25], [19, 25], [2, 26], [19, 26]], 'K');
  rect(g, 5, 23, 16, 23, 'C');
  rect(g, 4, 24, 17, 24, 'C');
  rect(g, 3, 25, 18, 26, 'C');
  rect(g, 15, 24, 17, 26, 'c');
  // collar
  pts(g, [[9, 22], [12, 22], [9, 23], [10, 23], [11, 23], [12, 23], [10, 24], [11, 24]], 'W');
  pts(g, [[8, 23], [13, 23], [9, 24], [12, 24], [10, 25], [11, 25]], 'K');
  return {
    map: g.map((r) => r.join('')),
    pal: { K: C.K, H: hairColour, h: shade(hairColour, 1.35), S: skin, D: shade(skin), E: C.K, W: C.W, M: '#7a1f2e', B: '#f59ac1', C: shirt, c: shade(shirt), T: '#8fd3ff' },
  };
}

/** Darken a hex colour for cheek and neck shading. */
function shade(hex: string, k = 0.82) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.min(255, Math.round(v * k));
  const r = f(n >> 16);
  const gg = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (gg << 8) | b).toString(16).padStart(6, '0')}`;
}

export const icons: Record<string, { map: string[]; pal: Palette }> = {
  coins: {
    map: ['..KKKK......', '.KYYYYK.....', 'KYYKKYYK....', 'KYYKYYYKKKK.', 'KYYKKYYKYYYK', '.KYYYYKYKKYYK', '..KKKKKYKYYYK', '......KYKKYYK', '.......KYYYK.', '........KKK..'],
    pal: { K: C.K, Y: C.gold },
  },
  cup: {
    map: ['..W..W....', '...W..W...', 'KKKKKKKK..', 'KWWWWWWKK.', 'KCCCCCCK.K', 'KCCCCCCK.K', 'KCCCCCCKK.', '.KCCCCK...', 'KKKKKKKK..'],
    pal: { K: C.K, W: C.W, C: C.coffee },
  },
  bin: {
    map: ['...KKKK...', 'KKKKKKKKKK', '.KCCCCCCK.', '.KCKCKCCK.', '.KCKCKCCK.', '.KCKCKCCK.', '.KCKCKCCK.', '.KCCCCCCK.', '..KKKKKK..'],
    pal: { K: C.K, C: C.teal },
  },
  rocket: {
    map: ['....KK....', '...KWWK...', '...KCCK...', '..KCWWCK..', '..KCWWCK..', '..KCCCCK..', '.KKCCCCKK.', 'KK.KCCK.KK', '...YRRY...', '....RR....'],
    pal: { K: C.K, W: C.glass, C: C.cream, Y: C.gold, R: C.red },
  },
};

/** A tiny two-car thumbnail for the hub. */
export const chickenThumb = {
  map: [
    '...........................',
    '.KKKK...............KKKK...',
    'KBBBBK.............KRRRRK..',
    'KBBBBYK...........KYRRRRK..',
    '.KTKTK.............KTKTK...',
    'GGGGGGGGGGGGGGGGGGGGGGGGGGG',
    '..YY....YY....YY....YY....Y',
    'GGGGGGGGGGGGGGGGGGGGGGGGGGG',
  ],
  pal: { K: C.K, B: C.blue, R: C.red, Y: C.gold, T: C.K, G: '#4b4b5e' },
};

/** Skyline buildings for the startup level. */
export const tower = {
  map: [
    '....KKKKKKKK....',
    '....KGGGGGGK....',
    '..KKKKKKKKKKKK..',
    '..KCCCCCCCCCCK..',
    '..KCWCWCWCWCCK..',
    '..KCCCCCCCCCCK..',
    '..KCWCWCWCWCCK..',
    '..KCCCCCCCCCCK..',
    '..KCWCWCWCWCCK..',
    '..KCCCCCCCCCCK..',
    '..KCWCWCWCWCCK..',
    '..KCCCCCCCCCCK..',
    '..KCWCWCWCWCCK..',
    '..KCCCCCCCCCCK..',
    '..KCCCCKKCCCCK..',
    'KKKKKKKKKKKKKKKK',
  ],
  pal: { K: C.K, C: '#8a84b8', W: C.gold, G: C.red },
};
export const garage = {
  map: ['....KKKKKK....', '..KKCCCCCCKK..', 'KKCCCCCCCCCCKK', 'KWWWWWWWWWWWWK', 'KWKKKKKKKKKKWK', 'KWKGGGGGGGGKWK', 'KWKKKKKKKKKKWK', 'KWKGGGGGGGGKWK', 'KWKKKKKKKKKKWK', 'KKKKKKKKKKKKKK'],
  pal: { K: C.K, C: C.teal, W: C.cream, G: '#8a84b8' },
};

export const trashBag = {
  map: ['...KK...', '..KGGK..', '.KKKKKK.', 'KGGGGGGK', 'KGGDGGGK', 'KGGGGDGK', 'KGDGGGGK', '.KKKKKK.'],
  pal: { K: C.K, G: '#3a3a52', D: '#5c5c78' },
};
export const fly = { map: ['W.W', '.K.'], pal: { W: '#d4cdee', K: C.K } };
