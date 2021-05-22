const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = (env) => merge(common(env), {
  mode: 'production',
});