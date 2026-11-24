/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 ships vendor prefixing and `@import` resolution inside the
    // plugin itself, so `autoprefixer` is redundant here.
    '@tailwindcss/postcss': {},
  },
};

export default config;
