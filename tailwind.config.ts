import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        surface: "#0a0a0f",
        card: "#13131a",
        border: "#1e1e2e",
        accent: "#6366f1",
        "accent-glow": "#818cf8",
        muted: "#6b7280",
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.5)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
