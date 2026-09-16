module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F766E',
        accent: '#F97360',
        danger: '#DC2626'
      }
    }
  },
  plugins: [require('tailwindcss-animate')],
}
