/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'retro-green': '#00ff00',
        'retro-black': '#0a0a0a',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)'],
      },
      borderColor: {
        'retro-green': '#00ff00',
      },
      backgroundColor: {
        'retro-black': '#0a0a0a',
      },
      textColor: {
        'retro-green': '#00ff00',
      },
      boxShadow: {
        'retro-3d': '4px 4px 0px #00ff00',
        'retro-3d-hover': '6px 6px 0px #00ff00',
      }
    },
  },
  plugins: [],
}
