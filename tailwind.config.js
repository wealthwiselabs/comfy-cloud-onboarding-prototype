/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Comfy Cloud dark palette
        bg: '#0c0c0f',
        panel: '#141418',
        'panel-2': '#1b1b21',
        border: '#26262e',
        'border-light': '#33333d',
        ink: '#e8e8ec',
        'ink-dim': '#9a9aa6',
        'ink-faint': '#6b6b78',
        comfy: '#ffe14d', // Comfy yellow
        primary: '#2d8cff', // light-blue primary action / selected / active
        accent: '#7c6cff', // workflow accent (node links)
        good: '#4ade80',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
