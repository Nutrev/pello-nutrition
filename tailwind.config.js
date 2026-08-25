/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        cream: "#F5F0E8",
        ink: "#1A1A1A",
        moss: "#2D4A2D",
        sage: "#7A9E7A",
        amber: "#C8860A",
        rust: "#B84C2E",
        sand: "#E8E0D0",
        muted: "#8A8478",
      },
    },
  },
  plugins: [],
};
