import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09162b",
        navy: "#10213f",
        gold: "#d6a436",
        cream: "#f8f3ea",
        sage: "#b8c4a5",
        peach: "#edc4a7",
        sand: "#d9c9b3",
        sky: "#dbe7f4",
      },
      boxShadow: {
        soft: "0 24px 60px rgba(9, 22, 43, 0.12)",
        card: "0 18px 40px rgba(16, 33, 63, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        display: ["Cambria", "Georgia", "Times New Roman", "serif"],
        body: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(214, 164, 54, 0.18), transparent 30%), linear-gradient(135deg, #09162b 0%, #10213f 50%, #1a3257 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
