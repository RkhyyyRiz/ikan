import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F9F6', card: '#FFFFFF', ink: '#0F2419', mute: '#526B5D', line: '#DCEBE2',
        river: { DEFAULT: '#0b5d54', dark: '#08433d', soft: '#e3efec' },
        kunyit: { DEFAULT: '#9a5b06', soft: '#fbefd9' },
        merah: { DEFAULT: '#b3261e', soft: '#fbe7e5' },
      },
      fontFamily: { display: ['var(--font-display)', 'sans-serif'], sans: ['var(--font-body)', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '14px' },
    },
  },
  plugins: [],
}
export default config
