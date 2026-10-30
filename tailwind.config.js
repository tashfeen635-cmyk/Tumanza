/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#541d2b',
          dark: '#3f1520',
          light: '#f6efe3',
        },
        accent: {
          DEFAULT: '#b95871',
          hover: '#9a3852',
        },
        brand: {
          gold: '#dfceae',
          green: '#8B9A46',
          darkgreen: '#6B7A36',
          offwhite: '#fbf7f1',
          charcoal: '#1a1a1a',
          muted: '#5d5b5b',
        }
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Marcellus', 'Georgia', 'serif'],
        body: ['var(--font-body)', '"Open Sans"', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        container: '1340px',
      }
    },
  },
  plugins: [],
};
