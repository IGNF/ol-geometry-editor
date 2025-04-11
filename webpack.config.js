import webpack from "webpack";
import path from "path";
import CopyPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from "terser-webpack-plugin";

const __dirname = path.resolve();

const config = {
  target: 'web',
  entry: {
    'ol-geometry-editor': "./src/js/ge.js",
    'ol-geometry-editor.min': "./src/js/ge.js",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./js/[name].js",
    library: 'ge', // Nom de la variable globale
    libraryTarget: 'window', // Expose `ge` sur l'objet global `window`
    libraryExport: 'default', // Exporter uniquement l'objet par défaut
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: false,
      dry: false
    }),
    new CopyPlugin({
      patterns: [
        { context: './src/images/', from: '*.(png|gif|svg)', to: 'images/' },
      ]
    }),
    new ESLintPlugin({
      extensions: ['js'],
      exclude: ["node_modules"],
      fix: true
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css"
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
