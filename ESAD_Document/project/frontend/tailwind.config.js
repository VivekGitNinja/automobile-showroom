/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#050505',
          secondary: '#0E0E0E',
          surface: '#171717',
          elevated: '#202020',
        },
        gold: {
          DEFAULT: '#C9A227',
          hover: '#D4AF37',
          glow: 'rgba(201, 162, 39, 0.35)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B8B8B8',
          muted: '#7A7A7A',
        },
        status: {
          success: '#3DD598',
          warning: '#F7C948',
          error: '#FF5A5F',
        },
      },
      borderColor: {
        luxury: 'rgba(255, 255, 255, 0.08)',
        gold: 'rgba(201, 162, 39, 0.4)',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 35px -5px rgba(201, 162, 39, 0.3)',
        'luxury-card': '0 30px 60px -20px rgba(0, 0, 0, 0.9)',
        'metallic-hover': '0 20px 40px -10px rgba(201, 162, 39, 0.25)',
      },
    },
  },
  plugins: [],
}
