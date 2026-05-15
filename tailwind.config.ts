import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#f0f0f0",
        accent: "#00ffaa",
        "accent-vibrant": "#ff00ea",
        "neutral-dark": "#1a1a1a",
        "neutral-mid": "#252525",
      },
      fontFamily: {
        burmese: ['var(--font-padauk)', "sans-serif"],
        tactile: ['var(--font-inter)', "sans-serif"],
        playfair: ['var(--font-playfair)', "serif"],
      },
      animation: {
        'marquee-infinite': 'marquee 40s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
