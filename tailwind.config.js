module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html,njk}", // <-- add njk here!
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {},
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};
