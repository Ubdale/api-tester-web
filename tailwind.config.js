/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#12161d',
        panel: '#181e27',
        'panel-2': '#1e2530',
        raised: '#232b38',
        border: '#2b3444',
        'border-soft': '#232b38',
        'ink-text': '#e7eaf0',
        'text-dim': '#8b93a4',
        'text-faint': '#5b6478',
        amber: '#e2a03f',
        'amber-dim': '#8a651f',
        'accent-blue': '#4e8fe0',
        'accent-green': '#4fb583',
        'accent-purple': '#a682e0',
        'accent-red': '#e2604a'
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"IBM Plex Sans"', '-apple-system', 'sans-serif']
      }
    }
  },
  corePlugins: {
    preflight: false
  },
  plugins: []
};
