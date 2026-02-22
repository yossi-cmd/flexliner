import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flexliner: {
          black: "#141414",
          dark: "#181818",
          red: "#e50914",
          "red-hover": "#f40612",
        },
      },
      fontFamily: {
        sans: ["var(--font-ploni)", "Ploni", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
