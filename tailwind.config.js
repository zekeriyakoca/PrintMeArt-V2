const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/*.{html,ts}",
    "./src/**/*.{html,ts}",
    "./src/**/**/*.{html,ts}",
    "./src/**/**/**/*.{html,ts}",
    "./src/**/**/**/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      spacing: {
        "8xl": "96rem",
        "9xl": "128rem",
        13: "3.25rem",
        15: "3.75rem",
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      colors: {
        primary: {
          ...colors.indigo,
          500: "#ff0000", // Override 500 to be red for testing
        },
        secondary: {
          ...colors.rose,
        },
      },
    },
  },
  plugins: [],
};
