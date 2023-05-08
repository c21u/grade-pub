const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    app: "./client/src/index.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    noParse: [/xlsx.core.min.js/, /xlsx.full.min.js/],
    rules: [
      {
        test: /\.jsx?$/,
        resolve: { extensions: [".js", ".jsx"] },
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: [
              "@babel/plugin-syntax-dynamic-import",
              "@babel/plugin-proposal-class-properties"
            ]
          }
        }
      }
    ]
  },
  resolve: {
    alias: { "./dist/cpexcel.js": "" }
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HTMLWebpackPlugin({
      template: "client/src/index.html"
    })
  ]
};
