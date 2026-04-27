/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        zmen: {
          primary: "#080890",
          secondary: "#8F8FF0",
          background: "#F7F7FC",
          muted: "#C4C4D0",
          text: "#040404",
          white: "#FFFFFF",
        },
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "zmen-sm": "0 4px 14px rgba(8, 8, 144, 0.08)",
        "zmen-md": "0 8px 20px rgba(8, 8, 144, 0.14)",
      },
    },
  },
  plugins: [],
};
