import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#151515",
        ink: "#0B0B0C",
        glass: "rgba(255, 255, 255, 0.08)",
        success: "#6EE7A8",
        danger: "#FF8A8A"
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0, 0, 0, 0.28)",
        insetGlow: "inset 0 1px 0 rgba(255, 255, 255, 0.28)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Arial",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
} satisfies Config;
