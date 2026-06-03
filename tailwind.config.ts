import type { Config } from 'tailwindcss';

/** Plant Gallery — design tokens mapped to Tailwind theme.
 *  Hex values mirror /colors_and_type.css. Use e.g. `bg-forest`, `text-charcoal`,
 *  `rounded-md` (12px), `shadow-brand`, `font-display`. */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#2E7D32', hover: '#256528', press: '#1C4D1F' },
        sage: '#A5D6A7',
        terracotta: { DEFAULT: '#D97757', hover: '#C7613F', press: '#A84E30' },
        leaf: '#4CAF50',
        charcoal: '#263238',
        green: { 50: '#EFF6EF', 100: '#D7E9D8', 200: '#A5D6A7', 300: '#7CC07F', 400: '#4CAF50', 500: '#3C923F', 600: '#2E7D32', 700: '#256528', 800: '#1C4D1F', 900: '#133615' },
        terra: { 50: '#FBF1EC', 100: '#F4DDD0', 200: '#EBC0AB', 300: '#E29D80', 400: '#D97757', 500: '#C7613F', 600: '#A84E30', 700: '#843D26' },
        cream: { 0: '#FFFFFF', 50: '#FAF9F6', 100: '#F3F1EB', 200: '#E6E3DA', 300: '#D3CFC4', 400: '#ABA89D', 500: '#7E7B72', 600: '#56544C', 700: '#3A3B38', 800: '#2C3033', 900: '#263238' },
        ink: { 1: '#263238', 2: '#54605C', 3: '#8A938C' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xs: '4px', sm: '8px', md: '12px', lg: '18px', xl: '28px', '2xl': '40px' },
      boxShadow: {
        xs: '0 1px 2px rgba(38,50,56,.06)',
        sm: '0 2px 6px rgba(38,50,56,.07)',
        md: '0 6px 18px rgba(38,50,56,.09)',
        lg: '0 14px 38px rgba(38,50,56,.11)',
        xl: '0 28px 64px rgba(38,50,56,.14)',
        brand: '0 10px 28px rgba(46,125,50,.22)',
      },
      maxWidth: { content: '1200px' },
    },
  },
  plugins: [],
};
export default config;
