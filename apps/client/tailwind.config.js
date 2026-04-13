/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#0d1117',
          panel: '#161b22',
          card: '#21262d',
        },
        accent: {
          bull: '#2ea043',
          bear: '#f85149',
          info: '#58a6ff',
        },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
        },
        border: '#30363d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
