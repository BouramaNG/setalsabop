import type { Config } from "tailwindcss";

// Tailwind v4 — config minimaliste, les tokens sont dans globals.css @theme
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
export default config;
