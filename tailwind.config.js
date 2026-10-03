/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18332f',
        leaf: '#28675a',
        coral: '#e8785f',
        mist: '#f7f7f2'
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif']
      }
    }
  },
  plugins: []
};