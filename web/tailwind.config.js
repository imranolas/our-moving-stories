module.exports = {
  content: ["./**/*.html"],
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
      }
    }
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};
