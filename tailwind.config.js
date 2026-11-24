/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: { 950: '#07090f', 900: '#0d111c', 800: '#151b2b', 700: '#202840', 600: '#2e3958' },
        neon: { cyan: '#22d3ee', pink: '#f472b6', lime: '#a3e635', amber: '#fbbf24', violet: '#a78bfa' },
      },
    },
  },
  plugins: [],
};
