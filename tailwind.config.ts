import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        crime: {
          bg: '#0b0b0c',
          surface: '#121214',
          border: '#232326',
          tape: '#fef08a',
          red: '#ef4444'
        }
      },
      boxShadow: {
        crime: '0 8px 24px rgba(0,0,0,0.45)'
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'JetBrains Mono', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};
export default config;