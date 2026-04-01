import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        western: {
          purple: "#4F2D84",
          "purple-dark": "#3a1f63",
          "purple-light": "#6b44a8",
          white: "#FFFFFF",
          gray: "#f5f5f5",
        },
      },
    },
  },
  plugins: [],
};
export default config;
