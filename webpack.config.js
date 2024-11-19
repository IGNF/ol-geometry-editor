import webpack from "webpack";
import path from "path";
import ESLintPlugin from 'eslint-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from "terser-webpack-plugin";

const __dirname = path.resolve();

let config = {
  target: 'web',
  entry: {
    'ol-geometry-editor': "./src/js/ge.js",
    'ol-geometry-editor.min': "./src/js/ge.js",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./[name].js"
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: false,
      dry: false
    }),
    new ESLintPlugin({
      extensions: ['js'],
      exclude: ["node_modules"],
      fix: true
    }),
    new MiniCssExtractPlugin({
      filename: "./[name].css"
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          }
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ],
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        test: /\.min\.css$/
      }),
      new TerserPlugin({
        test: /\.min\.js$/,
        extractComments: false // Empécher la création de fichiers *.LICENCE.txt inutiles
      })
    ],
    minimize: true,
  },
  externals: {
    'jquery': '$',
    'openlayers': 'ol',
  },
};

export default config;