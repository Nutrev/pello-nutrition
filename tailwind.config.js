/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

// One typeface site-wide: DM Sans, loaded by next/font in app/layout.tsx as --font-sans.
// font-display and font-body are kept as aliases so existing class names still work.
const sans = ["var(--font-sans)", ...defaultTheme.fontFamily.sans];

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans,
        display: sans,
        body: sans,
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
