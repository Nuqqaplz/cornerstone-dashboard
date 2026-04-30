/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dce6ff',
          500: '#3b6fd4',
          600: '#2d5bbf',
          700: '#234aa3',
          900: '#162d6b',
        },
      },
    },
  },
  plugins: [],
}
