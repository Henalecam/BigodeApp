import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a1a1a",
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "#d4af37",
          foreground: "#000000"
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444"
      }
    }
  },
  plugins: []
}

export default config

