const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const webpack = require('webpack');

module.exports = (env) => {
    const gitRevisionPlugin = new GitRevisionPlugin({
        branch: true,
    });
    return {
        mode: 'development',
        entry: './src/index.ts',
        devtool: 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        devServer: {
            contentBase: './dist',
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            alias: {
                'csv-parse': path.resolve(__dirname, 'node_modules/csv-parse/lib/browser/index.js'),
            },
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: {
                keep: "assets",
            },
        },
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/index.html'
            }),
            new webpack.DefinePlugin({
                __BUILDINFO___: JSON.stringify({
                    buildHost: process.env.HOSTNAME,
                    buildUser: process.env.USER,
                    logTarget: process.env.LOGTARGET,
                    version: gitRevisionPlugin.version(),
                    branch: gitRevisionPlugin.branch(),
                    lastCommit: gitRevisionPlugin.lastcommitdatetime(),
                }),
            }),
        ],

    };
}