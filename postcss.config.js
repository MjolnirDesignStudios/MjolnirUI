const path = require('path');

process.chdir(path.dirname(__filename));

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
