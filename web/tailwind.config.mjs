import typographyPlugin from "@tailwindcss/typography";
import aspectPlugin from "@tailwindcss/aspect-ratio";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{tsx,astro,css}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        text: "#4500c8",
        primary: "#f29978",
        dark: "#22064a",
        light: "#fffdf4",
      },
    },
  },
  variants: {},
  plugins: [typographyPlugin, aspectPlugin],
};
