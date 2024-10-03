import { dirname, resolve } from "path";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HTMLWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";
// import baseConfig from "@instructure/ui-webpack-config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  // ...baseConfig,
  entry: {
    app: "./client/src/index.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: resolve(__dirname, "dist"),
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
              "@babel/plugin-transform-class-properties",
            ],
          },
        },
      },
      // ...baseConfig.module.rules,
    ],
  },
  resolve: {
    alias: { "./dist/cpexcel.js": "commonjs2 ./dist/cpexcel.js" },
  },
  plugins: [
    // ...baseConfig.plugins,
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HTMLWebpackPlugin({
      template: "client/src/index.html",
    }),
  ],
};
