/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-black':  '#1D1D1F',
        'apple-gray':   '#424245',
        'apple-muted':  '#8E8E93',
        'apple-bg':     '#F5F5F7',
        'apple-blue':   '#0071E3',
        'apple-green':  '#34C759',
        'apple-orange': '#FF9500',
        'apple-purple': '#AF52DE',
      },
    },
  },
  plugins: [],
}