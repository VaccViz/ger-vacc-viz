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
            static: './dist',
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            fallback: {
                "stream": require.resolve("stream-browserify"),
                "buffer": require.resolve("buffer/")
            },
            alias: {
                "process": "process/browser"
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
            // Work around for Buffer is undefined:
            // https://github.com/webpack/changelog-v5/issues/10
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
            new webpack.ProvidePlugin({
                process: 'process/browser',
            }),
        ],

    };
}