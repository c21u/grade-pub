import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "production",
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]@instructure[\\/]/,
          name: "vendors~instructure",
          chunks: "all",
        },
      },
    },
  },
});
