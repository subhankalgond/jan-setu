/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        page: "#F5F5F4",
        panel: "#FFFFFF",
        surface: "#F7F7F6",
        dark: "#111111",
        secondary: "#555555",
        muted: "#858585",
        border: "#E5E5E5",
        status: {
          green: "#15803D",
          greenLight: "#F0FDF4",
          amber: "#B45309",
          amberLight: "#FFFBEB",
          red: "#DC2626",
          redLight: "#FEF2F2"
        }
      },
      fontFamily: {
        sans: ["'DM Sans'", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px"
      }
    }
  },
  plugins: []
};
