const webpack = require("webpack");
const path = require("path");
const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");

module.exports = [
    {
        entry: "./src/js/ge.js",
        output: {
            path: path.resolve(__dirname, "./dist"),
            filename: "./ol-geometry-editor.min.js"
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel-loader"
                },
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    use: ExtractTextWebpackPlugin.extract({
                        fallback: 'style-loader',
                        use: {loader: 'css-loader', options: {minimize: true}}
                    })
                },
                {
                    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000
                    }
                }
            ]
        },
        plugins: [
            new ExtractTextWebpackPlugin("ol-geometry-editor.min.css"),
        ]
    }
];