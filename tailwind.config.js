/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#22C55E",
          dark: "#4ADE80",
        },
        accent: {
          DEFAULT: "#F59E0B",
          dark: "#FBBF24",
        },
        background: {
          DEFAULT: "#FFFFFF",
          dark: "#151718",
        },
        surface: {
          DEFAULT: "#F5F5F5",
          dark: "#1E2022",
        },
        foreground: {
          DEFAULT: "#11181C",
          dark: "#ECEDEE",
        },
        muted: {
          DEFAULT: "#687076",
          dark: "#9BA1A6",
        },
        border: {
          DEFAULT: "#E5E7EB",
          dark: "#334155",
        },
        success: {
          DEFAULT: "#22C55E",
          dark: "#4ADE80",
        },
        error: {
          DEFAULT: "#EF4444",
          dark: "#F87171",
        },
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
      },
      spacing: {
        'screen': '24px',
        'card': '20px',
      },
    },
  },
  plugins: [],
};
