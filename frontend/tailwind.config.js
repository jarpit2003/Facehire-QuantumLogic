/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.04)",
        "card-hover": "0 4px 6px rgba(15,23,42,0.07), 0 10px 24px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.04)",
      },
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-out",
        "fade-in-up": "fadeInUp 0.2s ease-out",
        "slide-in-right": "slideInRight 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
}
