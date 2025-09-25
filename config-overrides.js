const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require("webpack");

module.exports = function override(config, env) {
  // do stuff with the webpack config...

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    })
  );
  config.plugins.push(
    new NodePolyfillPlugin({
      excludeAliases: ["console"],
    })
  );
  return config;
};
