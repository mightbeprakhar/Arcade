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

/** 14×14 comic-style pixel faces. */
export type Mood = 'grim' | 'scared' | 'smug' | 'happy' | 'shocked' | 'sad';
const MOUTH: Record<Mood, string[]> = {
  grim: ['KSSSSKKKKSSSSK', '.KSSSSSSSSSSK.'],
  scared: ['KSSSSKMMKSSSSK', '.KSSSKMMKSSSK.'],
  smug: ['KSSSSSSKKKSSSK', '.KSSKKKKSSSSK.'],
  happy: ['KSSKSSSSSSKSSK', '.KSSKKKKKKSSK.'],
  shocked: ['KSSSSKMMKSSSSK', '.KSSSKMMKSSSK.'],
  sad: ['KSSSSSKKSSSSSK', '.KSSKSSSSKSSK.'],
};
const BROWS: Record<Mood, string> = {
  grim: 'KSKKSSSSSSKKSK',
  scared: 'KSSKKSSSSKKSSK',
  smug: 'KSSKKSSSSSSSSK',
  happy: 'KSSSSSSSSSSSSK',
  shocked: 'KSKKKSSSSKKKSK',
  sad: 'KSSSKKSSKKSSSK',
};
export function face(mood: Mood, hair: string, skin = C.skin): { map: string[]; pal: Palette } {
  return {
    map: [
      '....KKKKKK....',
      '..KKHHHHHHKK..',
      '.KHHHHHHHHHHK.',
      '.KHHSSSSSSHHK.',
      'KHSSSSSSSSSSHK',
      BROWS[mood],
      'KSSEKSSSSKESSK',
      'KSSKKSSSSKKSSK',
      'KSBSSSSKSSSBSK',
      MOUTH[mood][0],
      MOUTH[mood][1],
      '..KSSSSSSSSK..',
      '...KKKKKKKK...',
    ],
    pal: { K: C.K, H: hair, S: skin, E: C.W, M: '#7a1f2e', B: '#f59ac1' },
  };
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
