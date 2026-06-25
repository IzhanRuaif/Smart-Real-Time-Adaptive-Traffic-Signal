/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(45, 212, 191, 0.32)",
        signalRed: "0 0 28px rgba(248, 113, 113, 0.88)",
        signalYellow: "0 0 28px rgba(250, 204, 21, 0.88)",
        signalGreen: "0 0 28px rgba(52, 211, 153, 0.88)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(148, 163, 184, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.07) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
