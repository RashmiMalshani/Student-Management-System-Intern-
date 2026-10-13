/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      colors: {
        ink: "#1d2433",
        paper: "#f6f7f9",
        brand: { DEFAULT: "#1f4e5f", dark: "#163a47", soft: "#e3eef1" },
        accent: "#c8692f",
      },
    },
  },
  plugins: [],
};
