/** @type {import('tailwindcss').Config} */
const fs = (v) => [`var(--fs-${v})`, { lineHeight: `var(--lh-${v})` }];

/*
 * Visual world: a pixel-art arcade that tells its stories like a comic.
 * Night-purple screen, thick black outlines, hard offset shadows (never blurred),
 * cream comic-page panels for reading and maths.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      night: '#1d1a3a', // page
      panel: '#2b2659', // game panels
      panel2: '#3a3378',
      deep: '#151233',
      black: '#0f0d22', // outlines
      cream: '#fff4dc', // comic paper
      ink: { DEFAULT: '#f6f0dc', 2: '#d4cdee', 3: '#a39bc9' },
      paperink: { DEFAULT: '#1a1530', 2: '#4a4360' },
      gold: '#ffcc4d', // primary action, Nash / theory
      blue: '#5aa7ff', // player A, the class
      red: '#ef5a4b', // player B, the rival
      teal: '#47c9a8',
      pink: '#f59ac1',
      // aliases kept so older markup maps onto the new world
      paper: '#1d1a3a',
      surface: '#2b2659',
      sunken: '#151233',
      line: '#0f0d22',
      line2: '#0f0d22',
      pen: '#5aa7ff',
      mark: '#ffcc4d',
    },
    fontFamily: {
      pixel: ['"Press Start 2P"', 'monospace'],
      // Body text, captions, bubbles, notes: a clean, highly legible face (bundled, works offline).
      sans: ['"Atkinson Hyperlegible Next"', 'system-ui', 'sans-serif'],
      // Pixel display face for titles and labels inside cards.
      display: ['"Pixelify Sans"', 'ui-monospace', 'monospace'],
      // Numbers: VT323 has unambiguous digits (5 ≠ S, 7 ≠ 1) and is narrow enough for matrices.
      mono: ['VT323', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      xs: fs('xs'),
      sm: fs('sm'),
      base: fs('base'),
      lg: fs('lg'),
      xl: fs('xl'),
      '2xl': fs('2xl'),
      '3xl': fs('3xl'),
      '4xl': fs('4xl'),
      '5xl': fs('5xl'),
      '6xl': fs('6xl'),
    },
    fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
    borderRadius: { none: '0', sm: '2px', DEFAULT: '4px', md: '4px', lg: '6px', full: '9999px' },
    extend: {
      boxShadow: { hard: '6px 6px 0 #0f0d22', 'hard-sm': '4px 4px 0 #0f0d22', press: 'inset 0 -6px 0 rgba(0,0,0,.28)' },
    },
  },
  plugins: [],
};
