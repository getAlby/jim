import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    //
    themes: [
      {
        jim: {
          primary: "#b6b8ad",
          // secondary: "#f6d860",
          // accent: "#37cdbe",
          // neutral: "#3d4451",
          "base-100": "dbddd0",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
export default config;
