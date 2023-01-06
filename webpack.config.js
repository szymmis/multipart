const path = require("path");

module.exports = {
  entry: "./index.ts",
  output: {
    path: path.resolve(__dirname),
    filename: "index.js",
    library: {
      type: "umd",
    },
    globalObject: "this",
  },
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader" }],
  },
  externals: {
    express: "commonjs express",
  },
};
